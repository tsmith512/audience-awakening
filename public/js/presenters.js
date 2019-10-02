(function() {
  'use strict';

  var socket = io("/present");

  socket.on('new question', function(data) {
    console.log('received order to open new question' + JSON.stringify(data));

    // Put up the question text as the slide title:
    document.querySelector('h3').innerText = data.question;

    // Label the options:
    document.querySelectorAll('.response-option').forEach(function(el){
      el.innerText = data.responses[el.id.slice(-1)];
    });
  });

  socket.on('present', function(data) {
    console.log("received order to present findings " + JSON.stringify(data));

    // @TODO: So there's no reason to present results of a question isn't
    // open, but these data don't include the question, so if this fires
    // before the open, it shows numbers with no context.

    document.querySelectorAll('.results-display').forEach(function(el){
      el.innerText = data[el.id.slice(-1)];
    });
  });

  socket.on('clear', function(data) {
    console.log("received order to clear display");

    document.querySelectorAll('h3, span').forEach(function(el) {
      el.innerText = null;
    });
  });
})();
