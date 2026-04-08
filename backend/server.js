require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// Models
const Exam = require('./models/Exam');
const Question = require('./models/Question');
const Result = require('./models/Result');
const User = require('./models/User');
const Subject = require('./models/Subject');

const app = express();
const JWT_SECRET = process.env.JWT_SECRET || 'lms_secret_key_123';

// --- CORS Config ---
app.use(cors({
  origin: function (origin, callback) {
    // allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    return callback(null, origin);
  },
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  credentials: true
}));

app.options('*', cors());
app.use(express.json());

// Log all requests
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// --- MongoDB Connection ---
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/kid-lms';

mongoose.connect(MONGODB_URI)
  .then(() => console.log('✅ Connected to MongoDB Successfully'))
  .catch(err => console.error('❌ MongoDB Connection Error:', err));

// --- Auth APIs ---

app.post('/api/register', async (req, res) => {
  const { fullName, email, password, role } = req.body;
  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ error: "Email already exists" });

    const newUser = new User({ fullName, email, password, role });
    await newUser.save();
    res.status(201).json({ message: "User registered successfully" });
  } catch (err) {
    res.status(500).json({ error: "Registration failed", details: err.message });
  }
});

app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ error: "Invalid email or password" });

    const isMatch = await user.comparePassword(password);
    if (!isMatch) return res.status(401).json({ error: "Invalid email or password" });

    const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: '1d' });
    res.json({
      token,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        isAdmin: user.role === 'admin',
        isInstructor: user.role === 'instructor'
      }
    });
  } catch (err) {
    res.status(500).json({ error: "Login failed", details: err.message });
  }
});

// --- User APIs ---
app.get('/api/users', async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch users" });
  }
});

app.patch('/api/users/:id/role', async (req, res) => {
  const { role } = req.body;
  try {
    await User.findByIdAndUpdate(req.params.id, { role });
    res.json({ message: "Role updated successfully" });
  } catch (err) {
    res.status(500).json({ error: "Failed to update role" });
  }
});

// User Profile APIs
app.get('/api/users/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch user" });
  }
});

app.patch('/api/users/:id', async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true }).select('-password');
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: "Failed to update user" });
  }
});

// --- Subject APIs ---
app.get('/api/subjects', async (req, res) => {
  try {
    const subjects = await Subject.find().sort({ name: 1 });
    res.json(subjects);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch subjects" });
  }
});

app.post('/api/subjects', async (req, res) => {
  try {
    const newSubject = new Subject(req.body);
    await newSubject.save();
    res.status(201).json(newSubject);
  } catch (err) {
    res.status(500).json({ error: "Failed to create subject" });
  }
});

// --- Exam APIs ---
app.get('/api/exams', async (req, res) => {
  try {
    const exams = await Exam.find().sort({ date: -1 });
    const formatted = exams.map(e => ({
      _id: e._id,
      id: e._id,
      title: e.title,
      subject: e.subject,
      description: e.description,
      date: e.date
    }));
    res.json(formatted);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch exams" });
  }
});

app.post('/api/exams', async (req, res) => {
  try {
    const newExam = new Exam(req.body);
    await newExam.save();
    res.status(201).json({ ...newExam.toObject(), id: newExam._id, _id: newExam._id });
  } catch (err) {
    res.status(500).json({ error: "Failed to create exam" });
  }
});

app.get('/api/model-answers', async (req, res) => {
  const { examId } = req.query;
  if (!examId) return res.status(400).json({ error: "examId is required" });
  try {
    const questions = await Question.find({ examId }).sort({ q: 1 });
    // Keep internal IDs as 'id' for frontend compatibility
    const formatted = questions.map(q => ({
      id: q._id,
      q: q.q,
      question: q.question,
      modelAnswer: q.modelAnswer,
      maxMarks: q.maxMarks
    }));
    res.json(formatted);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch model answers" });
  }
});

app.post('/api/exams/:examId/questions', async (req, res) => {
  try {
    const { examId } = req.params;
    const { q, question, modelAnswer, maxMarks } = req.body;
    const newQuestion = new Question({ examId, q, question, modelAnswer, maxMarks });
    await newQuestion.save();
    // Return with 'id' for frontend
    res.status(201).json({ id: newQuestion._id, ...newQuestion.toObject() });
  } catch (err) {
    res.status(500).json({ error: "Failed to save question" });
  }
});

app.delete('/api/exams/:examId/questions/:questionId', async (req, res) => {
  try {
    await Question.findByIdAndDelete(req.params.questionId);
    res.json({ message: "Question deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete question" });
  }
});

app.post('/api/exams/:examId/questions/bulk', async (req, res) => {
  try {
    const { examId } = req.params;
    const { questions } = req.body;
    const docs = questions.map(q => ({ ...q, examId }));
    await Question.insertMany(docs);
    res.json({ message: `${questions.length} questions saved successfully` });
  } catch (err) {
    res.status(500).json({ error: "Failed to bulk save questions" });
  }
});

app.put('/api/exams/:examId/questions/:questionId', async (req, res) => {
  try {
    const { q, question, modelAnswer, maxMarks } = req.body;
    const updated = await Question.findByIdAndUpdate(
      req.params.questionId,
      { q, question, modelAnswer, maxMarks },
      { new: true }
    );
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: "Failed to update question" });
  }
});

// --- Extraction APIs ---
const multer = require('multer');
const upload = multer();

