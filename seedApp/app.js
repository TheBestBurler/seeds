var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

// ====================================
// EXTRAS
// ====================================
var mongoose = require('mongoose');
var jwt = require('jsonwebtoken');
var multer = require('multer');
var config = require('./config');
var authMW = require('./utils/authMiddleware');
// ************************************

// ====================================
// ROUTES REQUIRE
// ====================================
var routes = require('./routes/index');
var users = require('./routes/users');
var auth = require('./routes/authenticate');
var debugSetup = require('./routes/ds');
var torrent = require('./routes/torrent');
// ************************************


var app = express();

// ====================================
// DATABASE CONNEXION
// ====================================
var connexionDB = mongoose.connect(config.database, function(err) {
	if (err){
		console.log('database: connection error', err);
	}
	else {
		console.log('database: connection successful');
	}
});
app.set('connexionDB', connexionDB);
// ************************************


// ====================================
// SOCKETS
// ====================================
var connectedUsers = 0;
var socketIO = require('socket.io');
var io = socketIO();
app.io = io;
// console.log(io.parser);
//************************************


// ====================================
// TORRENTS
// ====================================
var TransmissionNode = require('./utils/transmissionNode');
var transmission = new TransmissionNode();
app.set('transmission', transmission);
//************************************


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// ====================================
// ROUTES
// ====================================
app.use('/', routes);
app.use('/debug', debugSetup);
app.set('secret', config.secret);
app.use('/authenticate', auth);
// all route below need identification token

io.on('connection', function (socket) {
	connectedUsers++;
	console.log('connection !');
	console.log('NB USERS : ',connectedUsers);
});

io.on('disconnect', function (socket) {
	connectedUsers--;
	console.log('disconnect !');
	console.log('NB USERS : ',connectedUsers);
});

app.use(authMW);
app.use('/users', users);
app.use('/torrent', torrent);
// ************************************

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});


module.exports = app;
