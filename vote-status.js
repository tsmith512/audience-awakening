const debug = require('debug')('audience-awakening:game-status');
const EventEmitter = require('events');

// This is stupidly simple, but there are a bunch of things that happen on each
// display when we move between stages in the application, so it made sense to
// be able to have "a thing" to remember what the status is, and tie some events
// to when it changes.

module.exports = {
  allowedValues: ['preshow', 'intro', 'vote', 'results', 'close', 'postshow'],
  status: null,

  init() {
    this.status = 'preshow';
    return this;
  },

  set(change) {
    const current = this.status;

    if (this.allowedValues.indexOf(change) === -1) {
      throw `You messed that up, not allowable status ${change}`;
    }

    this.status = change;

    this.events.emit('state change', current, change);
  },

  get() {
    return this.status;
  },

  events: new EventEmitter(),
};
