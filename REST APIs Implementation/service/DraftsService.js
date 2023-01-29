const Draft = require('../components/draft');
const User = require('../components/user');
const db = require('../components/db');
var constants = require('../utils/constants.js');
var parametersManipulation = require('../utils/parametersManipulation.js');
const Agreement = require('../components/agreement');

const findDraftId = function(sql, filmId, reviewersId){
    return new Promise((resolve, reject) => {
        db.all(sql, [filmId, reviewersId], function(err, rows) {
            if (err) {
                reject('500');
            } else {
                if(rows.length < 1)
                    resolve(1);
                else
                    resolve(rows[0].draftId+1);
            }
        });
    })
}

/**
 * Issue a review draft
 *
 *
 * Input: 
 * - req : the HTTP request
 * - authorId: the author of the draft
 * Output:
 * - the added draft and correspondant agreement
 * 
 **/
exports.addCooperativeReviewDraft= function(req, authorId) {
    return new Promise((resolve, reject) => {
        const sql1 = "SELECT * FROM drafts d JOIN draftIds i WHERE d.id = i.id AND d.closed = 0 AND i.filmId=? AND i.reviewersId=?";
        req.params.reviewersId= parametersManipulation.fromCommasToMinus(req.params.reviewersId);
        db.all(sql1, [req.params.filmId, req.params.reviewersId], (err, rows) => {
            if (err){
                  reject(err);
            }
            else if(rows.length >= 1) {
                reject('409A');
            } 
            else {
              var sql2 = 'SELECT * FROM reviews r WHERE r.completed=1 AND r.filmId=? AND r.reviewersId=? ' ;
              db.all(sql2, [req.params.filmId, req.params.reviewersId] , async function(err, rows2) {
                  if (err) {
                      reject(err);
                  } 
                  else if(rows2.length>0){
                    reject('409B');
                  }
                  else {
                    sql5="SELECT draftId FROM draftIds WHERE filmId=? AND reviewersId= ? ORDER BY draftId DESC"
                    let draftId;
                    try {
                        draftId = await findDraftId(sql5, req.params.filmId, req.params.reviewersId);
                    } catch (error) {
                        reject ('Error in finding the new draftId');
                    }
                      db.serialize(function(){
                        db.run("BEGIN TRANSACTION;");
                        const sql3 = 'INSERT INTO draftIds(filmId, reviewersId, draftId) VALUES(?,?, ?)';
                      
                        db.run(sql3, [req.params.filmId, req.params.reviewersId, draftId], function(err) {
                          if (err) {
                              db.run("ROLLBACK;");
                              reject(err);
                          } else {
                              var lastId=this.lastID;
                              const sql4 = 'INSERT INTO drafts(id, authorId, rating, review, closed) VALUES(?,?,?,?,?)';
                              db.run(sql4, [lastId, req.user.id, req.body.rating, req.body.review, 0], function(err) {
                                  if (err) {
                                      db.run("ROLLBACK;");
                                      reject(err);
                                  } else {
                                      var createdDraft = new Draft(req.params.filmId, req.params.reviewersId, draftId, Number.parseInt(req.user.id), req.body.rating, req.body.review, 0);
                                      const sql5 = 'INSERT INTO agreements(id, authorId, agreement) VALUES(?,?,1)';
                                      db.run(sql5, [lastId, req.user.id], function(err) {
                                          if (err) {
                                              db.run("ROLLBACK;");
                                              reject(err);
                                          } else {
                                              db.run("COMMIT TRANSACTION;");
                                              var createdDraft = new Draft(req.params.filmId, req.params.reviewersId, draftId, Number.parseInt(req.user.id), req.body.rating, req.body.review, 0);
                                              var createdAgreement =  new Agreement(req.params.filmId, req.params.reviewersId, draftId, req.user.id, true);
                                              resolve({draft: createdDraft, agreement: createdAgreement});                               
                                          }
                                      })
                                  }
                              });
                          }
                        });
                      })
                  }
              }); 
            }
        });
    });
  }

  /**
 * Retrieve the number of drafts for the review of the film with ID filmId made by the reviuewers in the list reviewersId
 * 
 * Input: 
 * - filmId: the ID of the film 
 * - reviewersId: list of reviewers ids separated by ','
 * Output:
 * - total number of drafts for the review of the film with ID filmId made by the users in the list reviewersId
 * 
 **/
 exports.getDraftsTotal = function(filmId, reviewersId) {
    return new Promise((resolve, reject) => {
        reviewersId=parametersManipulation.fromCommasToMinus(reviewersId)
        var params = [filmId, reviewersId];
        var sqlNumOfReviews = "SELECT count(*) total FROM draftIds WHERE filmId = ? AND reviewersId=? ";
          db.get(sqlNumOfReviews, params , (err, size) => {
            if (err) {
                reject(err);
            } else {
                resolve(size.total);
            }
        });
    });
  }

  /**
 * Retrieve the drafts of the review of the film with ID filmId
 * made by the list of reviewers reviewersId
 * Input: 
 * - req: the request of the user
 * Output:
 * - list of the drafts
 * 
 **/
 exports.getCooperativeReviewDrafts = function(req) {
    return new Promise((resolve, reject) => {
        let reviewersId=parametersManipulation.fromCommasToMinus(req.params.reviewersId);
        var sql = "SELECT i.filmId, i.reviewersId, i.draftId, d.authorId, d.review, d.rating, d.closed FROM drafts d JOIN draftIds i WHERE d.id=i.id AND i.filmId= ? AND i.reviewersId=?";
        db.all(sql, [req.params.filmId, reviewersId] , (err, rows) => {
            if (err) {
                reject(err);
            } else {
                let drafts =[];
                for(let i=0; i<rows.length; i++){
                    let draft= new Draft(req.params.filmId, reviewersId, rows[i].draftId, rows[i].authorId, rows[i].rating, rows[i].review, rows[i].closed)
                    drafts.push(draft);       
                }
                resolve(drafts);
            }
        });
    });
  }
  

