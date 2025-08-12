const express = require('express');
const { auth } = require('../middleware/auth');
const Mark = require('../models/Mark');
const Assessment = require('../models/Assessment');

const router = express.Router();

router.get('/course/:courseId', auth(['admin', 'teacher']), async (req, res) => {
  const marks = await Mark.find({ course: req.params.courseId }).populate('student assessment').sort({ createdAt: 1 });
  res.json(marks);
});

router.post('/', auth(['admin', 'teacher']), async (req, res) => {
  try {
    const { student, course, assessment, score } = req.body;
    const a = await Assessment.findById(assessment);
    if (!a) return res.status(400).json({ message: 'Assessment not found' });
    if (score < 0 || (a.maxScore && score > a.maxScore)) {
      return res.status(400).json({ message: 'Score out of range' });
    }
    const doc = await Mark.findOneAndUpdate(
      { student, assessment },
      { student, course, assessment, score },
      { new: true, upsert: true, runValidators: true }
    );
    res.status(201).json(doc);
  } catch (err) {
    res.status(400).json({ message: 'Save failed', error: err.message });
  }
});

// CSV export (simple): rows of studentId,assessmentId,score
router.get('/export/:courseId', auth(['admin', 'teacher']), async (req, res) => {
  const list = await Mark.find({ course: req.params.courseId }).lean();
  const header = 'student,assessment,score\n';
  const body = list.map((m) => `${m.student},${m.assessment},${m.score}`).join('\n');
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename="marks.csv"');
  res.send(header + body + '\n');
});

// CSV import (simple): expects text/csv in body
router.post('/import/:courseId', auth(['admin', 'teacher']), express.text({ type: 'text/csv' }), async (req, res) => {
  const lines = (req.body || '').trim().split(/\r?\n/);
  const rows = lines.slice(1); // skip header
  const ops = rows
    .map((line) => line.split(','))
    .filter((cols) => cols.length >= 3)
    .map(([student, assessment, score]) => ({ student, assessment, score: Number(score), course: req.params.courseId }));
  const results = [];
  for (const r of ops) {
    const doc = await Mark.findOneAndUpdate(
      { student: r.student, assessment: r.assessment },
      r,
      { new: true, upsert: true, runValidators: true }
    );
    results.push(doc);
  }
  res.json({ count: results.length });
});

module.exports = router;


