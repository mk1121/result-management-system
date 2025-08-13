const mongoose = require('mongoose');

const markSchema = new mongoose.Schema(
  {
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
    course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
    assessment: { type: mongoose.Schema.Types.ObjectId, ref: 'Assessment', required: true },
    score: { type: Number, required: true, min: 0 },
  },
  { timestamps: true },
);

markSchema.index({ student: 1, assessment: 1 }, { unique: true });

module.exports = mongoose.model('Mark', markSchema);
