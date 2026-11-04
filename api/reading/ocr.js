import { getUser, parseCookies, json } from '../auth/_utils.js';

const MAX_IMAGE_BYTES = 700 * 1024;
const ALLOWED_MIME_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);
const MODEL = process.env.GEMINI_READING_MODEL || process.env.GEMINI_MODEL || 'gemini-2.5-flash';

export function validateImagePayload(payload) {
  const mimeType = typeof payload?.mimeType === 'string' ? payload.mimeType.toLowerCase() : '';
  const data = typeof payload?.data === 'string' ? payload.data : '';
  if (!ALLOWED_MIME_TYPES.has(mimeType)) return { error: 'Chỉ hỗ trợ ảnh JPG, PNG hoặc WEBP.' };
  if (!data || data.length > Math.ceil(MAX_IMAGE_BYTES * 4 / 3) + 8 || !/^[A-Za-z0-9+/]+={0,2}$/.test(data)) {
    return { error: 'Dữ liệu ảnh không hợp lệ hoặc vượt quá giới hạn 6 MB.' };
  }
  const bytes = Math.floor(data.length * 3 / 4) - (data.endsWith('==') ? 2 : data.endsWith('=') ? 1 : 0);
  if (!bytes || bytes > MAX_IMAGE_BYTES) return { error: 'Ảnh phải có dung lượng từ 1 byte đến 6 MB.' };
  return { mimeType, data, bytes };
}

function parseJsonResponse(raw) {
  const clean = String(raw || '').trim().replace(/^\s*```(?:json)?\s*/i, '').replace(/\s*```\s*$/, '');
  try { return JSON.parse(clean); } catch {
    const start = clean.indexOf('{');
    const end = clean.lastIndexOf('}');
    if (start >= 0 && end > start) return JSON.parse(clean.slice(start, end + 1));
    return null;
  }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return json(res, 405, { error: 'Method Not Allowed' });
  const user = await getUser(parseCookies(req).lina_access);
  if (!user) return json(res, 401, { error: 'Vui lòng đăng nhập để sử dụng Lina Reading.' });

  const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY;
  if (!apiKey) return json(res, 503, { error: 'Tính năng nhận diện ảnh chưa được cấu hình khóa AI ở phía máy chủ.' });

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
    const image = validateImagePayload(body);
    if (image.error) return json(res, 400, { error: image.error });

    const prompt = `Bạn là bộ OCR chuyên nhận diện tài liệu học tiếng Trung. Hãy chép lại CHÍNH XÁC những gì nhìn thấy trong ảnh.
Quy tắc bắt buộc:
- Ưu tiên chữ Hán giản thể/phồn thể đúng như ảnh; giữ nguyên thứ tự dòng, đoạn, dấu câu và tiêu đề.
- Không dịch, không tự thêm pinyin, không sửa văn phong, không viết tiếp phần bị khuất.
- Không đoán chữ mờ. Nếu không đọc chắc, ghi ký hiệu [không rõ] đúng tại vị trí đó.
- Bỏ qua chữ viết tay tiếng Việt/pinyin chú giải bên cạnh nếu nó không thuộc nội dung tiếng Trung chính; nhưng giữ pinyin nếu nó được in/ghi như một phần riêng rõ ràng của bài học.
- Trả về JSON duy nhất: {"text":"nội dung nhận diện","notes":["ghi chú ngắn về vùng khó đọc nếu có"]}. Không bọc markdown.`;

    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${encodeURIComponent(apiKey)}`;
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal: AbortSignal.timeout(30000),
      body: JSON.stringify({
        contents: [{ role: 'user', parts: [{ text: prompt }, { inlineData: { mimeType: image.mimeType, data: image.data } }] }],
        generationConfig: { responseMimeType: 'application/json', responseSchema: {
          type: 'OBJECT', properties: { text: { type: 'STRING' }, notes: { type: 'ARRAY', items: { type: 'STRING' } } },
          required: ['text', 'notes']
        }, temperature: 0.1, maxOutputTokens: 5000 }
      })
    });
    const result = await response.json().catch(() => ({}));
    if (!response.ok) {
      console.error('[LinaReading][GEMINI_ERROR]', response.status, result?.error?.status || 'provider_error');
      return json(res, 502, { error: 'AI chưa thể đọc ảnh lúc này. Vui lòng thử lại với ảnh rõ và sáng hơn.' });
    }
    const raw = result?.candidates?.[0]?.content?.parts?.map(part => part.text || '').join('').trim();
    const parsed = parseJsonResponse(raw);
    const text = typeof parsed?.text === 'string' ? parsed.text.trim().slice(0, 30000) : '';
    if (!text) return json(res, 502, { error: 'Không nhận diện được nội dung. Hãy thử ảnh rõ hơn hoặc nhập văn bản thủ công.' });
    return json(res, 200, { text, notes: Array.isArray(parsed.notes) ? parsed.notes.filter(x => typeof x === 'string').slice(0, 8) : [], model: MODEL });
  } catch (error) {
    if (error?.name === 'TimeoutError' || error?.name === 'AbortError') return json(res, 504, { error: 'Nhận diện ảnh mất quá nhiều thời gian. Vui lòng thử lại.' });
    if (error instanceof SyntaxError) return json(res, 400, { error: 'Dữ liệu gửi lên không hợp lệ.' });
    console.error('[LinaReading][OCR_ERROR]', error?.message || 'unknown_error');
    return json(res, 500, { error: 'Đã xảy ra lỗi khi nhận diện ảnh.' });
  }
}
