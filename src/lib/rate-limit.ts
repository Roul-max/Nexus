import { Ratelimit } from '@upstash/ratelimit';
import { redis } from './redis';
import { NextRequest } from 'next/server';

// Rate limit to 10 requests per 10 seconds per IP address.
export const ratelimit = new Ratelimit({
  redis: redis,
  limiter: Ratelimit.slidingWindow(10, '10 s'),
  analytics: true,
  prefix: '@upstash/ratelimit',
});

// Rate limit AI chat requests to 20 per minute per user ID.
export const aiChatRatelimit = new Ratelimit({
  redis: redis,
  limiter: Ratelimit.slidingWindow(20, '1 m'),
  analytics: true,
  prefix: 'aic_ratelimit',
});

export async function checkRateLimit(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for') ?? '127.0.0.1';
  return await ratelimit.limit(ip);
}

export async function checkAiChatRateLimit(identifier: string) {
  return await aiChatRatelimit.limit(identifier);
}