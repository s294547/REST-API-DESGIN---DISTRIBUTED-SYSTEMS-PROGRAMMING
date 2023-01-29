'use strict';

/** UTILITY FUNCTIONS TO CHECK THE FORMAT OF PARAMETERS */

/**
 * Check if id is a string of integers 
 * 
 * Input: 
 * - id
 * Output:
 * - true/false
 * 
 **/
exports.checkIdNumerical = function(id) {
    var reg = new RegExp('^[0-9]+$');
    return (reg.test(id) || Number.isInteger(id));
  }

/**
 * Check if reviewersId is a string of numbers separated by commas
 * 
 * Input: 
 * - reviewersId
 * Output:
 * - true/false
 * 
 **/
exports.checkReviewersId = function(reviewersId) {
  var reg = new RegExp("^[0-9]+([,][0-9]+)*$");

  /*Checking it is a string of integers separated by comma*/
  if(!reg.test(reviewersId))
      return false;


  reviewersId= reviewersId.split(",");

   
  /* If the string has just one number, the first and the last element of the array will be empty
    They must be removed*/
  if(reviewersId[0]=="")
    reviewersId.shift();
  if(reviewersId[reviewersId.length-1]=="")
    reviewersId.pop();

  let set= new Set(reviewersId);
  /*Checking it has no duplicates*/
  if(set.size != reviewersId.length)
    return false;
  return true; 
}
