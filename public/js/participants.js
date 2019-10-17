(function () {
  'use strict';

  var socket = io('/participate');
  var vote = null;

  socket.on('status', function (data) {
    document.querySelector('body').className = 'status-' + data;
  });

  // @TODO: These three socket event handlers are basically the same, consolidate!

  socket.on('new question', function (data) {
    console.log('received new question' + JSON.stringify(data));

    // Put up the question text as the slide title:
    document.getElementById('question-text').innerText = data.question;

    // Label the buttons:
    document.querySelectorAll('button').forEach(function (el) {
      el.innerText = data.responses[el.id] || null;

      // If there's no response for a given key, disable the button. (i.e.
      // true/false questions don't have 4 buttons.) This also would set the
      // disabled flag appropriately if a new question is dispatched before the
      // previous question is cleared.
      el.disabled = Boolean(!data.responses[el.id]);

      vote = null;
      el.classList.remove('active');
    });

    // Populate the answer text:
    // @TODO: So this is a bad way to do this, but it'll work in the context of
    // this show, but _duhhhhh_ it drops the answer text into the DOM, even if
    // it is currently invisible.
    document.getElementById('answer-text').innerText = data.responses[data.answer];
    document.getElementById('citation-text').innerText = data.citation || null;
    document.getElementById('commentary-text').innerText = data.commentary || null;
  });

  socket.on('clear question', function () {
    // Put up the question text as the slide title:
    document.getElementById('question-text').innerText = null;

    // Label the buttons:
    document.querySelectorAll('button').forEach(function (el) {
      el.innerText = el.id.toUpperCase();
      el.disabled = false;
      vote = null;
      el.classList.remove('active');
    });

    document.getElementById('answer-text').innerText = null;
  });

  socket.on('clear', function () {
    document.getElementById('question-text').innerText = null;

    document.querySelectorAll('button').forEach(function (el) {
      el.innerText = el.id.length ? el.id.toUpperCase() : null;
      vote = null;
      el.classList.remove('active');
    });

    document.getElementById('answer-text').innerText = null;
  });

  socket.on('reload', function () {
    // eslint-disable-next-line no-restricted-globals
    location.reload(true);
  });

  document.querySelectorAll('button').forEach(function (el) {
    el.addEventListener('click', function () {
      if (vote) {
        // We've already voted on this question, so we need to change our vote.
        if (vote === this.id) {
          // Client tapped the same response again.
          return;
        }

        // Reset button states
        document.querySelectorAll('button.active').forEach(function (btn) {
          btn.classList.remove('active');
        });

        socket.emit('vote change', { old: vote, new: this.id });
        console.log('submitted vote change from ' + vote + ' to ' + this.id);

        // Clear client-side record of the vote.
        vote = null;
      } else {
        socket.emit('vote', this.id);
        console.log('submitted vote ' + this.id);
      }

      vote = this.id;
      this.classList.add('active');
    });
  });
})();
