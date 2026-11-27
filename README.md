# Veliora Polymars

One Vercel project: the website (React + Vite) and the API (Express, in `server/`, served from `api/index.js`).
Data lives in a free Neon Postgres database. Tables, starting products and the first super admin are created
automatically the first time the site starts.

## Deploy (about 5 minutes)
1. neon.com: create a project, click Connect, copy the connection string.
2. Vercel > your project > Settings > Environment Variables, add:
   - `DATABASE_URL`  (the Neon string)
   - `JWT_SECRET`    (run `node -p "crypto.randomBytes(48).toString('hex')"`)
   - `SEED_SUPERADMIN_EMAIL` and `SEED_SUPERADMIN_PASSWORD` (8+ characters)
   - `SEED_SUPERADMIN_NAME` (optional)
3. Push this code to GitHub (`git add -A`, `git commit -m "Full site"`, `git push`). Vercel deploys it.
   If you add or change variables later, Redeploy from the Deployments tab.
4. Open the site, log in with the super admin email and password, set rates and photos in Dashboard > Products.
5. Optional: delete the two SEED_SUPERADMIN variables afterwards; they only matter before the first super admin exists.

## Run locally
    npm install
    cp .env.example .env     # fill DATABASE_URL, JWT_SECRET, SEED_*  (use a second free Neon project for development)
    npm run dev:api          # terminal 1: API on :4000
    npm run dev              # terminal 2: website on :5173

## Two computers
Code moves with Git. `.env` does not: create it on each computer. Both can use the same Neon database if you
paste the same DATABASE_URL.
