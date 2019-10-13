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
})();
