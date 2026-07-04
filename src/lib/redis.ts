import { Redis } from '@upstash/redis';

const url = process.env.UPSTASH_REDIS_REST_URL;
const token = process.env.UPSTASH_REDIS_REST_TOKEN;

export const isRedisConfigured = Boolean(url && token);

const developmentRedis = {
  get: async () => null,
  set: async () => 'OK',
  del: async () => 1,
  incr: async () => 1,
  expire: async () => 1,
} as unknown as Redis;

export const redis = isRedisConfigured
  ? new Redis({
      url: url!,
      token: token!,
    })
  : developmentRedis;

export function requireRedis(): Redis {
  if (!isRedisConfigured) {
    throw new Error(
      'UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN are required'
    );
  }

  return redis;
}