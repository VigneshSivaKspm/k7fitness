# K7 Fitness Studio & Gym — Website + Gym Management System

Two React apps sharing one Firebase backend:

```text
k7_fitness/
├── website/                 Public gym website (React + Vite + Tailwind, Firestore Lite)
├── admin/                   Private gym management system (React + Vite + Tailwind, Firebase Auth/Firestore/Storage)
├── scripts/                 Owner-run setup scripts (create admins, optional starter content). Never deployed.
├── tests/                   Security-rules + end-to-end tests (run against the Firebase emulators only)
├── firestore.rules          Firestore security rules
├── storage.rules            Storage security rules
├── firestore.indexes.json   Composite indexes
└── firebase.json            Hosting (2 sites), rules, indexes, emulators
```

There is no trainee app, trainee login or public admin sign-up, by design.

---

## Requirements

- Node.js 20+ (built and tested with Node 24)
- A Firebase project (free Spark plan works for small gyms; Storage requires the Blaze plan on new projects)
- Firebase CLI: `npm i -g firebase-tools`
- Java 21+, only if you use the local emulators

---

## 1. Firebase setup

1. Create a project at <https://console.firebase.google.com>.
2. **Authentication** → Sign-in method → enable **Email/Password**.
3. **Firestore Database** → create (production mode, region close to you, e.g. `asia-south1`).
4. **Storage** → get started.
5. **Project settings → Your apps** → add a **Web app** and copy its config.
6. Deploy rules and indexes:

   ```bash
   firebase login
   firebase use --add            # choose your project
   firebase deploy --only firestore:rules,firestore:indexes,storage
   ```

   Indexes take a few minutes to build. Until then, some filtered lists show *"A database index is still being created"*.

## 2. Environment variables

Both apps read Firebase config from env files; credentials are never hard-coded.

```bash
cp website/.env.example website/.env
cp admin/.env.example   admin/.env
```

| Variable | Used by | Purpose |
|---|---|---|
| `VITE_FIREBASE_API_KEY` … `VITE_FIREBASE_APP_ID` | both | Firebase web config (same project for both apps) |
| `VITE_WEBSITE_URL` | admin | "View website" / preview links |
| `VITE_USE_EMULATORS` | both | `true` = use local emulators (dev only) |
| `VITE_DEV_AUTH_BYPASS`, `VITE_DEV_ADMIN_EMAIL`, `VITE_DEV_ADMIN_PASSWORD` | admin | **Temporary** dev-only auto sign-in (see below) |

`.env`, `.env.local` and service-account keys are git-ignored. The Firebase *web* config is not secret (security comes from the rules), but keep it out of git anyway.

## 3. Create the first admin (secure)

Admins exist only when an `admins/{uid}` document exists with `active: true`. A Firebase Auth account alone grants nothing, and there is no sign-up button.

1. Firebase Console → Project settings → **Service accounts** → *Generate new private key*.
   Save it as `scripts/service-account.json` (git-ignored, never share it).
2. Run:

   ```bash
   cd scripts
   npm install
   node create-admin.mjs --email owner@yourgym.in --name "Owner Name" --role owner
   ```

   It prints a temporary password. Sign in, or use **Forgot password?** on the login page to set your own.
3. Optional starter content (typical plans + hero text; never overwrites existing data, creates no fake members):

   ```bash
   node seed-starter-content.mjs
   ```

   Optional website content (About text, stats, facilities, 4 programs, trainer cards, testimonials,
   an offer and opening hours) so every section is filled from day one; only fills empty sections:

   ```bash
   node seed-website-content.mjs
   ```

   Before going live, replace the trainer cards and testimonials with your real coaches and genuine
   member reviews, and check the statistics and offer.

Add more staff the same way with `--role admin` (roles: `owner`, `admin`, `manager`, `trainer`, `receptionist`). Owners can disable staff from **Settings → Account & admins**.

**Manual alternative:** create the user in Authentication → Users, copy its UID, then create the document `admins/<UID>` in Firestore with `{ email, name, role: "owner", active: true }`.

## 4. Run locally

```bash
cd website && npm install && npm run dev     # http://localhost:5173
cd admin   && npm install && npm run dev     # http://localhost:5174
```

### Local development with emulators (no real project needed)

```bash
firebase emulators:start --project demo-k7 --import ./.emulator-data --export-on-exit ./.emulator-data
# in another terminal
cd scripts
FIRESTORE_EMULATOR_HOST=127.0.0.1:8080 FIREBASE_AUTH_EMULATOR_HOST=127.0.0.1:9099 \
  node create-admin.mjs --email dev@k7.local --name "Dev Owner" --role owner --password dev-password-123 --project demo-k7
FIRESTORE_EMULATOR_HOST=127.0.0.1:8080 node seed-starter-content.mjs --project demo-k7
```

