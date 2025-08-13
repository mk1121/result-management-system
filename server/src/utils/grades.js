function gradeLetterFromPercent(percent) {
  // Using scale:
  // 93+ A, 89-<93 A-, 86-<89 B+, 82-<86 B, 79-<82 B-, 75-<79 C+, 72-<75 C,
  // 69-<72 C-, 65-<69 D+, 60-<65 D, <60 F
  if (percent >= 93) return 'A';
  if (percent >= 89) return 'A-';
  if (percent >= 86) return 'B+';
  if (percent >= 82) return 'B';
  if (percent >= 79) return 'B-';
  if (percent >= 75) return 'C+';
  if (percent >= 72) return 'C';
  if (percent >= 69) return 'C-';
  if (percent >= 65) return 'D+';
  if (percent >= 60) return 'D';
  return 'F';
}

function gradePointFromLetter(letter) {
  switch (letter) {
    case 'A':
      return 4.0;
    case 'A-':
      return 3.7;
    case 'B+':
      return 3.3;
    case 'B':
      return 3.0;
    case 'B-':
      return 2.7;
    case 'C+':
      return 2.3;
    case 'C':
      return 2.0;
    case 'C-':
      return 1.7;
    case 'D+':
      return 1.3;
    case 'D':
      return 1.0;
    default:
      return 0.0;
  }
}

function computeCoursePercent(assessments, marksByAssessmentId) {
  let total = 0;
  for (const a of assessments) {
    const mark = marksByAssessmentId.get(String(a._id));
    if (!mark) continue;
    const ratio = a.maxScore ? mark.score / a.maxScore : 0;
    total += ratio * a.weightPercent;
  }
  return total; // already percent out of 100
}

function computeGPA(results) {
  // results: [{ percent, credits }]
  let totalQualityPoints = 0;
  let totalCredits = 0;
  for (const r of results) {
    const letter = gradeLetterFromPercent(r.percent);
    const gp = gradePointFromLetter(letter);
    totalQualityPoints += gp * (r.credits || 0);
    totalCredits += r.credits || 0;
  }
  return totalCredits ? Number((totalQualityPoints / totalCredits).toFixed(2)) : 0;
}

module.exports = { gradeLetterFromPercent, gradePointFromLetter, computeCoursePercent, computeGPA };
