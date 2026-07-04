# Architecture

## Overview
Nexus SaaS Platform is built using Next.js 15 (App Router), leveraging server components and React 19 for a high-performance web experience. 
The backend connects to PostgreSQL via Drizzle ORM and utilizes Redis (Upstash) for rate limiting and caching.

## Stack
- Frontend: Next.js 15, React 19, Tailwind CSS, Shadcn UI
- Backend: Next.js API Routes, Node.js
- Database: PostgreSQL (Drizzle ORM)
- Cache: Redis
- Storage: AWS S3
- Authentication: Firebase Auth + Custom API Keys
- Telemetry: OpenTelemetry
