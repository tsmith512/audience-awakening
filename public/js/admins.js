(function () {
  'use strict';

  var socket = io('/manage');
  var status = null;
  var questionActive = null;
  var blackout = false;

  // Initial status
  document.getElementById('results').disabled = true;
  document.getElementById('blackout').disabled = false;

  socket.on('status', function (data) {
    document.querySelector('body').className = document.querySelector('body').className.replace(/status-\w+/g, '');
    document.querySelector('body').classList.add('status-' + data);
    status = data;
  });

  socket.on('new question', function (data) {
    questionActive = true;
    document.querySelectorAll('.question-trigger').forEach(function (element) {
      element.classList.remove('active');
    });

    document.getElementById('question-' + data.key).classList.add('active');

    document.querySelectorAll('.response-value').forEach(function (el) {
      el.innerText = data.responses[el.id.slice(-1)];
    });

    document.getElementById('results').disabled = false;
    document.getElementById('blackout').disabled = true;
  });

  socket.on('clear question', function () {
    questionActive = false;

    document.querySelectorAll('.question-trigger').forEach(function (element) {
      element.classList.remove('active');
    });

    document.querySelectorAll('.response-value, .vote-count').forEach(function (element) {
      element.innerText = null;
    });

    document.getElementById('results').disabled = true;
    document.getElementById('blackout').disabled = false;
  });

  socket.on('update vote count', function (data) {
    console.log('received update ' + JSON.stringify(data));

    document.querySelectorAll('.vote-count').forEach(function (el) {
      el.innerText = data[el.id.slice(-1)];
    });
  });

  socket.on('clear', function () {
    document.querySelectorAll('.question-trigger').forEach(function (element) {
      element.classList.remove('active');
    });
  });

  socket.on('blackout', function (data) {
    console.log('received blackout update: ' + ((data) ? 'enable' : 'disable'));
    blackout = data;

    if (blackout) {
      document.querySelector('body').classList.add('presenter-blackout');
    } else {
      document.querySelector('body').classList.remove('presenter-blackout');
    }
  });

  document.getElementById('preshow').addEventListener('click', function () {
    socket.emit('status', 'preshow');
  });

  document.getElementById('results').addEventListener('click', function () {
    socket.emit('status', 'results');
  });

  document.getElementById('close').addEventListener('click', function () {
    socket.emit('status', 'close');
  });

  document.getElementById('blackout').addEventListener('click', function () {
    // This logic matches server-side in voteStatus. We can only black out the
    // projector when it isn't showing something important (consider what's also
    // on the participant screens in other states...)
    if (['preshow', 'close', 'postshow'].includes(status)) {
      // Toggle the blackout status.
      socket.emit('blackout', !blackout);
    } else {
      // eslint-disable-next-line no-alert
      alert('Close the question before giving the presenter screens a blackout cue. Presenter can blackout during preshow, question close, or postshow.');
      console.log(status);
    }
  });

  document.getElementById('postshow').addEventListener('click', function () {
    socket.emit('status', 'postshow');
  });

  document.querySelectorAll('.question-trigger').forEach(function (el) {
    el.addEventListener('click', function () {
      console.log('opening question ' + this.dataset.index);
      socket.emit('open question', this.dataset.index);
    });
  });
})();
