/**
 * Unit Tests: Authentication Logic
 * Tests cho các logic xác thực - không cần DB
 */

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

describe('Authentication Logic Unit Tests', () => {
    beforeEach(() => {
        process.env.JWT_SECRET = 'test-jwt-secret-key';
    });

    describe('UC1.6: Password Hashing', () => {
        test('Password được hash bằng bcrypt', async () => {
            const plainPassword = 'password123';
            const hashedPassword = await bcrypt.hash(plainPassword, 10);

            expect(hashedPassword).not.toBe(plainPassword);
            expect(hashedPassword).toMatch(/^\$2[ayb]\$.{56}$/);
        });

        test('Bcrypt compare trả về true với password đúng', async () => {
            const plainPassword = 'password123';
            const hashedPassword = await bcrypt.hash(plainPassword, 10);

            const isMatch = await bcrypt.compare(plainPassword, hashedPassword);
            expect(isMatch).toBe(true);
        });

        test('Bcrypt compare trả về false với password sai', async () => {
            const plainPassword = 'password123';
            const hashedPassword = await bcrypt.hash(plainPassword, 10);

            const isMatch = await bcrypt.compare('wrongpassword', hashedPassword);
            expect(isMatch).toBe(false);
        });
    });

    describe('UC1.10-UC1.13: JWT Token', () => {
        test('UC1.10: Token hết hạn sau 24h', () => {
            const token = jwt.sign(
                { userId: 'user-123', email: 'test@example.com' },
                process.env.JWT_SECRET,
                { expiresIn: '24h' }
            );

            const decoded = jwt.decode(token);
            const expiresIn = decoded.exp - decoded.iat;

            expect(expiresIn).toBe(24 * 60 * 60);
        });

        test('UC1.11: Xác thực token hợp lệ', () => {
            const payload = { userId: 'user-123', email: 'test@example.com', role: 'user' };
            const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '24h' });

            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            expect(decoded.userId).toBe('user-123');
            expect(decoded.email).toBe('test@example.com');
            expect(decoded.role).toBe('user');
        });

        test('UC1.12: Từ chối token không hợp lệ', () => {
            const invalidToken = 'invalid.jwt.token';

            expect(() => {
                jwt.verify(invalidToken, process.env.JWT_SECRET);
            }).toThrow();
        });

        test('UC1.13: Từ chối token với secret sai', () => {
            const token = jwt.sign({ userId: 'user-123' }, 'wrong-secret', { expiresIn: '24h' });

            expect(() => {
                jwt.verify(token, process.env.JWT_SECRET);
            }).toThrow();
        });

        test('Token chứa đầy đủ thông tin user', () => {
            const payload = {
                userId: 'user-123',
                email: 'test@example.com',
                role: 'admin'
            };
            const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '24h' });
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            expect(decoded).toMatchObject(payload);
        });

        test('Token expired bị từ chối', () => {
            const token = jwt.sign(
                { userId: 'user-123' },
                process.env.JWT_SECRET,
                { expiresIn: '-1h' } // Already expired
            );

            expect(() => {
                jwt.verify(token, process.env.JWT_SECRET);
            }).toThrow('jwt expired');
        });
    });

    describe('Email Validation', () => {
        const isValidEmail = (email) => {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            return emailRegex.test(email);
        };

        test('Email hợp lệ', () => {
            expect(isValidEmail('test@example.com')).toBe(true);
            expect(isValidEmail('user.name@domain.co')).toBe(true);
            expect(isValidEmail('user+tag@example.org')).toBe(true);
        });

        test('Email không hợp lệ', () => {
            expect(isValidEmail('invalid')).toBe(false);
            expect(isValidEmail('invalid@')).toBe(false);
            expect(isValidEmail('@domain.com')).toBe(false);
            expect(isValidEmail('no spaces@domain.com')).toBe(false);
        });
    });

    describe('Password Validation', () => {
        const isValidPassword = (password) => {
            return password != null && password.length >= 8;
        };

        test('Password hợp lệ (>= 8 ký tự)', () => {
            expect(isValidPassword('password123')).toBe(true);
            expect(isValidPassword('12345678')).toBe(true);
            expect(isValidPassword('abcdefgh')).toBe(true);
        });

        test('Password không hợp lệ (< 8 ký tự)', () => {
            expect(isValidPassword('1234567')).toBe(false);
            expect(isValidPassword('abc')).toBe(false);
            expect(isValidPassword('')).toBe(false);
            expect(isValidPassword(null)).toBe(false);
        });
    });
});
