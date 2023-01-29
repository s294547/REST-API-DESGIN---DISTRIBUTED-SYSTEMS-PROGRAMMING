var parametersManipulation = require('../utils/parametersManipulation.js');

class Review{    
    constructor(filmId, reviewersId, completed, reviewDate, rating, review) {
        this.filmId = Number.parseInt(filmId);
        this.reviewersId = parametersManipulation.getReviewersArray(reviewersId);
        this.completed = completed==1?true:false;

        if(reviewDate)
            this.reviewDate = reviewDate;
        if(rating)
            this.rating = rating;
        if(review)
            this.review = review;
        
        var selfLink = "/api/films/public/" + this.filmId + "/reviews/" + reviewersId;
        var selfLink2 = "/api/films/public/" + this.filmId + "/reviews/";
        if((parametersManipulation.getReviewersArray(reviewersId)).length>1){
            selfLink2= selfLink2+ "cooperative/"
        }
        else{
            selfLink2= selfLink2+ "single/"
        }
        selfLink2= selfLink2+ reviewersId
        this.self =  selfLink;
        this.self2= selfLink2;
    }
}

module.exports = Review;


