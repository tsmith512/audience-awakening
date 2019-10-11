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

    // Populate the answer text:
    // @TODO: So this is a bad way to do this, but it'll work in the context of
    // this show, but _duhhhhh_ it drops the answer text into the DOM, even if
    // it is currently invisible.
    document.getElementById('answer-text').innerText = data.responses[data.answer];
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