Use `.env.local` in each app with `VITE_FIREBASE_PROJECT_ID=demo-k7`, any non-empty API key, and `VITE_USE_EMULATORS=true`. Emulator UI: <http://127.0.0.1:4000>.
On low-memory machines, set `JAVA_TOOL_OPTIONS=-Xmx512m` before starting the emulators.

### Temporary login bypass (development only)

With `VITE_DEV_AUTH_BYPASS=true` in `admin/.env.local`, `npm run dev` signs in the dev admin automatically, so no credentials need to be typed. On the Auth emulator the account is created if missing; its `admins/{uid}` document must exist (step 3).

- It only works under `vite dev`; production builds strip it (`import.meta.env.DEV`).
- Security rules are unchanged, so data access still requires a real admin session.
- Remove it when no longer needed: set `VITE_DEV_AUTH_BYPASS=false` or delete the three `VITE_DEV_*` lines.

## 5. Push to GitHub

```bash
git init
git add .
git commit -m "K7 Fitness website + admin"
git branch -M main
git remote add origin https://github.com/<you>/k7-fitness.git
git push -u origin main
```

`.gitignore` keeps out `node_modules`, builds, every `.env*` file except `.env.example`, service-account keys, emulator data and logs. Keep the GitHub repository **private**.

## 6. Deploy on Vercel (recommended)

The repo holds two apps, so create **two Vercel projects from the same GitHub repo**:

| Vercel project | Root Directory | Suggested domain |
|---|---|---|
| `k7-website` | `website` | `k7fitness.in` |
| `k7-admin` | `admin` | `admin.k7fitness.in` |

For each project:

1. Vercel → **Add New → Project** → import the GitHub repo.
2. **Root Directory**: `website` (or `admin`). Framework is detected as **Vite**; build settings come from each app's `vercel.json` (`npm ci`, `npm run build`, output `dist`, SPA rewrites, caching and security headers).
3. **Environment Variables** (Production + Preview), copied from your Firebase web app config:

   | Name | website | admin |
   |---|---|---|
   | `VITE_FIREBASE_API_KEY` | ✔ | ✔ |
   | `VITE_FIREBASE_AUTH_DOMAIN` | ✔ | ✔ |
   | `VITE_FIREBASE_PROJECT_ID` | ✔ | ✔ |
   | `VITE_FIREBASE_STORAGE_BUCKET` | ✔ | ✔ |
   | `VITE_FIREBASE_MESSAGING_SENDER_ID` | ✔ | ✔ |
   | `VITE_FIREBASE_APP_ID` | ✔ | ✔ |
   | `VITE_WEBSITE_URL` (e.g. `https://k7fitness.in`) | | ✔ |

   Do **not** add `VITE_USE_EMULATORS` or any `VITE_DEV_*` variables on Vercel. (The dev login bypass is compiled out of production builds anyway.)
4. Deploy. Every push to `main` redeploys both projects; pull requests get preview URLs.
5. **Firebase → Authentication → Settings → Authorized domains**: add your admin domain(s) (e.g. `admin.k7fitness.in` and `k7-admin.vercel.app`), otherwise password-reset links and sign-in won't work there.
6. Replace `k7fitness.example.com` in `website/public/robots.txt` and `website/public/sitemap.xml` with your real domain.

Firestore/Storage rules and indexes are still deployed with the Firebase CLI (step 1). Vercel only hosts the two frontends.

## 7. Alternative: Firebase Hosting (two sites)

```bash
firebase hosting:sites:create k7-website     # once
firebase hosting:sites:create k7-admin       # once
firebase target:apply hosting website k7-website
firebase target:apply hosting admin   k7-admin

(cd website && npm run build) && (cd admin && npm run build)
firebase deploy --only hosting
```

Point your domain at the website site (e.g. `k7fitness.in`) and use a subdomain for the admin (e.g. `admin.k7fitness.in`). Update `website/public/robots.txt` and `sitemap.xml` with your real domain. The admin sends `X-Robots-Tag: noindex` and is installable as a PWA ("Add to Home screen").

---

## Architecture

### Data model (Firestore)

| Collection | Purpose | Key fields |
|---|---|---|
| `admins/{uid}` | Staff allow-list + role | `name, email, role, active` |
| `trainees` | Members | `memberId` (K7-0001), `fullName, phone, …`, `status` (active/inactive), current membership snapshot (`currentPlanId, currentPlanName, membershipStart, membershipExpiry`), derived money fields (`totalFee, totalPaid, pendingAmount, paymentStatus, hasDues, feeDueDate`), `searchTokens`, assigned plan refs |
| `memberships` | Every membership period (history is never overwritten) | `traineeId, planId, planName, startDate, expiryDate` (inclusive), `fee, paidAmount, status, type` (new/renewal) |
| `payments` | Immutable payment transactions | `receiptNo` (RCPT-000001), `traineeId, membershipId, amount, paymentDate, method, reference, status` (valid/void), `receivedBy` |
| `membershipPlans` | **One** collection for CRM + website | `name, duration, durationUnit, price, features, active, showOnWebsite, recommended, displayOrder` |
| `workoutTemplates` / `dietTemplates` | Reusable templates | days → exercises / meals → foods |
| `workoutAssignments` / `dietAssignments` | Per-trainee snapshot of a template | customising edits the snapshot only, never the template |
| `enquiries` | Website leads | ID = phone + date (duplicate guard), `status`, `internalNotes` |
| `websiteSettings/{hero,about,contact}` | Website singletons; `contact` also holds gym name/logo (single source) |
| `programs, trainers, gallery, testimonials, offers` | Website CMS collections | `active, displayOrder` |
| `settings/general` | Private config | currency, member ID prefix, alert days, fee due days, WhatsApp templates, receipt footer |
| `counters/{trainees,receipts}` | Sequential IDs (transactional) | `value` |
| `activityLogs` | Append-only audit trail | `adminUid, adminName, action, recordType, recordId, createdAt` |

