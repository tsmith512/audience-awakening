(function () {
  'use strict';

  var socket = io('/debug');

  socket.on('status', function (data) {
    document.querySelector('body').className = 'status-' + data;
  });

  var textarea = document.querySelector('textarea');
  if (textarea) {
    socket.on('data dump', function (data) {
      textarea.innerHTML = JSON.stringify(data, null, 4);
    });
  }

})();
