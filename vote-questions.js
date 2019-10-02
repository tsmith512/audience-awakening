module.exports = {
  active: false,

  questions: [
    {
      question: '2 + 2 = ?',
      responses: {
        a: '1',
        b: '2',
        c: '4',
        d: '8',
      },
      answer: 'c',
    },
    {
      question: '5 * 5 = ?',
      responses: {
        a: '10',
        b: '25',
        c: '55',
        d: '100',
      },
      answer: 'b',
    },
  ],

  listQuestions() {
    return this.questions.map((q) => q.question);
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
      return this.getQuestion(this.active);
    }
    return false;
  },
};
