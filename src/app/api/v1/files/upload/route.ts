import { NextResponse, NextRequest } from 'next/server';
import { generateUploadUrl } from '@/lib/aws';
import { db } from '@/db';
import { AuthError, requireAuth } from '@/lib/auth';
import { z } from 'zod';

const MAX_FILE_SIZE = 10 * 1024 * 1024;
const uploadSchema = z.object({
  fileName: z.string().trim().min(1).max(255),
  contentType: z.enum(['image/png', 'image/jpeg', 'application/pdf']),
  size: z.number().int().positive().max(MAX_FILE_SIZE),
  organizationId: z.string().uuid(),
});

function sanitizeFileName(fileName: string) {
  const baseName = fileName.replace(/\\/g, '/').split('/').pop() ?? '';
  const sanitized = baseName
    .normalize('NFKC')
    .replace(/[^a-zA-Z0-9._-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^\.+/, '')
    .slice(0, 200);
  if (!sanitized) throw new z.ZodError([{
    code: z.ZodIssueCode.custom,
    path: ['fileName'],
    message: 'Filename is invalid',
  }]);
  return sanitized;
}

export async function POST(req: NextRequest) {
  try {
    const decodedToken = await requireAuth(req);
    const firebaseUid = decodedToken.uid;
    const { fileName, contentType, size, organizationId: clientOrgId } =
      uploadSchema.parse(await req.json());
    const safeFileName = sanitizeFileName(fileName);

    // Find the user using Firebase UID
    const user = await db.query.users.findFirst({
      where: (u, { eq }) => eq(u.firebaseUid, firebaseUid)
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Verify organization membership
    const userOrgMembership =
      await db.query.organizationUsers.findFirst({
        where: (ou, { and, eq }) =>
          and(
            eq(ou.organizationId, clientOrgId),
            eq(ou.userId, user.id)
          )
      });

    if (!userOrgMembership) {
      return NextResponse.json(
        {
          error:
            'Forbidden: User does not belong to the specified organization.'
        },
        { status: 403 }
      );
    }

    const organizationId = userOrgMembership.organizationId;

    const key = `${organizationId}/${Date.now()}-${safeFileName}`;

    const uploadUrl = await generateUploadUrl(
      key,
      contentType,
      size,
    );

    return NextResponse.json({
      uploadUrl,
      key,
      fileName: safeFileName,
      contentType
    });
  } catch (error: unknown) {
    console.error('S3 Upload Error:', error);

    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid upload request', details: error.flatten() },
        { status: 400 },
      );
    }

    return NextResponse.json(
      {
        error: 'Internal Server Error'
      },
      { status: 500 }
    );
  }
}
