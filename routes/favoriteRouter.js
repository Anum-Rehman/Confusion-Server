const express = require('express');
const bodyParser = require('body-parser');
const authenticate = require('../authenticate')
const Favorites = require('../models/favorites');
const cors = require('./cors')

const favoriteRouter = express.Router();

favoriteRouter.use(bodyParser.json())

favoriteRouter.route('/')
.options(cors.corsWithOptions, (req,res)=>{
    res.sendStatus(200);
})
.get(cors.cors, authenticate.verifyUser, (req,res,next) => {
    Favorites.find({user: req.user._id})
    .populate('dishes')
    .populate('user')
    .then((favorites)=>{
        if(favorites !== null){
            res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(favorites);
    }
        else{
            err = new Error('Favorite Dishes not exists');
                err.status = 404;
                return next(err)
        }
    },(err) => next(err))
    .catch((err) => next(err));
})
    .post(cors.corsWithOptions,authenticate.verifyUser, (req, res, next) => {
        Favorites.find({user: req.user._id})
        .then((favorite)=>{
            if(favorite.length>0){
                let favoriteDish = [];
                for (var i=0; i<req.body.length; i++) {
                    if (favorite[0].dishes.indexOf(req.body[i]._id) === -1) {
                        favoriteDish.push(req.body[i]._id);
                    }
                }
                Favorites.findByIdAndUpdate(favorite[0]._id, {
                    $push: {"dishes": favoriteDish}
                }
                , { new: true })
                .then((favorites) => {
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json(favorites)
                }, (err) => next(err))
                .catch((err) => next(err));
            }
            else{
                Favorites.create({
                    user: req.user._id,
                    dishes: req.body
                })
                    .then((favorite) => {                
                        console.log('favorites Created ', favorite);
                        res.statusCode = 200;
                        res.setHeader('Content-Type', 'application/json');
                        res.json(favorite)
                    }, (err) => next(err))
                    .catch((err) => next(err));
            }
        },(err) => next(err))
        .catch((err) => next(err));
    })
    .put(cors.corsWithOptions,authenticate.verifyUser, (req, res, next) => {
        res.statusCode = 403;
        res.end('PUT operation not supported on /favorites');
    })
    .delete(cors.corsWithOptions,authenticate.verifyUser, (req, res, next) => {
        Favorites.find({user: req.user._id})
        .then((favorites)=>{
            if(favorites.length>0){
                Favorites.remove({})
            .then((resp) => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(resp)
            }, (err) => next(err))
            .catch((err) => next(err));
            }
            else{
                err = new Error('Favorite Dishes not exists');
                err.status = 404;
                return next(err)
            }
        }, (err) => next(err))
        .catch((err) => next(err));
    });

