var express = require('express');
const { body } = require('express-validator/check');
var router = express.Router();
var mongo = require('mongodb');

var posts = require('../models/posts');
var categories = require('../models/categories');
var users = require('../models/users');

/* GET home page. */
router.get('/add', function(req, res, next) {
    
    var errors = req.validationErrors();
    
    var currentUser={
        name: req.session.name,
        email: req.session.email
    };

    categories.find()
    .then(results => {
        if(req.session.isLoggedIn){
            return res.render('create', {
                'title': 'Add Post',
                'categories': results,
                'errors': errors,
                name: req.session.name,
                'currentUser': currentUser,
                'editing': false,
                path: '/posts/add',
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
});

router.get('/user', function(req, res, next) {
	
    var email = req.session.email;

    var errors = req.validationErrors();
    
    users.find({"email":email})
    .then(users=>{
        posts.find({"email": email})
        .then(posts => {
            if(req.session.isLoggedIn){
                
                return res.render('read',{ 
                    title: "User Blogs",
                    name: req.session.name,
                    path: '/posts/user',
                    posts: posts,
                    user: users[0],
                    follow: 3,
                    explore:false,
                    userblog: true,
                    "errors": errors,
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
        .catch(err=>console.log(err)); 
    })
    .catch(err=>console.log(err)); 
    
});

	
router.post('/addcomment', function(req, res, next) {
    var name = req.body.name;
    var email= req.body.email;
    var body = req.body.body;
    var postid= req.body.postid;
    var commentdate = new Date();

  	// Form Validation
	req.checkBody('name','Name field is required').notEmpty();
	req.checkBody('email','Email field is required but never displayed').notEmpty();
	req.checkBody('email','Email is not formatted properly').isEmail();
	req.checkBody('body', 'Body field is required').notEmpty();

	// Check Errors
	var errors = req.validationErrors();

    var currentUser={
        name: req.session.name,
        email: req.session.email
    };

	if(errors){
		posts.findOne({_id: postid},function(err, post){
            
            return res.render('show',{
                'title': "Complete Blog",
                'post': post,
                name: req.session.name,
                "errors": errors,
                userblog: false,
                currentUser: currentUser,
                path: '/read',
                isAuthenticated: req.session.isLoggedIn
            });
        });
    }
    if(!errors) {
		var comment = {
			"name": name,
			"email": email,
			"body": body,
			"commentdate": commentdate
		}
		posts.update({ 
			"_id": postid
		},{
			$push:{
				comments : comment
			}
		}, function(err, doc){
			if(err){
				throw err;
            }
            if(!err) {
				res.location('/read/'+postid);
				res.redirect('/read/'+postid);
			}
		});
	}
});

router.get('/edit/:id', function(req, res, next) {
	
    var id= req.params.id;
    
    var errors = req.validationErrors();
    
    var currentUser={
        name: req.session.name,
        email: req.session.email
    };

    posts.findById(id)
    .then(post => {
        categories.find()
        .then(results => {
            return res.render('create', {
                'title': 'Edit Post',
                name: req.session.name,
                'errors': errors,
                'post': post,
                'categories': results,
                'currentUser': currentUser,
                'editing': true,
                path: '/posts/add',
                isAuthenticated: req.session.isLoggedIn    
            });
        }).catch(err => console.log(err));
    })
    .catch(err => console.log(err));

});

router.get('/delete/:id', function(req, res, next) {
	
    var id= req.params.id;
    console.log(id);

    var errors = req.validationErrors();
    if(!errors){         
        posts.remove( {_id : id})
        .then(result=>{
            req.flash('success','Post deleted successfully');
            res.location('/posts/user');
            res.redirect('/posts/user');
        }).catch(err => console.log(err));
        
    }
    if(errors){
        req.flash('failure','Post not deleted');
        res.location('/posts/user');
        res.redirect('/posts/user');
    }   
});

router.post('/deletecomment/:postid', function(req, res, next) {
            
    var postid=req.params.postid;
    var commentname=req.body.commentname;
    var commentbody=req.body.commentbody;
    var commentemail=req.body.commentemail;
    var commentdate=req.body.commentdate;
    
    var errors = req.validationErrors();
    if(!errors){         
        posts.updateOne(
            { _id: postid},
            { $pull: { comments: { name: commentname , email: commentemail , body: commentbody } } },
            { }
          )
        .then(result=>{
            res.location('/read/'+postid);
            res.redirect('/read/'+postid);
        }).catch(err => console.log(err));
        
    }
    if(errors){
        res.location('/read/'+postid);
        res.redirect('/read/'+postid);
    }   
});


router.get('/like/:postid', function(req, res, next) {
            
    var postid=req.params.postid;
    var name=req.session.name;
    
    posts.findById(postid)
    .then(post => {
        var liked=false;
        for(var i=0;i<post.likes.length;i++){
            if(post.likes[i].name===req.session.name){
                liked=true;
            }
        }
        if(!liked){
            var liked = {
                "name": req.session.name
            }
            posts.update({ 
                "_id": postid
            },{
                $push:{
                    likes : liked
                }
            }, function(err, doc){
                if(err){
                    throw err;
                }
                if(!err) {
                    res.location('/read/'+postid);
                    res.redirect('/read/'+postid);
                }
            });
            
        }
        else{
            res.location('/read/'+postid);
            res.redirect('/read/'+postid);
        }
    })
    .catch(err => console.log(err));
    
    
});


router.get('/unlike/:postid', function(req, res, next) {
            
    var postid=req.params.postid;
    var name=req.session.name;
    
    var errors = req.validationErrors();
    if(!errors){         
        posts.updateOne(
            { _id: postid},
            { $pull: { likes: { name: req.session.name } } },
            { }
          )
        .then(result=>{
            res.location('/read/'+postid);
            res.redirect('/read/'+postid);
        }).catch(err => console.log(err));
        
    }
    if(errors){
        res.location('/read/'+postid);
        res.redirect('/read/'+postid);
    }   
});


module.exports = router;