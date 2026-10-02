export const AI_PROMPT_VERSION = '19.1.0';
export const AI_TASK_CONFIG = {
  conversation: { model: process.env.GEMINI_TUTOR_MODEL || 'gemini-3.8-flash', temperature: 0.5, maxOutputTokens: 1400, timeoutMs: 15000 },
  correction: { model: process.env.GEMINI_TUTOR_MODEL || 'gemini-3.8-flash', temperature: 0.3, maxOutputTokens: 1000, timeoutMs: 15000 },
  translation: { model: process.env.GEMINI_TUTOR_MODEL || 'gemini-3.8-flash', temperature: 0.2, maxOutputTokens: 700, timeoutMs: 12000 },
  lesson_generation: { model: process.env.GEMINI_TUTOR_MODEL || 'gemini-3.8-flash', temperature: 0.4, maxOutputTokens: 1600, timeoutMs: 18000 },
  roleplay: { model: process.env.GEMINI_TUTOR_MODEL || 'gemini-3.8-flash', temperature: 0.5, maxOutputTokens: 1200, timeoutMs: 15000 },
  vocabulary: { model: process.env.GEMINI_TUTOR_MODEL || 'gemini-3.8-flash', temperature: 0.2, maxOutputTokens: 900, timeoutMs: 12000 },
  grammar: { model: process.env.GEMINI_TUTOR_MODEL || 'gemini-3.8-flash', temperature: 0.2, maxOutputTokens: 900, timeoutMs: 12000 },
  summary: { model: process.env.GEMINI_TUTOR_MODEL || 'gemini-3.8-flash', temperature: 0.2, maxOutputTokens: 800, timeoutMs: 12000 },
  personalization: { model: process.env.GEMINI_TUTOR_MODEL || 'gemini-3.8-flash', temperature: 0.3, maxOutputTokens: 900, timeoutMs: 12000 },
} as const;
