require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');

const authRoutes = require('./routes/auth');
const studentRoutes = require('./routes/students');
const courseRoutes = require('./routes/courses');
const assessmentRoutes = require('./routes/assessments');
const markRoutes = require('./routes/marks');
const enrollmentRoutes = require('./routes/enrollments');
const resultRoutes = require('./routes/results');
const userRoutes = require('./routes/users');

const app = express();

app.use(cors({ origin: process.env.CLIENT_ORIGIN || 'http://localhost:5173', credentials: true }));
app.use(express.json());
app.use(morgan('dev'));

// Health
app.get('/api/health', (req, res) => res.json({ ok: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/assessments', assessmentRoutes);
app.use('/api/marks', markRoutes);
app.use('/api/enrollments', enrollmentRoutes);
app.use('/api/results', resultRoutes);
app.use('/api/users', userRoutes);

// Not found handler
app.use((req, res) => {
  res.status(404).json({ message: 'Not found' });
});

module.exports = { app };


