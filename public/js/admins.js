(function () {
  'use strict';

  var socket = io('/manage');
  var blackout = false;

  // Initial status
  document.getElementById('results').disabled = true;

  socket.on('status', function (data) {
    document.querySelector('body').className = document.querySelector('body').className.replace(/status-\w+/g, '');
    document.querySelector('body').classList.add('status-' + data);
  });

  socket.on('new question', function (data) {
    document.querySelectorAll('.question-trigger').forEach(function (element) {
      element.classList.remove('active');
    });

    document.querySelectorAll('.response-value').forEach(function (el) {
      el.innerText = data.responses[el.id.slice(-1)];
      el.classList.remove('correct');
    });


    document.getElementById('question-' + data.key).classList.add('active');
    document.getElementById('response-' + data.answer).classList.add('correct');

    document.getElementById('results').disabled = false;
  });

  socket.on('clear question', function () {
    document.querySelectorAll('.question-trigger').forEach(function (element) {
      element.classList.remove('active');
    });

    document.querySelectorAll('.response-value').forEach(function (element) {
      element.classList.remove('correct');
    });

    document.querySelectorAll('.response-value, .vote-count').forEach(function (element) {
      element.innerText = null;
    });

    document.getElementById('results').disabled = true;
  });

  socket.on('update vote count', function (data) {
    console.log('received update ' + JSON.stringify(data));

    document.querySelectorAll('.vote-count').forEach(function (el) {
      el.innerText = data[el.id.slice(-1)];
    });
  });

  socket.on('update connection count', function (data) {
    document.getElementById('connections').innerText = data;
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

  socket.on('reload', function () {
    // eslint-disable-next-line no-restricted-globals
    location.reload(true);
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
    // Toggle the blackout status.
    socket.emit('blackout', !blackout);
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
