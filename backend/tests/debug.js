import { app } from '../index.js';
import request from 'supertest';

async function test() {
  process.env.NODE_ENV = 'test';
  try {
    const res = await request(app)
      .post('/api/auth/send-otp')
      .send({});
    console.log('STATUS:', res.status);
    console.log('BODY:', res.body);
  } catch (err) {
    console.error('TEST ERROR:', err);
  }
}

test();
