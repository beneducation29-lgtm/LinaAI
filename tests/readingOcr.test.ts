import assert from 'node:assert/strict';
import { validateImagePayload } from '../api/reading/ocr.js';

const valid = Buffer.from('test-image').toString('base64');
assert.equal(validateImagePayload({ mimeType: 'image/jpeg', data: valid }).error, undefined);
assert.match(validateImagePayload({ mimeType: 'image/svg+xml', data: valid }).error || '', /JPG, PNG hoặc WEBP/);
assert.match(validateImagePayload({ mimeType: 'image/png', data: 'not base64!' }).error || '', /không hợp lệ/);
assert.match(validateImagePayload({ mimeType: 'image/png', data: Buffer.alloc(6 * 1024 * 1024 + 1).toString('base64') }).error || '', /6 MB/);
console.log('Lina Reading OCR validation tests passed.');
