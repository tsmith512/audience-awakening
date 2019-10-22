(function () {
  'use strict';

  var socket = io('/present');
  var blackout = false;

  socket.on('status', function (data) {
    document.querySelector('body').className = document.querySelector('body').className.replace(/status-\w+/g, '');
    document.querySelector('body').classList.add('status-' + data);
  });

  socket.on('blackout', function (data) {
    console.log('received blackout update: ' + ((data) ? 'enable' : 'disable'));
    blackout = data;

    if (blackout) {
      document.querySelector('body').classList.add('presenter-blackout');
    } else {
      document.querySelector('body').classList.remove('presenter-blackout');
    }
  });

  socket.on('new question', function (data) {
    console.log('received order to open new question' + JSON.stringify(data));

    // Put up the question text as the slide title:
    document.getElementById('question-text').innerText = data.question;

    // Label the options:
    document.querySelectorAll('.response-option').forEach(function (el) {
      el.innerText = data.responses[el.id.slice(-1)];

      // In case this wasn't properly scrubbed in a jump cue.
      el.classList.remove('correct');
      el.classList.remove('disabled');

      // eslint-disable-next-line no-extra-boolean-cast
      if (!Boolean(data.responses[el.id.slice(-1)])) {
        el.classList.add('disabled');
      }


      if (data.answer === el.id.slice(-1)) {
        el.classList.add('correct');
      }
    });

    // Put up the citation, if there is one.
    document.getElementById('citation-text').innerText = data.citation || null;
  });


  socket.on('clear question', function () {
    // Put up the question text as the slide title:
    document.getElementById('question-text').innerText = null;

    // Label the options:
    document.querySelectorAll('.response-option, .results-display').forEach(function (el) {
      el.innerText = null;
      el.classList.remove('correct');
      el.classList.remove('disabled');
    });

    document.querySelectorAll('.results-background').forEach(function (el) {
      el.style.width = null;
    });
  });

  socket.on('results', function (data) {
    // We need to total up all the votes so we know what percentage each took.
    var sum = 0;

    // eslint-disable-next-line
    for (var key in data) {
      if (Object.hasOwnProperty.call(data, key)) {
        sum += data[key];
      }
    }
    // @TODO: I would like to do ^^ the right way instead of disabling eslint

    console.log('received order to present findings ' + JSON.stringify(data));

    document.querySelectorAll('.results-display').forEach(function (el) {
      el.innerText = data[el.id.slice(-1)];
    });

    document.querySelectorAll('.results-background').forEach(function (el) {
      el.style.width = ((data[el.id.slice(-1)] / sum) * 100) + '%';
    });
  });

  socket.on('reload', function () {
    // eslint-disable-next-line no-restricted-globals
    location.reload(true);
  });
})();
