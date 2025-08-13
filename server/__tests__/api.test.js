const request = require('supertest');
const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const { app } = require('../src/app');
const User = require('../src/models/User');
const Student = require('../src/models/Student');
const Course = require('../src/models/Course');
const Enrollment = require('../src/models/Enrollment');
const Assessment = require('../src/models/Assessment');
const Mark = require('../src/models/Mark');

describe('RMS API', () => {
  let mongod;

  beforeAll(async () => {
    mongod = await MongoMemoryServer.create();
    const uri = mongod.getUri();
    process.env.JWT_SECRET = 'test_secret';
    await mongoose.connect(uri);

    // seed minimal data
    const student = await Student.create({ studentId: 'S100', name: 'Test Student' });
    const course = await Course.create({ code: 'TST101', title: 'Test Course', credits: 3 });
    await Enrollment.create({ student: student._id, course: course._id, semester: 'S1' });
    const [a1, a2] = await Assessment.create([
      { course: course._id, name: 'Mid', weightPercent: 50, maxScore: 100 },
      { course: course._id, name: 'Final', weightPercent: 50, maxScore: 100 },
    ]);
    await Mark.create([
      { student: student._id, course: course._id, assessment: a1._id, score: 80 },
      { student: student._id, course: course._id, assessment: a2._id, score: 90 },
    ]);

    const pass = await bcrypt.hash('studpass', 10);
    await User.create({ email: 'stud@test.com', passwordHash: pass, role: 'student', student: student._id });
  });

  afterAll(async () => {
    await mongoose.disconnect();
    if (mongod) await mongod.stop();
  });

  it('health check', async () => {
    const res = await request(app).get('/api/health');
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ ok: true });
  });

  it('login and fetch results', async () => {
    const login = await request(app).post('/api/auth/login').send({ email: 'stud@test.com', password: 'studpass' });
    expect(login.statusCode).toBe(200);
    const token = login.body.token;
    expect(token).toBeTruthy();
    const me = await request(app).get('/api/auth/me').set('Authorization', `Bearer ${token}`);
    expect(me.statusCode).toBe(200);
    expect(me.body.role).toBe('student');
    const results = await request(app).get(`/api/results/student/${me.body.studentId}`).set('Authorization', `Bearer ${token}`);
    expect(results.statusCode).toBe(200);
    expect(Array.isArray(results.body.results)).toBe(true);
    expect(results.body.results.length).toBeGreaterThan(0);
    expect(typeof results.body.gpa).toBe('number');
  });
});


