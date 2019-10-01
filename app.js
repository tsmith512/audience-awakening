var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var sassMiddleware = require('node-sass-middleware');

var participantRouter = require('./routes/index');
var presentationRouter = require('./routes/presentation');
var adminRouter = require('./routes/admin');
var debugRouter = require('./routes/debug');

var app = express();
var io = require('socket.io')();
app.io = io;

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'twig');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(sassMiddleware({
  src: path.join(__dirname, 'public'),
  dest: path.join(__dirname, 'public'),
  indentedSyntax: false, // true = .sass and false = .scss
  sourceMap: true
}));
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', participantRouter);
app.use('/present', presentationRouter);
app.use('/sm', adminRouter);
app.use('/debug', debugRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

io.on('connection', function (socket) {
  console.log('a user connected');
});

var participants = io.of('/participate');
var presenters = io.of('/present');

participants.on('connection', function (socket) {
  console.log('participant connected');

  socket.on('vote', function(msg) {
    console.log('participant vote for ' + msg);

    presenters.emit('update', msg);
  });
});

participants.on('connection', function (socket) {
  console.log('presenter connected');
});


module.exports = app;
