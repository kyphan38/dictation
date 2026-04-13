#!/usr/bin/env node
/**
 * Print SHA-256 (hex) of UTF-8 username and password for NEXT_PUBLIC_AUTH_*_HASH.
 * Usage: node scripts/generate-auth-hashes.js <username> <password>
 */
import { createHash } from 'crypto';

const [,, u, p] = process.argv;
if (u == null || p == null) {
  console.error('Usage: node scripts/generate-auth-hashes.js <username> <password>');
  process.exit(1);
}

function sha256Hex(s) {
  return createHash('sha256').update(s, 'utf8').digest('hex');
}

const uh = sha256Hex(String(u).trim());
const ph = sha256Hex(String(p).trim());
console.log('NEXT_PUBLIC_AUTH_USERNAME_HASH=' + uh);
console.log('NEXT_PUBLIC_AUTH_PASSWORD_HASH=' + ph);
