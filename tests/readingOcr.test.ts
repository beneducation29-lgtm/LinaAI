import assert from 'node:assert/strict';
import { validateReadingImage } from '../api/lesson/generate.js';

const valid = Buffer.from('test-image').toString('base64');
assert.equal(validateReadingImage({ mimeType: 'image/jpeg', data: valid }).error, undefined);
assert.match(validateReadingImage({ mimeType: 'image/svg+xml', data: valid }).error || '', /JPG, PNG hoặc WEBP/);
assert.match(validateReadingImage({ mimeType: 'image/png', data: 'not base64!' }).error || '', /không hợp lệ/);
assert.match(validateReadingImage({ mimeType: 'image/png', data: Buffer.alloc(700 * 1024 + 1).toString('base64') }).error || '', /700 KB/);
console.log('Lina Reading OCR validation tests passed.');
