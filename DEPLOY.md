# Deploying Koumian Academy to Netlify

This walks you from a local project to a live `https://your-site.netlify.app`.
**Total time: ~30 minutes.** All services here have free tiers.

> Pre-reqs: a Google account (for OAuth + GitHub login), nothing else.

---

## Step 1 — Get a Postgres database (Neon, free)

1. Go to https://neon.tech and sign up (Google login is fastest).
2. Click **Create a project**. Use the defaults:
   - **Project name:** `koumian`
   - **Region:** pick the one closest to you
   - **Postgres version:** 16 (default)
3. After it spins up, you'll see a **Connection string** that looks like:
   ```
   postgresql://USER:PASSWORD@ep-xxxx.aws.neon.tech/neondb?sslmode=require
   ```
4. **Copy this string** — you'll paste it in two places.

---

## Step 2 — Set up the database locally

Back in PowerShell at the project folder:

1. Open `.env` and replace the `DATABASE_URL` line with your Neon string from
   Step 1. It should now look like:
   ```
   DATABASE_URL="postgresql://...@ep-xxxx.aws.neon.tech/neondb?sslmode=require"
   ```

2. Push the schema to Neon (creates all the tables):
   ```powershell
   npx prisma db push
   ```
   You should see: **"Your database is now in sync with your Prisma schema."**

3. Re-seed your admin in the new database:
   ```powershell
   npm run make-admin admin@koumian.local --username=admin --password=123456
   ```

4. Verify locally (still works the same):
   ```powershell
   npm run dev
   ```
   Open http://localhost:3000 — sign in with `admin` / `123456`. If it works,
   your local app is now backed by Neon. Stop the server when ready (Ctrl+C).

---

## Step 3 — Push the code to GitHub

1. Create a GitHub account if you don't have one: https://github.com/signup
2. **Install Git for Windows** (skip if already installed):
   https://git-scm.com/download/win — use all defaults.
3. Create a new empty repo on GitHub:
   - Go to https://github.com/new
   - **Repository name:** `koumian-academy`
   - **Visibility:** Private (recommended)
   - **Do NOT** check "Add a README", ".gitignore", or "license" — leave them blank
   - Click **Create repository**
4. Back in PowerShell, in your project folder, initialize and push:
   ```powershell
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/koumian-academy.git
   git push -u origin main
   ```
   Replace `YOUR_USERNAME` with your actual GitHub username.
   It'll prompt you to authenticate the first time — sign in via the browser.

---

## Step 4 — Deploy to Netlify

1. Go to https://app.netlify.com/signup and sign up (use GitHub login).
2. Click **Add new site → Import an existing project**.
3. Choose **GitHub** → authorize Netlify → pick `koumian-academy`.
4. Build settings (Netlify auto-detects most of these from `netlify.toml`):
   - **Branch to deploy:** `main`
   - **Build command:** (leave default — comes from `netlify.toml`)
   - **Publish directory:** (leave default — comes from `netlify.toml`)
5. Click **Show advanced → New variable**. Add these one by one:

   | Key | Value |
   |---|---|
   | `DATABASE_URL` | Your Neon string from Step 1 |
   | `AUTH_SECRET` | Generate a fresh one: in PowerShell run `npx auth secret` and copy the output |
   | `AUTH_TRUST_HOST` | `true` |
   | `GOOGLE_CLIENT_ID` | (paste later — see Step 5) |
   | `GOOGLE_CLIENT_SECRET` | (paste later — see Step 5) |

6. Click **Deploy site**. It'll build for ~2-3 minutes.
7. When it finishes, you'll get a URL like `https://random-name-1234.netlify.app`.
   Click **Site configuration → Change site name** to set something cleaner like
   `koumian-academy.netlify.app` (must be globally unique).

---

## Step 5 — Update Google OAuth for production

1. Go to https://console.cloud.google.com/apis/credentials
2. Click your existing OAuth 2.0 Client ID.
3. Under **Authorized JavaScript origins**, click **+ Add URI** and paste:
   ```
   https://your-site.netlify.app
   ```
   (use your actual Netlify URL)
4. Under **Authorized redirect URIs**, click **+ Add URI** and paste:
   ```
   https://your-site.netlify.app/api/auth/callback/google
   ```
5. Click **Save**.
6. Copy the **Client ID** and **Client Secret** values.
7. Back in Netlify → **Site configuration → Environment variables**:
   - Set `GOOGLE_CLIENT_ID` to the Client ID
   - Set `GOOGLE_CLIENT_SECRET` to the Client Secret
8. Trigger a redeploy: **Deploys → Trigger deploy → Deploy site**.

> If you haven't set up Google OAuth yet, you can skip this step entirely —
> the credentials sign-in (username + password) works without it. Google
> sign-in just won't work until you add the credentials.

---

## Step 6 — Test the live site

1. Open `https://your-site.netlify.app` — you should see the landing page.
2. Click **Sign in** → use `admin` / `123456` (the admin you seeded in Step 2).
3. You should land on the student dashboard with admin shortcut.
4. Click **Admin** → create a course → add lessons.
5. The data is in Neon now — visible on any device, persists forever.

---

## When you change code later

After making changes locally:

```powershell
git add .
git commit -m "describe your change"
git push
```

Netlify auto-redeploys whenever you push to `main`. Watch progress at
`https://app.netlify.com/sites/your-site/deploys`.

### When you change the database schema

If you edit `prisma/schema.prisma`, you have to push the schema change to Neon
manually (not done by Netlify build):

```powershell
npx prisma db push
```

Then commit + push the schema file like any other change.

---

## Troubleshooting

**"Build failed: Cannot find Prisma engine"**
→ Already handled by `netlify.toml` (`npx prisma generate` runs before build).
   If it still fails, check Netlify's build log for the actual error.

**"Auth.js error: Untrusted host"**
→ You forgot the `AUTH_TRUST_HOST=true` env var on Netlify. Add it and redeploy.

**Sign-in goes to a blank page or 500 error**
→ Check `AUTH_SECRET` is set on Netlify. Must be a long random string,
   minimum 32 chars. Generate fresh with `npx auth secret`.

**Google sign-in fails with "redirect_uri_mismatch"**
→ Your Netlify URL doesn't match the redirect URI in Google Console exactly.
   Must include `https://` and `/api/auth/callback/google` at the end.
   No trailing slash on the origin.

**Database tables are missing**
→ You skipped Step 2.2. Run `npx prisma db push` from your local PowerShell
   with `.env` pointing to Neon.

**Need a fresh admin password?**
→ Run locally (with `.env` pointing to Neon):
   ```powershell
   npm run make-admin admin@koumian.local --password=NEW_PASSWORD
   ```

---

## Cost forecast

All free tier limits, never charged unless you exceed them:

- **Neon free:** 0.5 GB storage, 1 project (~thousands of courses + users)
- **Netlify free:** 100 GB bandwidth/month, 300 build minutes/month
- **Custom domain (optional):** ~$10-15/year if you want a `.com`

For a small course site, you'll stay free indefinitely.
