var express = require('express');
var router = express.Router();
var mongo = require('mongodb');
var posts = require('../models/posts');
var categories = require('../models/categories');
var users = require('../models/users');

router.get('/', function(req, res, next) {
    
    if(req.session.isLoggedIn){
        return res.render('index',{
            title: "Index Page",
            name: req.session.name,
            isAuthenticated: req.session.isLoggedIn,
            path: '/'
        });
    }
    if(!req.session.isLoggedIn){
        return res.render('index',{
            title: "Index Page",
            isAuthenticated: req.session.isLoggedIn,
            path: '/'
        });
    }
    
    
});

router.get('/profile', function(req, res, next) {
    
    users.find({"username": req.session.username})
    .then(Users => {
        if(req.session.isLoggedIn){
            return res.render('profile',{
                title: req.session.name+ " Page",
                user : Users[0],
                name: req.session.name,
                isAuthenticated: req.session.isLoggedIn,
                path: '/profile'
            });
        }
        if(!req.session.isLoggedIn){
            return res.render('index',{
                title: "Index Page",
                isAuthenticated: req.session.isLoggedIn,
                path: '/'
            });
        }
    })
    .catch(err => {
      console.log(err);
    });
});

router.get('/follow/:author',(req,res,next)=>{
    
    var author= req.params.author;
    var errors = req.validationErrors();
    
    var email;
    var name=author;
    var ref = "";
    for (var i = 0, len = name.length; i < len; i++) {
        if(name[i]===' '){
            ref += "_";
        }
        else{
            ref += name[i];
        }
    }
    author = ref.toLowerCase();
    users.find({"username": author})
    .then(Users => {
        email=Users[0].email;
        
        var followers = {
            "name": req.session.name,
            "email": req.session.email
        };
        var following = {
            "name": name,
            "email": email
        };

        users.updateOne({ 
                "email": email 
            },{
                $push:{
                    followers : followers
                }
            }, function(err, doc){
                if(err){
                throw err;
            }        
        });
        users.updateOne({ 
            "email": req.session.email 
        },{
            $push:{
                following : following
            }
        }, function(err, doc){
            if(err){
            throw err;
        }
        if(!err) {
            req.flash('success','You started following '+author);
                res.location('/categories/findAuthor/'+author);
                res.redirect('/categories/findAuthor/'+author);
            }
        });
        
        
    })
    .catch(err => {
      console.log(err);
    });
    

    
});

router.get('/unfollow/:author',(req,res,next)=>{
    

    var author= req.params.author;
    var errors = req.validationErrors();
    
    var email;
    var name=author;
    var ref = "";
    for (var i = 0, len = name.length; i < len; i++) {
        if(name[i]===' '){
            ref += "_";
        }
        else{
            ref += name[i];
        }
    }
    author = ref.toLowerCase();
    users.find({"username": author})
    .then(Users => {
        email=Users[0].email;
        console.log(name);
        console.log(email);
        console.log(req.session.name);
        console.log(req.session.email);

        var followers = {
            "name": req.session.name,
            "email": req.session.email,
        };
        var following = {
            "name": name,
            "email": email
        };
        users.updateOne({ 
            "email": email
            },{
                $pull: { followers: { name: req.session.name , email: req.session.email ,  } }
            }, function(err, doc){
                if(err){
                throw err;
            }        
        });
        users.updateOne({ 
            "email": req.session.email 
        },{
            $pull: { following: { name: name , email: email , } } 
        }, function(err, doc){
            if(err){
            throw err;
        }
        if(!err) {
            req.flash('failure','You unfollowed '+name);
            res.location('/categories/findAuthor/'+name);
            res.redirect('/categories/findAuthor/'+name);
            }
        });
    })
    .catch(err => {
      console.log(err);
    });
    

    
});

router.get('/followers/:author',(req,res,next)=>{
    

    var errors = req.validationErrors();
    
    var currentUser;
    var author= req.params.author;
    
    var name=author;
    var ref = "";
    for (var i = 0, len = name.length; i < len; i++) {
        if(name[i]===' '){
            ref += "_";
        }
        else{
            ref += name[i];
        }
    }
    author = ref.toLowerCase();
    users.find({"username": req.session.username})
    .then(Users => {
        currentUser=Users[0];
        console.log(currentUser);
        users.find({"username": author})
        .then(Users => {
            return res.render('follow',{
                title: Users[0].name+ " followers",
                author : Users[0],
                user: currentUser,
                name: req.session.name,
                editing: true,
                isAuthenticated: req.session.isLoggedIn,
                path: '/followers'
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

router.get('/following/:author',(req,res,next)=>{
    

    var errors = req.validationErrors();
    
    var currentUser;
    var author= req.params.author;
    
    var name=author;
    var ref = "";
    for (var i = 0, len = name.length; i < len; i++) {
        if(name[i]===' '){
            ref += "_";
        }
        else{
            ref += name[i];
        }
    }
    author = ref.toLowerCase();

    users.find({"username": req.session.username})
    .then(Users => {
        currentUser=Users[0];
        console.log(currentUser);
        users.find({"username": author})
        .then(Users => {
            return res.render('follow',{
                title: Users[0].name+ " following",
                author : Users[0],
                user: currentUser,
                name: req.session.name,
                editing: false,
                isAuthenticated: req.session.isLoggedIn,
                path: '/following'
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


router.get('/update/:user', function(req, res, next) {
	
    var email = req.session.email;

    var errors = req.validationErrors();
    
    users.find({"email":email})
    .then(users=>{
        var currentUser=users[0];
        console.log(users[0]);
        return res.render('update',{
            title: "Update profile",
            heading: "Update profile",
            user: currentUser,
            editing: false,
            name: req.session.name,
            isAuthenticated: req.session.isLoggedIn,
            path: '/update/profile'
        });
    })
    .catch(err=>console.log(err)); 
    
});

router.post('/update/:user', function(req, res, next) {
    
        var email = req.session.email;
        var name = req.session.name;
        var userfacebook =req.body.facebook;
        var usertwitter =req.body.twitter;
        var userinstagram =req.body.instagram;
        var userlinkedin =req.body.linkedin;

        var errors = req.validationErrors();
        
        console.log(name);
        console.log(email);
        users.find({"email":req.session.email})
        .then(users=>{
            var currentUser=users[0];
            currentUser.name=name;
            currentUser.email=email;
            currentUser.facebook=userfacebook;
            currentUser.twitter=usertwitter;
            currentUser.instagram=userinstagram;
            currentUser.linkedin=userlinkedin;
            currentUser.save()
            .then(result => {
                req.flash('success','Profile Updated');
                res.location('/posts/user');
                res.redirect('/posts/user');
            }).catch(err => console.log(err));
        })
        .catch(err=>console.log(err)); 
    
    // }else{
        
    //     imageUrl= image.path;var email = req.session.email;
    //     var name = req.session.name;
    //     var errors = req.validationErrors();
        
    //     console.log(name);
    //     console.log(email);
    //     users.find({"email":req.session.email})
    //     .then(users=>{
    //         var currentUser=users[0];
    //         currentUser.name=name;
    //         currentUser.email=email;
    //         currentUser.imageUrl=imageUrl;
    //         currentUser.save()
    //         .then(result => {
    //             req.flash('success','Profile Updated');
    //             res.location('/posts/user');
    //             res.redirect('/posts/user');
    //         }).catch(err => console.log(err));
    //     })
    //     .catch(err=>console.log(err)); 
        
    // }

    

    
});

router.get('/logout', function(req, res, next) {
	req.session.destroy(err => {
        console.log(err);
        res.redirect('/');
    });
});


module.exports = router;