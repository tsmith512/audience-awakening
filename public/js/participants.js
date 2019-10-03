(function () {
  'use strict';

  var socket = io('/participate');

  socket.on('new question', function (data) {
    console.log('received order to open new question' + JSON.stringify(data));

    // Put up the question text as the slide title:
    document.querySelector('h3').innerText = data.question;

    // Show the voting buttons:
    document.getElementById('voting-buttons').classList.add('active');

    // Label the buttons:
    document.querySelectorAll('button').forEach(function (el) {
      el.innerText = data.responses[el.id];
    });
  });

  socket.on('clear', function () {
    document.getElementById('voting-buttons').classList.remove('active');
    document.querySelectorAll('h3, button').forEach(function (el) {
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
