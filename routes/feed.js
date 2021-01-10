var express = require('express');
var router = express.Router();
var mongo = require('mongodb');
var posts = require('../models/posts');
var categories = require('../models/categories');
var users = require('../models/users');


router.get('/', function(req, res, next) {
    
    var currentUser={
        name: req.session.name,
        email: req.session.email
    };
    users.find({username: req.session.username})
    .then(user => {
        currentUser=user[0];
        console.log(user[0]);
        console.log(req.session.username);
        posts.find()
        .then(posts => {
            return res.render('feed', {
                title: "Your Feed",
                path: '/feed',
                name: req.session.name,
                editing: false,
                "heading": "BLOG FEED",
                follow: 0,
                posts: posts,
                user: currentUser,
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

    
});

module.exports = router;