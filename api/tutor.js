export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });
  const body = req.body || {};
  const message = typeof body.message === 'string' ? body.message.trim() : '';
  if (!message) return res.status(400).json({ error: 'Message string is required' });
  res.setHeader('Content-Type', 'text/event-stream; charset=utf-8');
  res.setHeader('Cache-Control', 'no-cache, no-transform');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders?.();
  const response = {
    chinese: '你好！我们先从简单的中文对话开始吧。',
    pinyin: 'Nǐ hǎo! Wǒmen xiān cóng jiǎndān de Zhōngwén duìhuà kāishǐ ba.',
    vietnamese: 'Xin chào! Chúng ta bắt đầu bằng một đoạn hội thoại tiếng Trung đơn giản nhé.',
    responseType: 'conversation',
    emotion: 'encouraging',
    correction: null,
    vocabulary: [],
    grammar: [],
    progressiveHints: {},
    suggestedReplies: [{ hanzi: '你好！', pinyin: 'Nǐ hǎo!', vietnamese: 'Xin chào!' }],
    memoryUpdate: null
  };
  res.write('data: ' + JSON.stringify({ type: 'response', response }) + '\n\n');
  res.write('data: ' + JSON.stringify({ type: 'done' }) + '\n\n');
  res.end();
}