const express = require('express');
const { auth } = require('../middleware/auth');
const Assessment = require('../models/Assessment');

const router = express.Router();

router.get('/course/:courseId', auth(['admin', 'teacher', 'student']), async (req, res) => {
  const list = await Assessment.find({ course: req.params.courseId }).sort({ createdAt: 1 });
  res.json(list);
});

router.post('/course/:courseId', auth(['admin', 'teacher']), async (req, res) => {
  try {
    const { name, weightPercent, maxScore } = req.body;
    // Validate weight total per course <= 100
    const current = await Assessment.find({ course: req.params.courseId });
    const total =
      current.reduce((s, a) => s + (a.weightPercent || 0), 0) + (Number(weightPercent) || 0);
    if (total > 100) return res.status(400).json({ message: 'Total weight exceeds 100%' });
    const doc = await Assessment.create({
      course: req.params.courseId,
      name,
      weightPercent,
      maxScore,
    });
    res.status(201).json(doc);
  } catch (err) {
    res.status(400).json({ message: 'Create failed', error: err.message });
  }
});

router.put('/:id', auth(['admin', 'teacher']), async (req, res) => {
  try {
    const { name, weightPercent, maxScore } = req.body;
    const existing = await Assessment.findById(req.params.id);
    if (!existing) return res.status(404).json({ message: 'Not found' });
    const siblings = await Assessment.find({ course: existing.course, _id: { $ne: existing._id } });
    const total =
      siblings.reduce((s, a) => s + (a.weightPercent || 0), 0) + (Number(weightPercent) || 0);
    if (total > 100) return res.status(400).json({ message: 'Total weight exceeds 100%' });
    const doc = await Assessment.findByIdAndUpdate(
      req.params.id,
      { $set: { name, weightPercent, maxScore } },
      { new: true, runValidators: true },
    );
    if (!doc) return res.status(404).json({ message: 'Not found' });
    res.json(doc);
  } catch (err) {
    res.status(400).json({ message: 'Update failed', error: err.message });
  }
});

router.delete('/:id', auth(['admin', 'teacher']), async (req, res) => {
  try {
    const doc = await Assessment.findByIdAndDelete(req.params.id);
    if (!doc) return res.status(404).json({ message: 'Not found' });
    res.json({ ok: true });
  } catch (err) {
    res.status(400).json({ message: 'Delete failed', error: err.message });
  }
});

module.exports = router;
