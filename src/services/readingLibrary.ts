import { accountStorageKey } from './accountStorage';

export interface ReadingDocument {
  id: string;
  title: string;
  text: string;
  sourceName?: string;
  createdAt: string;
  updatedAt: string;
}

const STORAGE_KEY = 'lina-reading-library-v1';
const MAX_DOCUMENTS = 40;
const MAX_TEXT_LENGTH = 30000;

function read(ownerId: string): ReadingDocument[] {
  try {
    const value = JSON.parse(localStorage.getItem(accountStorageKey(STORAGE_KEY, ownerId)) || '[]');
    if (!Array.isArray(value)) return [];
    return value.filter((item): item is ReadingDocument =>
      item && typeof item.id === 'string' && typeof item.title === 'string' &&
      typeof item.text === 'string' && typeof item.createdAt === 'string' &&
      typeof item.updatedAt === 'string'
    ).slice(0, MAX_DOCUMENTS);
  } catch { return []; }
}

export function listReadingDocuments(ownerId: string): ReadingDocument[] {
  return read(ownerId).sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

export function saveReadingDocument(ownerId: string, input: Pick<ReadingDocument, 'title' | 'text' | 'sourceName'>, id?: string): ReadingDocument {
  const documents = read(ownerId);
  const now = new Date().toISOString();
  const existing = id ? documents.find(item => item.id === id) : undefined;
  const document: ReadingDocument = {
    id: existing?.id || (typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : `reading-${Date.now()}`),
    title: input.title.trim().slice(0, 120) || 'Bài đọc chưa đặt tên',
    text: input.text.slice(0, MAX_TEXT_LENGTH),
    sourceName: input.sourceName?.slice(0, 160),
    createdAt: existing?.createdAt || now,
    updatedAt: now
  };
  const next = [document, ...documents.filter(item => item.id !== document.id)].slice(0, MAX_DOCUMENTS);
  localStorage.setItem(accountStorageKey(STORAGE_KEY, ownerId), JSON.stringify(next));
  return document;
}

export function deleteReadingDocument(ownerId: string, id: string): void {
  localStorage.setItem(accountStorageKey(STORAGE_KEY, ownerId), JSON.stringify(read(ownerId).filter(item => item.id !== id)));
}
