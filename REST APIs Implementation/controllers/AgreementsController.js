'use strict';

var utils = require('../utils/writer.js');
var parametersValidation = require('../utils/parametersValidation.js');
var parametersExistance = require('../utils/parametersExistance.js');
var parametersManipulation = require('../utils/parametersManipulation.js');
var Agreements = require('../service/AgreementsService');
var constants = require('../utils/constants.js');


  /**
     * Adds an agreement to a cooperative review draft, given the film Id, the
	   * the reviewers Id and the draftId
     * ---------------------------------------------------------------------------------------------------------
     *      		API: POST /api/films/public/:filmId/reviews/cooperative/:reviewersId/drafts/:draftId/agreements
     * =========================================================================================================
    */

module.exports.addAgreement = function addAgreement (req, res, next) {
    let reviewersArray=parametersManipulation.getReviewersArray(parametersManipulation.fromCommasToMinus(req.params.reviewersId));
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
        utils.writeJson(res, { errors: [{ 'param': 'Server', 'msg': "The author of the agreement is not a reviewer" }], }, 403);
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
                        Agreements.addAgreement(req, req.user.id)
                        .then(function(response) {
                            utils.writeJson(res, response, 201);
                        })
                        .catch(function(response) {
                            if (response == 404){
                                utils.writeJson(res, { errors: [{ 'param': 'Server', 'msg': 'The draft does not exist.' }], }, 404);
                            }
                            else if(response== '409A'){
                                utils.writeJson(res, { errors: [{ 'param': 'Server', 'msg':'The draft has alrady been closed' }], }, 409);
                            }
                            else if(response == '409B'){
                                utils.writeJson(res, { errors: [{ 'param': 'Server', 'msg':'You have already expressed an agreement for the draft' }], }, 409);
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
     * Gets the agreements of a cooperative review draft, given the film Id, the
	   * the reviewers Id and the draftId
     * ---------------------------------------------------------------------------------------------------------
     *    API: GET /api/films/public/:filmId/reviews/cooperative/:reviewersId/drafts/:draftId/agreements
     * =========================================================================================================
    */


  module.exports.getAgreements = function getAgreements (req, res, next) {
    
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
                        parametersExistance.findDraft(req.params.filmId,parametersManipulation.fromCommasToMinus(req.params.reviewersId), req.params.draftId)
                        .then(function(response) {
                          if(!response){
                            utils.writeJson(res, { errors: [{ 'param': 'Server', 'msg': "The draft does not exist" }], }, 404);
                            return;
                          }
                          else{
                            Agreements.getAgreementsTotal(req.params.filmId, req.params.reviewersId, req.params.draftId)
                            .then(function(response) {
                                let numOfAgreements = response;
                                if(numOfAgreements == 0){
                                  utils.writeJson(res, { errors: [{ 'param': 'Server', 'msg': "There is no agreement" }], }, 404);
                                  return;
                                }
                                Agreements.getAgreements(req)
                                .then(function(response) {
                    
                                    if (req.query.pageNo == null) var pageNo = 1;
                                    else var pageNo = req.query.pageNo;
                                    var totalPage=Math.ceil(numOfAgreements / constants.OFFSET);
                                    next = Number(pageNo) + 1;
                                    if (pageNo>totalPage) {
                                        utils.writeJson(res, { errors: [{ 'param': 'Server', 'msg': "The page does not exist." }], }, 404);
                                    } else if (pageNo == totalPage) {
                                        utils.writeJson(res, {
                                            totalPages: totalPage,
                                            currentPage: pageNo,
                                            totalItems: numOfAgreements,
                                            agreements: response
                                        });
                                    } else {
                                        utils.writeJson(res, {
                                            totalPages: totalPage,
                                            currentPage: pageNo,
                                            totalItems: numOfAgreements,
                                            agreements: response,
                                            next: "/api/films/public/" + req.params.filmId +"/reviews/cooperative/"+req.params.reviewersId+"/drafts/"+req.params.draftId+"/?pageNo=" + next
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
          }
        })
  };

  /**
     * Gets an agreement of a cooperative review draft, given the film Id, the
	   * the reviewers Id, the draftId and the authorId
     * ---------------------------------------------------------------------------------------------------------
     *  API: GET /api/films/public/:filmId/reviews/cooperative/:reviewersId/drafts/:draftId/agreements/:authorId
     * =========================================================================================================
    */

  module.exports.getAgreement = function getAgreemen (req, res, next) {
    
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

    if(!parametersValidation.checkIdNumerical(req.params.draftId)){
        utils.writeJson(res, { errors: [{ 'param': 'Server', 'msg': "Wrong format of draftId path parameter" }], }, 400);
        return;
      }
    
    if(!parametersValidation.checkIdNumerical(req.params.authorId)){
        utils.writeJson(res, { errors: [{ 'param': 'Server', 'msg': "Wrong format of authorId path parameter" }], }, 400);
        return;
      }
    
    if(!reviewersArray.includes(req.params.authorId) && !reviewersArray.includes((req.params.authorId).toString()) && !reviewersArray.includes(Number.parseInt(req.params.authorId))){
        utils.writeJson(res, { errors: [{ 'param': 'Server', 'msg': "The author of the agreement is not a reviewer" }], }, 403);
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
                        parametersExistance.findDraft(req.params.filmId,parametersManipulation.fromCommasToMinus(req.params.reviewersId), req.params.draftId)
                        .then(function(response) {
                          if(!response){
                            utils.writeJson(res, { errors: [{ 'param': 'Server', 'msg': "The draft does not exist" }], }, 404);
                            return;
                          }

                          else{
                            Agreements.getAgreement(req.params.filmId, req.params.reviewersId, req.params.draftId, req.params.authorId)
                            .then(function(response) {
                                utils.writeJson(res, response);
                            })
                            .catch(function(response) {
                                if (response == 404){
                                    utils.writeJson(res, { errors: [{ 'param': 'Server', 'msg': 'The agreement does not exist.' }], }, 404);
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
          }
        })
  };

    /**
     * Deletes an agreement of a cooperative review draft, given the film Id, the
	   * the reviewers Id, the draftId and the authorId
     * ---------------------------------------------------------------------------------------------------------
     *  API: DELETE /api/films/public/:filmId/reviews/cooperative/:reviewersId/drafts/:draftId/agreements/:authorId
     * =========================================================================================================
    */

  module.exports.deleteAgreement = function deleteAgreemen (req, res, next) {
    
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

    if(!parametersValidation.checkIdNumerical(req.params.draftId)){
        utils.writeJson(res, { errors: [{ 'param': 'Server', 'msg': "Wrong format of draftId path parameter" }], }, 400);
        return;
      }

      if(!parametersValidation.checkIdNumerical(req.params.authorId)){
        utils.writeJson(res, { errors: [{ 'param': 'Server', 'msg': "Wrong format of authorId path parameter" }], }, 400);
        return;
      }
      
      if(!reviewersArray.includes(req.params.authorId) && !reviewersArray.includes((req.params.authorId).toString()) && !reviewersArray.includes(Number.parseInt(req.params.authorId))){
        utils.writeJson(res, { errors: [{ 'param': 'Server', 'msg': "The author of the agreement is not a reviewer" }], }, 403);
        return;
      }

      if(req.params.authorId!=req.user.id){
        utils.writeJson(res, { errors: [{ 'param': 'Server', 'msg': "The user who tries to delete the agreement must be the author of the agreement" }], }, 403);
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
                        parametersExistance.findDraft(req.params.filmId,parametersManipulation.fromCommasToMinus(req.params.reviewersId), req.params.draftId)
                        .then(function(response) {
                          if(!response){
                            utils.writeJson(res, { errors: [{ 'param': 'Server', 'msg': "The draft does not exist" }], }, 404);
                            return;
                          }

                          else{
                            Agreements.deleteAgreement(req.params.filmId, req.params.reviewersId, req.params.draftId, req.params.authorId)
                            .then(function(response) {
                                utils.writeJson(res, response, 204);
                            })
                            .catch(function(response) {
                                if (response == 404){
                                    utils.writeJson(res, { errors: [{ 'param': 'Server', 'msg': 'The agreement does not exist.' }], }, 404);
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
          }
        })
  };