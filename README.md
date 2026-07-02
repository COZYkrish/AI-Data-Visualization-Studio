# AI Data Visualization Studio

An enterprise-ready SaaS foundation for AI-assisted data analysis, interactive dashboard visualization, and statistical modeling.

---

## 1. Project Architecture

This project is organized as a unified monorepo powered by **pnpm workspaces** and **Turborepo** to maximize compilation speeds, pipeline parallelization, and build caching.

```
AI-Data-Visualization-Studio/
├── apps/
│   ├── frontend/             # React 19 + TypeScript + Vite + Tailwind (Feature-First)
│   └── backend/              # FastAPI + SQLAlchemy + Alembic (Controller-Service-Repo)
├── packages/                 # Shared monorepo packages
│   ├── ui/                   # Reusable shadcn/ui components (Lucide icons, Toast context)
│   ├── config/               # Common Tailwind themes, postcss settings
│   ├── types/                # Shared TypeScript models and API types
│   ├── eslint-config/        # Standardized ESLint configs
│   └── tsconfig/             # Shared TypeScript configuration files
├── .github/
│   └── workflows/            # GitHub Actions CI workflows
│       ├── frontend-ci.yml
│       └── backend-ci.yml
├── .husky/                   # Local pre-commit Git hooks
├── pnpm-workspace.yaml       # pnpm workspace definition
├── turbo.json                # Turborepo task settings
├── package.json              # Root package metadata
└── README.md                 # Developer Onboarding Guide
```

---

## 2. Technology Stack

### Frontend

- **React 19 & TypeScript**: Component layer utilizing modern hooks.
- **Vite**: Ultra-fast hot-reloading dev server.
- **Tailwind CSS**: HSL CSS variable tokens supporting light, dark, and system themes.
- **shadcn/ui placeholders**: Core components (Button, Card, Inputs, Table, Toast system) packaged in `@studio/ui`.
- **Zustand**: Reactive lightweight client-side state management.
- **Axios**: Configured client with request interceptors to inject JWT headers and handle error envelopes.
- **TanStack Query**: REST cache queries and mutations.

### Backend

- **FastAPI**: Clean API mapping with route controllers.
- **SQLAlchemy (v2.0)**: Object relational database mapping with connection pooling.
- **Alembic**: Database versioning migrations.
- **Pydantic (v2)**: Strict type-checking, payload validation, and response serialization.
- **Uvicorn**: Lightweight ASGI application server.

---

## 3. Quick Start Guide

### Local Native Development

#### 1. Root & Packages Setup

1. Install monorepo dependencies and link packages:
   ```bash
   pnpm install
   ```
2. Build shared packages:
   ```bash
   pnpm run build
   ```

#### 2. Frontend Development

1. Start the Vite server:
   ```bash
   pnpm --filter @studio/frontend dev
   ```
2. The UI is available at `http://localhost:3000`.

#### 3. Backend Development

1. Navigate to backend:
   `cd apps/backend`
2. Create and activate a Python virtual environment:
   ```bash
   python -m venv .venv
   # Windows:
   .venv\Scripts\activate
   # macOS/Linux:
   source .venv/bin/activate
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Run the Uvicorn application:
   ```bash
   python main.py
   ```
5. The API is available at `http://localhost:8000` (docs at `http://localhost:8000/docs`).

---

## 4. Deployment Model

### Frontend (Vercel)

The React application is fully optimized for static web hosting on **Vercel**:

- Set the root directory of the Vercel project to `apps/frontend`.
- Build command: `pnpm run build`.
- Output directory: `dist`.
- Set the environment variable `VITE_API_URL` to point to the backend service.

### Backend & Database (Render)

The FastAPI application and PostgreSQL database are hosted on **Render**:

- Create a **PostgreSQL** instance on Render to retrieve the database URI connection string.
- Create a **Web Service** on Render pointing to `apps/backend`.
- Environment settings:
  - Select **Python** runtime.
  - Set Build Command: `pip install -r requirements.txt`.
  - Set Start Command: `uvicorn main:app --host 0.0.0.0 --port $PORT`.
  - Configure environment variables:
    - `ENV=production`
    - `DATABASE_URL=<your-render-postgresql-url>`

---

## 5. API Design Standards

All API routes follow versioning under the `/api/v1` prefix.

### Response Formats

- **Success Envelope**:

  ```json
  {
    "success": true,
    "message": "Operation completed successfully.",
    "data": { ... }
  }
  ```

- **Error Envelope**:
  ```json
  {
    "success": false,
    "message": "Validation Error",
    "error": {
      "code": "VALIDATION_ERROR",
      "details": [
        {
          "field": "name",
          "issue": "Field is required"
        }
      ]
    }
  }
  ```

---

## 6. Development Standards

- **Pre-commit Hooks**: We use Husky and `lint-staged` to format files (`prettier`) and lint code (`eslint`) prior to commits.
- **Git Branching Strategy**:
  - `main`: Protected production-ready code.
  - `feature/<name>`: Feature branch. Create a pull request targeting `main` to trigger CI testing.
