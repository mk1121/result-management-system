const express = require('express');
const bcrypt = require('bcryptjs');
const { auth } = require('../middleware/auth');
const User = require('../models/User');
const Student = require('../models/Student');

const router = express.Router();

// Create a student login (email + password) for an existing student
router.post('/student', auth(['admin']), async (req, res) => {
  try {
    const { studentId, email, password } = req.body;
    if (!studentId || !email || !password) {
      return res.status(400).json({ message: 'studentId, email and password are required' });
    }

    const student = await Student.findById(studentId);
    if (!student) return res.status(404).json({ message: 'Student not found' });

    const existingEmail = await User.findOne({ email: email.toLowerCase() });
    if (existingEmail) return res.status(400).json({ message: 'Email already in use' });

    const existingStudentUser = await User.findOne({ student: studentId });
    if (existingStudentUser) return res.status(400).json({ message: 'Login already exists for this student' });

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({ email: email.toLowerCase(), passwordHash, role: 'student', student: studentId });

    res.status(201).json({ id: user._id, email: user.email, role: user.role, studentId: user.student });
  } catch (err) {
    res.status(400).json({ message: 'Create student login failed', error: err.message });
  }
});

module.exports = router;


