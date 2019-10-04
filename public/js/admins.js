(function () {
  'use strict';

  // Initial status
  document.getElementById('results').disabled = true;

  var socket = io('/manage');

  socket.on('status', function (data) {
    document.querySelector('body').className = 'status-' + data;
  });

  socket.on('new question', function (data) {
    document.querySelectorAll('.question-trigger').forEach(function (element) {
      element.classList.remove('active');
    });

    document.getElementById('question-' + data.key).classList.add('active');

    document.getElementById('results').disabled = false;
  });

  socket.on('clear question', function () {
    document.querySelectorAll('.question-trigger').forEach(function (element) {
      element.classList.remove('active');
    });

    document.getElementById('results').disabled = true;
  });

  socket.on('update vote count', function (data) {
    console.log('received update ' + JSON.stringify(data));

    document.querySelectorAll('dd').forEach(function (el) {
      el.innerText = data[el.id.slice(-1)];
    });
  });

  socket.on('clear', function () {
    document.querySelectorAll('.question-trigger').forEach(function (element) {
      element.classList.remove('active');
    });
  });

  document.getElementById('preshow').addEventListener('click', function () {
    socket.emit('status', 'preshow');
  });

  document.getElementById('intro').addEventListener('click', function () {
    socket.emit('status', 'intro');
  });

  document.getElementById('results').addEventListener('click', function () {
    socket.emit('status', 'results');
  });

  document.getElementById('close').addEventListener('click', function () {
    socket.emit('status', 'close');
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
