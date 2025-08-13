const request = require('supertest');
const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const { app } = require('../src/app');
const User = require('../src/models/User');
const Student = require('../src/models/Student');

describe('users route', () => {
  let mongod;
  let adminToken;
  let student;

  beforeAll(async () => {
    mongod = await MongoMemoryServer.create();
    const uri = mongod.getUri();
    process.env.JWT_SECRET = 'test_secret';
    await mongoose.connect(uri);
    student = await Student.create({ studentId: 'S100', name: 'New Student' });
    const pass = await bcrypt.hash('admin123', 10);
    await User.create({ email: 'admin@test.com', passwordHash: pass, role: 'admin' });
    adminToken = (
      await request(app).post('/api/auth/login').send({ email: 'admin@test.com', password: 'admin123' })
    ).body.token;
  });

  afterAll(async () => {
    await mongoose.disconnect();
    if (mongod) await mongod.stop();
  });

  it('creates a student login', async () => {
    const res = await request(app)
      .post('/api/users/student')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ studentId: student._id.toString(), email: 'student@test.com', password: 'pass123' });
    expect(res.statusCode).toBe(201);
    expect(res.body.email).toBe('student@test.com');
  }, 20000);
});


