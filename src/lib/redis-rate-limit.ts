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
  const luaScript = `
    local current = redis.call("GET", KEYS[1])
    if current == false then
      redis.call("SET", KEYS[1], 1, "EX", ARGV[1])
      return {1, ARGV[2] - 1}
    end
    if tonumber(current) >= tonumber(ARGV[2]) then
      local ttl = redis.call("TTL", KEYS[1])
      return {0, 0, ttl}
    end
    local incr = redis.call("INCR", KEYS[1])
    if tonumber(incr) == 1 then
      redis.call("EXPIRE", KEYS[1], ARGV[1])
    end
    local ttl = redis.call("TTL", KEYS[1])
    return {1, ARGV[2] - incr, ttl}
  `;

  try {
    const result = await client.eval(
      luaScript,
      1,
      key,
      windowSec.toString(),
      limit.toString()
    ) as [number, number, number];

    const [success, remaining, ttl] = result;
    return {
      success: success === 1,
      remaining: Math.max(0, remaining),
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