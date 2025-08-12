const mongoose = require('mongoose');

const assessmentSchema = new mongoose.Schema(
  {
    course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
    name: { type: String, required: true },
    weightPercent: { type: Number, required: true, min: 0, max: 100 },
    maxScore: { type: Number, default: 100 },
  },
  { timestamps: true }
);

assessmentSchema.index({ course: 1, name: 1 }, { unique: true });

module.exports = mongoose.model('Assessment', assessmentSchema);


