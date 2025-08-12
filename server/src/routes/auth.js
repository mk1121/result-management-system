const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { auth } = require('../middleware/auth');
const User = require('../models/User');

const router = express.Router();

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email }).populate('student');
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });
    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return res.status(400).json({ message: 'Invalid credentials' });
    const token = jwt.sign(
      { id: user._id, role: user.role, email: user.email, studentId: user.student ? user.student._id : null },
      process.env.JWT_SECRET || 'dev_secret',
      { expiresIn: '7d' }
    );
    res.json({
      token,
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        studentId: user.student ? user.student._id : null,
        name: user.student ? user.student.name : undefined,
      },
    });
  } catch (err) {
    res.status(500).json({ message: 'Login failed' });
  }
});

router.get('/me', auth(), async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate('student');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({
      id: user._id,
      email: user.email,
      role: user.role,
      studentId: user.student ? user.student._id : null,
      name: user.student ? user.student.name : undefined,
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch profile' });
  }
});

module.exports = router;


