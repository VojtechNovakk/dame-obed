type RateLimitState = {
  count: number;
  resetAt: number;
};

const globalForRateLimit = globalThis as unknown as {
  rateLimitStore?: Map<string, RateLimitState>;
};

const rateLimitStore = globalForRateLimit.rateLimitStore ?? new Map<string, RateLimitState>();

if (process.env.NODE_ENV !== "production") {
  globalForRateLimit.rateLimitStore = rateLimitStore;
}

const MAX_STORE_ENTRIES = 10_000;

function pruneExpired(now: number) {
  if (rateLimitStore.size < MAX_STORE_ENTRIES) {
    return;
  }

  for (const [key, value] of rateLimitStore.entries()) {
    if (value.resetAt <= now) {
      rateLimitStore.delete(key);
    }
  }
}

export function consumeRateLimit(key: string, limit: number, windowMs: number) {
  const now = Date.now();
  pruneExpired(now);

  const current = rateLimitStore.get(key);
  if (!current || current.resetAt <= now) {
    const resetAt = now + windowMs;
    rateLimitStore.set(key, { count: 1, resetAt });
    return {
      allowed: true,
      remaining: limit - 1,
      retryAfterMs: windowMs,
    };
  }

  if (current.count >= limit) {
    return {
      allowed: false,
      remaining: 0,
      retryAfterMs: Math.max(0, current.resetAt - now),
    };
  }

  current.count += 1;
  rateLimitStore.set(key, current);

  return {
    allowed: true,
    remaining: Math.max(0, limit - current.count),
    retryAfterMs: Math.max(0, current.resetAt - now),
  };
}

export function resetRateLimit(key: string) {
  rateLimitStore.delete(key);
}