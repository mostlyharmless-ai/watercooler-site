import CryptoJS from 'crypto-js';

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || '';

if (!ENCRYPTION_KEY && process.env.NODE_ENV === 'production') {
  throw new Error('ENCRYPTION_KEY environment variable is required in production');
}

/**
 * Encrypts a string using AES-256 encryption
 */
export function encrypt(text: string): string {
  if (!ENCRYPTION_KEY) {
    // In development, use a default key (not secure, but allows development)
    const devKey = 'dev-key-not-secure-change-in-production';
    return CryptoJS.AES.encrypt(text, devKey).toString();
  }
  return CryptoJS.AES.encrypt(text, ENCRYPTION_KEY).toString();
}

/**
 * Decrypts an encrypted string
 */
export function decrypt(encryptedText: string): string {
  if (!ENCRYPTION_KEY) {
    // In development, use a default key
    const devKey = 'dev-key-not-secure-change-in-production';
    const bytes = CryptoJS.AES.decrypt(encryptedText, devKey);
    return bytes.toString(CryptoJS.enc.Utf8);
  }
  const bytes = CryptoJS.AES.decrypt(encryptedText, ENCRYPTION_KEY);
  return bytes.toString(CryptoJS.enc.Utf8);
}

/**
 * Encrypts a GitHub token for storage
 */
export function encryptToken(token: string): string {
  return encrypt(token);
}

/**
 * Decrypts a stored GitHub token
 */
export function decryptToken(encryptedToken: string): string {
  return decrypt(encryptedToken);
}

