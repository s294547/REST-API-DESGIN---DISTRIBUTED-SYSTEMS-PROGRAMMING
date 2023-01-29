'use strict';


const db = require('../components/db');
/** UTILITY FUNCTIONS TO CHECK THE EXISTANCE OF PARAMETERS */

/**
 * Find out if a film with a certain filmId exists
 * 
 * Input: 
 * - filmId
 * Output:
 * - true/false
 * 
 **/
exports.findFilm = function(filmId) {
    return new Promise((resolve, reject) => {
        var sql = "SELECT COUNT(*) as total FROM films f WHERE f.id = ? ";
        db.all(sql, [filmId], (err, rows) => {
            if (err) {
                reject(err);
            } else {
                if(rows[0].total>0)
                    resolve(true);
                else
                    resolve(false);
            }
        });
    });
  }

/**
 * Find out if all the users of a reviewersId list exist
 * 
 * Input: 
 * - reviewersId: list of users
 * Output:
 * - true/false
 * 
 **/
exports.findUsers = function(reviewersIdList) {
    return new Promise((resolve, reject) => {
        if(!reviewersIdList){
            resolve(true);
        }
        let reviewersId= reviewersIdList.split(",");/* If the string has just one number, the first and the last element of the array will be empty
    They must be removed*/
        if(reviewersId[0]=="")
            reviewersId.shift();

        if(reviewersId[reviewersId.length-1]=="")
            reviewersId.pop();

        var sql = "SELECT COUNT(*) as total FROM users u WHERE ";
        for(let i=0; i<reviewersId.length; i++){
            if(i>0)
                sql= sql + " OR ";
            sql= sql + " u.id=? "
        }

        db.all(sql, reviewersId , (err, rows) => {
            if (err) {
                reject(err);
            } else {
                if(rows[0].total==reviewersId.length)
                    resolve(true);
                else
                    resolve(false);
            }
        });
    });
  }

  /**
 * Find out if a review with a certain filmId AND reviewersId exists
 * 
 * Input: 
 * - filmId
 * - reviewersId
 * Output:
 * - true/false
 * 
 **/
exports.findReview = function(filmId, reviewersId) {
    return new Promise((resolve, reject) => {
        var sql = "SELECT COUNT(*) as total FROM reviews r WHERE r.filmId = ? AND r.reviewersId = ?";
        db.all(sql, [filmId, reviewersId], (err, rows) => {
            if (err) {
                reject(err);
            } else {
                if(rows[0].total>0)
                    resolve(true);
                else
                    resolve(false);
            }
        });
    });
  }

  /**
 * Find out if a draft for a review with a certain filmId AND reviewersId exists
 * 
 * Input: 
 * - filmId
 * - reviewersId
 * - draftId
 * Output:
 * - true/false
 * 
 **/
  exports.findDraft = function(filmId, reviewersId, draftId) {
    return new Promise((resolve, reject) => {
        var sql = "SELECT COUNT(*) as total FROM draftIds WHERE filmId = ? AND reviewersId = ? AND draftId= ?";
        db.all(sql, [filmId, reviewersId, draftId], (err, rows) => {
            if (err) {
                reject(err);
            } else {
                if(rows[0].total>0)
                    resolve(true);
                else
                    resolve(false);
            }
        });
    });
  }