const express = require('express');
const { auth } = require('../middleware/auth');
const Course = require('../models/Course');

const router = express.Router();

router.get('/', auth(['admin', 'teacher', 'student']), async (req, res) => {
  const courses = await Course.find().sort({ code: 1 });
  res.json(courses);
});

router.post('/', auth(['admin']), async (req, res) => {
  try {
    const course = await Course.create(req.body);
    res.status(201).json(course);
  } catch (err) {
    res.status(400).json({ message: 'Create failed', error: err.message });
  }
});

module.exports = router;


