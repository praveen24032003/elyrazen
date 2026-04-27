# Elyra Zen

Futuristic home automation website with:
- all-brand product catalog and category filters
- live floor interaction demo
- case studies and testimonials style content
- conversion funnels (book demo, site visit, lead form)
- launch-ready consultation flow without payment gateway integration (V1)
- SEO-ready metadata and deployment assets

## Tech Stack

- React + Vite + TypeScript
- Express middleware server with local JSON APIs
- Tailwind CSS + Motion animations

## Run Locally

Prerequisites: Node.js 20+

1. Install dependencies:
   npm install
2. Start development server:
   npm run dev
3. Verify type safety:
   npm run lint

Default local URL:
http://localhost:3001

## Environment Variables

- PORT (optional): overrides server port
- HMR_PORT (optional): overrides Vite websocket port for local development; default 24678
- SUPABASE_URL (optional): Supabase project URL used by backend API routes
- SUPABASE_SERVICE_ROLE_KEY (optional): backend service role key for secure server-side database access
- ADMIN_EMAIL (optional): allowed admin Google email for /api/admin/leads (default: elyrazen.in@gmail.com)
- VITE_SUPABASE_URL (optional): Supabase URL for browser auth client
- VITE_SUPABASE_ANON_KEY (optional): Supabase anon/publishable key for browser auth client
- LEAD_WEBHOOK_URL (optional): forwards each validated lead payload to your CRM/email automation webhook
- LEAD_RATE_LIMIT_MS (optional): throttles lead submissions per IP; default is 60000 ms

## Supabase Setup

1. Create a Supabase project.
2. In Supabase SQL Editor, run [supabase/schema.sql](supabase/schema.sql).
3. Copy project values into [.env](.env):
   - SUPABASE_URL from Project Settings -> API -> Project URL
   - SUPABASE_SERVICE_ROLE_KEY from Project Settings -> API -> service_role key
   - VITE_SUPABASE_URL same as SUPABASE_URL
   - VITE_SUPABASE_ANON_KEY from Project Settings -> API -> anon/publishable key
4. Start server and seed products:
   - npm run dev
   - POST /api/seed

After this, GET /api/health should report Connected (Supabase).

## Future Google Sign-In Readiness

- Supabase Auth supports Google provider directly from Authentication -> Providers.
- The schema already includes user_profiles with row-level security policies for authenticated users.
- Backend uses service role key server-side only, which is compatible with future auth + authorization rollout.

## Google Auth Setup Checklist

1. Get backend key (server only):
   - Supabase Dashboard -> Project Settings -> API -> service_role key
   - Put it in [.env](.env) as SUPABASE_SERVICE_ROLE_KEY
   - Never expose this key in client code.
2. Set browser auth env values in [.env](.env):
   - VITE_SUPABASE_URL = your project URL
   - VITE_SUPABASE_ANON_KEY = anon/publishable key
3. Configure Google provider in Supabase:
   - Supabase Dashboard -> Authentication -> Providers -> Google -> Enable
4. Create OAuth credentials in Google Cloud Console:
   - Create Web Application OAuth client
   - Authorized redirect URI:
     - https://<your-project-ref>.supabase.co/auth/v1/callback
