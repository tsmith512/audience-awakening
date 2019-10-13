const debug = require('debug')('audience-awakening:vote');
const EventEmitter = require('events');

module.exports = {
  // Currently, we're only handling 4-answer single-choice questions, so we can
  // hard-spec this:
  counts: {
    a: 0,
    b: 0,
    c: 0,
    d: 0,
  },

  report() {
    return this.counts;
  },

  vote(key) {
    // To validate user-submitted data, the "key" from the client socket.emit
    // should match a valid key to vote for in this.counts.
    if (Object.prototype.hasOwnProperty.call(this.counts, key)) {
      debug(`vote added for ${key}`);
      this.counts[key] += 1;
    } else {
      debug(`vote submitted for invalid key: ${JSON.stringify(key)}`);
    }
  },

  // NOTE: Given the constraints and goals on this project, this method is not
  // going to record-keep or verify changes. It will change the vote as called
  // by subtracting 1 from old and adding 1 to new. Its only validation will be
  // to prevent a vote count from going negative and that votes are for valid
  // keys.
  voteChange(oldKey, newKey) {
    // To validate user-submitted data, the "key" from the client socket.emit
    // should match a valid key to vote for in this.counts.
    if (Object.prototype.hasOwnProperty.call(this.counts, oldKey)
        && Object.prototype.hasOwnProperty.call(this.counts, newKey)
    ) {
      if (this.counts[oldKey] >= 1) {
        debug(`vote subtracted for ${oldKey}`);
        this.counts[oldKey] -= 1;
      }

      debug(`vote added for ${newKey}`);
      this.counts[newKey] += 1;
    } else {
      debug(`vote submitted for invalid key: ${JSON.stringify([oldKey, newKey])}`);
    }
  },

  clear() {
    debug('vote counts reset');
    Object.keys(this.counts).forEach((key) => {
      this.counts[key] = 0;
    });
    this.events.emit('clear');
  },

  events: new EventEmitter(),
};
