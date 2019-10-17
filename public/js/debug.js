(function () {
  'use strict';

  var socket = io('/debug');
  var textarea = document.querySelector('textarea');

  socket.on('status', function (data) {
    document.querySelector('body').className = 'status-' + data;
  });

  if (textarea) {
    socket.on('data dump', function (data) {
      textarea.innerHTML = JSON.stringify(data, null, 4);
    });
  }

  document.getElementById('reload').addEventListener('click', function () {
    // eslint-disable-next-line no-alert
    var choice = window.confirm('Are you sure you want all clients to reload this page?');
    if (choice) {
      socket.emit('reload');
    }
  });
})();
