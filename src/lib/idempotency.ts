type IdempotencyRecord = {
  processedAt: number;
  expiresAt: number;
};

const globalForIdempotency = globalThis as typeof globalThis & {
  __impjiegIdempotencyStore?: Map<string, IdempotencyRecord>;
};

function getIdempotencyStore() {
  if (!globalForIdempotency.__impjiegIdempotencyStore) {
    globalForIdempotency.__impjiegIdempotencyStore = new Map();
  }
  return globalForIdempotency.__impjiegIdempotencyStore;
}

export function resetIdempotencyState() {
  getIdempotencyStore().clear();
}

export function checkAndMarkIdempotent(key: string, ttlMs: number): boolean {
  const store = getIdempotencyStore();
  const now = Date.now();
  const existing = store.get(key);

  if (existing) {
    if (now < existing.expiresAt) {
      return false;
    }
    store.delete(key);
  }

  store.set(key, {
    processedAt: now,
    expiresAt: now + ttlMs,
  });
  return true;
}

export function cleanupExpiredIdempotencyKeys(): number {
  const store = getIdempotencyStore();
  const now = Date.now();
  let cleaned = 0;
  for (const [key, record] of store.entries()) {
    if (now >= record.expiresAt) {
      store.delete(key);
      cleaned++;
    }
  }
  return cleaned;
}