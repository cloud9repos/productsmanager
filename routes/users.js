var LocalStrategy = require("passport-local").Strategy
    , CONST = require("./constants.js")
    , users = undefined
    , passport = undefined

    
exports.configure = function(params) {
    users = params.users
    passport = params.passport
}

module.exports.serialize = function(user, done) {
    done(null, user.id)
}

module.exports.deserialize = function(id, done) {
    users.findById(id, function(err, user) {
        done(err, user)
    })
}

module.exports.strategy = new LocalStrategy(
    function(username, password, done) {
        process.nextTick(function() {
            users.findByUsername(username, function(err, user) {
                if(err) { return done(err) }
                if(!user) { return done(null, false, {
                    message: 'Unknown user ' + username
                }) }
                if(user.password != password) {
                    return done(null, false, { message: 'Invalid password' })
                }
                return done(null, user)
            })
        })
    }
)

module.exports.ensureAuthenticated = function(req, res, next) {
    if(req.isAuthenticated()) { return next() }
    return res.redirect('/login')
}

module.exports.doAccount = function(req, res) {
    res.render('account', {
        title: 'Acount information for ' + req.user.username
        , user: req.user
    })
}

module.exports.doLogin = function(req, res) {
    res.render('login', {
        title: 'Login to Notes'
        , user: req.user
        , message: req.flash('error')
    })
}

module.exports.postLogin = function(req, res) {
    res.redirect('/')
}

module.exports.doLogout = function(req, res) {
    req.logout()
    res.redirect('/')
}

module.exports.signInShopify = function(req, res) {
    var storeName
    console.log("req.originalUrl", req.originalUrl)
    /*users.findByUsername('abhi-1', function(err, doc) {
        console.log("err", err)
        console.log("doc", doc)
        if(!doc) {
            users.create('abhi-1', 'shopifyuser', null, null, function(err) {
                console.log("err", err)
            })
        }
    })*/
    
    res.redirect('https://'+ storeName +'.myshopify.com/admin/oauth/authorize?client_id='+ CONST.CLIENT_ID +'&scope='+ CONST.SCOPE +'&redirect_uri='+ CONST.REDIRECT_URI +'/&state=nonce')
}