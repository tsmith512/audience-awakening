const debug = require('debug')('audience-awakening:vote');
const EventEmitter = require('events');

module.exports = {
  active: false,

  questions: [
    {
      title: 'Texas ranking in 2016 teen birth rates',
      question: 'In 2016, where did Texas rank among the nation in teen birth rates among females age 15-19 (with 1 representing the highest rate and 50 representing the lowest rate)?',
      citation: 'According to the US Department of Health and Human Services.',
      responses: {
        a: '34',
        b: '17',
        c: '4',
        d: '1',
      },
      answer: 'c',
    },
    {
      title: 'T/F: 2018 number of children removed by CPS',
      question: 'In 2018, Child Protective Service removed over 16,000 Texas’ children as a result of abuse/neglect. True or False?',
      citation: 'According to Texas Department of Family and Protective Services.',
      commentary: 'True. In 2018, CPS removed 16,221 children as a result of abuse/neglect.',
      responses: {
        a: 'True',
        b: 'False',
        c: '?',
        d: '?',
      },
      answer: 'a',
    },
    {
      title: 'T/F: TX, Males 2x likely to experience depression symptoms',
      question: 'In Texas, males are twice as likely to experience depression symptoms as females. True or False?',
      citation: 'According to The US Department of Health and Human Services.',
      commentary: 'Although the rate of teen suicide is higher among males than females, 44% of the females surveyed experienced depression symptoms compared to 25% of the males.',
      responses: {
        a: 'True',
        b: 'False',
        c: '?',
        d: '?',
      },
      answer: 'b',
    },
    {
      title: 'Percentage of TX HS who experience suicidal ideation',
      question: 'Suicide is the second leading cause of death in Texans ages 15 to 24. In a recent survey, 37 percent of Texas high school students reported feeling sad or hopeless for weeks on end. What percentage of these students have seriously considered suicide?',
      citation: 'According to the CCDC\'s 2017 Youth Risk Behavior Survey.',
      responses: {
        a: '12',
        b: '18',
        c: '9',
        d: '21',
      },
      answer: 'b',
    },
    {
      title: 'T/F: Abortion rate decrease \'88 &rarr; \' 13',
      question: 'From 1988-2013, the rate of teen abortions in Texas has had a 74% change in that time period. Has it increased or decreased over that time period?',
      citation: 'According to the US Department of Health and Human Services.',
      responses: {
        a: 'Increased 74%',
        b: 'Decreased 74%',
        c: '?',
        d: '?',
      },
      answer: 'b',
    },
  ],

  listQuestions() {
    return this.questions.map((q) => q.question);
  },

  listQuestionsByTitle() {
    return this.questions.map((q) => q.title);
  },

  getQuestion(index = this.active) {
    if (!index) {
      return false;
    }
    return {
      key: index,
      ...this.questions[index],
    };
  },

  // This returns exactly what getQuestion would return but without the correct
  // answer identified.
  getQuestionPublic(index = this.active) {
    const q = this.getQuestion(index);

    return {
      key: index,
      question: q.question,
      responses: q.responses,
    };
  },

  activate(index) {
    if (Object.prototype.hasOwnProperty.call(this.questions, index)) {
      this.active = index;
      debug('vote question opened');
      this.events.emit('activate', this.getQuestion(this.active));
      return this.getQuestion(this.active);
    }
    return false;
  },

  deactivate() {
    this.index = false;
    this.events.emit('deactivate');
  },

  events: new EventEmitter(),
};