/**
 * Retrieve the draft with id draftId of a review of the film having filmId as ID and issued to the list of users with IDS in the list reviewersId 
 *
 * Input: 
 * - filmId: the ID of the film 
 * - reviewersId: list of ID of the reviewers
 * - draftId: id of the draft
 * Output:
 * - the requested draft
 * 
 **/
exports.getCooperativeReviewDraft = function(filmId, reviewersId, draftId) {
    return new Promise((resolve, reject) => {
        reviewersId=parametersManipulation.fromCommasToMinus(reviewersId);
        const sql = "SELECT i.filmId, i.reviewersId, i.draftId, d.authorId, d.review, d.rating, d.closed FROM drafts d JOIN draftIds i WHERE d.id=i.id AND i.filmId= ? AND i.reviewersId=? AND i.draftId= ? ";
        db.all(sql, [filmId, reviewersId, draftId], (err, rows) => {
            if (err)
                reject(err);
            else if (rows.length === 0)
                reject(404);
            else {
                var draft = new Draft(filmId, reviewersId, draftId, rows[0].authorId, rows[0].rating, rows[0].review, rows[0].closed);
                resolve(draft);
            }
        });
    });
  }

  /**
 * Delete the draft with id draftId of a review of the film having filmId as ID and issued to the list of users with IDS in the list reviewersId 
 * The corresponding agreements are also deleted
 * 
 * Input: 
 * - filmId: the ID of the film 
 * - reviewersId: list of ID of the reviewers
 * - draftId: id of the draft
 * - userId: id of the authenticated user
 * Output:
 * - none
 * 
 **/
exports.deleteCooperativeReviewDraft = function(filmId, reviewersId, draftId, userId) {
    return new Promise((resolve, reject) => {
        db.serialize(function(){
            db.run("BEGIN TRANSACTION;")
            reviewersId=parametersManipulation.fromCommasToMinus(reviewersId);
            const sql = "SELECT i.id, i.filmId, i.reviewersId, i.draftId, d.authorId, d.review, d.rating, d.closed FROM drafts d JOIN draftIds i WHERE d.id=i.id AND i.filmId= ? AND i.reviewersId=? AND i.draftId= ? ";
            db.all(sql, [filmId, reviewersId, draftId], (err, rows) => {
                if (err){
                    db.run("ROLLBACK;")
                    reject(err);
                }
                else if (rows.length === 0){
                    db.run("ROLLBACK;")
                    reject(404);
                }
                else if(rows[0].authorId != userId){
                    db.run("ROLLBACK;")
                    reject(403);
                }
                else if(rows[0].closed){                  
                    db.run("ROLLBACK;")
                    reject(409);
                }
                else {
                    let id=rows[0].id;
                    const sql2 = 'DELETE FROM drafts WHERE id=?';
                    db.run(sql2, [id], (err) => {
                        if (err){
                            db.run("ROLLBACK;")
                            reject(err);
                        }
                        else {
                            const sql3 = 'DELETE FROM agreements WHERE id=?';
                            db.run(sql3, [id], (err) => {
                                if (err){
                                    db.run("ROLLBACK;")
                                    reject(err);
                                }
                                else{
                                    const sql4 = 'DELETE FROM draftIds WHERE id=?';
                                    db.run(sql4, [id], (err) => {
                                        if (err){
                                            db.run("ROLLBACK;")
                                            reject(err);
                                        }
                                        else{
                                            db.run("COMMIT TRANSACTION;")
                                            resolve(null);
                                        }
                                    })
                                }
                            })
                        }
                            
                    })
                }
            });
        })

    });
  }