app.post('/api/extract', upload.array('files'), async (req, res) => {
  try {
    const { exam_id } = req.body;
    
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: "No files uploaded" });
    }

    const firstFile = req.files[0];
    const content = JSON.parse(firstFile.buffer.toString());

    if (!content.qa || !Array.isArray(content.qa)) {
      return res.status(400).json({ error: "Invalid JSON format: missing qa array" });
    }

    const extracted_data = content.qa.map((item, idx) => ({
      question_num: idx + 1,
      student_question: item.question,
      student_answer: item.answer
    }));

    res.json({ extracted_data });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Extraction failed. Ensure you uploaded a valid JSON file." });
  }
});

app.post('/api/record-ledger', async (req, res) => {
  try {
    const { uid, evaluation_result } = req.body;
    
    // Find exam details for title
    const exam = await Exam.findById(evaluation_result.examId || evaluation_result.exam_id);
    // Find user details for name
    const user = await User.findById(uid).catch(() => null);

    const newResult = new Result({
      examId: evaluation_result.examId || evaluation_result.exam_id,
      examTitle: exam ? exam.title : 'External Assessment',
      studentName: user ? user.fullName : 'External Candidate',
      rollNumber: evaluation_result.roll_number || evaluation_result.rollNumber,
      score: evaluation_result.score,
      total: evaluation_result.total,
      percentage: evaluation_result.percentage,
      grade: evaluation_result.grade,
      details: evaluation_result.details
    });

    await newResult.save();
    res.json({ message: "Marks recorded successfully", resultId: newResult._id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to record marks in ledger", details: err.message });
  }
});

// --- Results APIs ---
app.get('/api/results', async (req, res) => {
    const { rollNumber } = req.query;
    try {
        let filter = {};
        if (rollNumber) {
            filter = { 
                $or: [
                    { rollNumber: rollNumber },
                    { rollNumber: rollNumber.toLowerCase() }
                ] 
            };
        }
        const results = await Result.find(filter).sort({ timestamp: -1 });
        res.json(results);
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch results", details: err.message });
    }
});

app.get('/api/results/:id', async (req, res) => {
    try {
        const result = await Result.findById(req.params.id);
        if (!result) return res.status(404).json({ error: "Result not found" });
        res.json(result);
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch result detail" });
    }
});

// --- Evaluation APIs ---
app.post('/api/evaluate-confirm', async (req, res) => {
  const { exam_id, roll_number, extracted_data } = req.body;
  try {
    // This is a simulated semantic evaluation
    // In a real app, this would call an LLM (OpenAI/Gemini) to compare student_answer vs modelAnswer
    
    const questions = await Question.find({ examId: exam_id });
    if (!questions || questions.length === 0) {
      return res.status(400).json({ error: "No answer key found for this exam" });
    }

    let totalMarks = 0;
    let gainedMarks = 0;
    const details = [];

    for (const item of extracted_data) {
      const qNum = item.question_num;
      const questionObj = questions.find(q => q.q === qNum);
      
      const maxM = questionObj ? questionObj.maxMarks : 10;
      totalMarks += maxM;

      
      // Simulated score and match calculation
      const studentLen = (item.student_answer || item.answer || '').length;
      const modelLen = (questionObj?.modelAnswer || '').length;
      const matchPct = modelLen > 0 ? Math.min(100, Math.round((studentLen / modelLen) * 100)) : 0;
      const score = Math.min(maxM, Math.max(0, Math.round((matchPct / 100) * maxM)));
      
      gainedMarks += score;
      details.push({
        question_num: qNum,
        score: score,
        semantic_match_percentage: matchPct,
        instructor_question: questionObj ? questionObj.question : 'Question data missing',
        instructor_answer: questionObj ? questionObj.modelAnswer : 'Model answer missing',
        student_question: item.student_question || item.question || 'Extraction missing',
        student_answer: item.student_answer || item.answer || 'Answer missing',
        evaluation_feedback: "Automated semantic comparison complete." 
      });
    }

    const pctVal = (gainedMarks / totalMarks) * 100;
    const percentage = pctVal.toFixed(1) + '%';
    
    let grade = 'F';
    if (pctVal >= 90) grade = 'A+';
    else if (pctVal >= 80) grade = 'A';
    else if (pctVal >= 70) grade = 'B';
    else if (pctVal >= 60) grade = 'C';
    else if (pctVal >= 50) grade = 'D';

    const result = new Result({
      examId: exam_id,
      rollNumber: roll_number === 'RESERVED_UNASSIGNED' ? 'TEST_EVAL' : roll_number,
      score: gainedMarks,
      total: totalMarks,
      percentage,
      grade,
      details
    });

    await result.save();
    res.json(result);

  } catch (err) {
    res.status(500).json({ error: "Evaluation failed", details: err.message });
  }
});

// --- Dashboard Stats API ---
app.get('/api/stats', async (req, res) => {
  try {
    const userCount = await User.countDocuments();
    const studentCount = await User.countDocuments({ role: 'student' });
    const instructorCount = await User.countDocuments({ role: 'instructor' });
    const adminCount = await User.countDocuments({ role: 'admin' });
    const examCount = await Exam.countDocuments();
    const resultCount = await Result.countDocuments();
    
    res.json({
      totalUsers: userCount,
      students: studentCount,
      instructors: instructorCount,
      admins: adminCount,
      exams: examCount,
      evaluations: resultCount
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch stats" });
  }
});

const port = process.env.PORT || 5000;
app.listen(port, '0.0.0.0', () => {
  console.log(`🚀 Node.js Backend Server running at http://localhost:${port}`);
});
