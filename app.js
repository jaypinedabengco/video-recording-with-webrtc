var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var app = express();

// uncomment after placing your favicon in /public
app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(cookieParser());

////

//Custom middlewares
// Custom Middlewares
app.use(require('./middlewares/video-interview-authentication.middleware'));

/* Routes */


app.use('/', express.static(path.join(__dirname, 'public')));
app.use('/api', require('./routes/healthcheck.route'));
app.use('/api', require('./routes/authentication.route'));

app.use('/api/video-interview', require('./routes/video-interview.authenticate.route'));
app.use('/api/video-interview', require('./routes/video-interview.user.route'));

app.use('/api', require('./routes/video-interview.route'));


////

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

app.use(function(err, req, res, next) {

  //show error
  if ( err.status != 404 ){
    console.log(err);
  }
  
  if ( res.headersSent ){ //if already sent..
    return;
  }

  res.status(err.status || 500)
    .json({
      message: err.message,
      error: err
  });
});


module.exports = app;
