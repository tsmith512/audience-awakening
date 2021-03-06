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
const voteStatus = require('./vote-status').init();

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
app.get('/', (req, res) => res.render('participant', { title: 'Spring Awakening' }));

app.get('/present', (req, res) => res.render('present', { title: 'Spring Awakening | Projector', website: process.env.PROD_URL }));

app.get('/sm', (req, res) => res.render('admin', { title: 'Spring Awakening | Stage Manager', questions: voteQuestions.listQuestionsByTitle() }));

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
const debuggers = io.of('/debug');
// ^ Testing displays

const connectionStartup = (socket) => {
  socket.emit('status', voteStatus.get());

  if (voteQuestions.active) {
    socket.emit('new question', voteQuestions.getQuestion());
  } else {
    socket.emit('clear question');
  }
};

// PARTICIPANTS are the main route (/) and is a display for smartphones to be
// able to vote on open questions.
participants.on('connection', (socket) => {
  debug('participant connected');

  connectionStartup(socket);

  socket.on('vote', (msg) => {
    debug(`participant vote for ${msg}`);

    voteCount.vote(msg);

    managers.emit('update vote count', voteCount.report());
  });

  socket.on('vote change', (msg) => {
    debug(`participant vote change from ${msg.old} to ${msg.new}`);

    voteCount.voteChange(msg.old, msg.new);

    managers.emit('update vote count', voteCount.report());
  });
});

// PRESENTERS (there will probably only be one at a time) display questions,
// results, and shutdown notices for the audience on a read-only display on the
// route (/present)
presenters.on('connection', (socket) => {
  debug('presenter connected');

  connectionStartup(socket);

  socket.emit('update vote count', voteCount.report());

  if (voteStatus.get() === 'results') {
    socket.emit('results', voteCount.report());
  }
});

// MANAGERS (there should only be one, but an ASM may have a backup) display the
// list of questions, can dispatch instruction slides, open questions, see live
// vote tallies, close questions, and push results to the presentation screen.
managers.on('connection', (socket) => {
  debug('manager connected');

  connectionStartup(socket);

  socket.emit('update vote count', voteCount.report());

  socket.on('open question', (msg) => {
    debug(`manager ordered to open question ${msg}`);
    voteQuestions.activate(msg);
  });

  socket.on('blackout', (data) => {
    debug(`manager ordered blackout to ${data}`);

    if (data) {
      debug('sending BLO Q to presenters and managers');
      voteStatus.setBlackout(true);
    } else if (!data) {
      // Turn blackout off
      debug('cancelling BLO Q to presenters and managers');
      voteStatus.setBlackout(false);
    }
  });

  socket.on('status', (msg) => {
    debug(`manager ordered to advance game status to ${msg}`);
    voteStatus.set(msg);
  });
  // All other manager buttons are status changes, they are handled in the event
  // handler below.
});

debuggers.on('connection', (socket) => {
  debug('debug display connected');
  connectionStartup(socket);

  socket.emit('data dump', {
    status: voteStatus.get(),
    statusAllowed: voteStatus.allowedValues,
    questions: voteQuestions.listQuestions(),
    activeQuestion: voteQuestions.active ? voteQuestions.getQuestion() : null,
    vote: voteCount.report(),
  });

  socket.on('reload', () => {
    managers.emit('reload');
    presenters.emit('reload');
    participants.emit('reload');
  });

  socket.on('vote', (msg) => {
    debug(`debugger vote for ${msg}`);
    voteCount.vote(msg);
    managers.emit('update vote count', voteCount.report());
  });
});

// Events for vote counts and questions

voteStatus.events.on('state change', (previous, next) => {
  managers.emit('status', next);
  presenters.emit('status', next);
  participants.emit('status', next);
  debuggers.emit('status', next);

  if (voteStatus.blackout) {
    voteStatus.setBlackout(false);
  }

  if (next === 'close' || (voteQuestions.active && ['preshow', 'postshow'].includes(next))) {
    debug('status change to close');
    voteCount.clear();
    voteQuestions.deactivate();
  }

  if (next === 'results') {
    presenters.emit('results', voteCount.report());
  }
});

voteQuestions.events.on('activate', (question) => {
  // Reset the vote counts
  voteCount.clear();

  // Set game status
  voteStatus.set('vote');

  // Notify all kinds of clients that a new question is open
  managers.emit('new question', question);
  presenters.emit('new question', question);
  participants.emit('new question', question);
});

voteQuestions.events.on('deactivate', () => {
  managers.emit('clear question');
  presenters.emit('clear question');
  participants.emit('clear question');
});

voteCount.events.on('clear', () => {
  managers.emit('update vote count', voteCount.report());
});

voteStatus.events.on('blackout', (state) => {
  managers.emit('blackout', state);
  presenters.emit('blackout', state);
});

setInterval(() => {
  participants.clients((err, clients) => {
    managers.emit('update connection count', clients.length);
  });
}, 3000);

module.exports = app;