### Money consistency

`payments` and `memberships` are the source of truth. Every money operation runs in a single Firestore **transaction** that writes the payment, updates the membership's `paidAmount`, and recalculates the trainee's derived totals together. These are: add member with first payment, record payment, renew, adjust fee, cancel membership, void payment. Overpayment, negative amounts and fees below the amount already paid are rejected in both the UI and the rules. Payments are never deleted; mistakes are **voided**, which keeps the record and reverses its effect.

Statuses are derived at read time, so they never go stale:

- **Membership:** Active / Expiring soon (configurable, default 7 days) / Expired / Inactive.
- **Payment:** Paid / Partial / Pending / Overdue (unpaid after *fee due days* from membership start).

### Performance

- Cursor pagination everywhere (`startAfter`), no full-collection reads (CSV export is an explicit action).
- Dashboard and report numbers use server-side `count()`/`sum()` aggregations.
- Member search uses prefix tokens (`array-contains`) on name / phone / member ID, so it's case-insensitive and needs no extra service.
- Images are resized and converted to WebP in the browser before upload (typically 4–8 MB → 150–400 KB).
- The website uses Firestore Lite with one-shot reads; the admin is route-split and caches Firestore offline.

### Security model

- **Public:** reads only website settings, active programs/trainers/gallery/testimonials/offers, and plans with `active && showOnWebsite`. Can create enquiries (strict field validation, create-only). Cannot read members, payments, plans hidden from the website, enquiries or settings, or write anything else.
- **Staff:** active `admins/{uid}`. Full CRM access. Payments can't be deleted or re-priced; activity logs are append-only; staff can't change their own role.
- **Owner:** manages other admins. `hasRole([...])` in the rules makes future per-role restrictions straightforward.
- **Storage:** `public/**` world-readable, staff-writable (JPG/PNG/WebP < 5 MB). `private/**` (member photos) is staff only.

### Indexes

`firestore.indexes.json` covers every filtered/sorted query (trainee filters × sorts, renewals, overdue fees, payment history/search, per-trainee history, public website queries). Deploy with `firebase deploy --only firestore:indexes`. If Firestore ever reports a missing index, the error message includes a one-click creation link.

---

## Testing

```bash
# 1) Emulators (Java 21+)
firebase emulators:start --only auth,firestore,storage --project demo-k7

# 2) Security rules (40 tests: public vs staff vs disabled admin, enquiries, payments, storage)
cd tests && npm install && npm run test:rules

# 3) End-to-end: the 10 required scenarios through the real UI
#    (admin dev server with VITE_DEV_AUTH_BYPASS=true, website dev server)
ADMIN_URL=http://localhost:5174 SITE_URL=http://localhost:5173 node e2e.mjs

# 4) Visual QA: screenshots + horizontal-overflow check at 1366 / 768 / 390 / 360 px
ADMIN_URL=http://localhost:5174 SITE_URL=http://localhost:5173 SHOTS=./shots node visual.mjs
```

The e2e run covers: add member on Monthly ₹1,500 → pay ₹1,000 (Partial, ₹500 pending) → pay ₹500 (Paid, ₹0) → receipt → workout template + assign + per-member customisation (template unchanged) → diet template + assign → near-expiry member appears in Renewals → renew (history kept) → plan price change shows on the website → gallery upload shows on the website → public enquiry reaches the admin (same-day duplicate blocked by rules). It restores the plan price and removes its test image afterwards; the test member and templates are left in place.

## Branding

- Logo: replace `website/public/brand/k7-mark.svg` and `admin/public/brand/k7-mark.svg` (and the favicons) with the official artwork, or simply upload the logo in **Admin → Website → Contact information** (or **Settings**). The uploaded logo is used across the website, admin, receipts and printed charts.
- Colours: `@theme` tokens at the top of `website/src/styles/index.css` and `admin/src/styles/index.css`.
- PWA icons: `admin/public/brand/icon-192.png` / `icon-512.png` (regenerate with `node tests/make-png.mjs`).