5. Add app URLs in Supabase:
   - Authentication -> URL Configuration -> Site URL: your app URL (local: http://localhost:3001)
   - Add Redirect URLs:
     - http://localhost:3001
6. Verify round-trip locally:
   - Run npm run dev
   - Click Sign In with Google in navbar
   - Complete consent and return to app
   - Navbar should show signed-in email
   - Optional API check: call GET /api/auth/session with Bearer access token

## Build and Preview

1. Build client bundle:
   npm run build
2. Start production server locally:
   npm run start
2. Preview build:
   npm run preview

## Railway Deployment

Recommended deployment target for this project: Railway.

Why it fits this repo well:
- The app is a combined Express + Vite deployment, not a static frontend only.
- Backend API routes use the Supabase service role key and need a server runtime.
- Railway can run the app as a single web service with very little extra setup.

Files already prepared for Railway:
- [railway.json](railway.json)
- [scripts/start-production.mjs](scripts/start-production.mjs)

### First Successful Deploy Checklist

1. Create a new Railway project from this repo.
2. Add these required environment variables in Railway:
   - PORT: leave unset if Railway injects it automatically
   - SUPABASE_URL
   - SUPABASE_SERVICE_ROLE_KEY
   - VITE_SUPABASE_URL
   - VITE_SUPABASE_ANON_KEY
   - ADMIN_EMAIL
3. Add these optional environment variables if needed:
   - LEAD_WEBHOOK_URL
   - LEAD_RATE_LIMIT_MS
4. Set your Supabase Auth URL configuration:
   - Site URL: your Railway production domain
   - Redirect URLs: your Railway production domain and any custom domain
5. After deploy completes, verify:
   - GET /api/health returns ok and Connected (Supabase)
   - Google sign-in returns to the live domain successfully
   - GET /api/products loads product data
   - lead submissions reach Supabase
   - admin login works only for ADMIN_EMAIL

### Railway Build/Start Commands

- Build: npm ci && npm run build
- Start: npm run start

## Local Dev Troubleshooting

If npm run dev exits with code 1 and you see EADDRINUSE:

- Cause: another Node process is already listening on your configured app port and Vite HMR port.
- In this workspace, the observed failure was port 3001 plus HMR port 24678 already being used by an existing Node process.

Fix options:

1. Stop the existing Node process that is already using the ports.
2. Change PORT in [.env](.env) to another open port, for example 3002.
3. If the websocket port is also occupied, set HMR_PORT in [.env](.env) to another open port, for example 24679.

PowerShell commands that help:

```powershell
Get-NetTCPConnection -LocalPort 3001,24678 -State Listen | Select-Object LocalPort, OwningProcess
Get-Process -Id <PID>
Stop-Process -Id <PID>
```

## 3D Model Optimization Pipeline

The live-floor 3D house model has a lightweight build pipeline:

1. Generate model:
   npm run model:generate
2. Optimize and emit compressed artifacts:
   npm run model:optimize
3. Run both:
   npm run model:build

Generated assets in public/models:
- smart-house.gltf (minified JSON)
- smart-house.bin (externalized binary buffer)
- smart-house.gltf.gz and smart-house.gltf.br
- smart-house.bin.gz and smart-house.bin.br

## Custom 3D Model Wiring Guide

If you build the house model manually (Blender/3ds Max/SketchUp), follow these names so the website controls work without extra rewiring:

Required clickable room mesh names:
- LivingRoom
- Hall
- Kitchen
- DiningArea
- Staircase
- Bathroom
- MasterBedroom
- ParkingArea

Required lighting mesh names:
- ParkingLamp (required for parking light glow)
- BedroomLampShade (optional, for bedroom lamp glow)

### Export + File Placement

1. Export as glTF (`.gltf`) or GLB (`.glb`).
2. Place the file in `public/models/`.
3. Default expected filename is `smart-house.gltf`.

### If Your Filename Is Different

Update the model path in [src/components/sections/LiveFloorExperience.tsx](src/components/sections/LiveFloorExperience.tsx):
- Change both occurrences of `/models/smart-house.gltf`:
   - inside `useGLTF('/models/smart-house.gltf')`
   - inside `useGLTF.preload('/models/smart-house.gltf')`

### Quick Functional Checklist

- Clicking each room mesh toggles its light state.
- Voice commands work for: kitchen, bedroom, hall, bathroom, dining, staircase, parking.
- `ParkingLamp` glows when parking area light is ON.
- Optional: `BedroomLampShade` glows when bedroom light is ON.

## API Endpoints

- GET /api/health
- GET /api/products
- POST /api/seed
- GET /api/case-studies
- POST /api/leads
- GET /api/metrics/conversions?days=14 (daily lead trend + source split)
- GET /api/admin/leads?query=... (requires Supabase bearer token + ADMIN_EMAIL match)
- POST /api/admin/audit (requires Supabase bearer token + ADMIN_EMAIL match)
- GET /api/admin/audit?limit=100 (requires Supabase bearer token + ADMIN_EMAIL match)
- GET /api/auth/session (requires Authorization: Bearer <access_token>)

## GA4 Event Map (V1)

Lead and conversion events pushed from frontend:

- lead_submit_success
   - params: source, service/items_count, city
- lead_submit_failed
   - params: source, service/items_count
- lead_submit_blocked
   - params: source, reason (honeypot | too_fast)
- product_consultation_item_added
   - params: mode, category, brand

Use these names as-is in GA4 custom events for clean reporting.

## SEO and Deployment Notes

- Robots and sitemap are configured in public assets.
- index.html includes Open Graph, Twitter tags, canonical, and LocalBusiness JSON-LD.
- Replace placeholder domain values (elyra-zen.example.com) with your production domain before launch.
