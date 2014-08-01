var express           = require('express')
  , helmet            = require('helmet')
  , csrf              = require('csurf')
  , cookieParser      = require('cookie-parser')
  , bodyParser        = require('body-parser')
  , cookieSession     = require('cookie-session')
  , methodOverride    = require('method-override')
  , compress          = require('compression')
  , swig              = require('swig')
  , path              = require('path')
  , fs                = require('fs')
  , logger            = require("morgan")
  , debug             = require('debug')('myApp');

var app = express();
var env = process.env.NODE_ENV || 'development';

app.set('port', (process.env.PORT || 4000));
app.use(compress());
app.use(bodyParser());
app.use(helmet.defaults())
app.use(methodOverride());

// Configure templating
if (process.env.NODE_ENV !== 'production') {
  swig.setDefaults({ cache: false });
}
app.engine('html.swig', swig.renderFile)
app.set('view engine', 'html.swig');
app.set('views', __dirname + '/views');

// Enable cookie based sessions
app.use(cookieParser("another secret secret"));  
app.use(cookieSession({
  secret: "super secret",
}))

// Logging
app.use(logger("dev"));

// Configure micer as asset pipeline
require('./config/mincer')(app);

// GET ALL THE ROUTES
var routesPath = path.join(__dirname, 'routes');
fs.readdirSync(routesPath).forEach(function(file) {
  require(routesPath + '/' + file)(app);
});

// app.enable('trust proxy');

/// Catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

/// Error handlers
app.use(function(err, req, res, next) {
  console.error(err.stack);
  var status = err.status || 500
  res.status(status);
  res.render('error', {
    message: err.message,
    error: ('development' == env) ? err : {}, // don't show stack trace in production
    status: status
  });
});

// START SERVER
app.listen(app.get('port'), function() {
  debug("Node app is running at localhost:" + app.get('port'))
})
