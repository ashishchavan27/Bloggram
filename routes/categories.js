var express = require('express');
var router = express.Router();
var mongo = require('mongodb');
var posts = require('../models/posts');
var categories = require('../models/categories');
var users = require('../models/users');
const { all } = require('./posts');

/* GET home page. */
router.get('/add', function(req, res, next) {
    var errors = req.validationErrors();
    if(req.session.isLoggedIn){
        return res.render('categories',{
            title: "Category Page",
            path: '/categories/add',
            "errors": errors,
            name: req.session.name,
            isAuthenticated: req.session.isLoggedIn
        });
    }
    if(!req.session.isLoggedIn){
        req.flash('failure','Kindly Login');
        return res.render('login',{
            title: "login Page",
            path: '/login',
            "errors": errors,
            isAuthenticated: req.session.isLoggedIn
        });
    }
});

router.post('/add', function(req, res, next) {
    var name = req.body.name;
    req.checkBody('name','name field is required').notEmpty();    
    
    var errors = req.validationErrors();

    categories.find({"name":name})
    .then(Categories => {
      if(Categories.length > 0){
        req.flash('failure','Category already exists');
        res.location('/posts/add');
        res.redirect('/posts/add');
      }
      else {
        if(errors){
    
            for(let i=0;i<errors.length;i++){
              req.flash('failure', errors[i].msg);
            }
            if(req.session.isLoggedIn){
                res.redirect('/categories/add');
            }
            if(!req.session.isLoggedIn){
                res.redirect('/login');
            }
        }
        if(!errors){
            const category = new categories({
                name: name
            });
            category
            .save()
            .then(result => {
                req.flash('success','Category Added');
                res.location('/posts/add');
                res.redirect('/posts/add');
            })
            .catch(err => {
                console.log(err);
            });
        }
      }
    })
    .catch(err => {
      console.log(err);
    });
});
router.post('/find', function(req, res, next) {
    
    var errors = req.validationErrors();
    
    if(req.body.category==="All"){
        res.redirect("/read");
    }
    else{
    posts.find({category: req.body.category})
        .then(posts => {
            categories.find()
            .then(categories => {
                if(req.session.isLoggedIn){
                    return res.render('read',{
                        'title': req.body.category + " Page",
                        'posts': posts,
                        explore:true,
                        name: req.session.name,
                        categories: categories,
                        userblog: false,
                        follow: 0,
                        path: '/read',
                        "heading": req.body.category ,
                        isAuthenticated: req.session.isLoggedIn
                    });
                }
                if(!req.session.isLoggedIn){
                    req.flash('failure','Kindly Login');
                    return  res.redirect('/login');
                }  
            })
        })
        .catch(err => console.log(err));
    }
});

router.get('/findCategory/:category', function(req, res, next) {
    
    var errors = req.validationErrors();
    
    posts.find({category: req.params.category})
        .then(posts => {
            if(req.session.isLoggedIn){
                return res.render('read',{
                    'title': req.params.category + " Page",
                    'posts': posts,
                    explore:false,
                    name: req.session.name,
                    userblog: false,
                    follow: 0,
                    path: '/read',
                    "heading": req.params.category,
                    isAuthenticated: req.session.isLoggedIn
                });
            }
            if(!req.session.isLoggedIn){
                req.flash('failure','Kindly Login');
                return  res.redirect('/login');
            }  
        })
        .catch(err => console.log(err));
});

router.get('/findAuthor/:author', function(req, res, next) {
    if(!req.session.isLoggedIn){
        res.redirect('/login');
    }
    var errors = req.validationErrors();
    var flag=false;
    var allow=1;
    var findUser;
    var author=req.params.author;
    var username = "";
    for (var i = 0, len = author.length; i < len; i++) {
        if(author[i]===' '){
            username += "_";
        }
        else{
            username += author[i];
        }
    }
    author = username.toLowerCase();
    console.log(author);
    users.find({ username: { $regex: author } } || { name: { $regex: author } })
    .then(Users => {
        if(Users.length>0){
            
            findUser=Users[0];
            for(var i=0;i<Users[0].followers.length;i++){
                
                if(Users[0].followers[i].email===req.session.email){
                    allow = 2;
                    break;
                }
            }
            if(req.params.author===req.session.name){
                allow = 3;
            }

            console.log(allow);
            console.log(req.params.author);
            console.log(req.session.name);
            

            posts.find({author: req.params.author})
            .then(posts => {
                if(req.session.isLoggedIn){
                    return res.render('read',{
                        'title': Users[0].name + " Page",
                        'posts': posts,
                        "heading": Users[0].name+ "'s Profile",
                        userblog: false,
                        follow: allow,
                        explore:false,
                        name: req.session.name,
                        author: req.params.author,
                        user: findUser,
                        path: '/read',
                        isAuthenticated: req.session.isLoggedIn
                    });
                }
                if(!req.session.isLoggedIn){
                    req.flash('failure','Kindly Login');
                    return res.render('login',{
                        title: "login Page",
                        path: '/login',
                        "errors":errors,
                        isAuthenticated: req.session.isLoggedIn
                    });
                }  
            })
            .catch(err => console.log(err));
        }
        else{
            req.flash('failure','No results found!!');
            res.redirect('/read');
        }
    })
    .catch(err => {
      console.log(err);
    }); 
    
});

module.exports = router;