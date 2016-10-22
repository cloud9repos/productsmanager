'use strict'

var 
    express = require('express')
  , http = require('http')
  , path = require('path')
  , flash = require("connect-flash")
  , passport = require("passport")
  , LocalStrategy = require("passport-local")
  , CONST = require("./constants.js")
  
  // Models
  , mongoConnect = require("./models-mongoose/mongoConnect")
  , usersModel = require("./models-mongoose/users")
  
  //Routes
  , routes = require('./routes')
  , usersRoutes = require("./routes/users")
  , shopifyOperationsRoutes = require('./routes/shopify-operations')

//auth support
passport.serializeUser(usersRoutes.serialize)
passport.deserializeUser(usersRoutes.deserialize)
passport.use(usersRoutes.strategy)

var app = express();

app.configure(function(){
  
  app.set('port', process.env.PORT || 3000);
  app.set('views', __dirname + '/views');
  app.set('view engine', 'ejs');
  
  app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(express.cookieParser())
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(express.session({ secret: 'keyboard cat'}))
  app.use(flash())
  app.use(passport.initialize())
  app.use(passport.session())
  app.use(app.router);
  app.use(express.static(path.join(__dirname, 'public')));
  
});

app.configure('development', function(){
  app.use(express.errorHandler());
});
    
mongoConnect.connect(CONST.MONGODB_URI, function(err) {
  if(err) throw err
})

usersRoutes.configure({
  users: usersModel
  , passport: passport
})

shopifyOperationsRoutes.configure({
  users: usersModel
})

//app routes
app.get('/', routes.index);

//handle logout
app.get('/logout', usersRoutes.doLogout)

//check registered client and do login
app.get('/initshopify'
  , usersRoutes.initShopify
  , passport.authenticate('local', {failureRedirect: '/', failureFlash: true})
  , usersRoutes.postLogin)

//redirect uri to get access token
app.get('/registerclient'
  , usersRoutes.registerClient
  , passport.authenticate('local', {failureRedirect: '/', failureFlash: true})
  , usersRoutes.postLogin)
  
//mass products create
app.post('/initmassproductcreate'
  , usersRoutes.ensureAuthenticated
  ,  shopifyOperationsRoutes.initMassProductsCreate)



http.createServer(app).listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});
