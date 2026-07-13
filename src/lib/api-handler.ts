import { NextRequest, NextResponse } from "next/server";
import { ZodError } from 'zod';
import { AuthError } from './auth';

export function apiHandler(
  handler: (req: NextRequest, params?: any) => Promise<NextResponse>
) {
  return async (req: NextRequest, params?: any) => {
    try {
      return await handler(req, params);
    } catch (error: any) {
      console.error('[API_ERROR]', { path: req.nextUrl.pathname, message: error.message });

      if (error instanceof ZodError) { // Correctly check for ZodError
        return NextResponse.json(
          {
            error: 'Validation failed',
            details: error.flatten().fieldErrors,
          },
          { status: 400 }
        );
      }

      if (error instanceof AuthError) {
        return NextResponse.json({ error: error.message }, { status: error.status });
      }

      return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
  };
}
