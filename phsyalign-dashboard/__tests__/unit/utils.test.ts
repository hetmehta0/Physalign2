import { generateAccessCode, hashString, isValidAccessCode } from '../../lib/utils';

describe('Utility Functions', () => {
  describe('generateAccessCode', () => {
    it('should generate a code of the default length (8)', () => {
      const code = generateAccessCode();
      expect(code).toHaveLength(8);
    });

    it('should generate a code of a specified length', () => {
      const code = generateAccessCode(12);
      expect(code).toHaveLength(12);
    });

    it('should only contain valid characters', () => {
      const code = generateAccessCode(100);
      const validChars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789';
      for (const char of code) {
        expect(validChars).toContain(char);
      }
    });

    it('should generate unique codes', () => {
      const codes = new Set();
      for (let i = 0; i < 100; i++) {
        codes.add(generateAccessCode());
      }
      expect(codes.size).toBe(100);
    });
  });

  describe('hashString', () => {
    it('should return a 64-character hex string for SHA-256', () => {
      const hash = hashString('password123');
      expect(hash).toHaveLength(64);
      expect(hash).toMatch(/^[a-f0-9]+$/);
    });

    it('should produce the same hash for the same input', () => {
      const hash1 = hashString('test-string');
      const hash2 = hashString('test-string');
      expect(hash1).toBe(hash2);
    });

    it('should produce different hashes for different inputs', () => {
      const hash1 = hashString('string-1');
      const hash2 = hashString('string-2');
      expect(hash1).not.toBe(hash2);
    });
  });

  describe('isValidAccessCode', () => {
    it('should return true for a valid 8-character code', () => {
      expect(isValidAccessCode('ABC234XY')).toBe(true);
    });

    it('should return false for codes of wrong length', () => {
      expect(isValidAccessCode('ABC123X')).toBe(false);
      expect(isValidAccessCode('ABC123XYZ')).toBe(false);
    });

    it('should return false for codes containing ambiguous characters', () => {
      expect(isValidAccessCode('ABC123O0')).toBe(false); // Contains O and 0
      expect(isValidAccessCode('ABC123I1')).toBe(false); // Contains I and 1
      expect(isValidAccessCode('ABC123l1')).toBe(false); // Contains l and 1
    });

    it('should return false for codes containing special characters', () => {
      expect(isValidAccessCode('ABC123X!')).toBe(false);
      expect(isValidAccessCode('ABC 234X')).toBe(false);
    });
  });
});
