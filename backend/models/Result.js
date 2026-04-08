const mongoose = require('mongoose');

const resultSchema = new mongoose.Schema({
  examId: { type: mongoose.Schema.Types.ObjectId, ref: 'Exam', required: true },
  examTitle: { type: String },
  studentName: { type: String },
  rollNumber: { type: String, required: true },
  score: { type: Number, required: true },
  total: { type: Number, required: true },
  percentage: { type: String },
  grade: { type: String },
  details: [
    {
      question_num: Number,
      score: Number,
      instructor_question: String,
      instructor_answer: String,
      student_question: String,
      student_answer: String,
      evaluation_feedback: String,
      semantic_match_percentage: Number
    }
  ],
  timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Result', resultSchema);
