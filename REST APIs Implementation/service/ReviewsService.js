'use strict';

const Review = require('../components/review');
const User = require('../components/user');
const db = require('../components/db');
var constants = require('../utils/constants.js');
var parametersManipulation = require('../utils/parametersManipulation.js');

/**
 * Retrieve the reviews of the film with ID filmId
 * 
 * Input: 
 * - req: the request of the user
 * Output:
 * - list of the reviews
 * 
 **/
 exports.getFilmReviews = function(req) {
  return new Promise((resolve, reject) => {
      var sql = "SELECT r.filmId as fid, r.reviewersId as rid, completed, reviewDate, rating, review, c.total_rows FROM reviews r, (SELECT count(*) total_rows FROM reviews l WHERE l.filmId = ? ";
      if(req.query.reviewerId)
        sql = sql + " AND l.reviewersId LIKE ? "
      sql= sql + " ) c WHERE  r.filmId = ?  "
      var params = getPagination(req);
      if(req.query.reviewerId)
        sql = sql + " AND r.reviewersId LIKE ? "
      if ((params.length != 4 && req.query.reviewerId) || (params.length!=2 && req.query.reviewerId === undefined)) 
        sql = sql + " LIMIT ?,?";
      db.all(sql, params, (err, rows) => {
          if (err) {
              reject(err);
          } else {
              let reviews = rows.map((row) => createReview(row));
              resolve(reviews);
          }
      });
  });
}

/**
 * Retrieve the single reviews of the film with ID filmId
 * 
 * Input: 
 * - req: the request of the user
 * Output:
 * - list of the reviews
 * 
 **/
exports.getSingleFilmReviews = function(req) {
    return new Promise((resolve, reject) => {
        var sql = " SELECT r.filmId as fid, reviewersId as rid, completed, reviewDate, rating , review FROM reviews r JOIN users u WHERE trim(r.reviewersId, '-') = CAST(u.id AS TEXT) AND  r.filmId=? ";
        var params = getPagination(req, "single");
        if (params.length!= 1 ) 
          sql = sql + " LIMIT ?,?";
        db.all(sql, params , (err, rows) => {
            if (err) {
                reject(err);
            } else {
                let reviews = rows.map((row) => createReview(row));
                resolve(reviews);
            }
        });
    });
  }

/**
 * Retrieve the cooperative reviews of the film with ID filmId
 * 
 * Input: 
 * - req: the request of the user
 * Output:
 * - list of the cooperative reviews
 * 
 **/
exports.getCooperativeFilmReviews = function(req, reviewersId) {
    return new Promise((resolve, reject) => {
        var reviewersArray;
        if(reviewersId)
            reviewersArray=parametersManipulation.getReviewersArray(parametersManipulation.fromCommasToMinus(reviewersId));
        var sql = " SELECT r.filmId as fid, reviewersId as rid, completed, reviewDate, rating , review FROM reviews r WHERE r.reviewersId NOT IN (SELECT CAST('-'||u.id||'-' AS TEXT) FROM users u) AND r.filmId=? ";
        if(reviewersId){
            for(let i=0; i<reviewersArray.length; i++){
                sql = sql + " AND r.reviewersId LIKE ? "
            }
        }
        var params = getPagination(req, "cooperative", reviewersId);
        if ((reviewersId && params.length != ((reviewersArray.length+1))) || (params.length!=1 && reviewersId === undefined)) 
            sql = sql + " LIMIT ?,?";
        db.all(sql, params , (err, rows) => {
            if (err) {

                reject(err);
            } else {
                let reviews = rows.map((row) => createReview(row));
                resolve(reviews);
            }
        });
    });
  }

