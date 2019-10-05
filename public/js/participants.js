(function () {
  'use strict';

  var socket = io('/participate');

  socket.on('status', function (data) {
    document.querySelector('body').className = 'status-' + data;
  });

  socket.on('new question', function (data) {
    console.log('received new question' + JSON.stringify(data));

    // Put up the question text as the slide title:
    document.getElementById('question-text').innerText = data.question;

    // Label the buttons:
    document.querySelectorAll('button').forEach(function (el) {
      el.innerText = data.responses[el.id];
    });
  });

  socket.on('clear question', function () {
    // Put up the question text as the slide title:
    document.getElementById('question-text').innerText = null;

    // Label the buttons:
    document.querySelectorAll('button').forEach(function (el) {
      el.innerText = el.id.toUpperCase();
    });
  });

  socket.on('clear', function () {
    document.getElementById('question-text').innerText = null;

    document.querySelectorAll('button').forEach(function (el) {
      el.innerText = el.id.length ? el.id.toUpperCase() : null;
    });
  });

  document.querySelectorAll('button').forEach(function (el) {
    el.addEventListener('click', function () {
      socket.emit('vote', this.id);
      console.log('submitted vote ' + this.id);
    });
  });
})();
