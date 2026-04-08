
require('dotenv').config({ path: 'd:/Moshe/wireframe-weaver/backend/.env' });
const mongoose = require('mongoose');
const User = require('d:/Moshe/wireframe-weaver/backend/models/User');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/kid-lms';

async function testRegister() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('Connected.');

    const email = `test_${Date.now()}@example.com`;
    const fullName = 'Test User';
    const password = 'password123';
    const role = 'student';

    console.log(`Attempting to register user: ${email}`);
    const newUser = new User({ fullName, email, password, role });
    await newUser.save();
    console.log('User registered successfully.');

    await User.deleteOne({ email });
    console.log('Test user deleted.');

    process.exit(0);
  } catch (err) {
    console.error('Registration failed in test:');
    console.error(err);
    console.error(err.stack);
    process.exit(1);
  }
}

testRegister();
