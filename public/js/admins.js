(function () {
  'use strict';

  var socket = io('/manage');

  socket.on('new question', function (data) {
    document.querySelectorAll('.question-trigger').forEach(function (element) {
      element.classList.remove('active');
    });

    document.getElementById('question-' + data.key).classList.add('active');
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

  document.getElementById('present').addEventListener('click', function () {
    socket.emit('present', true);
  });

  document.getElementById('clear').addEventListener('click', function () {
    socket.emit('clear', true);
  });

  document.querySelectorAll('.question-trigger').forEach(function (el) {
    el.addEventListener('click', function () {
      console.log('opening question ' + this.dataset.index);
      socket.emit('open question', this.dataset.index);
    });
  });
})();
