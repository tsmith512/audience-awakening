![Spring Awakening Poster][POSTER]

# Audience Awakening

A live-survey application built for [St. Andrew's Episcopal School][SAS],
Austin, TX for their performance of _Spring Awakening,_ fall 2019.

## Instructions to the audience

> As part of our show’s exploration of difficult topics through the framework of
> Theatre of the Oppressed, the audience is invited to participate. Using your
> mobile device, visit {{ APPLICATION HOSTED URL HERE }} in your browser.

> Before the show starts, you will see a note that you have successfully
> connected. Keep the page open while you turn your screen off and on so you
> can get back to it quickly. Throughout the show, questions will be projected.
> Open your device to vote on answers and see how others responded.

# About the application

This Node application provides three displays:

- **Participant screen:** mobile-optimized for voting and seeing answers.
- **Presenter screen:** projector-optimized for displaying instructions,
  questions, and results.
- **Admin screen:** desktop-optimized for controlling the contents of the other
  two, pushing prompts to clients and data to the presenters.

## Installation

During the production, this application will be hosted on dedicated infrastructure.

**Local installation _(only tested on Linux machines)_**

1. Install [nvm][NVM]
2. Clone repository and `cd` into it
3. `nvm install` to get the specified version of Node
4. `nvm use` to activate it
5. `npm install` to install collect dependencies
6. `npm install -g nodemon` for local development ([Nodemon][NM] enables server
   process restart on changes)

**Running the service**

- `npm run start` will start the server process
- `npm run dev` will do so using [Nodemon][NM] for auto restart

For debugging information, set the environment variable `DEBUG` to either `*`
for all information, or `audience*` for information only from libraries in this
application. Example:

`DEBUG=audience* npm run dev`

Unless otherwise overridden, the service listens on port 3000 on all interfaces.

## Usage

When the service running, visit:

- `/` is the default path and shows the participant display
- `/present` is the projector path that shows a read-only display of
  instructions, questions, and results
- `/sm` is the stage manager's console for controlling the application
- `/debug` shows 3 side-by-side iframes with each of these displays for easier
  development and testing. There's also a link to pull a data dump of current
  state information.

## Stage Manager Instructions

1. Preshow, open the `/sm` display and activate the **Preshow** cue.
  - Optionally, use **Projector Blackout** if the projector needs to display dark.
2. For a question cue, click the numbered button for the question that should be
  dispatched.
3. To display the results of a poll, click **Present Results**
4. After a delay, click **Close Question** to encourage the audience to turn
  their screens off again.
  - Optionally, use **Projector Blackout**
  - I'd recommend leaving the state on **Close** until the next question.
5. Repeat from step 2 as needed.
6. Be sure to end on the **Postshow** cue. This page will still be open on
   participants' phones when they first turn them on after the show, this is a
   "thank you" message.
  - Keep **Postshow** engaged until time to repeat from step 1 at the next
    performance.

### Troubleshooting

If something goes wrong:

- Given how fast this application was built, it was primarily tested on Chrome.
  If you're using a different browser, give Chrome a shot.
- If the presenter/projector screen lags:
  - Consider what browser it is using.
  - Make sure it is plugged in (battery modes can throttle page activity)
  - Try clicking into / focusing the window.
  - Reload the presenter screen.
  - If possible, connect the presenter screen to the internet using ethernet
    instead of the venue's wifi.
- Visit the `/debug` page to see a sample participant, presenter, and admin
  display.
  - Use the **Data dump** link on the debug display to get a status report of
    the active data in the system.
  - Use the **Reload all clients** button on the debug display to force all
    clients to reload the page. This is a heavy hammer!
- _@TODO: Is there a way to restart the dyno?_

## Editing

Currently, questions are stored in [`vote-questions.js`][VQ] directly.

# License and Copyright

It's complicated.

- The content in this application (questions and respones) are taken from
  publicly available statistics, please refer to their sources for using those
  data properly.
- The visual design elements of this application were created by Taylor Smith as
  work for hire to St. Andrew's and are owned exclusively by SAS and cannot be
  reused.
- The code for this application is a bit sketchy in its initial implementation,
  but the code is absolutely reusable if you want to copy parts of it for your
  own use. Maybe down the line I can separate the proprietary elements to
  license it properly, but I can't do that at this time. Learn from it, improve
  upon it, and go make great theatre.
- [Spring Awakening was performed by special permission from Music Theatre International][MTISA].

[POSTER]: ./extra/poster.jpg
[SAS]: https://www.sasaustin.org/
[NVM]: https://github.com/nvm-sh/nvm
[NM]: https://github.com/remy/nodemon
[VQ]: ./vote-questions.js
[MTISA]: https://www.mtishows.com/spring-awakening
