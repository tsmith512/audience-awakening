'use strict';

module.exports = {
  active: false,

  questions: [
    {
      question: "2 + 2 = ?",
      responses: {
        a: "1",
        b: "2",
        c: "4",
        d: "8"
      },
      answer: "c",
    },
    {
      question: "5 * 5 = ?",
      responses: {
        a: "10",
        b: "25",
        c: "55",
        d: "100"
      },
      answer: "b",
    },
  ],

  listQuestions: function() {
    return this.questions.map((q) => q.question);
  },

  getQuestion: function (index) {
    index = index || this.active;
    if (!index) {
      return false;
    }
    else {
      return {
        key: index,
        ...this.questions[index]
      };
    }
  },

  // This returns exactly what getQuestion would return but without the correct
  // answer identified.
  getQuestionPublic: function (index) {
    index = index || this.active;
    const q = this.getQuestion(index);

    return {
      key: index,
      question: q.question,
      responses: q.responses
    };
  },

  activate: function (index) {
    if (this.questions.hasOwnProperty(index)) {
      this.active = index;
      return this.getQuestion(this.active);
    } else {
      return false;
    }
  }
}
