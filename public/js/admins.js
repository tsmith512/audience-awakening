(function() {
  'use strict';

  var socket = io("/manage");

  socket.on('update vote count', function(data) {
    console.log('received update ' + JSON.stringify(data));

    // @TODO: So this is a horrible way to do this.
    document.getElementById('response-a').innerText = data.a;
    document.getElementById('response-b').innerText = data.b;
    document.getElementById('response-c').innerText = data.c;
    document.getElementById('response-d').innerText = data.d;
  });

  document.getElementById('present').addEventListener('click', function() {
    socket.emit('present', true);
  });

  document.getElementById('clear').addEventListener('click', function() {
    socket.emit('clear', true);
  });

  document.querySelectorAll('.question-trigger').forEach(function(el) {
    el.addEventListener('click', function() {
      console.log('opening question ' + this.dataset.index);
      socket.emit('open question', this.dataset.index);
    });
  });
})();
