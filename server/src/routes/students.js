const express = require('express');
const { auth } = require('../middleware/auth');
const Student = require('../models/Student');

const router = express.Router();

router.get('/', auth(['admin', 'teacher']), async (req, res) => {
  const students = await Student.find().sort({ createdAt: -1 });
  res.json(students);
});

router.post('/', auth(['admin']), async (req, res) => {
  try {
    const student = await Student.create(req.body);
    res.status(201).json(student);
  } catch (err) {
    res.status(400).json({ message: 'Create failed', error: err.message });
  }
});

module.exports = router;
