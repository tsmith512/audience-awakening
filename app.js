'use strict';

const createError = require('http-errors');
const debug = require('debug')('audience-awakening:application');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const sassMiddleware = require('node-sass-middleware');
const app = express();
const voteCount = require('./vote-count');
const voteQuestions = require('./vote-questions');

// Express Generator splits up the actual Server creation into the separate file
// bin/www; app.js just exports the Express instance. This is needed to be able
// to attach Socket to the server when it is instantiated there.
const io = require('socket.io')();
app.io = io;

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'twig');

// General middleware setup
// @TODO: Can any of this be removed?
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

// Set up routes for the appliation displays. Simple handlers, just to output
// Twig templates. The data exchanges are all done on the Sockets.
app.get('/', (req, res, next) => res.render('participant', { title: 'Participant Display' }));

app.get('/present', (req, res, next) => res.render('present', { title: 'Projector Display' }));

app.get('/sm', (req, res, next) => res.render('admin', { title: 'Stage Manager Display', questions: voteQuestions.listQuestions() }));

app.get('/debug', (req, res, next) => res.render('debug', { title: '3-Up Testing Display' }));

app.get('/debug/data', (req, res, next) => res.render('data-dump', { title: 'Data Dump' }));

app.get('/api/questions', (req, res, next) => res.json(voteQuestions.listQuestions()));

// 404 Handler (i.e. request didn't match a Socket, any of the above routes, or
// something in the static handler at /public)
app.use((req, res, next) => next(createError(404)));

// error handler
app.use((err, req, res, next) => {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});


// Socket communication

// For any connection established:
io.on('connection', (socket) => debug('a user connected'));

// Segment connections into the three types we support:
const participants = io.of('/participate');
  // Audience members who will be voting
const presenters = io.of('/present');
  // The projector display
const managers = io.of('/manage');
  // The stage manager's control desk

// PARTICIPANTS are the main route (/) and is a display for smartphones to be
// able to vote on open questions.
participants.on('connection', (socket) => {
  debug('participant connected');

  socket.on('vote', (msg) => {
    debug('participant vote for ' + msg);

    voteCount.vote(msg);

    managers.emit('update vote count', voteCount.report());
  });
});

// PRESENTERS (there will probably only be one at a time) display intros,
// questions, results, and shutdown notices for the audience on a read-only
// display on the route (/present)
presenters.on('connection', (socket) => {
  debug('presenter connected')
});

// MANAGERS (there should only be one, but an ASM may have a backup) display the
// list of questions, can dispatch instruction slides, open questions, see live
// vote tallies, close questions, and push results to the presentation screen.
managers.on('connection', (socket) => {
  debug('manager connected');

  socket.on('open question', (msg) => {
    debug('manager ordered to open question ' + msg);
  })

  socket.on('present', (msg) => {
    debug('manager order to present results');
    // @TODO: What else happens here? Something should happen to participant displays...
    presenters.emit('present', voteCount.report());
  });

  socket.on('clear', (msg) => {
    debug('manager order to clear');
    voteCount.clear();
    // @TODO: Need to do something with participants, but probably related to
    // opening and closing a vote. This whole routine should probably change.
    managers.emit('update vote count', voteCount.report());
    presenters.emit('clear', true);
  });
});

module.exports = app;
