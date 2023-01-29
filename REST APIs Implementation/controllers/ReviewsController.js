'use strict';

var utils = require('../utils/writer.js');
var parametersValidation = require('../utils/parametersValidation.js');
var parametersExistance = require('../utils/parametersExistance.js');
var parametersManipulation = require('../utils/parametersManipulation.js');
var Reviews = require('../service/ReviewsService');
var constants = require('../utils/constants.js');

  /**
     * Gets the single and cooperative reviews of a film with
	   * id filmId
     * -------------------------------------------------
     *  API: GET /api/films/public/:filmId/reviews
     * =================================================
    */

module.exports.getFilmReviews = function getFilmReviews (req, res, next) {

    //retrieve a list of reviews
    var numOfReviews = 0;
    var next=0;

    
    if(!parametersValidation.checkIdNumerical(req.params.filmId)){
      utils.writeJson(res, { errors: [{ 'param': 'Server', 'msg': "Wrong format of filmId path parameter" }], }, 400);
      return;
    }
    if(req.query.reviewerId && !parametersValidation.checkIdNumerical(req.query.reviewerId)){
      utils.writeJson(res, { errors: [{ 'param': 'Server', 'msg': "Wrong format of reviewerId query parameter" }], }, 400);
      return;
    }
    if(((Object.keys(req.query)).length==1 && !req.query.reviewerId)|| ((Object.keys(req.query)).length>1)){
      utils.writeJson(res, { errors: [{ 'param': 'Server', 'msg': "Wrong format of query parameters" }], }, 400);
      return;
    }

    parametersExistance.findFilm(req.params.filmId)
        .then(function(response) {
            if(!response){
              utils.writeJson(res, { errors: [{ 'param': 'Server', 'msg': "The film with ID filmID does not exist" }], }, 404);
              return;
            }
            else{
              parametersExistance.findUsers(req.query.reviewerId)
              .then(function(response){
                if(!response){
                  utils.writeJson(res, { errors: [{ 'param': 'Server', 'msg': "The user with id reviewerID does not exist" }], }, 404);
                  return;
                }
                else{

                  Reviews.getFilmReviewsTotal(req.params.filmId, req.query.reviewerId)
                  .then(function(response) {
                      
                      numOfReviews = response;
                      if(numOfReviews == 0){
                        utils.writeJson(res, { errors: [{ 'param': 'Server', 'msg': "There is no review" }], }, 404);
                        return;
                      }
                      Reviews.getFilmReviews(req)
                      .then(function(response) {
          
                          if (req.query.pageNo == null) var pageNo = 1;
                          else var pageNo = req.query.pageNo;
                          var totalPage=Math.ceil(numOfReviews / constants.OFFSET);
                          next = Number(pageNo) + 1;
                          if (pageNo>totalPage) {
                              utils.writeJson(res, { errors: [{ 'param': 'Server', 'msg': "The page does not exist." }], }, 404);
                          } else if (pageNo == totalPage) {
                              utils.writeJson(res, {
                                  totalPages: totalPage,
                                  currentPage: pageNo,
                                  totalItems: numOfReviews,
                                  reviews: response
                              });
                          } else {
                              utils.writeJson(res, {
                                  totalPages: totalPage,
                                  currentPage: pageNo,
                                  totalItems: numOfReviews,
                                  reviews: response,
                                  next: "/api/films/public/" + req.params.filmId +"/reviews?pageNo=" + next
                              });
                          }
                  })
                  .catch(function(response) {
                      utils.writeJson(res, { errors: [{ 'param': 'Server', 'msg': response }], }, 500);
                  });
                  })
                  .catch(function(response) {
                    utils.writeJson(res, { errors: [{ 'param': 'Server', 'msg': response }], }, 500);
                })
                
                }
              })
              .catch(function(response) {
                utils.writeJson(res, { errors: [{ 'param': 'Server', 'msg': response }], }, 500);
            })
            }
    })
  
};


  /**
     * Gets the single  reviews of a film with
	   * id filmId
     * ---------------------------------------------------------
     *  API: GET /api/films/public/:filmId/reviews/single
     * =========================================================
    */

