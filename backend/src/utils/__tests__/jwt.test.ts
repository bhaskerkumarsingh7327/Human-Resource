import { generateAccessToken, verifyAccessToken } from '../jwt';

describe('JWT utils', () => {
  it('should generate and verify a valid access token', () => {
    const payload = { userId: 1, email: 'test@company.com', role: 'ADMIN' as const };
    const token = generateAccessToken(payload);
    const decoded = verifyAccessToken(token);

    expect(decoded.userId).toBe(payload.userId);
    expect(decoded.email).toBe(payload.email);
    expect(decoded.role).toBe(payload.role);
  });

  it('should throw when verifying an invalid token', () => {
    expect(() => verifyAccessToken('invalid.token.here')).toThrow();
  });
});