const debug = require('debug')('audience-awakening:game-status');
const EventEmitter = require('events');

// This is stupidly simple, but there are a bunch of things that happen on each
// display when we move between stages in the application, so it made sense to
// be able to have "a thing" to remember what the status is, and tie some events
// to when it changes. Further, "blackout" is a toggle-able state that only
// applies to the presenter display and is only allowable sometimes.

module.exports = {
  allowedValues: ['preshow', 'vote', 'results', 'close', 'postshow'],
  status: null,
  blackout: null,

  init() {
    this.status = 'preshow';
    this.blackout = false;
    return this;
  },

  set(change) {
    const current = this.status;

    if (this.allowedValues.indexOf(change) === -1) {
      throw new Error(`You messed that up, not allowable status: ${JSON.stringify(change)}`);
    }

    this.status = change;

    this.events.emit('state change', current, change);
  },

  get() {
    return this.status;
  },

  // Argument is whether to turn BLO on or off.
  // Return is whether or not that change was accepted.
  setBlackout(q) {
    if (q) {
      // Blackout is requested
      this.blackout = true;
      this.events.emit('blackout', true);
      return true;
    }

    // Blackout is being turned off
    this.blackout = false;
    this.events.emit('blackout', false);
    return true;
  },

  events: new EventEmitter(),
};