module.exports.getSingleFilmReviews = function getSingleFilmReviews (req, res, next) {

  //retrieve a list of reviews
  var numOfReviews = 0;
  var next=0;

  
  if(!parametersValidation.checkIdNumerical(req.params.filmId)){
    utils.writeJson(res, { errors: [{ 'param': 'Server', 'msg': "Wrong format of filmId path parameter" }], }, 400);
    return;
  }

  parametersExistance.findFilm(req.params.filmId)
      .then(function(response) {
          if(!response){
            utils.writeJson(res, { errors: [{ 'param': 'Server', 'msg': "The film with ID filmID does not exist" }], }, 404);
            return;
          }
          else{
            
            Reviews.getSingleFilmReviewsTotal(req.params.filmId)
                .then(function(response) {
                    numOfReviews = response;
                    if(numOfReviews == 0){
                      utils.writeJson(res, { errors: [{ 'param': 'Server', 'msg': "There is no review" }], }, 404);
                      return;
                    }
                    Reviews.getSingleFilmReviews(req)
                    .then(function(response) {
        
                        if (req.query.pageNo == null) var pageNo = 1;
                        else var pageNo = req.query.pageNo;
                        var totalPage=Math.ceil(numOfReviews / constants.OFFSET);
                        next = Number(pageNo) + 1;
                        if (pageNo>totalPage) {
                            utils.writeJson(res, { errors: [{ 'param': 'Server', 'msg': "The page does not exist." }], }, 404);
                        } else if (pageNo == totalPage) {
                            utils.writeJson(res, {
                                totalPages: totalPage,
                                currentPage: pageNo,
                                totalItems: numOfReviews,
                                reviews: response
                            });
                        } else {
                            utils.writeJson(res, {
                                totalPages: totalPage,
                                currentPage: pageNo,
                                totalItems: numOfReviews,
                                reviews: response,
                                next: "/api/films/public/" + req.params.filmId +"/reviews/single?pageNo=" + next
                            });
                        }
                })
                .catch(function(response) {
                    utils.writeJson(res, { errors: [{ 'param': 'Server', 'msg': response }], }, 500);
                });
                })
                .catch(function(response) {
                  utils.writeJson(res, { errors: [{ 'param': 'Server', 'msg': response }], }, 500);
              });

          }
  })

};

  /**
     * Gets the cooperative reviews of a film with
	   * id filmId
     * ---------------------------------------------------------
     *  API: GET /api/films/public/:filmId/reviews/cooperative
     * =========================================================
    */


module.exports.getCooperativeFilmReviews = function getCooperativeFilmReviews (req, res, next) {

  //retrieve a list of reviews
  var numOfReviews = 0;
  var next=0;

  
  if(!parametersValidation.checkIdNumerical(req.params.filmId)){
    utils.writeJson(res, { errors: [{ 'param': 'Server', 'msg': "Wrong format of filmId path parameter" }], }, 400);
    return;
  }
  if(req.query.reviewersId && !parametersValidation.checkReviewersId(req.query.reviewersId)){
    utils.writeJson(res, { errors: [{ 'param': 'Server', 'msg': "Wrong format of reviewersId query parameter" }], }, 400);
    return;
  }
  if(((Object.keys(req.query)).length==1 && !req.query.reviewersId)|| ((Object.keys(req.query)).length>1)){
    utils.writeJson(res, { errors: [{ 'param': 'Server', 'msg': "Wrong format of query parameters" }], }, 400);
    return;
  }

  parametersExistance.findFilm(req.params.filmId)
      .then(function(response) {
          if(!response){
            utils.writeJson(res, { errors: [{ 'param': 'Server', 'msg': "The film with ID filmID does not exist" }], }, 404);
            return;
          }
          else{
            
            Reviews.getCooperativeFilmReviewsTotal(req.params.filmId,  req.query.reviewersId)
                .then(function(response) {
                    numOfReviews = response;
                    if(numOfReviews == 0){
                      utils.writeJson(res, { errors: [{ 'param': 'Server', 'msg': "There is no review" }], }, 404);
                      return;
                    }
                    Reviews.getCooperativeFilmReviews(req, req.query.reviewersId)
                    .then(function(response) {
        
                        if (req.query.pageNo == null) var pageNo = 1;
                        else var pageNo = req.query.pageNo;
                        var totalPage=Math.ceil(numOfReviews / constants.OFFSET);
                        next = Number(pageNo) + 1;
                        if (pageNo>totalPage) {
                            utils.writeJson(res, { errors: [{ 'param': 'Server', 'msg': "The page does not exist." }], }, 404);
                        } else if (pageNo == totalPage) {
                            utils.writeJson(res, {
                                totalPages: totalPage,
                                currentPage: pageNo,
                                totalItems: numOfReviews,
                                reviews: response
                            });
                        } else {
                            utils.writeJson(res, {
                                totalPages: totalPage,
                                currentPage: pageNo,
                                totalItems: numOfReviews,
                                reviews: response,
                                next: "/api/films/public/" + req.params.filmId +"/reviews/cooperative?pageNo=" + next
                            });
                        }
                })
                .catch(function(response) {
                    utils.writeJson(res, { errors: [{ 'param': 'Server', 'msg': response }], }, 500);
                });
                })
                .catch(function(response) {
                  utils.writeJson(res, { errors: [{ 'param': 'Server', 'msg': response }], }, 500);
              });

          }
  })

};

  /**
     * Gets a single/cooperative review of a film with
	   * id filmId made by the user[s] in the list reviewersId
     * ---------------------------------------------------------
     *  API: GET /api/films/public/:filmId/reviews/:reviewersId
     * =========================================================
    */

