'use strict';

var utils = require('../utils/writer.js');
var Films = require('../service/FilmsService');
var constants = require('../utils/constants.js');

  /**
     * Gets the list of public films
     * ---------------------------------------------------------
     *  API: GET /api/films/public
     * =========================================================
    */

module.exports.getPublicFilms = function getPublicFilms (req, res, next) {
    var numOfFilms = 0;
    var next=0;
  
    Films.getPublicFilmsTotal()
        .then(function(response) {
            numOfFilms = response;
            Films.getPublicFilms(req)
            .then(function(response) {
                if (req.query.pageNo == null) var pageNo = 1;
                else var pageNo = req.query.pageNo;
                var totalPage=Math.ceil(numOfFilms / constants.OFFSET);
                next = Number(pageNo) + 1;
                if (pageNo>totalPage) {
                    utils.writeJson(res, {
                        totalPages: totalPage,
                        currentPage: pageNo,
                        totalItems: numOfFilms,
                        films: {}
                    });
                } else if (pageNo == totalPage) {
                    utils.writeJson(res, {
                        totalPages: totalPage,
                        currentPage: pageNo,
                        totalItems: numOfFilms,
                        films: response
                    });
                } else {
                    utils.writeJson(res, {
                        totalPages: totalPage,
                        currentPage: pageNo,
                        totalItems: numOfFilms,
                        films: response,
                        next: "/api/films/public?pageNo=" + next
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
  
  
    
  };

    /**
     * Gets the list of public films a user has been invited to review
     * ---------------------------------------------------------
     *  API: GET /api/films/public/invited
     * =========================================================
    */

  module.exports.getInvitedFilms = function getInvitedFilms (req, res, next) {
    var numOfFilms = 0;
    var next=0;
  
    Films.getInvitedFilmsTotal(req.user.id)
        .then(function(response) {
            numOfFilms = response;
            Films.getInvitedFilms(req)
            .then(function(response) {
                if (req.query.pageNo == null) var pageNo = 1;
                else var pageNo = req.query.pageNo;
                var totalPage=Math.ceil(numOfFilms / constants.OFFSET);
                next = Number(pageNo) + 1;
                if (pageNo>totalPage) {
                    utils.writeJson(res, {
                        totalPages: totalPage,
                        currentPage: pageNo,
                        totalItems: numOfFilms,
                        films: {}
                    });
                } else if (pageNo == totalPage) {
                    utils.writeJson(res, {
                        totalPages: totalPage,
                        currentPage: pageNo,
                        totalItems: numOfFilms,
                        films: response
                    });
                } else {
                    utils.writeJson(res, {
                        totalPages: totalPage,
                        currentPage: pageNo,
                        totalItems: numOfFilms,
                        films: response,
                        next: "/api/films/public/invited?pageNo=" + next
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
  
  
    
  };

    /**
     * Gets the list of private films of an user
     * ---------------------------------------------------------
     *  API: GET /api/films/private
     * =========================================================
    */
  
  module.exports.getPrivateFilms = function getPrivateFilms (req, res, next) {
      var numOfFilms = 0;
      var next=0;
    
      Films.getPrivateFilmsTotal(req.user.id)
          .then(function(response) {
              numOfFilms = response;
              Films.getPrivateFilms(req)
              .then(function(response) {
                  if (req.query.pageNo == null) var pageNo = 1;
                  else var pageNo = req.query.pageNo;
                  var totalPage=Math.ceil(numOfFilms / constants.OFFSET);
                  next = Number(pageNo) + 1;
                  if (pageNo>totalPage) {
                    utils.writeJson(res, {
                        totalPages: totalPage,
                        currentPage: pageNo,
                        totalItems: numOfFilms,
                        films: {}
                    });
                  } else if (pageNo == totalPage) {
                      utils.writeJson(res, {
                          totalPages: totalPage,
                          currentPage: pageNo,
                          totalItems: numOfFilms,
                          films: response
                      });
                  } else {
                      utils.writeJson(res, {
                          totalPages: totalPage,
                          currentPage: pageNo,
                          totalItems: numOfFilms,
                          films: response,
                          next: "/api/films/" + req.params.userId + "/films/private?pageNo=" + next
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
    };
  
  /**
     * Adds a film
     * ---------------------------------------------------------
     *  API: POST /api/films
     * =========================================================
    */

module.exports.createFilm = function createFilm (req, res, next) {
    var film = req.body;
    var owner = req.user.id;
    Films.createFilm(film, owner)
        .then(function(response) {
            utils.writeJson(res, response, 201);
        })
        .catch(function(response) {
            utils.writeJson(res, { errors: [{ 'param': 'Server', 'msg': response }], }, 500);
        });
  };

  /**
     * Gets a single private film with id filmId
     * ---------------------------------------------------------
     *  API: GET /api/films/private/:filmId
     * =========================================================
    */

module.exports.getSinglePrivateFilm = function getSinglePrivateFilm (req, res, next) {
    Films.getSinglePrivateFilm(req.params.filmId, req.user.id)
          .then(function(response) {
              utils.writeJson(res, response);
          })
          .catch(function(response) {
              if(response == 403){
                  utils.writeJson(res, { errors: [{ 'param': 'Server', 'msg': 'The user is not the owner of the film.' }], }, 403);
              }
              else if (response == 404){
                  utils.writeJson(res, { errors: [{ 'param': 'Server', 'msg': 'The film does not exist.' }], }, 404);
              }
              else {
                  utils.writeJson(res, { errors: [{ 'param': 'Server', 'msg': response }], }, 500);
              }
          });
  };

  /**
     * Updates a single private film with id filmId
     * ---------------------------------------------------------
     *  API: PUT /api/films/private/:filmId
     * =========================================================
    */  

module.exports.updateSinglePrivateFilm = function updateSinglePrivateFilm (req, res, next) {
    Films.updateSinglePrivateFilm(req.body, req.params.filmId, req.user.id)
    .then(function(response) {
        utils.writeJson(res, response, 204);
    })
    .catch(function(response) {
        if(response == 403){
            utils.writeJson(res, { errors: [{ 'param': 'Server', 'msg': 'The user is not the owner of the film' }], }, 403);
        }
        else if (response == 404){
            utils.writeJson(res, { errors: [{ 'param': 'Server', 'msg': 'The film does not exist.' }], }, 404);
        }
        else if (response == 409){
            utils.writeJson(res, { errors: [{ 'param': 'Server', 'msg': 'The visibility of the film cannot be changed.' }], }, 409);
        }
        else {
            utils.writeJson(res, { errors: [{ 'param': 'Server', 'msg': response }], }, 500);
        }
    });
  };


    /**
     * Deletes a single private film with id filmId
     * ---------------------------------------------------------
     *  API: DELETE /api/films/private/:filmId
     * =========================================================
    */  


module.exports.deleteSinglePrivateFilm = function deleteSinglePrivateFilm (req, res, next) {
  Films.deleteSinglePrivateFilm(req.params.filmId, req.user.id)
        .then(function(response) {
            utils.writeJson(res, response, 204);
        })
        .catch(function(response) {S
            if(response == 403){
                utils.writeJson(res, { errors: [{ 'param': 'Server', 'msg': 'The user is not the owner of the film' }], }, 403);
            }
            else if (response == 404){
                utils.writeJson(res, { errors: [{ 'param': 'Server', 'msg': 'The film does not exist.' }], }, 404);
            }
            else if (response == 409){
                utils.writeJson(res, { errors: [{ 'param': 'Server', 'msg': 'The visibility of the film cannot be changed.' }], }, 409);
            }
            else {
                utils.writeJson(res, { errors: [{ 'param': 'Server', 'msg': response }], }, 500);
            }
        });
};

  /**
     * Gets a single public film with id filmId
     * ---------------------------------------------------------
     *  API: GET /api/films/public/:filmId
     * =========================================================
    */  

module.exports.getSinglePublicFilm = function getSinglePublicFilm (req, res, next) {
    Films.getSinglePublicFilm(req.params.filmId)
    .then(function(response) {
        utils.writeJson(res, response);
    })
    .catch(function(response) {
        if (response == 404){
            utils.writeJson(res, { errors: [{ 'param': 'Server', 'msg': 'The film does not exist.' }], }, 404);
        }
        else {
            utils.writeJson(res, { errors: [{ 'param': 'Server', 'msg': response }], }, 500);
        }
    });
};

  /**
     * Updates a single public film with id filmId
     * ---------------------------------------------------------
     *  API: PUT /api/films/public/:filmId
     * =========================================================
    */  

module.exports.updateSinglePublicFilm = function updateSinglePublicFilm (req, res, next) {
    Films.updateSinglePublicFilm(req.body, req.params.filmId, req.user.id)
    .then(function(response) {
        utils.writeJson(res, response, 204);
    })
    .catch(function(response) {
        if(response == 403){
            utils.writeJson(res, { errors: [{ 'param': 'Server', 'msg': 'The user is not the owner of the film' }], }, 403);
        }
        else if (response == 404){
            utils.writeJson(res, { errors: [{ 'param': 'Server', 'msg': 'The film does not exist.' }], }, 404);
        }
        else if (response == 409){
            utils.writeJson(res, { errors: [{ 'param': 'Server', 'msg': 'Attempt to make unallowed change' }], }, 409);
        }
        else {
            utils.writeJson(res, { errors: [{ 'param': 'Server', 'msg': response }], }, 500);
        }
    });
  };

    /**
     * Deletes a single public film with id filmId
     * ---------------------------------------------------------
     *  API: DELETE /api/films/public/:filmId
     * =========================================================
    */  

  module.exports.deleteSinglePublicFilm = function deleteSinglePublicFilm (req, res, next) {
    Films.deleteSinglePublicFilm(req.params.filmId, req.user.id)
          .then(function(response) {
              utils.writeJson(res, response, 204);
          })
          .catch(function(response) {
              if(response == 403){
                  utils.writeJson(res, { errors: [{ 'param': 'Server', 'msg': 'The user is not the owner of the film' }], }, 403);
              }
              else if (response == 404){
                  utils.writeJson(res, { errors: [{ 'param': 'Server', 'msg': 'The film does not exist.' }], }, 404);
              }
              else {

                  utils.writeJson(res, { errors: [{ 'param': 'Server', 'msg': response }], }, 500);
              }
          });
  };
  
  