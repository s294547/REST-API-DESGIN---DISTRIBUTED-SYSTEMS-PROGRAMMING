var parametersManipulation = require('../utils/parametersManipulation.js');

class Draft{    
    constructor(filmId, reviewersId, draftId, authorId, rating, review, closed) {
        this.filmId = Number.parseInt(filmId);
        this.reviewersId = parametersManipulation.getReviewersArray(reviewersId);
        this.authorId= authorId;
        this.draftId= Number.parseInt(draftId);
        this.rating = rating;
        this.review = review;
        this.closed = closed==1?true:false;
        
        var selfLink = "/api/films/public/" + this.filmId + "/reviews/cooperative/" + reviewersId + "/drafts/" + this.draftId;
        this.self =  selfLink;
    }
}

module.exports = Draft;