module.exports.getReview = function getReview (req, res, next) {
    
  if(!parametersValidation.checkIdNumerical(req.params.filmId)){
    utils.writeJson(res, { errors: [{ 'param': 'Server', 'msg': "Wrong format of filmId path parameter" }], }, 400);
    return;
  }
  if(!parametersValidation.checkReviewersId(req.params.reviewersId)){
    utils.writeJson(res, { errors: [{ 'param': 'Server', 'msg': "Wrong format of reviewersId path parameter" }], }, 400);
    return;
  }
  parametersExistance.findFilm(req.params.filmId)
      .then(function(response) {
        if(!response){
          utils.writeJson(res, { errors: [{ 'param': 'Server', 'msg': "The film with ID filmID does not exist" }], }, 404);
          return;
        }
        else{
          parametersExistance.findUsers(req.params.reviewersId)
            .then(function(response) {
              if(!response){
                utils.writeJson(res, { errors: [{ 'param': 'Server', 'msg': "One of the reviewers does not exist" }], }, 404);
                return;
              }
              else{
                Reviews.getReview(req.params.filmId, req.params.reviewersId)
                .then(function(response) {
                    utils.writeJson(res, response);
                })
                .catch(function(response) {
                    if (response == 404){
                        utils.writeJson(res, { errors: [{ 'param': 'Server', 'msg': 'The review does not exist.' }], }, 404);
                    }
                    else {
                        utils.writeJson(res, { errors: [{ 'param': 'Server', 'msg': response }], }, 500);
                    }
                });  
              }
            })
        }
      })
};

  /**
     * Gets a single review of a film with
	   * id filmId made by the user with Id reviewerId
     * ----------------------------------------------------------------
     *  API: GET /api/films/public/:filmId/reviews/single/:reviewerId
     * ================================================================
    */

module.exports.getSingleReview = function getSingleReview (req, res, next) {
    
  if(!parametersValidation.checkIdNumerical(req.params.filmId)){
    utils.writeJson(res, { errors: [{ 'param': 'Server', 'msg': "Wrong format of filmId path parameter" }], }, 400);
    return;
  }
  if(!parametersValidation.checkIdNumerical(req.params.reviewerId)){
    utils.writeJson(res, { errors: [{ 'param': 'Server', 'msg': "Wrong format of reviewerId path parameter" }], }, 400);
    return;
  }
  parametersExistance.findFilm(req.params.filmId)
      .then(function(response) {
        if(!response){
          utils.writeJson(res, { errors: [{ 'param': 'Server', 'msg': "The film with ID filmID does not exist" }], }, 404);
          return;
        }
        else{
          parametersExistance.findUsers(req.params.reviewerId)
            .then(function(response) {
              if(!response){
                utils.writeJson(res, { errors: [{ 'param': 'Server', 'msg': "The reviewer does not exist" }], }, 404);
                return;
              }
              else{
                Reviews.getReview(req.params.filmId, req.params.reviewerId)
                .then(function(response) {
                    utils.writeJson(res, response);
                })
                .catch(function(response) {
                    if (response == 404){
                        utils.writeJson(res, { errors: [{ 'param': 'Server', 'msg': 'The review does not exist.' }], }, 404);
                    }
                    else {
                        utils.writeJson(res, { errors: [{ 'param': 'Server', 'msg': response }], }, 500);
                    }
                });  
              }
            })
        }
      })
};

  /**
     * Gets a cooperative review of a film with
	   * id filmId made by the users in the list reviewersId
     * --------------------------------------------------------------------
     *  API: GET /api/films/public/:filmId/reviews/cooperative/:reviewersId
     * ====================================================================
    */

