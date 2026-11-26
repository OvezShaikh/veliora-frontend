# Veliora Polymars website

React 18 + Vite + React Three Fiber. Roles: **user**, **admin**, **superadmin**.

    npm install
    npm run dev      # local
    npm run build    # outputs dist/

Deploy `dist/` on Vercel or Netlify (SPA rewrites included in `vercel.json` and `public/_redirects`).

## Demo logins
- superadmin@veliora.in / Super@123
- admin@veliora.in / Admin@123
- user@veliora.in / User@123

## Before real launch
Auth and data live in the browser (localStorage) in `src/store.jsx`. Passwords there are plain text and
anyone can edit them, so this is a working demo only. Swap the functions in `Provider` for calls to a real
backend (hashed passwords, server-checked roles) before taking real customer data.
Materials and copy come from the client's list; confirm the city/address and any extra details.
