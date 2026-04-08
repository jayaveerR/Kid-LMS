const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  examId: { type: mongoose.Schema.Types.ObjectId, ref: 'Exam', required: true },
  q: { type: Number, required: true },
  question: { type: String, required: true },
  modelAnswer: { type: String, required: true },
  maxMarks: { type: Number, default: 10 }
});

module.exports = mongoose.model('Question', questionSchema);
