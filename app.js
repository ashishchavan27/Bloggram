var express = require('express');
var path = require('path');
var fs = require('fs');
var https = require('https');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');
var multer = require('multer');
var moment = require('moment');
var expressValidator = require('express-validator');
var helmet= require('helmet');
var compression= require('compression');

var mongo = require('mongodb');
const mongoose = require('mongoose');// to save data
const MongoDBStore = require('connect-mongodb-session')(session);//connecting and storing sessions with cookies
const users = require('./models/users');


const MONGODB_URI =
  `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@cluster0.u4kt0.mongodb.net/${process.env.MONGO_DEFAULT_DATABASE}`;
  
const store = new MongoDBStore({
  uri: MONGODB_URI,
  collection: 'sessions'
});

const fileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads');
  },
  filename: (req, file, cb) => {
    cb(null,  Math.random()+'_'+file.originalname);
  }
});

const fileFilter = (req, file, cb) => {
  if (
    file.mimetype === 'image/png' ||
    file.mimetype === 'image/jpg' ||
    file.mimetype === 'image/jpeg'
  ) {
    cb(null, true);
  } else {
    cb(null, false);
  }
};


var mainRoutes = require('./routes/index');
var postsRoutes = require('./routes/posts');
var categoriesRoutes = require('./routes/categories');
var loginRoutes = require('./routes/login');
var readRoutes = require('./routes/read');
var registerRoutes = require('./routes/register');
var feedRoutes = require('./routes/feed');
var searchRoutes = require('./routes/search');

// console.log(MONGODB_URI);
// console.log(process.env.NODE_ENV);


var app= express();

app.locals.moment = require('moment');

app.locals.truncateText = function(text, length){
  var truncatedText = text.substring(0, length);
  return truncatedText;
}

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads/',express.static(path.join(__dirname, 'uploads')));

app.use(
  multer({ storage: fileStorage , fileFilter: fileFilter }).single('image')
);

// Express Session
app.use(session({
    secret: 'secret',
    saveUninitialized: true,
    resave: true,
    store: store
}));

// Connect-Flash
app.use(require('connect-flash')());
app.use(function (req, res, next) {
  res.locals.messages = require('express-messages')(req, res);
  next();
});


app.use(expressValidator({
    errorFormatter: function(param, msg, value) {
        var namespace = param.split('.')
        , root    = namespace.shift()
        , formParam = root;
  
      while(namespace.length) {
        formParam += '[' + namespace.shift() + ']';
      }
      return {
        param : formParam,
        msg   : msg,
        value : value
      };
    }
  })
);

// app.use(function(req,res,next){
//     req.db = db;    
//     next();
// });

app.use((req, res, next) => {
  if (!req.session.user) {
    return next();
  }
  users.findById(req.session.user._id)
    .then(user => {
      req.user = user;
      // console.log(req.user);
      next();
    })
    .catch(err => console.log(err));
    

});// user created 

app.use('/', mainRoutes);
app.use('/posts', postsRoutes);
app.use('/categories', categoriesRoutes);
app.use('/login', loginRoutes);
app.use('/read', readRoutes);
app.use('/feed', feedRoutes);
app.use('/search', searchRoutes);
app.use('/register', registerRoutes);

app.use(helmet());
app.use(compression());

// catch 404 and forward to error handler
// app.use(function(req, res, next) {
//   var err = new Error('Not Found');
//   err.status = 404;
//   next(err);
// });

// error handlers

// // development error handler
// // will print stacktrace
// if (app.get('env') === 'development') {
//     app.use(function(err, req, res, next) {
//       res.status(err.status || 500);
//       res.render('error', {
//         message: err.message,
//         error: err
//       });
//     });
//   }
  
//   // production error handler
//   // no stacktraces leaked to user
//   app.use(function(err, req, res, next) {
//     res.status(err.status || 500);
//     res.render('error', {
//       message: err.message,
//       error: {}
//     });
//   });

mongoose
  .connect(MONGODB_URI,{ useNewUrlParser: true , useUnifiedTopology: true })
  .then(result => {
    // https
    // .createServer({key: privateKey, cert: certificate},app)
    // .listen(process.env.PORT || 3000);
    console.log("MONGO DB CONNECTED");
    app.listen(process.env.PORT || 3000,()=>{
      console.log("APP STARTED");
    });
  })
  .catch(err => {
    console.log(err);
  });
 