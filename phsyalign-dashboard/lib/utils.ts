import crypto from 'crypto';

/**
 * Generates a secure random access code for exercise programs
 * Uses cryptographically secure random bytes and excludes ambiguous characters
 * 
 * @param length - Length of the code to generate (default: 8)
 * @returns A secure random alphanumeric code
 */
export function generateAccessCode(length: number = 8): string {
  // Characters excluding ambiguous ones (O, 0, I, l, 1)
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789';
  
  // Generate cryptographically secure random bytes
  const randomBytes = crypto.randomBytes(length);
  
  let code = '';
  for (let i = 0; i < length; i++) {
    // Use random byte to pick character from our safe character set
    code += chars[randomBytes[i] % chars.length];
  }
  
  return code;
}

/**
 * Hashes a password or sensitive string using SHA-256
 * 
 * @param input - String to hash
 * @returns 32-byte (256-bit) hash in hexadecimal format
 */
export function hashString(input: string): string {
  return crypto.createHash('sha256').update(input).digest('hex');
}

/**
 * Validates if a string matches expected format for access codes
 * 
 * @param code - Code to validate
 * @returns true if code is valid format
 */
export function isValidAccessCode(code: string): boolean {
  // Must be 8 characters, alphanumeric, no ambiguous characters
  const validPattern = /^[ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789]{8}$/;
  return validPattern.test(code);
}