/**
 * Retrieve the number of reviews of the film with ID filmId
 * 
 * Input: 
 * - filmId: the ID of the film whose reviews need to be retrieved
 * - reviewerId: the id of the reviewer
 * Output:
 * - total number of reviews of the film with ID filmId
 * 
 **/
 exports.getFilmReviewsTotal = function(filmId, reviewerId) {
  return new Promise((resolve, reject) => {
      if(reviewerId)
        reviewerId= "%-"+reviewerId+"-%";
      var params = [filmId];
      var sqlNumOfReviews = "SELECT count(*) total FROM reviews WHERE filmId = ? ";
      if(reviewerId){
        sqlNumOfReviews = sqlNumOfReviews + " AND reviewersId LIKE ?"
        params = [filmId, reviewerId]
       }
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
 * Retrieve the number of single reviews of the film with ID filmId
 * 
 * Input: 
 * - filmId: the ID of the film whose reviews need to be retrieved
 * - reviewerId: the ID of the reviewer
 * Output:
 * - total number of single reviews of the film with ID filmId
 * 
 **/

exports.getSingleFilmReviewsTotal = function(filmId, reviewerId) {
    return new Promise((resolve, reject) => {
        if(reviewerId)
          reviewerId= "%-"+reviewerId+"-%";
        var params = [filmId];
        var sqlNumOfReviews = "SELECT count(*) total FROM reviews r JOIN users u WHERE trim(r.reviewersId, '-') = CAST(u.id AS TEXT) AND  r.filmId=?  ";
        if(reviewerId){
          sqlNumOfReviews = sqlNumOfReviews + " AND r.reviewersId LIKE ?"
          params = [filmId, reviewerId]
         }
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
 * Retrieve the number of cooperative reviews of the film with ID filmId
 * 
 * Input: 
 * - filmId: the ID of the film whose reviews need to be retrieved
 * - reviewerId: list of IDS of reviewers
 * Output:
 * - total number of cooperative reviews of the film with ID filmId
 * 
 **/

exports.getCooperativeFilmReviewsTotal = function(filmId, reviewersId) {
    return new Promise((resolve, reject) => {
        var reviewersArray;
        if(reviewersId)
            reviewersArray=parametersManipulation.getReviewersArray(parametersManipulation.fromCommasToMinus(reviewersId));
        var params = [filmId];
        var sqlNumOfReviews = " SELECT count(*) total FROM reviews r WHERE r.reviewersId NOT IN (SELECT CAST('-'||u.id||'-' AS TEXT) FROM users u) AND r.filmId=?  ";    
         if(reviewersId){
            for(let i=0; i<reviewersArray.length; i++){
                sqlNumOfReviews = sqlNumOfReviews + " AND r.reviewersId LIKE ? "
                params.push("%-"+reviewersArray[i]+"-%");
            }
        }
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
 * Retrieve the review of the film having filmId as ID and issued to user with reviewerId as ID
 *
 * Input: 
 * - filmId: the ID of the film whose review needs to be retrieved
 * - reviewersId: the list of Ids of the reviewers
 * Output:
 * - the requested review
 * 
 **/
 exports.getReview = function(filmId, reviewersId) {
  return new Promise((resolve, reject) => {
      reviewersId=parametersManipulation.fromCommasToMinus(reviewersId);
      const sql = "SELECT filmId as fid, reviewersId as rid, completed, reviewDate, rating, review FROM reviews WHERE filmId = ? AND reviewersId = ?";
      db.all(sql, [filmId, reviewersId], (err, rows) => {
          if (err)
              reject(err);
          else if (rows.length === 0)
              reject(404);
          else {
              var review = createReview(rows[0]);
              resolve(review);
          }
      });
  });
}


/**
 * Delete a review invitation
 *
 * Input: 
 * - filmId: ID of the film
 * - reviewerId: ID of the reviewer/list of ids
 * - owner : ID of user who wants to remove the review
 * Output:
 * - no response expected for this operation
 * 
 **/
 exports.deleteReview = function(filmId,reviewerId,owner) {
  return new Promise((resolve, reject) => {
      db.serialize(function(){
        db.run("BEGIN TRANSACTION;");
        reviewerId= parametersManipulation.fromCommasToMinus(reviewerId);
        const sql1 = "SELECT f.owner, r.completed FROM films f, reviews r WHERE f.id = r.filmId AND f.id = ? AND r.reviewersId = ?";
        db.all(sql1, [filmId, reviewerId], (err, rows) => {
            if (err){
                db.run("ROLLBACK;");
                reject(err);
            }
            else if (rows.length === 0){
                db.run("ROLLBACK;");
                reject(404);
            }
            else if(owner != rows[0].owner) {
                db.run("ROLLBACK;");
                reject(403);
            }
            else if(rows[0].completed == 1) {
                db.run("ROLLBACK;");
                reject(409);
            }
            else {
                const sql2 = 'DELETE FROM reviews WHERE filmId = ? AND reviewersId = ?';
                db.run(sql2, [filmId, reviewerId], (err) => {
                    if (err){
                        db.run("ROLLBACK;");
                        reject(err);
                    }
                    else{
                      const sql3 = 'DELETE FROM drafts WHERE id IN (SELECT id FROM draftIds WHERE filmId=? AND reviewersId=?)';
                      db.run(sql3, [filmId, reviewerId], (err) => {
                          if (err){
                            db.run("ROLLBACK;");
                            reject(err);
                          }
                          else{
                              const sql4 ='DELETE FROM agreements WHERE id IN (SELECT id FROM draftIds WHERE filmId=? AND reviewersId=?)';
                              db.run(sql4, [filmId, reviewerId], (err) => {
                                  if (err){
                                     db.run("ROLLBACK;");
                                      reject(err);
                                  }
                                  else{
                                      const sql5 ='DELETE FROM draftIds WHERE filmId=? AND reviewersId=?';
                                      db.run(sql5, [filmId, reviewerId], (err) => {
                                          if (err){
                                              db.run("ROLLBACK;");
                                              reject(err);
                                          }
                                          else{
                                            db.run("COMMIT TRANSACTION;");
                                            resolve(null);
                                          }
                                              
                                      })
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



/**
 * Issue a single/cooperative film review to a user
 *
 *
 * Input: 
 * - req: the request sent by the user
 * - owner: ID of the user who wants to issue the review
 * Output:
 * - the created review[s]
 * 
 **/
 exports.issueFilmReview = function(req, owner) {
  return new Promise((resolve, reject) => {
      db.serialize(function(){
        db.run("BEGIN TRANSACTION;")
        const sql1 = "SELECT f.owner, f.private FROM films f JOIN users u WHERE f.id = ? AND u.id=f.owner";
        db.all(sql1, [req.params.filmId], (err, rows) => {
            if (err){
                  db.run("ROLLBACK;")
                  reject(err);
            }
            else if(owner != rows[0].owner) {
                db.run("ROLLBACK;")
                reject(403);
            } else if(rows[0].private == 1) {
                db.run("ROLLBACK;")
                reject(404);
            }
            else {
              var sql2 = 'SELECT * FROM users' ;
              var invitedUsers = req.body.reviewersId;
              for (var i = 0; i < invitedUsers.length; i++) {
                  if(i == 0) sql2 += ' WHERE id = ?';
                  else sql2 += ' OR id = ?'
              }
              db.all(sql2, invitedUsers, async function(err, rows) {
                  if (err) {
                      db.run("ROLLBACK;")
                      reject(err);
                  } 
                  else {
                      const sql3 = 'INSERT INTO reviews(filmId, reviewersId, completed) VALUES(?,?,0)';
                      var finalResult = [];
                      if(req.query.type=="cooperative"){
                          var singleResult;
                          try {
                              singleResult = await issueSingleReview(sql3, req.params.filmId, parametersManipulation.getReviewersString(invitedUsers));
                              finalResult.push(singleResult);
                          } catch (error) {
                              db.run("ROLLBACK;")
                              reject ('Error in the creation of the review data structure');
                          }
                      }
                      else{
                          for (var i = 0; i < invitedUsers.length; i++) {
                              var singleResult;
                              try {
                                  singleResult = await issueSingleReview(sql3, req.params.filmId, parametersManipulation.getReviewersString([invitedUsers[i]]));
                                  finalResult[i] = singleResult;
                              } catch (error) {
                                  db.run("ROLLBACK;")
                                  reject ('Error in the creation of the review data structure');
                                  break;
                              }
                          }
                      }
  
                      if(finalResult.length !== 0){
                          db.run("COMMIT TRANSACTION;")
                          resolve(finalResult);
                      }        
                  }
              }); 
            }
        });
      })
  });
}

const issueSingleReview = function(sql3, filmId, reviewerId){
    return new Promise((resolve, reject) => {
        db.run(sql3, [filmId, reviewerId], function(err) {
            if (err) {
                reject('500');
            } else {
                var createdReview = new Review(Number.parseInt(filmId), reviewerId, false);
                resolve(createdReview);
            }
        });
    })
}

/**
 * Complete and update a review
 *
 * Input:
 * - review: review object (with only the needed properties)
 * - filmID: the ID of the film to be reviewed
 * - reviewerId: the ID of the reviewer/list of ids
 * Output:
 * - no response expected for this operation
 * 
 **/
 exports.updateSingleReview = function(review, filmId, reviewerId) {
  return new Promise((resolve, reject) => {
      reviewerId= parametersManipulation.fromCommasToMinus(reviewerId);
      const sql1 = "SELECT * FROM reviews WHERE filmId = ? AND reviewersId = ?";
      db.all(sql1, [filmId, reviewerId], (err, rows) => {
          if (err)
              reject(err);
          else if (rows.length === 0)
              reject(404);
          else if(rows[0].completed==true){
              reject(409);
          }
          else {
            var sql2 = 'UPDATE reviews SET completed = ?';
            var parameters = [review.completed];
            if(review.reviewDate != undefined){
              sql2 = sql2.concat(', reviewDate = ?');
              parameters.push(review.reviewDate);
            } 
            if(review.rating != undefined){
                sql2 = sql2.concat(', rating = ?');
                parameters.push(review.rating);
            } 
            if(review.review != undefined){
                sql2 = sql2.concat(', review = ?');
                parameters.push(review.review);
            } 
            sql2 = sql2.concat(' WHERE filmId = ? AND reviewersId = ?');
            parameters.push(filmId);
            parameters.push(reviewerId);

            db.run(sql2, parameters, function(err) {
              if (err) {
              reject(err);
              } else {
              resolve(null);
            }
           })
          }
      });
  });
}

/**
 * Utility functions
 */
 const getPagination = function(req, single, reviewersId) {
  var reviewersArray;
  if(reviewersId)
    reviewersArray=parametersManipulation.getReviewersArray(parametersManipulation.fromCommasToMinus(reviewersId));
  var pageNo = parseInt(req.query.pageNo);
  var size = parseInt(constants.OFFSET);
  var limits = [];
  limits.push(Number.parseInt(req.params.filmId));
  if(req.query.reviewerId)
    limits.push("%-"+req.query.reviewerId+"-%");
  if(reviewersId){
    for(let i=0; i<reviewersArray.length; i++){
        limits.push("%-"+reviewersArray[i]+"-%");
    }
  }
  if(single == undefined )
    limits.push(req.params.filmId);
  if(req.query.reviewerId)
    limits.push("%-"+req.query.reviewerId+"-%");

  if (req.query.pageNo == null) {
      pageNo = 1;
  }
  limits.push(size * (pageNo - 1));
  limits.push(size);
  return limits;
}



const createReview = function(row) {
  var completedReview = (row.completed === 1) ? true : false;
  return new Review(row.fid, row.rid, completedReview, row.reviewDate, row.rating, row.review);
}