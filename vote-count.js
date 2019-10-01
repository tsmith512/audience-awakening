'use strict';

const debug = require('debug')('audience-awakening:vote');

module.exports = {
  // Currently, we're only handling 4-answer single-choice questions, so we can
  // hard-spec this:
  counts: {
    a: 0,
    b: 0,
    c: 0,
    d: 0
  },

  report: function() {
    return this.counts;
  },

  vote: function(key) {
    // To validate user-submitted data, the "key" from the client socket.emit
    // should match a valid key to vote for in this.counts.
    if (this.counts.hasOwnProperty(key)) {
      debug('vote added for ' + key);
      this.counts[key]++;
    }
    else {
      debug('vote submitted for invalid key: ' + JSON.stringify(key));
    }
  },

  clear: function() {
    debug('vote counts reset');
    Object.keys(this.counts).forEach((key) => this.counts[key] = 0);
  }
}
