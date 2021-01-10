var express = require('express');
var router = express.Router();
var mongo = require('mongodb');
var posts = require('../models/posts');
var categories = require('../models/categories');
var users = require('../models/users');

const { check, body } = require('express-validator/check');

const bcrypt = require('bcryptjs');

/* GET home page. */
router.get('/', function(req, res, next) {
    var errors = req.validationErrors();

	if(errors){
        for(let i=0;i<errors.length;i++){
          req.flash('failure', errors[i].msg);
        }
        return res.redirect('/register');
    }
	else{
        return res.render('register',{
        title: "register Page",
        path: '/register',
        editing: false,
        isAuthenticated: false
        });
    }    
});



router.post('/',[
    body(
      'password',
      'Please enter a password with only numbers and text and at least 5 characters.'
    )
    .isLength({ min: 5 })
    .isAlphanumeric()
    .trim()
  ], function(req, res, next) {
  
  var email = req.body.email;
  var password= req.body.password;
  var name=req.body.name;
  var username = "";
  for (var i = 0, len = name.length; i < len; i++) {
      if(name[i]===' '){
          username += "_";
      }
      else{
          username += name[i];
      }
  }
  username = username.toLowerCase();

  req.checkBody('name','name field is required').notEmpty();
  req.checkBody('email','email field is required').notEmpty();
  req.checkBody('email','Enter valid Email address').isEmail();
  req.checkBody('password', 'Password field is required').notEmpty();
  
  var errors = req.validationErrors();
  
  if(errors){
    for(let i=0;i<errors.length;i++){
      req.flash('failure', errors[i].msg);
    }
    return res.render('register',{
      "errors": null,
      title: "Register Page",
      email:email,
      password: password,
      name: name,
      path: '/register',
      editing: true,
      isAuthenticated: false
    });
  }
  if(!errors){
  users.find({"email": email})
  .then(results => {
  if(results.length > 0){
    req.session.username = username;
    req.session.name = name;
    req.flash('success','Email address already exists');
    return res.render('login',{
      title: "Login Page",
      email:email,
      password: password,
      path: '/login',
      editing: true,
      isAuthenticated: false
    });
  }
  else{
    users.find({"username": username})
    .then(Users => {
      if(Users.length > 0){
      req.flash('failure','Use another name');
      return res.render('register',{
        "errors": null,
        title: "Register Page",
        email:email,
        password: password,
        name: name,
        path: '/register',
        editing: true,
        isAuthenticated: false
      });
    }else{
      var imageUrl= "uploads/noprofile.png";
      bcrypt
      .hash(password, 12)
      .then(hashedPassword => {
        const user = new users({
          name: name,
          username: username,
          email:email,
          password: hashedPassword,
          imageUrl: imageUrl 
        });
        return user.save();
      })
      .then(result => {
        req.session.username = username;
        req.session.name = name;
        req.session.email = email;
        req.session.isLoggedIn = true;    
        req.flash('success','Logged in');
        res.location('/');
        res.redirect('/');
        // return transporter.sendMail({
        //   to: email,
        //   from: 'shop@node-complete.com',
        //   subject: 'register succeeded!',
        //   html: '<h1>You successfully signed up!</h1>'
        // });
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
  })
  .catch(err => {
    console.log(err);
  });

}
 
});


module.exports = router;