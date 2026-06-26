# InvoiceOS AI

**The AI Business Operating System for Small Businesses**

InvoiceOS AI is a production-ready SaaS web application that enables small businesses to create invoices, manage customers, and automate bookkeeping.

## Tech Stack

- **Frontend:** Next.js 14 (App Router), React, TypeScript, Tailwind CSS, shadcn/ui, Framer Motion, React Hook Form, Zod.
- **Backend:** Supabase (PostgreSQL, Authentication, RLS).
- **Hosting:** Designed for Vercel and GitHub.

## Local Development Setup

1. **Clone the repository and install dependencies:**
   ```bash
   npm install
   ```

2. **Configure Environment Variables:**
   Copy the `.env.example` file to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```
   Fill in your Supabase project URL and anon key.

3. **Database Setup:**
   Run the SQL migrations located in `supabase/migrations/` in your Supabase project's SQL editor to set up the database schema and RLS policies.
   - `20240101000000_init.sql`
   - `20240101000001_core_modules.sql`

4. **Start the development server:**
   ```bash
   npm run dev
   ```
   Navigate to `http://localhost:3000`.

## Deployment Guide (Vercel)

This project is optimized for deployment on Vercel.

1. **Push to GitHub:**
   Commit your code and push it to a GitHub repository.
   ```bash
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/yourusername/invoice-os-ai.git
   git push -u origin main
   ```

2. **Deploy to Vercel:**
   - Log in to your Vercel dashboard.
   - Click **Add New** -> **Project**.
   - Import your GitHub repository.
   - In the **Environment Variables** section, add the following keys from your Supabase project:
     - `NEXT_PUBLIC_SUPABASE_URL`
     - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - Click **Deploy**.

Vercel will automatically build and deploy the Next.js application. Future commits to the `main` branch will trigger automatic deployments.
