var parametersManipulation = require('../utils/parametersManipulation.js');

class Agreement{    
    constructor(filmId, reviewersId, draftId, authorId, agreement, reason) {
        this.filmId = Number.parseInt(filmId);
        this.reviewersId = parametersManipulation.getReviewersArray(reviewersId);
        this.authorId= Number.parseInt(authorId);
        this.draftId= Number.parseInt(draftId);
        this.agreement= agreement==1?true:false;
        if(reason)
            this.reason= reason;
        
        var selfLink = "/api/films/public/" + this.filmId + "/reviews/cooperative/" + reviewersId + "/drafts/" + this.draftId + "/agreements/" + this.authorId;
        this.self =  selfLink;
    }
}

module.exports = Agreement;