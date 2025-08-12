const express = require('express');
const { auth } = require('../middleware/auth');
const Enrollment = require('../models/Enrollment');

const router = express.Router();

router.get('/course/:courseId', auth(['admin', 'teacher']), async (req, res) => {
  try {
    const list = await Enrollment.find({ course: req.params.courseId })
      .populate('student')
      .populate('course')
      .sort({ createdAt: 1 });
    res.json(list);
  } catch (err) {
    res.status(500).json({ message: 'Fetch failed' });
  }
});

router.post('/', auth(['admin']), async (req, res) => {
  try {
    const { student, course, semester } = req.body;
    const doc = await Enrollment.create({ student, course, semester });
    res.status(201).json(doc);
  } catch (err) {
    res.status(400).json({ message: 'Enroll failed', error: err.message });
  }
});

module.exports = router;


