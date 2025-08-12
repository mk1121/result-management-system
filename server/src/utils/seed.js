require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const User = require('../models/User');
const Student = require('../models/Student');
const Course = require('../models/Course');
const Enrollment = require('../models/Enrollment');
const Assessment = require('../models/Assessment');
const Mark = require('../models/Mark');

async function main() {
  const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/rms';
  await mongoose.connect(MONGO_URI);
  console.log('Connected to MongoDB');

  await Promise.all([
    User.deleteMany({}),
    Student.deleteMany({}),
    Course.deleteMany({}),
    Enrollment.deleteMany({}),
    Assessment.deleteMany({}),
    Mark.deleteMany({}),
  ]);

  const [s1, s2] = await Student.create([
    { studentId: 'S001', name: 'Alice Johnson', program: 'BSc CS', batch: '2024' },
    { studentId: 'S002', name: 'Bob Smith', program: 'BSc CS', batch: '2024' },
  ]);

  const [c1, c2] = await Course.create([
    { code: 'CS101', title: 'Intro to Programming', credits: 3 },
    { code: 'CS102', title: 'Data Structures', credits: 4 },
  ]);

  await Enrollment.create([
    { student: s1._id, course: c1._id, semester: 'S1' },
    { student: s1._id, course: c2._id, semester: 'S1' },
    { student: s2._id, course: c1._id, semester: 'S1' },
  ]);

  const [a1, a2, a3] = await Assessment.create([
    { course: c1._id, name: 'Midterm', weightPercent: 30, maxScore: 100 },
    { course: c1._id, name: 'Project', weightPercent: 20, maxScore: 100 },
    { course: c1._id, name: 'Final', weightPercent: 50, maxScore: 100 },
  ]);

  // minimal marks
  await Mark.create([
    { student: s1._id, course: c1._id, assessment: a1._id, score: 80 },
    { student: s1._id, course: c1._id, assessment: a2._id, score: 85 },
    { student: s1._id, course: c1._id, assessment: a3._id, score: 90 },
    { student: s2._id, course: c1._id, assessment: a1._id, score: 60 },
    { student: s2._id, course: c1._id, assessment: a2._id, score: 70 },
    { student: s2._id, course: c1._id, assessment: a3._id, score: 65 },
  ]);

  const [adminPass, teacherPass, studentPass] = await Promise.all([
    bcrypt.hash('admin123', 10),
    bcrypt.hash('teacher123', 10),
    bcrypt.hash('student123', 10),
  ]);

  await User.create([
    { email: 'admin@example.com', passwordHash: adminPass, role: 'admin' },
    { email: 'teacher@example.com', passwordHash: teacherPass, role: 'teacher' },
    { email: 'alice@example.com', passwordHash: studentPass, role: 'student', student: s1._id },
  ]);

  console.log('Seed complete');
  await mongoose.disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});


