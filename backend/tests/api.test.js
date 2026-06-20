import { describe, it, expect, vi } from 'vitest';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import { app } from '../index.js';

describe('Backend API Endpoints', () => {
  // ─── Authentication Routes ──────────────────────────────────────────────────
  describe('POST /api/auth/send-otp', () => {
    it('should return 400 Bad Request if parameters are missing or empty', async () => {
      const response = await request(app)
        .post('/api/auth/send-otp')
        .send({});

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('Invalid input: expected string, received undefined');
    });

    it('should return 404 Not Found if mobile and workerId are not registered', async () => {
      const response = await request(app)
        .post('/api/auth/send-otp')
        .send({ workerId: 'INVALID_ID', mobile: '0000000000' });

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('Worker ID or mobile number not registered');
    });

    it('should generate OTP successfully for registered worker', async () => {
      const mockRandom = vi.spyOn(Math, 'random').mockReturnValue(0); // generates OTP '1000'
      const response = await request(app)
        .post('/api/auth/send-otp')
        .send({ workerId: 'AW-4521', mobile: '9876543210' });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
      mockRandom.mockRestore();
    });
  });

  describe('POST /api/auth/verify-otp', () => {
    it('should verify OTP and return a JWT session token', async () => {
      // 1. Trigger OTP generation with mocked value 1000
      const mockRandom = vi.spyOn(Math, 'random').mockReturnValue(0);
      await request(app)
        .post('/api/auth/send-otp')
        .send({ workerId: 'AW-4521', mobile: '9876543210' });
      mockRandom.mockRestore();

      // 2. Perform verification with the generated OTP
      const response = await request(app)
        .post('/api/auth/verify-otp')
        .send({ mobile: '9876543210', otp: '1000' });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('token');
      expect(response.body.worker).toHaveProperty('id', 'AW-4521');
    });

    it('should return 400 Bad Request for incorrect OTP codes', async () => {
      const response = await request(app)
        .post('/api/auth/verify-otp')
        .send({ mobile: '9876543210', otp: '9999' });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error', 'Invalid verification code');
    });
  });

  describe('GET /api/auth/validate', () => {
    it('should return 200 and session details for valid JWT', async () => {
      const token = jwt.sign(
        { id: 'AW-4521', name: 'Sunita Ji', mobile: '9876543210', block: 'Anganwadi Block 3' },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
      );

      const response = await request(app)
        .get('/api/auth/validate')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('valid', true);
      expect(response.body.worker).toHaveProperty('id', 'AW-4521');
    });

    it('should return 403 Forbidden with invalid signature JWT', async () => {
      const response = await request(app)
        .get('/api/auth/validate')
        .set('Authorization', 'Bearer invalid_signature_token');

      expect(response.status).toBe(403);
      expect(response.body).toHaveProperty('error', 'Invalid or expired token');
    });

    it('should return 401 Unauthorized with missing token', async () => {
      const response = await request(app)
        .get('/api/auth/validate');

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('error', 'Access token missing');
    });
  });

  // ─── Child CRUD Routes ──────────────────────────────────────────────────────
  describe('GET /api/children', () => {
    it('should fetch children list when authenticated', async () => {
      const token = jwt.sign(
        { id: 'AW-4521', name: 'Sunita Ji', mobile: '9876543210', block: 'Anganwadi Block 3' },
        process.env.JWT_SECRET
      );

      const response = await request(app)
        .get('/api/children')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
      expect(response.body[0]).toHaveProperty('id');
      expect(response.body[0]).toHaveProperty('name');
    });

    it('should reject children fetch with 401 if token missing', async () => {
      const response = await request(app)
        .get('/api/children');

      expect(response.status).toBe(401);
    });
  });

  describe('POST /api/children/observation', () => {
    it('should add observation to child record when authenticated', async () => {
      const token = jwt.sign(
        { id: 'AW-4521', name: 'Sunita Ji', mobile: '9876543210', block: 'Anganwadi Block 3' },
        process.env.JWT_SECRET
      );

      const response = await request(app)
        .post('/api/children/observation')
        .set('Authorization', `Bearer ${token}`)
        .send({
          childId: '1',
          note: 'Excellent language progress verified in integration test',
          category: 'Language',
          type: 'text'
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message', 'Observation added successfully');
      expect(response.body.child).toHaveProperty('id', '1');
    });

    it('should return 404 for observation logged to non-existent child ID', async () => {
      const token = jwt.sign(
        { id: 'AW-4521', name: 'Sunita Ji', mobile: '9876543210', block: 'Anganwadi Block 3' },
        process.env.JWT_SECRET
      );

      const response = await request(app)
        .post('/api/children/observation')
        .set('Authorization', `Bearer ${token}`)
        .send({
          childId: 'INVALID_CHILD_ID',
          note: 'Quiet child',
          category: 'Social',
          type: 'text'
        });

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('error', 'Child not found');
    });
  });

  describe('PUT /api/children/attendance', () => {
    it('should toggle and upsert attendance status when authenticated', async () => {
      const token = jwt.sign(
        { id: 'AW-4521', name: 'Sunita Ji', mobile: '9876543210', block: 'Anganwadi Block 3' },
        process.env.JWT_SECRET
      );

      const response = await request(app)
        .put('/api/children/attendance')
        .set('Authorization', `Bearer ${token}`)
        .send({
          childId: '1',
          attendance: 'absent'
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('child');
      expect(response.body.child).toHaveProperty('attendance', 'absent');
    });
  });
});