favoriteRouter.route('/:dishId')
.options(cors.corsWithOptions, (req,res)=>{
    res.sendStatus(200);
})
    .get(cors.cors, authenticate.verifyUser, (req, res, next) => {
        res.statusCode = 403;
        res.end('GET operation not supported on /favorites/dishId');
    })

    .post(cors.corsWithOptions,authenticate.verifyUser, (req, res, next) => {
        Favorites.find({user: req.user._id})
        .then((favorite) => {
            // res.json(favorite)
            console.log(req.params.dishId,"req.params.dishId")
            if(favorite.length > 0){
                    if (favorite[0].dishes.indexOf(req.params.dishId) === -1) {
                        this.data = req.params.dishId
                    }

               if(this.data !=null){
                Favorites.findByIdAndUpdate(favorite[0]._id, {
                    $push: {"dishes": this.data}
                }
                , { new: true })
                .then((favorites) => {
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json(favorites)
                }, (err) => next(err))
                .catch((err) => next(err));
               }
               else{
                res.statusCode = 403;
                res.end('Dish already exists');
               }
            }
            else{
                Favorites.create({
                    user: req.user._id,
                    dishes: req.params.dishId
                })
                .then((favorite) => {                
                    console.log('favorites Created ', favorite);
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json(favorite)
                }, (err) => next(err))
                .catch((err) => next(err));
            }
        }, (err) => next(err))
        .catch((err) => next(err));
    })

    .put(cors.corsWithOptions,authenticate.verifyUser, (req, res, next) => {
        res.statusCode = 403;
        res.end('PUT operation not supported on /favorites/dishId');
    })

    .delete(cors.corsWithOptions,authenticate.verifyUser, (req, res, next) => {
        Favorites.find({user: req.user._id})
        .then((favorite)=>{
            if(favorite.length>0){
                if(favorite[0].dishes.length === 1 && favorite[0].dishes.indexOf(req.params.dishId) === 0){
                    Favorites.remove({})
                    .then((resp) => {
                        res.statusCode = 200;
                        res.setHeader('Content-Type', 'application/json');
                        res.json(resp)
                    }, (err) => next(err))
                    .catch((err) => next(err));
                }
                else{
                Favorites.findByIdAndUpdate(favorite[0]._id, {
                    $pull: {dishes : {$in: [req.params.dishId]}}
                }, { new: true })
                .then((resp) => {
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json(resp)
                }, (err) => next(err))
                .catch((err) => next(err));
            }
            }
            else{
                err = new Error('Favorite Dishes not exists');
                err.status = 404;
                return next(err)
            }
        }, (err) => next(err))
        .catch((err) => next(err));

        // Favorites.findById(req.params._id)
        //     .then((resp) => {
        //         res.statusCode = 200;
        //         res.setHeader('Content-Type', 'application/json');
        //         res.json(resp)
        //     }, (err) => next(err))
        //     .catch((err) => next(err));
    });


//Comments Operation
// favoriteRouter.route('/:favoriteId/comments')
// favoriteRouter.route('/')
// .options(cors.corsWithOptions, (req,res)=>{
//     res.sendStatus(200);
// })
//     .get(cors.cors,(req, res, next) => {
//         favorites.findById(req.params.favoriteId)
//         .populate('comments.author')
//             .then((favorite) => {
//                 if (favorite != null) {
//                     res.statusCode = 200;
//                     res.setHeader('Content-Type', 'application/json');
//                     res.json(favorite.comments)
//                 }
//                 else{
//                     err = new Error('favorite' + req.params.favoriteId + 'not exists');
//                     err.status = 404;
//                     return next(err)
//                 }
//             }, (err) => next(err))
//             .catch((err) => next(err));
//     })
//     .post(cors.corsWithOptions,authenticate.verifyUser, (req, res, next) => {
//         favorites.findById(req.params.favoriteId)
//             .then((favorite) => {
//                 if (favorite != null) {
//                     req.body.author = req.user._id
//                     favorite.comments.push(req.body);
//                     favorite.save()
//                     .then((favorite)=>{
//                         favorites.findById(favorite._id)
//                         .populate('comments.author')
//                         .then((favorite)=>{
//                             res.statusCode = 200;
//                             res.setHeader('Content-Type', 'application/json');
//                             res.json(favorite);
//                         })
//                     },(err)=>next(err))
//                 }
//                 else{
//                     err = new Error('favorite' + req.params.favoriteId + 'not exists');
//                     err.status = 404;
//                     return next(err)
//                 }
//             }, (err) => next(err))
//             .catch((err) => next(err));
//     })
//     .put(cors.corsWithOptions,authenticate.verifyUser, (req, res, next) => {
//         res.statusCode = 403;
//         res.end('PUT operation not supported on /Favorites/' + req.params.favoriteId + '/comments');
//     })
//     .delete(cors.corsWithOptions,authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
//         favorites.findById(req.params.favoriteId)
//             .then((favorite) => {
//                 if (favorite != null) {
//                    for(var i= (favorite.comments.length -1); i>=0 ; i--){
//                        favorite.comments.id(favorite.comments[i]._id).remove();
//                    }
//                    favorite.save()
//                     .then((favorite)=>{
//                         res.statusCode = 200;
//                         res.setHeader('Content-Type', 'application/json');
//                         res.json(favorite);
//                     },(err)=>next(err))
//                 }
//                 else{
//                     err = new Error('favorite' + req.params.favoriteId + 'not exists');
//                     err.status = 404;
//                     return next(err)
//                 }
//             }, (err) => next(err))
//             .catch((err) => next(err));
//     });

