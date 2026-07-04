import { eq } from 'drizzle-orm';
import { db } from '@/db';
import { users } from '@/db/schema';

/**
 * Updates the last activity timestamp for a given user.
 * This should be called on authenticated API requests to track user presence.
 */
export async function updateUserActivity(userId: string): Promise<void> {
  await db.update(users).set({ lastActivityAt: new Date() }).where(eq(users.id, userId));
}