module.exports.getCooperativeReview = function getCooperativeReview (req, res, next) {
    
  if(!parametersValidation.checkIdNumerical(req.params.filmId)){
    utils.writeJson(res, { errors: [{ 'param': 'Server', 'msg': "Wrong format of filmId path parameter" }], }, 400);
    return;
  }
  if(!parametersValidation.checkReviewersId(req.params.reviewersId)){
    utils.writeJson(res, { errors: [{ 'param': 'Server', 'msg': "Wrong format of reviewersId path parameter" }], }, 400);
    return;
  }
  if((parametersManipulation.getReviewersArray(parametersManipulation.fromCommasToMinus(req.params.reviewersId))).length<2){
    utils.writeJson(res, { errors: [{ 'param': 'Server', 'msg': "There should be at least two reviewers" }], }, 400);
    return;
  }
  parametersExistance.findFilm(req.params.filmId)
      .then(function(response) {
        if(!response){
          utils.writeJson(res, { errors: [{ 'param': 'Server', 'msg': "The film with ID filmID does not exist" }], }, 404);
          return;
        }
        else{
          parametersExistance.findUsers(req.params.reviewersId)
            .then(function(response) {
              if(!response){
                utils.writeJson(res, { errors: [{ 'param': 'Server', 'msg': "The reviewer does not exist" }], }, 404);
                return;
              }
              else{
                Reviews.getReview(req.params.filmId, req.params.reviewersId)
                .then(function(response) {
                    utils.writeJson(res, response);
                })
                .catch(function(response) {
                    if (response == 404){
                        utils.writeJson(res, { errors: [{ 'param': 'Server', 'msg': 'The review does not exist.' }], }, 404);
                    }
                    else {
                        utils.writeJson(res, { errors: [{ 'param': 'Server', 'msg': response }], }, 500);
                    }
                });  
              }
            })
        }
      })
};

  /**
     * Deletes a single/cooperative review of a film with
	   * id filmId made by the user[s] in the list reviewersId
     * -------------------------------------------------------------
     *  API: DELETE /api/films/public/:filmId/reviews/:reviewersId
     * =============================================================
    */

module.exports.deleteReview = function deleteReview (req, res, next) {
  if(!parametersValidation.checkIdNumerical(req.params.filmId)){
    utils.writeJson(res, { errors: [{ 'param': 'Server', 'msg': "Wrong format of filmId path parameter" }], }, 400);
    return;
  }
  if(!parametersValidation.checkReviewersId(req.params.reviewersId)){
    utils.writeJson(res, { errors: [{ 'param': 'Server', 'msg': "Wrong format of reviewersId path parameter" }], }, 400);
    return;
  }
  parametersExistance.findFilm(req.params.filmId)
      .then(function(response) {
        if(!response){
          utils.writeJson(res, { errors: [{ 'param': 'Server', 'msg': "The film with ID filmID does not exist" }], }, 404);
          return;
        }
        else{
          parametersExistance.findUsers(req.params.reviewersId)
            .then(function(response) {
              if(!response){
                utils.writeJson(res, { errors: [{ 'param': 'Server', 'msg': "One of the reviewers does not exist" }], }, 404);
                return;
              }
              else{
                Reviews.deleteReview(req.params.filmId, req.params.reviewersId, req.user.id)
                .then(function (response) {
                  utils.writeJson(res, response, 204);
                })
                .catch(function (response) {
                  if(response ==403){
                    utils.writeJson(res, { errors: [{ 'param': 'Server', 'msg': 'The user is not the owner of the film' }], }, 403);
                  }
                  else if(response == 409){
                    utils.writeJson(res, { errors: [{ 'param': 'Server', 'msg': 'The review has been already completed, so the invitation cannot be deleted anymore.' }], }, 409);
                  }
                  else if (response == 404){
                    utils.writeJson(res, { errors: [{ 'param': 'Server', 'msg': 'The review does not exist.' }], }, 404);
                  }
                  else {
                    utils.writeJson(res, {errors: [{ 'param': 'Server', 'msg': response }],}, 500);
                  }
                });
              }
            })
        }
      })
};

  /**
     * Adds a single/cooperative review of a film with
	   * id filmId made by the user[s] in the list reviewersId
     * ----------------------------------------------------------
     *  API: POST /api/films/public/:filmId/reviews/:reviewersId
     * ==========================================================
    */

