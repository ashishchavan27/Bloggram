var express = require('express');
var router = express.Router();
var mongo = require('mongodb');
var posts = require('../models/posts');
var categories = require('../models/categories');
var users = require('../models/users');

const { check, body } = require('express-validator/check');


const bcrypt = require('bcryptjs');

router.get('/', function(req, res, next) {
  var errors = req.validationErrors();
  if(errors){
    for(let i=0;i<errors.length;i++){
      req.flash('failure', errors[i].msg);
    }
    res.redirect('/login');
  }
	else{
    return res.render('login',{
      title: "Login Page",
      path: '/login',
      editing: false,
      isAuthenticated: false
      });
    }    
});

router.post('/',[
  body('password', 'Password has to be valid.')
    .isLength({ min: 5 })
    .isAlphanumeric()
    .trim()
],function(req, res, next) {
  var email = req.body.email;
  var password= req.body.password;

  // req.checkBody('name','name field is required').notEmpty();
  req.checkBody('email','email field is required').notEmpty();
  req.checkBody('password', 'Password field is required').notEmpty();
  
  var errors = req.validationErrors();
    
    users.find({"email": email })
    .then(Users => {
      if(Users.length > 0){
          console.log(Users[0].password);
          bcrypt
          .compare(password, Users[0].password)
          .then(doMatch => {
            if (doMatch) {
              req.session.email = email;
              req.session.username=Users[0].username;
              req.session.name=Users[0].name;
              req.session.userfollowers=Users[0].followers;
              req.session.userfollowing=Users[0].following;
              req.session.isLoggedIn = true;
              req.flash('success','Logged In');
              return req.session.save(err => {
                res.location('/');
                res.redirect('/');
              });
            }
            req.flash('failure','Password does not match');
              return res.render('login',{
                title: "Login Page",
                email:email,
                password: password,
                editing: true,
                path: '/login',
                isAuthenticated: false
              });
            })
          .catch(err => {
            console.log(err);
            res.redirect('/login');
          });
        }
      else {
          if(errors){
              for(let i=0;i<errors.length;i++){
              req.flash('failure', errors[i].msg);
            }
            return res.render('login',{
              title: "Login Page",
              email:email,
              password: password,
              path: '/login',
              editing: true,
              isAuthenticated: false
            });
          }
          if(!errors){
            req.flash('failure','Incorrect user email. Kindly Register if not done!!');
             return res.render('login',{
              title: "Login Page",
              email:email,
              password: password,
              path: '/login',
              editing: true,
              isAuthenticated: false
            });
          }
        }
      })
    .catch(err => {
      console.log(err);
    });
});


module.exports = router;