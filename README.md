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
├── docker/                   # Deployment and orchestration dockerfiles
│   ├── dev.docker-compose.yml
│   ├── prod.docker-compose.yml
│   ├── frontend.Dockerfile
│   └── backend.Dockerfile
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

### Prerequisites

- Node.js (>= 20.0)
- pnpm (>= 9.15.0)
- Python (>= 3.11)
- Docker & Docker Compose

### Option A: Running with Docker (Recommended)

1. Build and boot the local development environment:
   ```bash
   docker compose -f docker/dev.docker-compose.yml up --build
   ```
2. Once booted, the services are available at:
   - **Frontend UI**: `http://localhost:3000`
   - **Backend API**: `http://localhost:8000`
   - **API OpenAPI Swagger Docs**: `http://localhost:8000/docs`
   - **PostgreSQL Database**: `localhost:5432`

### Option B: Local Native Development

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

---

## 4. API Design Standards

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

## 5. Development Standards

- **Pre-commit Hooks**: We use Husky and `lint-staged` to format files (`prettier`) and lint code (`eslint` and `ruff`) prior to commits.
- **Python Conventions**: Use Ruff for import sorting and black-equivalent formatting.
- **Git Branching Strategy**:
  - `main`: Protected production-ready code.
  - `feature/<name>`: Feature branch. Create a pull request targeting `main` to trigger CI testing.
