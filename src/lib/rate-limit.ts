import { Ratelimit } from '@upstash/ratelimit';
import { isRedisConfigured, redis } from '@/lib/redis';

export type RateLimitResult = Awaited<ReturnType<Ratelimit['limit']>>;

const limiters = new Map<string, Ratelimit>();

function getLimiter(namespace: string, requests: number, window: `${number} ${'s' | 'm' | 'h' | 'd'}`) {
  const key = `${namespace}:${requests}:${window}`;
  let limiter = limiters.get(key);
  if (!limiter) {
    limiter = new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(requests, window),
      prefix: `ratelimit:${namespace}`,
      analytics: true,
    });
    limiters.set(key, limiter);
  }
  return limiter;
}

export async function checkRateLimit(
  namespace: string,
  identifier: string,
  requests = 60,
  window: `${number} ${'s' | 'm' | 'h' | 'd'}` = '1 m',
): Promise<RateLimitResult> {
  if (!isRedisConfigured && process.env.NODE_ENV !== 'production') {
    return {
      success: true,
      limit: requests,
      remaining: requests,
      reset: Date.now() + 60_000,
      pending: Promise.resolve(),
      reason: undefined,
      deniedValue: undefined,
    } as RateLimitResult;
  }
  return getLimiter(namespace, requests, window).limit(identifier);
}
