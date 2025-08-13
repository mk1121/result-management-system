const express = require('express');
const { auth } = require('../middleware/auth');
const Enrollment = require('../models/Enrollment');
const Assessment = require('../models/Assessment');
const Mark = require('../models/Mark');
// const Course = require('../models/Course');
const { computeCoursePercent, gradeLetterFromPercent, computeGPA } = require('../utils/grades');
const PDFDocument = require('pdfkit');

const router = express.Router();

router.get('/student/:studentId', auth(['admin', 'teacher', 'student']), async (req, res) => {
  try {
    const requestedStudentId = req.params.studentId;
    if (req.user.role === 'student' && String(req.user.studentId) !== String(requestedStudentId)) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    const enrollments = await Enrollment.find({ student: requestedStudentId }).populate('course');
    const courseIds = enrollments.map((e) => e.course._id);

    const [assessments, marks] = await Promise.all([
      Assessment.find({ course: { $in: courseIds } }),
      Mark.find({ student: requestedStudentId, course: { $in: courseIds } }),
    ]);

    const assessmentsByCourse = new Map();
    for (const a of assessments) {
      const key = String(a.course);
      if (!assessmentsByCourse.has(key)) assessmentsByCourse.set(key, []);
      assessmentsByCourse.get(key).push(a);
    }

    const marksByAssessment = new Map(marks.map((m) => [String(m.assessment), m]));

    const courseResults = [];
    for (const e of enrollments) {
      const course = e.course;
      const aList = assessmentsByCourse.get(String(course._id)) || [];
      const percent = computeCoursePercent(aList, marksByAssessment);
      const letter = gradeLetterFromPercent(percent);
      courseResults.push({
        course: { id: course._id, code: course.code, title: course.title },
        percent: Number(percent.toFixed(2)),
        letter,
        credits: course.credits,
      });
    }

    const gpa = computeGPA(courseResults.map((c) => ({ percent: c.percent, credits: c.credits })));

    res.json({ results: courseResults, gpa });
  } catch {
    res.status(500).json({ message: 'Failed to compute results' });
  }
});

router.get('/student/:studentId/pdf', auth(['admin', 'teacher', 'student']), async (req, res) => {
  try {
    const requestedStudentId = req.params.studentId;
    if (req.user.role === 'student' && String(req.user.studentId) !== String(requestedStudentId)) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    const enrollments = await Enrollment.find({ student: requestedStudentId }).populate('course');
    const courseIds = enrollments.map((e) => e.course._id);
    const [assessments, marks] = await Promise.all([
      Assessment.find({ course: { $in: courseIds } }),
      Mark.find({ student: requestedStudentId, course: { $in: courseIds } }),
    ]);

    const assessmentsByCourse = new Map();
    for (const a of assessments) {
      const key = String(a.course);
      if (!assessmentsByCourse.has(key)) assessmentsByCourse.set(key, []);
      assessmentsByCourse.get(key).push(a);
    }
    const marksByAssessment = new Map(marks.map((m) => [String(m.assessment), m]));

    const rows = [];
    for (const e of enrollments) {
      const course = e.course;
      const aList = assessmentsByCourse.get(String(course._id)) || [];
      const percent = computeCoursePercent(aList, marksByAssessment);
      const letter = gradeLetterFromPercent(percent);
      rows.push({
        code: course.code,
        title: course.title,
        percent: Number(percent.toFixed(2)),
        letter,
        credits: course.credits,
      });
    }
    const gpa = computeGPA(rows.map((c) => ({ percent: c.percent, credits: c.credits })));

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="results.pdf"');
    const doc = new PDFDocument({ margin: 40 });
    doc.pipe(res);
    doc.fontSize(18).text('Student Results', { align: 'center' });
    doc.moveDown();
    doc.fontSize(12);
    rows.forEach((r) => {
      doc.text(`${r.code} - ${r.title}`);
      doc.text(`Percent: ${r.percent}%   Grade: ${r.letter}   Credits: ${r.credits}`);
      doc.moveDown(0.5);
    });
    doc.moveDown();
    doc.text(`GPA: ${gpa}`, { align: 'right' });
    doc.end();
  } catch {
    res.status(500).json({ message: 'Failed to generate PDF' });
  }
});

module.exports = router;