//     favoriteRouter.route('/:favoriteId/comments/:commentId')
//     favoriteRouter.route('/')
// .options(cors.corsWithOptions, (req,res)=>{
//     res.sendStatus(200);
// })
//     .get(cors.cors,(req,res,next) => {
//         favorites.findById(req.params.favoriteId)
//         .populate('comments.author')
//         .then((favorite) => {
//             if (favorite != null && favorite.comments.id(req.params.commentId) != null) {
//                 res.statusCode = 200;
//                 res.setHeader('Content-Type', 'application/json');
//                 res.json(favorite.comments.id(req.params.commentId));
//             }
//             else if (favorite == null) {
//                 err = new Error('favorite ' + req.params.favoriteId + ' not found');
//                 err.status = 404;
//                 return next(err);
//             }
//             else {
//                 err = new Error('Comment ' + req.params.commentId + ' not found');
//                 err.status = 404;
//                 return next(err);            
//             }
//         }, (err) => next(err))
//         .catch((err) => next(err));
//     })
//     .post(cors.corsWithOptions,authenticate.verifyUser, (req, res, next) => {
//         res.statusCode = 403;
//         res.end('POST operation not supported on /favorites/'+ req.params.favoriteId
//             + '/comments/' + req.params.commentId);
//     })
//     .put(cors.corsWithOptions,authenticate.verifyUser, (req, res, next) => {
//         favorites.findById(req.params.favoriteId)
//         .then((favorite) => {
//             if (favorite != null && favorite.comments.id(req.params.commentId) != null) {
//                 if((req.user._id).equals(favorite.comments.id(req.params.commentId).author)){
//                 if (req.body.rating) {
//                     favorite.comments.id(req.params.commentId).rating = req.body.rating;
//                 }
//                 if (req.body.comment) {
//                     favorite.comments.id(req.params.commentId).comment = req.body.comment;                
//                 }
//                 favorite.save()
//                 .then((favorite) => {
//                     favorites.findById(favorite._id)
//                     .populate('comments.author')
//                     .then((favorite)=>{
//                         res.statusCode = 200;
//                         res.setHeader('Content-Type', 'application/json');
//                         res.json(favorite); 
//                     })               
//                 }, (err) => next(err));
//             }
//             else{
//                 var err = new Error("You are not authorized to perform this operation!");
//             err.status = 403;
//             next(err);
//             }
//             }
//             else if (favorite == null) {
//                 err = new Error('favorite ' + req.params.favoriteId + ' not found');
//                 err.status = 404;
//                 return next(err);
//             }
//             else {
//                 err = new Error('Comment ' + req.params.commentId + ' not found');
//                 err.status = 404;
//                 return next(err);            
//             }
//         }, (err) => next(err))
//         .catch((err) => next(err));
//     })
//     .delete(cors.corsWithOptions,authenticate.verifyUser, (req, res, next) => {
//         favorites.findById(req.params.favoriteId)
//         .then((favorite) => {
//             if (favorite != null && favorite.comments.id(req.params.commentId) != null) {
//                 if((req.user._id).equals(favorite.comments.id(req.params.commentId).author)){
//                 favorite.comments.id(req.params.commentId).remove();
//                 favorite.save()
//                 .then((favorite) => {
//                     favorites.findById(favorite._id)
//                     .populate('comments.author')
//                     .then((favorite)=>{
//                         res.statusCode = 200;
//                         res.setHeader('Content-Type', 'application/json');
//                         res.json(favorite); 
//                     })                
//                 }, (err) => next(err));
//             }
//             else{
//                 var err = new Error("You are not authorized to perform this operation!");
//             err.status = 403;
//             next(err);
//             }
//             }
//             else if (favorite == null) {
//                 err = new Error('favorite ' + req.params.favoriteId + ' not found');
//                 err.status = 404;
//                 return next(err);
//             }
//             else {
//                 err = new Error('Comment ' + req.params.commentId + ' not found');
//                 err.status = 404;
//                 return next(err);            
//             }
//         }, (err) => next(err))
//         .catch((err) => next(err));
//     });
    
module.exports = favoriteRouter;