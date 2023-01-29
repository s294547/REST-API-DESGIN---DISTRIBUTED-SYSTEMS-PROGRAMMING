'use strict'

/**
 * Given an array of reviewers, turn it in the string -reviewer1-reviewer2-..-reviewerN- 
 * sorted by increasing order
 * 
 * Input: 
 * - reviewersId: array of integers containing the ids of the reviewers
 * Output:
 * - formatted string of reviewers 
 * 
 **/
exports.getReviewersString = function(reviewersId) {
    reviewersId.sort();
    let reviewersString='-';
    var i=0;
    for(i; i<reviewersId.length; i++){
        reviewersString= reviewersString + reviewersId[i] + "-";
    }
    return reviewersString;
  }

/**
 * Given an string of reviewers, turn it in the array
 * 
 * Input: 
 * - reviewersId: string with reviewers Id in format -rid1-rid2-...-ridN-
 * Output:
 * - array of reviewers
 * 
 **/
exports.getReviewersArray = function(reviewersId) {
    reviewersId=reviewersId.split("-");
    reviewersId.shift();
    reviewersId.pop();
    
    for (let i=0; i<reviewersId.length; i++){
        reviewersId[i]=parseInt(reviewersId[i]);
    }
    return reviewersId;
  }

/**
 * Given an string of reviewers separated by commas, turn it into the one separated by -..-
 * 
 * Input: 
 * - reviewersId: string with reviewers Id in format rid1,rid2,...,ridN
 * Output:
 * - list of reviewers in format -rid1-rid2-...-ridN-
 * 
 **/
exports.fromCommasToMinus = function(reviewersIdList) {
  let reviewersId= reviewersIdList.split(",");/* If the string has just one number, the first and the last element of the array will be empty
    They must be removed*/
  if(reviewersId[0]=="")
    reviewersId.shift();

  if(reviewersId[reviewersId.length-1]=="")
    reviewersId.pop();

    reviewersId.sort();
    let reviewersString='-';
    var i=0;
    for(i; i<reviewersId.length; i++){
        reviewersString= reviewersString + reviewersId[i] + "-";
    }
    return reviewersString;
}