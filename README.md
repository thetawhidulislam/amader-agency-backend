# Amader Agency - Backend API

Express + TypeScript + Prisma (PostgreSQL). Auth via httpOnly JWT cookie, images on Cloudinary, lead emails via SMTP.

## Setup

```bash
npm install
cp .env.example .env        # fill DATABASE_URL, DIRECT_URL, JWT_SECRET, REVALIDATE_SECRET, SEED_ADMIN_PASSWORD
npx prisma migrate dev --name init
npm run seed                # admin user + 4 services from the brand prospectus + site settings
npm run dev                 # http://localhost:5000
```

Generate secrets:
`node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"`

Other scripts: `npm run typecheck`, `npm run build`, `npm start`, `npm run prisma:studio`.
Production deploy: `npm run build && npx prisma migrate deploy && npm start`.

## Token login mode

Set `ALLOW_TOKEN_LOGIN=true` only while the frontend and API are on different domains; keep `JWT_EXPIRES_DAYS` short (e.g. 2). The token is stored in the browser, so use a short expiry and do not load third-party scripts on `/admin`. Switch back to cookie mode (`ALLOW_TOKEN_LOGIN=false`) when a custom domain is available.

## Edit production content from local

Copy `.env.production.example` to `.env.production` and fill in its values. Then use:

```bash
npm run dev:prod
npm run migrate:prod
npm run studio:prod
```

Never run `prisma migrate dev` or `prisma migrate reset` against the production database. Use `npm run migrate:prod` to deploy migrations safely.

## Deploy on Vercel

Import the backend folder as a Vercel project. Vercel detects the Express app in `src/app.ts`; the local `npm run dev` and `npm start` commands use `src/local.ts` to connect Prisma and listen on the configured port.

Set these project environment variables:

- `DATABASE_URL`, `DIRECT_URL`
- `JWT_SECRET`, `JWT_EXPIRES_DAYS`
- `FRONTEND_URL`, `CORS_ORIGINS`
- `COOKIE_DOMAIN`, `COOKIE_SAMESITE`
- `REVALIDATE_SECRET`
- `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`
- `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`
- `MAIL_FROM`, `LEAD_NOTIFY_EMAIL`

The Vercel build command generates Prisma Client and applies production migrations. Uploaded images must be 4MB or smaller.

## Response format

Success: `{ "success": true, "data": ... }` (lists with pagination also return `meta`).
Error: `{ "success": false, "message": "...", "errors": [...] }`.

## Public endpoints (`/api/v1`)

| Method | Path | Notes |
|---|---|---|
| GET | `/services` | active services, ordered |
| GET | `/services/:slug` | service + up to 6 portfolio items |
| GET | `/portfolio?service=<slug>&featured=true&page=1&limit=12` | paginated |
| GET | `/portfolio/:slug` | single item |
| GET | `/testimonials` | only `isActive` ones |
| GET | `/team?home=true&limit=12` | active team members; `home=true` filters to members shown on home |
| GET | `/team/:slug` | active team member profile |
| GET | `/settings` | phone, email, whatsapp, address, hours, socials |
| POST | `/leads` | contact form. Rate limited (5/hour/IP), honeypot field `website` |

Lead body: `name, phone, message` (required), `email, serviceId, budget, source` (optional).

## Auth

| Method | Path |
|---|---|
| POST | `/auth/login` `{ email, password }` sets `aa_token` cookie |
| POST | `/auth/logout` |
| GET | `/auth/me` |
| PATCH | `/auth/password` `{ currentPassword, newPassword }` |

## Admin endpoints (`/api/v1/admin/*`, login required)

- `/services` GET, POST, `/:id` GET PATCH DELETE, `PATCH /reorder { items: [{ id, order }] }`
- `/portfolio` GET (`?serviceId=&search=&page=&limit=`), POST, `/:id` GET PATCH DELETE, `PATCH /reorder`
- `/leads` GET (`?status=&serviceId=&search=&page=`), `GET /stats`, `GET /:id`, `PATCH /:id/status { status }`, `DELETE /:id`
- `/testimonials` GET, POST, `PATCH /:id`, `DELETE /:id`
- `/team` GET, POST, `PATCH /reorder { items: [{ id, order }] }`, `GET /:id`, `PATCH /:id`, `DELETE /:id`
- `/settings` GET, `PUT`
- `/upload/image` POST multipart field `file` (max 4MB, optional `?folder=portfolio|team`) returns `{ url, publicId, width, height }`; `DELETE` body `{ publicId }`

## Frontend integration

**Axios (admin):** `axios.create({ baseURL: process.env.NEXT_PUBLIC_API_URL + "/api/v1", withCredentials: true })`

**Public pages (ISR):** fetch with tags so the backend can refresh them:

```ts
const res = await fetch(`${process.env.API_URL}/api/v1/services`, { next: { tags: ["services"] } });
```

**Revalidate webhook** `frontend/app/api/revalidate/route.ts` (the backend calls it after every admin change):

```ts
import { revalidateTag } from "next/cache";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  if (req.headers.get("x-revalidate-secret") !== process.env.REVALIDATE_SECRET) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }
  const { tags } = (await req.json()) as { tags?: string[] };
  for (const tag of tags ?? []) revalidateTag(tag, "max"); // Next 15 or older: revalidateTag(tag)
  return NextResponse.json({ revalidated: true });
}
```

Tags used: `services`, `portfolio`, `testimonials`, `team`, `settings`. Put the same `REVALIDATE_SECRET` in both `.env` files.

## Cookies and deployment

- Dev: frontend `localhost:3000`, API `localhost:5000` works with `COOKIE_SAMESITE=lax`.
- Production: use sibling subdomains (`amaderagency.com` + `api.amaderagency.com`) and set `COOKIE_DOMAIN=.amaderagency.com`, `COOKIE_SAMESITE=lax`. Then Next.js middleware can read the `aa_token` cookie to protect `/admin`.
- Different sites entirely: `COOKIE_SAMESITE=none` (forces `secure`, needs HTTPS).

## Notes

- Deleting a service that still has portfolio items is blocked (409). Deactivate it instead or move the items.
- Deleting a portfolio item does not delete its Cloudinary images; call `DELETE /admin/upload/image` for each `publicId` if you want to clean up.
- Testimonials are `isActive: false` by default, so nothing unverified goes live by accident.
