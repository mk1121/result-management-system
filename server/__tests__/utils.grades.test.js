const { gradeLetterFromPercent, gradePointFromLetter, computeGPA } = require('../src/utils/grades');

describe('grades utils', () => {
  test('gradeLetterFromPercent thresholds', () => {
    expect(gradeLetterFromPercent(95)).toBe('A');
    expect(gradeLetterFromPercent(90)).toBe('A-');
    expect(gradeLetterFromPercent(87)).toBe('B+');
    expect(gradeLetterFromPercent(83)).toBe('B');
    expect(gradeLetterFromPercent(80)).toBe('B-');
    expect(gradeLetterFromPercent(76)).toBe('C+');
    expect(gradeLetterFromPercent(73)).toBe('C');
    expect(gradeLetterFromPercent(70)).toBe('C-');
    expect(gradeLetterFromPercent(66)).toBe('D+');
    expect(gradeLetterFromPercent(61)).toBe('D');
    expect(gradeLetterFromPercent(50)).toBe('F');
  });

  test('gradePointFromLetter mapping', () => {
    expect(gradePointFromLetter('A')).toBe(4.0);
    expect(gradePointFromLetter('A-')).toBe(3.7);
    expect(gradePointFromLetter('B+')).toBe(3.3);
    expect(gradePointFromLetter('B')).toBe(3.0);
    expect(gradePointFromLetter('B-')).toBe(2.7);
    expect(gradePointFromLetter('C+')).toBe(2.3);
    expect(gradePointFromLetter('C')).toBe(2.0);
    expect(gradePointFromLetter('C-')).toBe(1.7);
    expect(gradePointFromLetter('D+')).toBe(1.3);
    expect(gradePointFromLetter('D')).toBe(1.0);
    expect(gradePointFromLetter('F')).toBe(0.0);
  });

  test('computeGPA with weighted courses', () => {
    const results = [
      { percent: 95, credits: 3 }, // 4*3
      { percent: 87, credits: 4 }, // 3.3*4
      { percent: 73, credits: 3 }, // 2*3
    ];
    const gpa = computeGPA(results);
    // (12 + 13.2 + 6) / 10 = 3.12
    expect(gpa).toBe(3.12);
  });
});


