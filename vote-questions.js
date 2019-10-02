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
    return this.questions[index] || false;
  }
}
