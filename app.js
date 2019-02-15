
var express = require('express');
var passport = require('passport');
var StravaStrategy = require('passport-strava-oauth2').Strategy;
var strava = require('strava-v3');

passport.use(new StravaStrategy({
    clientID: "",
    clientSecret: "" ,
    callbackURL: '/return'
  },
  function(accessToken, refreshToken, profile, cb) {
    return cb(null, profile);
  }
));

passport.serializeUser(function(user, cb) {
    cb(null, user);
});
  
passport.deserializeUser(function(obj, cb) {
    cb(null, obj);
});


// Create a new Express application.
var app = express();

// Configure view engine to render EJS templates.
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.use('/images', express.static(__dirname + '/images'));
app.use('/images', express.static(__dirname + '/images'));
// Use application-level middleware for common functionality, including
// logging, parsing, and session handling.
app.use(require('cookie-parser')());
app.use(require('body-parser').urlencoded({ extended: true }));
app.use(require('express-session')({ secret: 'keyboard cat', resave: true, saveUninitialized: true }));

// Initialize Passport and restore authentication state, if any, from the
// session.
app.use(passport.initialize());
app.use(passport.session());

// Define routes.
app.get('/',
  function(req, res) {
    res.render('home', { user: req.user });
  });

app.get('/login',
  function(req, res){
    res.render('login');
  });

app.get('/login/strava',
  passport.authenticate('strava'));

app.get('/return', 
  passport.authenticate('strava', { failureRedirect: '/login' }),
  function(req, res) {
    res.redirect('/');
  });

app.get('/profile',
  require('connect-ensure-login').ensureLoggedIn(),
  function(req, res){
    res.render('profile', { user: req.user });
});

app.get('/activity',
require('connect-ensure-login').ensureLoggedIn(),
async function(req, res){
  var runActivities;
   runActivities = await getData(req.user.token);                
   strava.activities.get({'access_token': req.user.token , 'id': '2148530633'},function(err,payload,limits) {
    console.log('dd' + payload.json());
    });
   //console.log(runActivities[0]);
   //res.render('activity', { user: req.user, runActivities: runActivities });
} );

function getData(token) 
{
  let response = new Promise((resolve, reject) => { 
    strava.athlete.listActivities({'access_token': token },function(err,payload,limits) {
     var start = new Date('2019-01-27');
     var end = new Date('2019-03-10');
     var runActivities = payload.filter(f => f.type === "Run" && (new Date(f.start_date) >=  start && new Date(f.start_date) <= end));
     resolve(runActivities);
    });
  });
  return response;
}


app.listen(3000);