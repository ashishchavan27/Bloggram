var express = require('express');
var router = express.Router();
var mongo = require('mongodb');
var posts = require('../models/posts');
var categories = require('../models/categories');
var multer = require('multer');

/* GET home page. */
router.get('/', function(req, res, next) {
    var currentUser={
        username: req.session.username,
        name: req.session.name,
        email: req.session.email
    };

    posts.find()
    .then(posts => {
        categories.find()
        .then(categories => {
            return  res.render('read', {
                title: "Reading Page",
                    path: '/read',
                    name: req.session.name,
                    editing: false,
                    "heading": "EXPLORE BLOGS",
                    follow: 0,
                    categories: categories,
                    posts: posts,
                    explore: true,
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

router.post('/', function(req, res, next) {
    var title = req.body.title;
    var category= req.body.category;
    var body = req.body.body;
    var author = req.body.author;
    var date = new Date();
    var email = req.session.email;
    
    var currentUser={
        name: req.session.name,
        email: req.session.email
    };
    var image= req.file;
    if (!image) {
        
        var temp={
            _id: null,
            title: title,
            body: body,
            category: category,
            author: author,
            views: views
        }
        categories.find()
        .then(results => {
        req.flash('failure', 'You must select an image for the post');
        return res.render('create',{
            "title": title,
            name: req.session.name,
            "categories": results,
            editing: true,
            path: '/create',
            userblog: false,
            currentUser: currentUser,
            isAuthenticated: req.session.isLoggedIn,
            post: temp
        });
        }).catch(err => {
            console.log(err);
          });
        
    }else{
    var imageUrl= image.path;
    // var imageUrl= image.path;
    var views=0;

    var temp={
        title: title,
        body: body,
        category: category,
        imageUrl: imageUrl,
        author: author,
        views: views
    }
    console.log(image);
    console.log(imageUrl);

    // Form Validation
	req.checkBody('title','Title field is required').notEmpty();
	req.checkBody('body', 'Body field is required').notEmpty();
    req.checkBody('category', 'Category field is required').notEmpty();
    req.checkBody('author', 'Author field is required').notEmpty();
    
    // Check Errors
	var errors = req.validationErrors();

    categories.find()
    .then(results => {
        if(errors){
            for(let i=0;i<errors.length;i++){
                req.flash('failure', errors[i].msg);
            }
            return  res.render('create',{
                "title": title,
                name: req.session.name,
                "categories": results,
                editing: true,
                path: '/create',
                userblog: false,
                currentUser: currentUser,
                isAuthenticated: req.session.isLoggedIn,
                post: temp
            });
        }
        if(!errors){ 
            const post = new posts({
                title: title,
                category: category,
                body: body,
                imageUrl: imageUrl,
                email:email,
                date: date,
                author: author,
                views: views
            });
            post
            .save()
            .then(result => {
                req.flash('success','Post Added');
                res.location('/read');
                res.redirect('/read');
            })
            .catch(err => {
                console.log(err);
            });
        }
      
    })
    .catch(err => {
      console.log(err);
    });

    }
});

router.post('/:id', function(req, res, next) {
  
    var id= req.params.id;

   
    var currentUser={
        name: req.session.name,
        email: req.session.email
    };
    
    const image = req.file;
    console.log(image);
    if (!image) {
        req.flash('failure', 'You must select an image for the post');
        var temp={
            _id: id,
            title: title,
            body: body,
            category: category,
            author: author,
            views: views
        }
        
        categories.find()
        .then(results => {
        req.flash('failure', 'You must select an image for the post');
        return res.render('create',{
            "title": title,
            name: req.session.name,
            "categories": results,
            editing: true,
            path: '/create',
            userblog: false,
            currentUser: currentUser,
            isAuthenticated: req.session.isLoggedIn,
            post: temp
        });
        }).catch(err => {
            console.log(err);
        });
    }else{
        // Form Validation
        req.checkBody('title','Title field is required').notEmpty();
        req.checkBody('body', 'Body field is required').notEmpty();
        req.checkBody('category', 'Category field is required').notEmpty();
        
        // Check Errors
        var errors = req.validationErrors();

        if(errors){

            return  res.render('create',{
                "errors": errors,
                "title": "Edit page",
                "categories": results,
                editing: true,
                name: req.session.name,
                post:post,
                path: '/create',

                userblog: false,
                currentUser: currentUser,
                isAuthenticated: req.session.isLoggedIn
            });
        }

        posts.findById(id)
        .then(post => {
            categories.find()
            .then(results => {
                post.title = req.body.title;
                post.category= req.body.category;
                post.body = req.body.body;
                post.author = req.body.author;
                post.date = new Date();
                post.email = req.session.email;
                post.imageUrl= image.path;
                
                if(!errors){
                    post.save()
                    .then(result => {
                        req.flash('success','Post Added');
                        res.location('/read');
                        res.redirect('/read');
                    }).catch(err => console.log(err));
                }
            }).catch(err => console.log(err));
        })
        .catch(err => console.log(err));

    }
    
});

router.get('/:id', function(req, res, next) {
	
    var id= req.params.id;
    var reqEmail=req.session.email;
    console.log(id);

    var errors = req.validationErrors();
    
    var userblog=false;

    var currentUser={
        name: req.session.name,
        email: req.session.email
    };



    posts.findById(id)
    .then(post => {
        if(post.author===req.session.name)userblog=true;
        return  res.render('show',{
            'title': "Complete Blog",
            name: req.session.name,
            'post': post,
            currentUser: currentUser,
            "errors": errors,
            path: '/read',
            reqEmail: reqEmail,
            userblog: userblog,
            isAuthenticated: req.session.isLoggedIn
  		});
    })
    .catch(err => console.log(err));

});

module.exports = router;