module.exports.issueFilmReview = function issueFilmReview (req, res, next) {
  
  if(!parametersValidation.checkIdNumerical(req.params.filmId)){
    utils.writeJson(res, { errors: [{ 'param': 'Server', 'msg': "Wrong format of filmId path parameter" }], }, 400);
    return;
  }
  parametersExistance.findFilm(req.params.filmId)
        .then(function(response) {
            if(!response){
              utils.writeJson(res, { errors: [{ 'param': 'Server', 'msg': "The film with ID filmID does not exist" }], }, 404);
              return;
            }
            else{
              if(req.query.type && req.query.type!= "cooperative" && req.query.type!="single"){
                utils.writeJson(res, { errors: [{ 'param': 'Server', 'msg': "Wrong format of the query parameter 'type'" }], }, 400);
                return;
              }
              if(!req.body.reviewersId){
                utils.writeJson(res, { errors: [{ 'param': 'Server', 'msg': "missing reviewersId in the body" }], }, 400);
                return;
              }
              if(!Array.isArray(req.body.reviewersId)){
                utils.writeJson(res, { errors: [{ 'param': 'Server', 'msg': "reviewersId is not an array" }], }, 400);
                return;
              }
              if(req.query.type=="cooperative" && req.body.reviewersId.length<2){
                utils.writeJson(res, { errors: [{ 'param': 'Server', 'msg': "Cooperative review with less than two users" }], }, 400);
                return;
              }
              if((Object.keys(req.body)).length>=2){
                utils.writeJson(res, { errors: [{ 'param': 'Server', 'msg': "Too many properties in the body" }], }, 400);
                return;
              }
              if(((Object.keys(req.query)).length==1 && !req.query.type)|| ((Object.keys(req.query)).length>1)){
                utils.writeJson(res, { errors: [{ 'param': 'Server', 'msg': "Wrong format of query parameters" }], }, 400);
              }
              else {
                req.params.filmId=Number.parseInt(req.params.filmId);
                Reviews.issueFilmReview(req, req.user.id)
                .then(function (response) {
                  utils.writeJson(res, response, 201);
                })
                .catch(function (response) {
                  if(response == 403){
                    utils.writeJson(res, { errors: [{ 'param': 'Server', 'msg': 'The user is not the owner of the film' }], }, 403);
                  }
                  else if(response == 404){
                    utils.writeJson(res, { errors: [{ 'param': 'Server', 'msg': 'The film is a private one' }], }, 404);
                  }
                  else {
                      utils.writeJson(res, {errors: [{ 'param': 'Server', 'msg': response }],}, 500);
                  }
                });
              }
            }
          })
  
};


  /**
     * Updates a single/cooperative review of a film with
	   * id filmId made by the user[s] in the list reviewersId
     * ----------------------------------------------------------------
     *  API: PUT /api/films/public/:filmId/reviews/single/:reviewersId
     * ================================================================
    */
module.exports.updateSingleReview = function updateSingleReview (req, res, next) {
  if(!parametersValidation.checkIdNumerical(req.params.filmId)){
    utils.writeJson(res, { errors: [{ 'param': 'Server', 'msg': "Wrong format of filmId path parameter" }], }, 400);
    return;
  }
  if(!parametersValidation.checkIdNumerical(req.params.reviewerId)){
    utils.writeJson(res, { errors: [{ 'param': 'Server', 'msg': "Wrong format of reviewerId path parameter" }], }, 400);
    return;
  }
  if(req.params.reviewerId != req.user.id)
  {
    utils.writeJson(res, { errors: [{ 'param': 'Server', 'msg': 'The reviewerId is not equal the id of the requesting user.' }], }, 403);
    return;
  }
  parametersExistance.findFilm(req.params.filmId)
      .then(function(response) {
        if(!response){
          utils.writeJson(res, { errors: [{ 'param': 'Server', 'msg': "The film with ID filmID does not exist" }], }, 404);
          return;
        }
        else{
          Reviews.updateSingleReview(req.body, req.params.filmId, req.params.reviewerId)
          .then(function(response) {
              utils.writeJson(res, response, 204);
          })
          .catch(function(response) {
              if (response == 404){
                  utils.writeJson(res, { errors: [{ 'param': 'Server', 'msg': 'The review does not exist.' }], }, 404);
              }
              else if (response == 409){
                utils.writeJson(res, { errors: [{ 'param': 'Server', 'msg': 'The review is already completed.' }], }, 409);
            }
              else {
                  utils.writeJson(res, { errors: [{ 'param': 'Server', 'msg': response }], }, 500);
              }
          });  
        }
      })

};

