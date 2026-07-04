import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { AuthError } from '@/lib/auth';

export function apiHandler(handler: Function) {
  return async (...args: any[]) => {
    try {
      return await handler(...args);
    } catch (error: any) {
      console.error(error);

      if (error instanceof ZodError) {
        return NextResponse.json({ 
          error: "Validation failed", 
          details: error.flatten().fieldErrors 
        }, { status: 400 });
      }

      if (error instanceof AuthError) {
        return NextResponse.json({ error: error.message }, { status: error.status });
      }

      // Handle specific DB errors, unauth, etc. here

      return NextResponse.json({ 
        error: "Internal server error" 
      }, { status: 500 });
    }
  };
}
