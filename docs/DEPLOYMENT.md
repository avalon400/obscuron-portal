# CompetenceGate — Cloudflare Deployment Guide

## Overview

The system consists of two parts:

| Part | Technology | What it does |
|------|-----------|--------------|
| **Worker** (`worker/`) | Cloudflare Workers | API — handles all data logic, talks to KV |
| **Frontend** (`frontend/`) | Cloudflare Pages | Serves the HTML to users |

All persistent data lives in **Cloudflare KV** (key-value store).

---

## Prerequisites

1. A **Cloudflare account** — https://dash.cloudflare.com (free tier is sufficient)
2. A **domain** pointed to Cloudflare (or use the free `*.workers.dev` subdomain)
3. **Node.js 18+** installed locally — https://nodejs.org
4. **Wrangler CLI** — Cloudflare's deployment tool

---

## Step 1 — Install Wrangler

```bash
npm install -g wrangler
wrangler login
# Opens your browser to authenticate with Cloudflare
```

---

## Step 2 — Create the KV Namespace

```bash
cd worker
npm install

# Create the KV namespace
wrangler kv:namespace create CG_KV

# You will see output like:
# { binding = "CG_KV", id = "abc123def456..." }
#
# Copy that id value.
```

Open `worker/wrangler.toml` and replace `REPLACE_WITH_YOUR_KV_NAMESPACE_ID` with the id you just copied.

```toml
[[kv_namespaces]]
binding  = "CG_KV"
id       = "abc123def456..."   # ← paste here
```

---

## Step 3 — Set the Admin Password

The admin password is stored as a **Cloudflare secret** (never in code or config files).

```bash
wrangler secret put ADMIN_PASSWORD
# Type your chosen password when prompted
```

---

## Step 4 — Deploy the Worker

```bash
cd worker
wrangler deploy
```

After deployment, Wrangler will print your Worker URL, e.g.:

```
https://competencegate.your-account.workers.dev
```

**Copy this URL** — you need it in the next step.

---

## Step 5 — Configure the Frontend

Open `frontend/index.html` and find this line near the top of the `<script>` block:

```javascript
const API = 'https://competencegate.YOUR-SUBDOMAIN.workers.dev';
```

Replace `YOUR-SUBDOMAIN` with the actual subdomain from step 4.

Also open `frontend/_redirects` and update the Worker URL there too:

```
to = "https://competencegate.YOUR-ACCOUNT.workers.dev/api/:splat"
```

---

## Step 6 — Deploy the Frontend to Cloudflare Pages

### Option A — Cloudflare Dashboard (easiest)

1. Go to https://dash.cloudflare.com → **Workers & Pages** → **Create application** → **Pages**
2. Choose **"Upload assets"** (direct upload, no Git required)
3. Upload the contents of the `frontend/` folder
4. Set the project name, e.g. `competencegate`
5. Click **Deploy**

Your site will be live at: `https://competencegate.pages.dev`

### Option B — Wrangler CLI

```bash
cd frontend
wrangler pages deploy . --project-name=competencegate
```

---

## Step 7 — Custom Domain (optional)

1. In the Cloudflare Dashboard, go to your Pages project → **Custom domains**
2. Add your domain, e.g. `kompetenciakapu.hu`
3. Cloudflare handles DNS and HTTPS automatically

For the Worker API, go to the Worker → **Triggers** → **Add Custom Domain**, e.g. `api.kompetenciakapu.hu`
Then update the `API` constant in `index.html` to point to your custom domain.

---

## Step 8 — CORS Configuration (if using a custom domain)

If your frontend is on `kompetenciakapu.hu` and your Worker API is on `api.kompetenciakapu.hu`, update the CORS header in `worker/src/utils.js`:

```javascript
const CORS_HEADERS = {
  'Access-Control-Allow-Origin': 'https://kompetenciakapu.hu',  // ← your domain
  ...
};
```

Then redeploy the Worker: `wrangler deploy`

---

## Local Development

To run everything locally before deploying:

```bash
cd worker
wrangler dev
# Worker runs on http://localhost:8787
```

In `frontend/index.html`, temporarily set:
```javascript
const API = 'http://localhost:8787';
```

Then open `frontend/index.html` directly in a browser (or use a simple local server like `npx serve frontend`).

---

## KV Data Structure Reference

| KV Key | Value | Description |
|--------|-------|-------------|
| `exam:{CODE}` | Exam object (JSON) | Full exam definition |
| `exams:list` | `["CODE1","CODE2",…]` | Index of all exam codes |
| `task:{id}` | Task object (JSON) | Full task with correct answers |
| `tasks:list` | `["id1","id2",…]` | Index of all task IDs |
| `examinee:{CODE}:{ID}` | `"1"` | Registration record |
| `examinees:{CODE}` | `["EX-001","EX-002",…]` | Examinees per exam |
| `result:{CODE}:{ID}` | Result object (JSON) | Submitted result |
| `results:list` | `["CODE:ID",…]` | Index of all results |

---

## Security Notes

- The admin password is checked server-side on every admin API call via the `X-Admin-Password` header.
- Correct answers are **never sent to the client** — the `/api/exam` endpoint strips them before responding.
- Results are stored with `released: false` and only returned to examinees after the admin calls `/api/admin/results/publish`.
- KV is append-friendly; consider adding a cleanup endpoint if you need to delete old exams.

---

## Cloudflare Free Tier Limits

| Resource | Free Limit | Notes |
|----------|-----------|-------|
| Worker requests | 100,000 / day | ~1 request per API call |
| KV reads | 100,000 / day | Each page load = ~2–5 reads |
| KV writes | 1,000 / day | Each submission = ~3–5 writes |
| Pages requests | Unlimited | Static HTML |

For a typical school examination session with hundreds of students, the free tier is more than sufficient.
