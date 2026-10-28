# FitNexa AI

FitNexa AI is a full-stack gym and fitness platform with two separate sign-in portals backed by one MongoDB Atlas user store:

- **Member Login**: personalized dashboard, workout plans and history, exercise library, AI fitness coach, nutrition and progress logs, memberships, attendance, reminders, and profile settings.
- **Admin Login**: member and trainer management, membership plans and enrollment, attendance and payment records, exercise library, workout templates, announcements, analytics, and gym settings.

Public registration always creates a member. Administrator accounts are provisioned from a trusted terminal; there is no public admin-registration flow or default admin password.

## Tech stack

| Layer | Tools |
| --- | --- |
| Frontend | React 19, Vite 8, Recharts, lucide-react |
| Backend | Node.js 20.19+, Express 5, JWT (`jsonwebtoken`), bcryptjs |
| Database | MongoDB Atlas via Prisma 6 |
| Tooling | oxlint, Swagger UI (`/api-docs`) |

## Project structure

```text
.
├── index.html                     # Vite entry document
├── vite.config.js                 # Dev proxy /api → :3001
├── prisma/
│   └── schema.prisma              # MongoDB document model
├── scripts/
│   └── provision-admin.js         # Interactive admin provisioning
├── server/
│   ├── index.js                   # Bootstrap: connect DB, seed catalog, listen
│   ├── app.js                     # Express app assembly, middleware, routes, errors
│   ├── db.js                      # Prisma client for MongoDB
│   ├── swagger.yaml               # OpenAPI description
│   ├── config/env.js              # Environment loading and JWT validation
│   ├── middleware/auth.js         # authRequired / adminOnly / memberOnly
│   ├── lib/                       # Pure helpers: catalog, recommendations,
│   │                              # validation, serializers, tokens, memberships
│   └── routes/                    # One router per domain:
│       ├── auth.js                #   /api/v1/auth
│       ├── profile.js             #   /api/v1/profile
│       ├── dashboard.js           #   /api/v1/dashboard
│       ├── exercises.js           #   /api/v1/exercises
│       ├── workouts.js            #   /api/v1/workouts
│       ├── progress.js            #   /api/v1/progress
│       ├── nutrition.js           #   /api/v1/nutrition
│       ├── ai.js                  #   /api/v1/ai
│       ├── gym.js                 #   /api/v1/gym (member)
│       ├── admin.js               #   /api/v1/gym/admin
│       └── reminders.js           #   /api/v1/reminders
├── src/
│   ├── App.jsx                    # State container + provider
│   ├── api/client.js              # fetch wrapper for /api/v1
│   ├── components/                # TopBar, HeroSection, AuthPanel, Workspace, Footer
│   ├── context/AppContext.jsx     # Shared app state
│   ├── constants/navigation.js    # Member navigation + admin sections
│   ├── pages/member/              # One component per member view
│   ├── pages/admin/               # AdminWorkspace + one component per section
│   ├── styles/                    # base.css, app.css
│   └── utils/profile.js           # Profile helpers
└── tests/
    └── api.smoke.mjs              # End-to-end API test suite
```

## Getting started

1. Install dependencies:

   ```sh
   npm install
   ```

2. Create your environment file from the template and fill in real values:

   ```sh
   cp .env.example .env
   ```

   Replace the placeholders in `DATABASE_URL` with the Atlas database username and its URL-encoded password; do not include surrounding angle brackets or commit `.env`. The example uses direct replica-set hosts to avoid SRV DNS resolver issues.

   | Variable | Required | Description |
   | --- | --- | --- |
   | `DATABASE_URL` | yes | MongoDB Atlas connection string |
   | `JWT_SECRET` | yes | Random secret, 32+ characters |
   | `PORT` | no | API port (default `3001`) |

3. Generate the Prisma client and sync the MongoDB collections:

   ```sh
   npm run db:generate
   npm run db:push
   ```

4. Provision an administrator interactively (password input is hidden):

   ```sh
   npm run admin:setup
   ```

5. (Optional) Add repeatable sample members and fitness activity:

   ```sh
   npm run db:seed-demo
   ```

   This creates three demo member accounts, sample profiles, workout plans and sessions, progress, attendance, memberships, payments, reminders, trainers, and a workout template. It prints a randomly generated shared demo-member password for that run; rerunning the command resets the demo member passwords. Admin accounts are not created by this command.

6. Start the API and frontend together:

   ```sh
   npm run dev
   ```

   - Frontend: http://localhost:4175 (Vite automatically selects the next free port if this port is occupied)
   - API: http://localhost:3001
   - Swagger docs: http://localhost:3001/api-docs

The API seeds the exercise, food, and membership-plan catalogs on startup when their collections are empty. MongoDB does not use Prisma SQL migrations; `db:push` syncs the Prisma model with the database.

## Scripts

| Script | Description |
| --- | --- |
| `npm run dev` | Run API and Vite dev server concurrently |
| `npm run dev:client` | Vite dev server only |
| `npm run dev:server` | API only |
| `npm run start` | Start the API (production mode) |
| `npm run build` | Production build to `dist/` |
| `npm run preview` | Preview the production build |
| `npm run lint` | Lint with oxlint |
| `npm run check` | Lint and build |
| `npm run test:api` | Run the API smoke test (requires a running API and database) |
| `npm run db:generate` | Generate the Prisma client |
| `npm run db:push` | Sync Prisma models with MongoDB |
| `npm run db:seed-demo` | Add or refresh repeatable demo records |
| `npm run admin:setup` | Provision an admin account interactively |

## Testing

Start the API first, then run:

```sh
npm run test:api
```

The suite covers registration and login rules, role-based access control, profile and workout flows, progress, nutrition, AI coach, attendance, memberships, reminders, and every admin endpoint. It creates throwaway accounts and data, then removes them at the end. Point it at another host with `API_BASE=http://host:port npm run test:api`.

## Notes

- Payment records are administrative records only: this project does not integrate a payment processor.
- Coaching responses are rule-based general fitness guidance, not medical advice.
- `.env` is git-ignored; never commit real credentials.
