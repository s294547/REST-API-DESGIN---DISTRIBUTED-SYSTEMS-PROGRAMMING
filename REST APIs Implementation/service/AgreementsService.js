const Agreement = require('../components/agreement');
const User = require('../components/user');
const db = require('../components/db');
var constants = require('../utils/constants.js');
var parametersManipulation = require('../utils/parametersManipulation.js');
const Draft = require('../components/draft');
const Review = require('../components/review');


/**
 * Issue an agreement to a draft
 *
 *
 * Input: 
 * - req : the HTTP request
 * - authorId: the author of the draft
 * Output:
 * - the added agreement. If the draft is closed it returns also the closed draft, and if it is accepted it returns the completed review.
 * 
 **/
exports.addAgreement= function(req, authorId) {
    return new Promise((resolve, reject) => {
        const sql1 = "SELECT d.id, d.closed, d.review, d.rating FROM drafts d JOIN draftIds i WHERE d.id = i.id AND i.filmId=? AND i.reviewersId=? AND i.draftId= ?";
        req.params.reviewersId= parametersManipulation.fromCommasToMinus(req.params.reviewersId);
        db.all(sql1, [req.params.filmId, req.params.reviewersId, req.params.draftId], (err, rows) => {
            if (err){
                  reject(err);
            }
            else if(rows.length <1) {
                reject('404');
            } 
            else if(rows[0].closed)
                reject('409A')
            else {
              let id= rows[0].id;
              let rating= rows[0].rating;
              let review=rows[0].review;
              var sql2 = 'SELECT * FROM agreements WHERE id=? AND authorId= ? ' ;
              db.all(sql2, [id, authorId] , async function(err, rows2) {
                  if (err) {
                      reject(err);
                  } 
                  else if(rows2.length>0){
                    reject('409B');
                  }
                  else {
                      db.serialize(function(){
                        db.run("BEGIN TRANSACTION;")
                        let sql3 = 'INSERT INTO agreements(id, authorId, agreement';
                        if(req.body.reason)
                          sql3= sql3 + ", reason";
                        sql3= sql3 + ") VALUES (?,?,?"
                        if(req.body.reason)
                          sql3= sql3 + ", ?";
                          sql3= sql3 + ")"
                        let par=[id, authorId, req.body.agreement]
                        if(req.body.reason)
                          par.push(req.body.reason);
          
                        db.run(sql3, par, function(err) {
                          if (err) {
                              db.run("ROLLBACK;");
                              reject(err);
                          } else {
                  
                              const sql4 = 'SELECT agreement FROM agreements WHERE id=?';
                              db.all(sql4, [id], function(err,rows) {
                                  if (err) {
                                      db.run("ROLLBACK;");
                                      reject(err);
                                  } else {
                                      let updatedDraft=undefined;
                                      let updatedReview=undefined;
                                      if(rows.length== (parametersManipulation.getReviewersArray(req.params.reviewersId)).length ){
                                          let accepted=true;
                                          updatedDraft= new Draft(req.params.filmId, req.params.reviewersId, req.params.draftId, authorId, rating, review, true);
                                          for(let i=0; i<rows.length; i++){
                                              if(!rows[i].agreement){
                                                  accepted=false;
                                                  break;
                                              }
                                          }
                                          const sql5 = 'UPDATE drafts SET closed=1 WHERE id=?';
                                          db.run(sql5, [id], function(err) {
                                              if (err) {
                                                  db.run("ROLLBACK;");
                                                  reject(err);
                                              } else {
                                                  if(accepted){
                                                      const sql6 = 'UPDATE reviews SET completed=1, review=?, rating=?, reviewDate=? WHERE filmId=? AND reviewersId=?';
                                                      dateArray= new Date().toLocaleDateString().split("/");
                                                      if(dateArray[1]<10)
                                                          dateArray[1]='0'+dateArray[1];
                                                      if(dateArray[0]<10)
                                                          dateArray[0]='0'+dateArray[0];
                                                      dateString= dateArray[2]+'-'+dateArray[1]+'-'+dateArray[0];
                                                      updatedReview= new Review(req.params.filmId, req.params.reviewersId, true, dateString, rating, review);
                                                      db.run(sql6, [review, rating, dateString, req.params.filmId, req.params.reviewersId], function(err) {
                                                          if (err) {
                                                              db.run("ROLLBACK;");
                                                              reject(err);
                                                          } 
                                                      })
                                                  }                          
                                              }
                                          })
                                      }
                                      
                                      db.run("COMMIT TRANSACTION;");
                                      var createdAgreement = new Agreement(req.params.filmId, req.params.reviewersId, req.params.draftId, authorId, req.body.agreement, req.body.reason);
                                      
                                      var toRet;

                                      if(updatedDraft && updatedReview)
                                        toRet={agreement: createdAgreement, draft: updatedDraft, review:updatedReview}
                                      else if(updatedDraft){
                                        toRet={agreement: createdAgreement, draft: updatedDraft}
                                      }
                                      else{
                                        toRet={agreement: createdAgreement}
                                      }
                                      resolve(toRet);  
  
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
 * Retrieve the number of agreements for the draft of the review of the film with ID filmId made by the reviuewers in the list reviewersId
 * 
 * Input: 
 * - filmId: the ID of the film 
 * - reviewersId: list of reviewers ids separated by ','
 * - draftId: Id of the draft
 * Output:
 * - total number of agreements for the draft for the review of the film with ID filmId made by the users in the list reviewersId
 * 
 **/
 exports.getAgreementsTotal = function(filmId, reviewersId, draftId) {
    return new Promise((resolve, reject) => {
        reviewersId=parametersManipulation.fromCommasToMinus(reviewersId)
        var params = [filmId, reviewersId, draftId];
        var sqlNumOfReviews = "SELECT count(*) total FROM draftIds i JOIN agreements a WHERE a.id=i.id AND i.filmId = ? AND i.reviewersId=? AND i.draftId=?";
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
 * Retrieve the agreements of the draft of the review of the film with ID filmId
 * made by the list of reviewers reviewersId
 * Input: 
 * - req: the request of the user
 * Output:
 * - list of the agreements
 * 
 **/
 exports.getAgreements = function(req) {
    return new Promise((resolve, reject) => {
        let reviewersId=parametersManipulation.fromCommasToMinus(req.params.reviewersId);
        var sql = "SELECT a.agreement, a.reason, a.authorId FROM agreements a JOIN draftIds i WHERE a.id=i.id AND i.filmId= ? AND i.reviewersId=? AND i.draftId=?";
        db.all(sql, [req.params.filmId, reviewersId, req.params.draftId] , (err, rows) => {
            if (err) {
                reject(err);
            } else {
                let agreements =[];
                for(let i=0; i<rows.length; i++){
                    let agreement= new Agreement(req.params.filmId, reviewersId, req.params.draftId, rows[i].authorId, rows[i].agreement, rows[i].reason)
                    agreements.push(agreement);       
                }
                resolve(agreements);
            }
        });
    });
  }

  /**
 * Retrieve the agreement of the draft with id draftId of a review of the film having filmId as ID and issued to the list of users with IDS in the list reviewersId 
 *
 * Input: 
 * - filmId: the ID of the film 
 * - reviewersId: list of ID of the reviewers
 * - draftId: id of the draft
 * - authorId: id of the author of the draft
 * Output:
 * - the requested agreement
 * 
 **/
exports.getAgreement = function(filmId, reviewersId, draftId, authorId) {
    return new Promise((resolve, reject) => {
        reviewersId=parametersManipulation.fromCommasToMinus(reviewersId);
        const sql = "SELECT a.agreement, a.reason FROM agreements a JOIN  draftIds i WHERE a.id=i.id AND i.filmId= ? AND i.reviewersId=? AND i.draftId= ? AND a.authorId=?";
        db.all(sql, [filmId, reviewersId, draftId, authorId], (err, rows) => {
            if (err)
                reject(err);
            else if (rows.length === 0)
                reject(404);
            else {
               
                var agreement =  new Agreement(filmId, reviewersId, draftId, authorId, rows[0].agreement, rows[0].reason)
                resolve(agreement);
            }
        });
    });
  }

  /**
 * Delete the agreement of the draft with id draftId of a review of the film having filmId as ID and issued to the list of users with IDS in the list reviewersId 
 *
 * Input: 
 * - filmId: the ID of the film 
 * - reviewersId: list of ID of the reviewers
 * - draftId: id of the draft
 * - authorId: id of the author of the draft
 * Output:
 * - none
 * 
 **/
  exports.deleteAgreement = function(filmId, reviewersId, draftId, authorId) {
    return new Promise((resolve, reject) => {
        reviewersId=parametersManipulation.fromCommasToMinus(reviewersId);
        const sql = "SELECT d.closed, d.id FROM agreements a JOIN  draftIds i JOIN drafts d WHERE a.id=i.id AND d.id=i.id AND i.filmId= ? AND i.reviewersId=? AND i.draftId= ? AND a.authorId=?";
        db.all(sql, [filmId, reviewersId, draftId, authorId], (err, rows) => {
            if (err)
                reject(err);
            else if (rows.length === 0)
                reject(404);
            else {
                if(rows[0].closed){
                    reject(409);
                }
                else{
                    let id=rows[0].id;
                    const sql2 = "DELETE FROM agreements  WHERE id= ? AND authorId= ?";
                    db.run(sql2, [id, Number.parseInt(authorId)], (err) => {
                        if (err)
                            reject(err);
                        else {
                            resolve(null);
                        }
                    });

                }
            }
        });
    });
  }