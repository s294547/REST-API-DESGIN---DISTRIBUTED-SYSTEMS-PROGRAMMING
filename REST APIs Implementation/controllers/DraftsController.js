'use strict';

var utils = require('../utils/writer.js');
var parametersValidation = require('../utils/parametersValidation.js');
var parametersExistance = require('../utils/parametersExistance.js');
var parametersManipulation = require('../utils/parametersManipulation.js');
var Drafts = require('../service/DraftsService');
var constants = require('../utils/constants.js');

/**
     * Adds a cooperative review draft, given the film Id and the
	   * the reviewers Id.
     * ------------------------------------------------------------------------------------
     *      		API: POST /api/films/public/:filmId/reviews/cooperative/:reviewersId/drafts
     * ====================================================================================
    */

module.exports.addCooperativeReviewDraft = function addCooperativeReviewDraft (req, res, next) {
    
    let reviewersArray= (parametersManipulation.getReviewersArray(parametersManipulation.fromCommasToMinus(req.params.reviewersId)));
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
    if(!reviewersArray.includes(req.user.id) && !reviewersArray.includes((req.user.id).toString()) && !reviewersArray.includes(Number.parseInt(req.user.id))){
      utils.writeJson(res, { errors: [{ 'param': 'Server', 'msg': "The author of the draft is not a reviewer" }], }, 403);
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
                    parametersExistance.findReview(req.params.filmId,parametersManipulation.fromCommasToMinus(req.params.reviewersId))
                    .then(function(response) {
                      if(!response){
                        utils.writeJson(res, { errors: [{ 'param': 'Server', 'msg': "The review does not exist" }], }, 404);
                        return;
                      }
                      else{
                        Drafts.addCooperativeReviewDraft(req, req.user.id)
                        .then(function(response) {
                            utils.writeJson(res, response, 201);
                        })
                        .catch(function(response) {
                            if(response== '409A'){
                                utils.writeJson(res, { errors: [{ 'param': 'Server', 'msg': 'There is already an open draft for that review' }], }, 409);
                            }
                            else if(response == '409B'){
                                utils.writeJson(res, { errors: [{ 'param': 'Server', 'msg': 'The review has already been completed' }], }, 409);
                            }
                            else {
                                utils.writeJson(res, { errors: [{ 'param': 'Server', 'msg': response }], }, 500);
                            }
                        });  
                      }
                    })
                }
              })
          }
        })
  };

  /**
     * Gets all the cooperative review drafts, given the film Id and the
	   * the reviewers Id.
     * ------------------------------------------------------------------------------------
     *      		API: GET /api/films/public/:filmId/reviews/cooperative/:reviewersId/drafts
     * ====================================================================================
    */

  module.exports.getCooperativeReviewDrafts = function getCooperativeReviewDrafts (req, res, next) {
    
    let reviewersArray= (parametersManipulation.getReviewersArray(parametersManipulation.fromCommasToMinus(req.params.reviewersId)));
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
                    parametersExistance.findReview(req.params.filmId,parametersManipulation.fromCommasToMinus(req.params.reviewersId))
                    .then(function(response) {
                      if(!response){
                        utils.writeJson(res, { errors: [{ 'param': 'Server', 'msg': "The review does not exist" }], }, 404);
                        return;
                      }
                      else{
                        Drafts.getDraftsTotal(req.params.filmId, req.params.reviewersId)
                        .then(function(response) {
                            let numOfDrafts = response;
                            if(numOfDrafts == 0){
                              utils.writeJson(res, { errors: [{ 'param': 'Server', 'msg': "There is no draft" }], }, 404);
                              return;
                            }
                            Drafts.getCooperativeReviewDrafts(req)
                            .then(function(response) {
                
                                if (req.query.pageNo == null) var pageNo = 1;
                                else var pageNo = req.query.pageNo;
                                var totalPage=Math.ceil(numOfDrafts / constants.OFFSET);
                                next = Number(pageNo) + 1;
                                if (pageNo>totalPage) {
                                    utils.writeJson(res, { errors: [{ 'param': 'Server', 'msg': "The page does not exist." }], }, 404);
                                } else if (pageNo == totalPage) {
                                    utils.writeJson(res, {
                                        totalPages: totalPage,
                                        currentPage: pageNo,
                                        totalItems: numOfDrafts,
                                        drafts: response
                                    });
                                } else {
                                    utils.writeJson(res, {
                                        totalPages: totalPage,
                                        currentPage: pageNo,
                                        totalItems: numOfDrafts,
                                        drafts: response,
                                        next: "/api/films/public/" + req.params.filmId +"/reviews/cooperative/"+req.params.reviewersId+"/drafts?pageNo=" + next
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
                }
              })
          }
        })
  };

  /**
     * Gets a cooperative review draft, given the film Id, the
	   * the reviewers Id and the draftId
     * ---------------------------------------------------------------------------------------------
     *      		API: GET /api/films/public/:filmId/reviews/cooperative/:reviewersId/drafts/:draftId
     * =============================================================================================
    */


  module.exports.getCooperativeReviewDraft = function getCooperativeReviewDraft (req, res, next) {
    
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
    if(!parametersValidation.checkIdNumerical(req.params.draftId)){
        utils.writeJson(res, { errors: [{ 'param': 'Server', 'msg': "Wrong format of draftId path parameter" }], }, 400);
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
                    parametersExistance.findReview(req.params.filmId,parametersManipulation.fromCommasToMinus(req.params.reviewersId))
                    .then(function(response) {
                      if(!response){
                        utils.writeJson(res, { errors: [{ 'param': 'Server', 'msg': "The review does not exist" }], }, 404);
                        return;
                      }
                      else{
                        Drafts.getCooperativeReviewDraft(req.params.filmId, req.params.reviewersId, req.params.draftId)
                        .then(function(response) {
                            utils.writeJson(res, response);
                        })
                        .catch(function(response) {
                            if (response == 404){
                                utils.writeJson(res, { errors: [{ 'param': 'Server', 'msg': 'The draft does not exist.' }], }, 404);
                            }
                            else {
                                utils.writeJson(res, { errors: [{ 'param': 'Server', 'msg': response }], }, 500);
                            }
                        }); 
                      }
                    })
                }
              })
          }
        })
  };

    /**
     * Deletes a cooperative review draft, given the film Id, the
	   * the reviewers Id and the draftId
     * ---------------------------------------------------------------------------------------------
     *      		API: DELETE /api/films/public/:filmId/reviews/cooperative/:reviewersId/drafts/:draftId
     * =============================================================================================
    */

  module.exports.deleteCooperativeReviewDraft = function deleteCooperativeReviewDraft (req, res, next) {
    
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
    if(!parametersValidation.checkIdNumerical(req.params.draftId)){
        utils.writeJson(res, { errors: [{ 'param': 'Server', 'msg': "Wrong format of draftId path parameter" }], }, 400);
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
                    parametersExistance.findReview(req.params.filmId,parametersManipulation.fromCommasToMinus(req.params.reviewersId))
                    .then(function(response) {
                      if(!response){
                        utils.writeJson(res, { errors: [{ 'param': 'Server', 'msg': "The review does not exist" }], }, 404);
                        return;
                      }
                      else{
                        Drafts.deleteCooperativeReviewDraft(req.params.filmId, req.params.reviewersId, req.params.draftId, req.user.id)
                        .then(function(response) {
                            utils.writeJson(res, response, 204);
                        })
                        .catch(function(response) {
                            if (response == 404){
                                utils.writeJson(res, { errors: [{ 'param': 'Server', 'msg': 'The draft does not exist.' }], }, 404);
                            }
                            else if(response ==403){
                                utils.writeJson(res, { errors: [{ 'param': 'Server', 'msg': 'The draft owner is not the authenticated user' }], }, 403);
                            }
                            else if(response == 409){
                                utils.writeJson(res, { errors: [{ 'param': 'Server', 'msg': 'The draft has already been closed' }], }, 409);
                            }
                            else {
                                utils.writeJson(res, { errors: [{ 'param': 'Server', 'msg': response }], }, 500);
                            }
                        }); 
                      }
                    })
                }
              })
          }
        })
  };
