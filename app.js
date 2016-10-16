'use strict'

var 
    express = require('express')
  , routes = require('./routes')
  , http = require('http')
  , path = require('path')
  , flash = require("connect-flash")
  , usersRoutes = require("./routes/users")
  , passport = require("passport")
  , LocalStrategy = require("passport-local")
  , CONST = require("./constants.js")

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

var mongoConnect = require("./models-mongoose/mongoConnect")
    , usersModel = require("./models-mongoose/users")
    
mongoConnect.connect(CONST.MONGODB_URI, function(err) {
  if(err) throw err
})

usersRoutes.configure({
  users: usersModel
  , passport: passport
})


app.get('/', routes.index);

//user routes
app.get('/account', usersRoutes.ensureAuthenticated, usersRoutes.doAccount)
app.get('/login', usersRoutes.doLogin)
app.post('/login', passport.authenticate('local', {
  failureRedirect: '/login', failureFlash: true
}), usersRoutes.postLogin)
app.get('/logout', usersRoutes.doLogout)
app.get('/initshopify', usersRoutes.initShopify)

http.createServer(app).listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});
