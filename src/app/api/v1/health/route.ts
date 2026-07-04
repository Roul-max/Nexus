import { NextResponse } from 'next/server';
import { db } from '@/db';
import { sql } from 'drizzle-orm';
import { redis } from '@/lib/redis';

export async function GET() {
  let dbStatus = 'down';
  let redisStatus = 'down';
  
  try {
    await db.execute(sql`SELECT 1`);
    dbStatus = 'up';
  } catch (error) {
    console.error('DB Health Check Failed:', error);
  }

  try {
    const res = await redis.set('health_check', 'ok', { ex: 5 });
    if (res === 'OK') {
      redisStatus = 'up';
    }
  } catch (error) {
    console.error('Redis Health Check Failed:', error);
  }

  const status = dbStatus === 'up' && redisStatus === 'up' ? 'pass' : 'fail';

  return NextResponse.json({
    status,
    timestamp: new Date().toISOString(),
    services: {
      database: dbStatus,
      redis: redisStatus,
    }
  }, { status: status === 'pass' ? 200 : 503 });
}
