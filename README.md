This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

### Admin (Blog CMS)

The admin panel at `/admin` uses cookie-based auth and requires these environment variables:

- `ADMIN_USERNAME`
- `ADMIN_PASSWORD`
- `SESSION_SECRET`

Create a `.env.local` file (you can start from `.env.example`) and set those values before using the admin panel.

### Blog Post Storage

Posts created/edited in the admin panel are persisted to `data/posts.json` on the server filesystem.

Note: Some serverless platforms have a read-only or ephemeral filesystem, in which case posts may not persist across deploys/restarts.

## Deploy (Vercel + Cloudflare)

This project is a Next.js App Router app (includes API routes), so the easiest production deploy is Vercel.

### 1) Deploy from GitHub

1. Go to Vercel and create a new Project.
2. Import the GitHub repo.
3. Build settings:
	- Framework: Next.js (auto-detected)
	- Build command: `npm run build`
	- Output: default

### 2) Set required environment variables

In Vercel Project → Settings → Environment Variables, set:

- `ADMIN_USERNAME`
- `ADMIN_PASSWORD`
- `SESSION_SECRET`

Then redeploy.

### 3) Connect your domain (Cloudflare DNS)

1. In Vercel Project → Settings → Domains, add `meetingcost.team` (and optionally `www.meetingcost.team`).
2. Vercel will show the exact DNS records required.
3. In Cloudflare DNS, create exactly those records (type/name/value) and wait for verification.

Tip: Prefer copying the records from Vercel instead of using hard-coded values, since they can differ by setup.

### Note about blog persistence on serverless

If you deploy on Vercel (serverless), writing `data/posts.json` may not persist reliably across deploys/restarts.
For a production blog CMS, use a real database/storage (or deploy to a VPS where the filesystem is persistent).

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
