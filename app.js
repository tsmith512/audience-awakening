const cookieParser = require('cookie-parser');
const createError = require('http-errors');
const debug = require('debug')('audience-awakening:application');
const express = require('express');
const logger = require('morgan');
const path = require('path');
const sassMiddleware = require('node-sass-middleware');

const app = express();
const io = require('socket.io')();

const voteCount = require('./vote-count');
const voteQuestions = require('./vote-questions');

// Express Generator splits up the actual Server creation into the separate file
// bin/www; app.js just exports the Express instance. This is needed to be able
// to attach Socket to the server when it is instantiated there.
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
  sourceMap: true,
}));
app.use(express.static(path.join(__dirname, 'public')));

// Set up routes for the appliation displays. Simple handlers, just to output
// Twig templates. The data exchanges are all done on the Sockets.
app.get('/', (req, res) => res.render('participant', { title: 'Participant Display' }));

app.get('/present', (req, res) => res.render('present', { title: 'Projector Display' }));

app.get('/sm', (req, res) => res.render('admin', { title: 'Stage Manager Display', questions: voteQuestions.listQuestions() }));

app.get('/debug', (req, res) => res.render('debug', { title: '3-Up Testing Display' }));

app.get('/debug/data', (req, res) => res.render('data-dump', { title: 'Data Dump' }));

// 404 Handler (i.e. request didn't match a Socket, any of the above routes, or
// something in the static handler at /public)
app.use((req, res, next) => next(createError(404)));

// error handler
app.use((err, req, res) => {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});


// Socket communication

// Segment connections into the three types we support:
const participants = io.of('/participate');
// ^ Audience members who will be voting
const presenters = io.of('/present');
// ^ The projector display
const managers = io.of('/manage');
// ^ The stage manager's control desk

// PARTICIPANTS are the main route (/) and is a display for smartphones to be
// able to vote on open questions.
participants.on('connection', (socket) => {
  debug('participant connected');

  if (voteQuestions.active) {
    socket.emit('new question', voteQuestions.getQuestionPublic());
  }

  socket.on('vote', (msg) => {
    debug(`participant vote for ${msg}`);

    voteCount.vote(msg);

    managers.emit('update vote count', voteCount.report());
  });
});

// PRESENTERS (there will probably only be one at a time) display intros,
// questions, results, and shutdown notices for the audience on a read-only
// display on the route (/present)
presenters.on('connection', (socket) => {
  debug('presenter connected');

  if (voteQuestions.active) {
    socket.emit('new question', voteQuestions.getQuestionPublic());
  }

  socket.emit('update vote count', voteCount.report());
});

// MANAGERS (there should only be one, but an ASM may have a backup) display the
// list of questions, can dispatch instruction slides, open questions, see live
// vote tallies, close questions, and push results to the presentation screen.
managers.on('connection', (socket) => {
  debug('manager connected');


  if (voteQuestions.active) {
    socket.emit('new question', voteQuestions.getQuestion());
  }
  socket.emit('update vote count', voteCount.report());

  socket.on('open question', (msg) => {
    debug(`manager ordered to open question ${msg}`);
    voteCount.clear();
    voteQuestions.activate(msg);
  });

  socket.on('present', () => {
    debug('manager order to present results');
    // @TODO: What else happens here? Something should happen to participant displays...
    presenters.emit('present', voteCount.report());
  });

  socket.on('clear', () => {
    debug('manager order to clear');
    voteCount.clear();
    voteQuestions.deactivate();
  });
});

// Events for vote counts and questions

voteQuestions.events.on('activate', (question) => {
  // Notify all kinds of clients that a new question is open
  managers.emit('new question', question);
  presenters.emit('new question', voteQuestions.getQuestionPublic());
  participants.emit('new question', voteQuestions.getQuestionPublic());
});

voteCount.events.on('clear', () => {
  managers.emit('update vote count', voteCount.report());
  managers.emit('clear', true);
  presenters.emit('clear', true);
  participants.emit('clear', true);
});

module.exports = app;
