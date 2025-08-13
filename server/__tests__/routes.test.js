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

describe('Routes coverage', () => {
  let mongod;
  let tokens = {};
  let ids = {};

  beforeAll(async () => {
    mongod = await MongoMemoryServer.create();
    const uri = mongod.getUri();
    process.env.JWT_SECRET = 'test_secret';
    await mongoose.connect(uri);

    // Seed users and base data
    const [s1 /* , s2 */] = await Student.create([
      { studentId: 'S001', name: 'Alpha' },
      { studentId: 'S002', name: 'Beta' },
    ]);
    const [c1 /* , c2 */] = await Course.create([
      { code: 'CS101', title: 'Intro', credits: 3 },
      { code: 'CS102', title: 'DS', credits: 4 },
    ]);
    ids.s1 = s1._id.toString();
    ids.c1 = c1._id.toString();
    await Enrollment.create({ student: s1._id, course: c1._id, semester: 'S1' });
    const [a1, a2] = await Assessment.create([
      { course: c1._id, name: 'Mid', weightPercent: 50, maxScore: 100 },
      { course: c1._id, name: 'Final', weightPercent: 50, maxScore: 100 },
    ]);
    await Mark.create([
      { student: s1._id, course: c1._id, assessment: a1._id, score: 70 },
      { student: s1._id, course: c1._id, assessment: a2._id, score: 80 },
    ]);

    const [adminPass, teacherPass, studentPass] = await Promise.all([
      bcrypt.hash('admin123', 10),
      bcrypt.hash('teacher123', 10),
      bcrypt.hash('student123', 10),
    ]);
    await User.create([
      { email: 'admin@test.com', passwordHash: adminPass, role: 'admin' },
      { email: 'teacher@test.com', passwordHash: teacherPass, role: 'teacher' },
      { email: 'alpha@test.com', passwordHash: studentPass, role: 'student', student: s1._id },
    ]);

    // Logins
    tokens.admin = (
      await request(app).post('/api/auth/login').send({ email: 'admin@test.com', password: 'admin123' })
    ).body.token;
    tokens.teacher = (
      await request(app)
        .post('/api/auth/login')
        .send({ email: 'teacher@test.com', password: 'teacher123' })
    ).body.token;
    tokens.student = (
      await request(app)
        .post('/api/auth/login')
        .send({ email: 'alpha@test.com', password: 'student123' })
    ).body.token;
  });

  afterAll(async () => {
    await mongoose.disconnect();
    if (mongod) await mongod.stop();
  });

  it('students: admin can create, teacher can list', async () => {
    const createRes = await request(app)
      .post('/api/students')
      .set('Authorization', `Bearer ${tokens.admin}`)
      .send({ studentId: 'S003', name: 'Gamma' });
    expect(createRes.statusCode).toBe(201);
    const listRes = await request(app).get('/api/students').set('Authorization', `Bearer ${tokens.teacher}`);
    expect(listRes.statusCode).toBe(200);
    expect(Array.isArray(listRes.body)).toBe(true);
  }, 20000);

  it('courses: admin can create, student can list', async () => {
    const createRes = await request(app)
      .post('/api/courses')
      .set('Authorization', `Bearer ${tokens.admin}`)
      .send({ code: 'CS103', title: 'Algo', credits: 3 });
    expect(createRes.statusCode).toBe(201);
    const listRes = await request(app)
      .get('/api/courses')
      .set('Authorization', `Bearer ${tokens.student}`);
    expect(listRes.statusCode).toBe(200);
  }, 20000);

  it('enrollments: admin can enroll, teacher can fetch by course', async () => {
    const student = await Student.findOne({ studentId: 'S002' });
    const course = await Course.findOne({ code: 'CS102' });
    const enroll = await request(app)
      .post('/api/enrollments')
      .set('Authorization', `Bearer ${tokens.admin}`)
      .send({ student: student._id.toString(), course: course._id.toString(), semester: 'S1' });
    expect(enroll.statusCode).toBe(201);
    const list = await request(app)
      .get(`/api/enrollments/course/${course._id.toString()}`)
      .set('Authorization', `Bearer ${tokens.teacher}`);
    expect(list.statusCode).toBe(200);
    expect(Array.isArray(list.body)).toBe(true);
  }, 20000);

  it('assessments: create/update/delete and weight validations', async () => {
    const course = await Course.findOne({ code: 'CS102' });
    // create within limit
    const created = await request(app)
      .post(`/api/assessments/course/${course._id.toString()}`)
      .set('Authorization', `Bearer ${tokens.teacher}`)
      .send({ name: 'Quiz', weightPercent: 30, maxScore: 20 });
    expect(created.statusCode).toBe(201);
    const createdId = created.body._id;
    // try overflow
    const overflow = await request(app)
      .post(`/api/assessments/course/${course._id.toString()}`)
      .set('Authorization', `Bearer ${tokens.teacher}`)
      .send({ name: 'Proj', weightPercent: 80, maxScore: 100 });
    expect(overflow.statusCode).toBe(400);
    // update
    const updated = await request(app)
      .put(`/api/assessments/${createdId}`)
      .set('Authorization', `Bearer ${tokens.teacher}`)
      .send({ name: 'Quiz-1', weightPercent: 25, maxScore: 25 });
    expect(updated.statusCode).toBe(200);
    // delete
    const del = await request(app)
      .delete(`/api/assessments/${createdId}`)
      .set('Authorization', `Bearer ${tokens.teacher}`);
    expect(del.statusCode).toBe(200);
  }, 20000);

  it('marks: save validation, list, export/import', async () => {
    const course = await Course.findOne({ code: 'CS101' });
    const student = await Student.findOne({ studentId: 'S001' });
    const assessment = await Assessment.findOne({ course: course._id, name: 'Mid' });
    // out of range
    const bad = await request(app)
      .post('/api/marks')
      .set('Authorization', `Bearer ${tokens.teacher}`)
      .send({ student: student._id.toString(), course: course._id.toString(), assessment: assessment._id.toString(), score: 999 });
    expect(bad.statusCode).toBe(400);
    // ok
    const ok = await request(app)
      .post('/api/marks')
      .set('Authorization', `Bearer ${tokens.teacher}`)
      .send({ student: student._id.toString(), course: course._id.toString(), assessment: assessment._id.toString(), score: 85 });
    expect(ok.statusCode).toBe(201);
    // list
    const list = await request(app)
      .get(`/api/marks/course/${course._id.toString()}`)
      .set('Authorization', `Bearer ${tokens.teacher}`);
    expect(list.statusCode).toBe(200);
    expect(Array.isArray(list.body)).toBe(true);
    // export
    const csv = await request(app)
      .get(`/api/marks/export/${course._id.toString()}`)
      .set('Authorization', `Bearer ${tokens.teacher}`);
    expect(csv.statusCode).toBe(200);
    expect(csv.text).toContain('student,assessment,score');
    // import same back
    const imp = await request(app)
      .post(`/api/marks/import/${course._id.toString()}`)
      .set('Authorization', `Bearer ${tokens.teacher}`)
      .set('Content-Type', 'text/csv')
      .send(csv.text);
    expect(imp.statusCode).toBe(200);
    expect(imp.body.count).toBeGreaterThan(0);
  }, 20000);

  it('results: students and PDF', async () => {
    const me = await request(app).get('/api/auth/me').set('Authorization', `Bearer ${tokens.student}`);
    const resJson = await request(app)
      .get(`/api/results/student/${me.body.studentId}`)
      .set('Authorization', `Bearer ${tokens.student}`);
    expect(resJson.statusCode).toBe(200);
    expect(Array.isArray(resJson.body.results)).toBe(true);
    const pdf = await request(app)
      .get(`/api/results/student/${me.body.studentId}/pdf`)
      .set('Authorization', `Bearer ${tokens.student}`);
    expect(pdf.statusCode).toBe(200);
    expect(pdf.headers['content-type']).toMatch(/application\/pdf/);
  }, 20000);

  it('auth: missing token forbidden on protected route', async () => {
    const res = await request(app).post('/api/students').send({ studentId: 'S999', name: 'NoAuth' });
    expect(res.statusCode).toBe(401);
  }, 20000);
});


