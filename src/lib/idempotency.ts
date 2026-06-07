import { Redis } from "@upstash/redis";

type IdempotencyRecord = {
  processedAt: number;
  expiresAt: number;
};

let redisClient: Redis | null = null;

function getRedisClient(): Redis | null {
  if (redisClient) {
    return redisClient;
  }

  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!url || !token) {
    return null;
  }

  redisClient = new Redis({ url, token });
  return redisClient;
}

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

export async function checkAndMarkIdempotent(key: string, ttlMs: number): Promise<boolean> {
  const client = getRedisClient();

  if (client) {
    try {
      const redisKey = `idempotency:${key}`;
      const result = await client.set(redisKey, "processed", {
        nx: true,
        px: ttlMs,
      });
      return result === "OK";
    } catch (error) {
      console.error("Redis idempotency error, falling back to memory:", error);
    }
  }

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
