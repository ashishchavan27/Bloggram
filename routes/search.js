var express = require('express');
var router = express.Router();
var mongo = require('mongodb');
var posts = require('../models/posts');
var users = require('../models/users');
var categories = require('../models/categories');


router.get('/user/:search', function(req, res, next) {
    var currentUser;
    
    var search= req.params.search;
    var AllUsers;
    users.find({'$or':[
        {'name':{'$regex':search, '$options':'i'}},
        {'username':{'$regex':search, '$options':'i'}}]
    })
    .limit(4)
    .then(Users => {
        AllUsers=Users;
        users.find({email: req.session.email})
        .then(Users => {
            currentUser=Users[0];
            posts.find({'$or':[
                {'title':{'$regex':search, '$options':'i'}},
                {'category':{'$regex':search, '$options':'i'}}]})
            .then(posts => {
                return res.render('searchUsers', {
                    title: "Search Results",
                    path: '/search',
                    name: req.session.name,
                    editing: false,
                    heading: "Top results for "+ search ,
                    follow: 0,
                    allUsers: AllUsers,
                    posts: posts,
                    currentUser: currentUser,
                    userblog: false,
                    isAuthenticated: req.session.isLoggedIn
                });
            })
            .catch(err => {
                console.log(err);
            });
            
        })
        .catch(err => {
            console.log(err);
        });
    })
    .catch(err => {
        console.log(err);
    });

    

    
});


module.exports = router;