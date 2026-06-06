import { Redis } from "@upstash/redis";

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

export async function enforceRateLimitRedis({
  key,
  limit,
  windowMs,
  now = Date.now(),
}: {
  key: string;
  limit: number;
  windowMs: number;
  now?: number;
}): Promise<{ success: boolean; remaining: number; resetAt: number; limit: number }> {
  const client = getRedisClient();

  if (!client) {
    return enforceRateLimitMemory({ key, limit, windowMs, now });
  }

  const windowSec = Math.ceil(windowMs / 1000);

  try {
    const current = await client.get<string>(key);

    if (!current) {
      await client.set(key, 1, { ex: windowSec });
      return { success: true, remaining: limit - 1, resetAt: now + windowSec * 1000, limit };
    }

    const count = parseInt(current, 10);

    if (count >= limit) {
      const ttl = await client.ttl(key);
      return { success: false, remaining: 0, resetAt: now + ttl * 1000, limit };
    }

    const newCount = await client.incr(key);
    if (newCount === 1) {
      await client.expire(key, windowSec);
    }
    const ttl = await client.ttl(key);

    return {
      success: true,
      remaining: Math.max(0, limit - newCount),
      resetAt: now + ttl * 1000,
      limit,
    };
  } catch (error) {
    console.error("Redis rate limit error, falling back to memory:", error);
    return enforceRateLimitMemory({ key, limit, windowMs, now });
  }
}

type RateLimitBucket = {
  count: number;
  resetAt: number;
};

const globalForRateLimit = globalThis as typeof globalThis & {
  __impjiegRateLimitStore?: Map<string, RateLimitBucket>;
};

function getRateLimitStore() {
  if (!globalForRateLimit.__impjiegRateLimitStore) {
    globalForRateLimit.__impjiegRateLimitStore = new Map();
  }
  return globalForRateLimit.__impjiegRateLimitStore;
}

function enforceRateLimitMemory({
  key,
  limit,
  windowMs,
  now = Date.now(),
}: {
  key: string;
  limit: number;
  windowMs: number;
  now?: number;
}) {
  const store = getRateLimitStore();
  const bucket = store.get(key);

  if (!bucket || now >= bucket.resetAt) {
    const newBucket = { count: 1, resetAt: now + windowMs };
    store.set(key, newBucket);
    return { success: true, remaining: limit - 1, resetAt: newBucket.resetAt, limit };
  }

  if (bucket.count >= limit) {
    return { success: false, remaining: 0, resetAt: bucket.resetAt, limit };
  }

  bucket.count += 1;
  store.set(key, bucket);
  return { success: true, remaining: limit - bucket.count, resetAt: bucket.resetAt, limit };
}

export function resetRateLimitState() {
  getRateLimitStore().clear();
}