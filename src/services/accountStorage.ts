/** Return a stable local-storage namespace for a learner or guest. */
export function accountStorageKey(baseKey: string, userId: string | null | undefined): string {
  const owner = typeof userId === 'string' && userId.trim() ? userId.trim() : 'guest';
  return `${baseKey}:${owner}`;
}
