ALTER TABLE "users" ADD COLUMN "last_signed_in_at" timestamp;
--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "last_activity_at" timestamp;