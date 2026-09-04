import request from 'supertest';
import app from '../src/server';
import { hashPassword, comparePassword } from '../src/utils/password';
import { signJwt, verifyJwt } from '../src/utils/jwt';
import prisma from '../src/services/prisma';

// Mock Prisma for unit/integration testing without live network calls
jest.mock('../src/services/prisma', () => ({
  __esModule: true,
  default: {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
    auditLog: {
      create: jest.fn().mockResolvedValue({}),
    },
  },
}));

describe('API & Security Integration Tests', () => {
  describe('Health Endpoint', () => {
    it('GET /api/health should return 200 and healthy status', async () => {
      const res = await request(app).get('/api/health');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toBe('Clinic Queue API is running');
    });
  });

  describe('Password & JWT Utilities', () => {
    it('should properly hash and compare passwords', async () => {
      const rawPassword = 'SecurePassword123!';
      const hash = await hashPassword(rawPassword);
      expect(hash).not.toBe(rawPassword);
      const isMatch = await comparePassword(rawPassword, hash);
      expect(isMatch).toBe(true);
      const wrongMatch = await comparePassword('WrongPassword', hash);
      expect(wrongMatch).toBe(false);
    });

    it('should sign and verify valid JWT tokens', () => {
      const payload = {
        id: 'user-uuid-123',
        email: 'doctor@clinic.gov.za',
        role: 'STAFF' as const,
        name: 'Thabo',
        surname: 'Mokoena',
      };
      const token = signJwt(payload);
      expect(token).toBeDefined();

      const decoded = verifyJwt(token);
      expect(decoded).not.toBeNull();
      expect(decoded?.email).toBe('doctor@clinic.gov.za');
      expect(decoded?.role).toBe('STAFF');
    });
  });

  describe('Validation & Authorization Guards', () => {
    it('should reject registration with invalid email', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'John',
          surname: 'Doe',
          email: 'not-an-email',
          password: 'Pass123456!',
        });
      expect(res.status).toBe(422);
      expect(res.body.success).toBe(false);
    });

    it('should reject registration with password shorter than 6 characters', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'John',
          surname: 'Doe',
          email: 'john@example.com',
          password: '123',
        });
      expect(res.status).toBe(422);
      expect(res.body.success).toBe(false);
    });

    it('should block unauthenticated access to admin staff endpoint', async () => {
      const res = await request(app).get('/api/admin/staff');
      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('should block non-admin tokens from accessing admin endpoints', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValueOnce({
        id: 'patient-uuid',
        email: 'patient@example.com',
        role: 'PATIENT',
        name: 'Jane',
        surname: 'Doe',
        isActive: true,
      });

      const patientToken = signJwt({
        id: 'patient-uuid',
        email: 'patient@example.com',
        role: 'PATIENT',
        name: 'Jane',
        surname: 'Doe',
      });

      const res = await request(app)
        .get('/api/admin/staff')
        .set('Authorization', `Bearer ${patientToken}`);

      expect(res.status).toBe(403);
      expect(res.body.message).toContain('Access denied');
    });
  });
});
