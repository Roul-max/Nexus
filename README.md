# Nexus SaaS Platform

A production-grade AI-powered ERP, CRM, and Project Management platform.

## Architecture

* **Frontend**: Next.js 15 (App Router), React 19, Tailwind CSS, Framer Motion
* **Backend**: Next.js Server Components / API Routes
* **Database**: PostgreSQL via Drizzle ORM
* **Authentication**: Firebase Auth (Email, Google, GitHub)
* **AI Integration**: Gemini 3.5 Flash via @google/genai

## Key Features

1. **CRM**: Leads tracking, scoring, pipeline management
2. **Project Management**: Kanban boards, task assignments, tracking
3. **Analytics**: Real-time business reporting, conversion rates
4. **AI Assistant**: Context-aware chat powered by Gemini
5. **Billing**: Subscription management ready
6. **Team Management**: RBAC, user roles, security

## Getting Started

1. Set up a PostgreSQL database and copy connection string to `.env`
2. Run `npm install --legacy-peer-deps`
3. Run `npx drizzle-kit push` to migrate DB
4. Run `npm run dev`

## Deployment

Designed to be deployed as a standard Next.js application on Vercel or in a Docker container.

### Environment Variables Required

* `DATABASE_URL`: PostgreSQL connection string
* `GEMINI_API_KEY`: API key for Gemini AI features
* Firebase credentials (public/private depending on implementation)
