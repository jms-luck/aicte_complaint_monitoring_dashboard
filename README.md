# AICTE Integrated Institution Complaint Monitoring and Status Dashboard

> **DEMO DATA — Not actual AICTE records.**

A full-stack web application that centralises institution-related complaints and regulatory cases across AICTE's internal Bureaus and Cells. It prevents duplicated efforts, detects cross-bureau overlapping cases, tracks case lifecycles, monitors SLA deadlines, and provides management with consolidated reports.

---

## Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Technology Stack](#technology-stack)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Quick Start (Docker)](#quick-start-docker)
- [Local Development Setup](#local-development-setup)
- [Demo Accounts](#demo-accounts)
- [API Documentation](#api-documentation)
- [API Endpoints](#api-endpoints)
- [Running Tests](#running-tests)
- [Configuration Reference](#configuration-reference)
- [End-to-End Acceptance Scenario](#end-to-end-acceptance-scenario)
- [Production Deployment](#production-deployment)
- [Known Limitations](#known-limitations)

---

## Overview

The platform serves AICTE's Regulation Bureau (RB), Public Grievance Redressal Cell (PGRC), regional offices, and other authorised Bureaus/Cells with:

- **Unified complaint intake** from portal, email, letter, RTI, and court orders
- **Case lifecycle tracking** with configurable status transitions and SLA monitoring
- **Cross-bureau overlap detection** using exact ID matching, RapidFuzz fuzzy name matching, and optional semantic similarity (Sentence Transformers)
- **Role-based access control** with six user roles and backend-enforced permissions
- **Real-time dashboard** with KPI cards, ageing analysis, workload charts, and trend visualisations
- **Audit trail** — immutable chronological history for every case action
- **CSV/JSON report exports** with date-range and bureau filters
- **Background scheduler** (APScheduler) for deadline notifications and SLA escalation reminders

---

## Architecture

| Component | Technology | Port |
|---|---|---|
| Frontend | React 18 + Vite + TypeScript + Tailwind CSS | 5173 |
| Backend | Python 3.12 + FastAPI + SQLAlchemy 2 | 8000 |
| Database | PostgreSQL 16 | 5432 |
| Background jobs | APScheduler (in-process) | — |
| Document storage | Local filesystem (dev) / Azure Blob Storage (prod) | — |

---

## Technology Stack

### Frontend
- React 18 with Vite
- TypeScript
- Tailwind CSS + shadcn/ui
- React Router
- TanStack Query (data fetching and caching)
- Recharts (dashboard visualisations)
- React Hook Form + Zod (form validation)
- Lucide React (icons)

### Backend
- Python 3.12
- FastAPI
- Pydantic (request/response validation)
- SQLAlchemy 2.x ORM
- Alembic (database migrations)
- JWT authentication (HS256)
- Argon2 / bcrypt (password hashing)
- Pytest (automated testing)
- Uvicorn (ASGI server)

### Database
- PostgreSQL 16
- UUID primary keys, human-readable case IDs
- Foreign keys, indexes, unique constraints, transactions

### Matching & AI
- RapidFuzz (institution-name fuzzy matching)
- Sentence Transformers (optional semantic similarity)
- Configurable cosine similarity thresholds
- 4-stage rule-based overlap detection engine

### Infrastructure
- Docker + Docker Compose
- Azure App Service (production)
- Azure Blob Storage (production documents)
- Azure Database for PostgreSQL (production)
- Swagger / OpenAPI docs (FastAPI built-in)

---

## Project Structure

```
aicte-complaint-dashboard/
├── frontend/
│   ├── src/
│   │   ├── api/            # TanStack Query API clients
│   │   ├── components/     # Shared UI components
│   │   ├── contexts/       # React contexts (auth, etc.)
│   │   ├── hooks/          # Custom React hooks
│   │   ├── layouts/        # Page layout wrappers
│   │   ├── pages/          # 15 application pages
│   │   ├── routes/         # React Router config
│   │   └── types/          # TypeScript type definitions
│   ├── index.html
│   ├── vite.config.ts
│   └── tailwind.config.ts
│
├── backend/
│   ├── app/
│   │   ├── api/            # FastAPI route handlers
│   │   ├── core/           # Auth, config, security
│   │   ├── db/             # Database session + seed script
│   │   ├── models/         # SQLAlchemy ORM models
│   │   ├── schemas/        # Pydantic request/response schemas
│   │   ├── services/       # Business logic layer
│   │   ├── matching/       # Overlap detection engine
│   │   └── tasks/          # APScheduler background jobs
│   ├── migrations/         # Alembic migration scripts
│   ├── tests/              # 9 automated test files
│   ├── requirements.txt
│   └── alembic.ini
│
├── docker-compose.yml
├── .env.example
├── start_backend.bat       # Windows quick-start (conda ps2 env)
├── start_frontend.bat      # Windows quick-start (npm)
└── README.md
```

---

## Prerequisites

**Option A — Docker (recommended)**

- Docker 24+
- Docker Compose v2

**Option B — Local development**

- Node.js 20+
- Python 3.12+ (or conda environment `ps2`)
- PostgreSQL 16

---

## Quick Start (Docker)

```bash
git clone <repo-url>
cd aicte-complaint-dashboard

# Copy environment file
cp .env.example .env
# Edit .env — set SECRET_KEY to a random 32+ character string

# Start all services
docker compose up -d

# Wait ~30 seconds, then seed demo data
docker compose exec backend python -m app.db.seed

# Verify services
bash scripts/verify_setup.sh
```

| Service | URL |
|---|---|
| Frontend | http://localhost:5173 |
| API | http://localhost:8000 |
| Swagger UI | http://localhost:8000/api/docs |
| ReDoc | http://localhost:8000/api/redoc |

---

## Local Development Setup

### Backend

```bash
cd aicte-complaint-dashboard/backend

# Create and activate virtual environment
python -m venv venv
source venv/bin/activate          # Windows: venv\Scripts\activate

# OR use the conda environment
conda activate ps2

# Install dependencies
pip install -r requirements.txt

# Apply database migrations
alembic upgrade head

# Seed demo data
python -m app.db.seed

# Start development server
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

**Windows shortcut:**
```bat
start_backend.bat
```

### Frontend

```bash
cd aicte-complaint-dashboard/frontend

# Install dependencies
npm install

# Start Vite development server
npm run dev
```

**Windows shortcut:**
```bat
start_frontend.bat
```

### Other useful commands

```bash
# Build frontend for production
npm run build

# Create a new Alembic migration
alembic revision --autogenerate -m "description"

# Roll back last migration
alembic downgrade -1

# View Docker service logs
docker compose logs -f backend
docker compose logs -f frontend

# Stop all services
docker compose down

# Rebuild Docker images
docker compose up --build -d
```

---

## Demo Accounts

All demo accounts use the password `Demo@1234`.

> Remove all demo accounts before deploying to production.

| Email | Role | Bureau Access |
|---|---|---|
| admin@aicte.gov.in | System Administrator | All |
| rb.officer@aicte.gov.in | RB Officer | Regional Bureau |
| pgrc.officer@aicte.gov.in | PGRC Officer | PGRC Cell |
| ab.officer@aicte.gov.in | Bureau Officer | Approval Bureau |
| north.regional@aicte.gov.in | Regional Officer | Northern Region |
| management@aicte.gov.in | Senior Management | Read-all |

---

## API Documentation

Once the backend is running:

- **Swagger UI:** http://localhost:8000/api/docs
- **ReDoc:** http://localhost:8000/api/redoc
- **OpenAPI JSON:** http://localhost:8000/api/openapi.json

---

## API Endpoints

### Authentication

```
POST   /api/v1/auth/login             Login and receive JWT tokens
GET    /api/v1/auth/me                Get current user profile
POST   /api/v1/auth/logout            Logout / invalidate session
```

### Institutions

```
GET    /api/v1/institutions                          List and search institutions
POST   /api/v1/institutions                          Create institution
GET    /api/v1/institutions/{id}                     Institution details
PATCH  /api/v1/institutions/{id}                     Update institution
GET    /api/v1/institutions/{id}/cases               Institution complaint history
```

### Complaints

```
GET    /api/v1/complaints                            List complaints (with filters)
POST   /api/v1/complaints                            Register new complaint
GET    /api/v1/complaints/{id}                       Complaint details
PATCH  /api/v1/complaints/{id}                       Update permitted fields
```

### Cases

```
GET    /api/v1/cases                                 List cases (paginated, filtered)
POST   /api/v1/cases                                 Create case from complaint
GET    /api/v1/cases/{id}                            Case details
PATCH  /api/v1/cases/{id}/status                     Update case status (validated)
POST   /api/v1/cases/{id}/assign                     Assign case to officer
POST   /api/v1/cases/{id}/transfer                   Transfer to another bureau
POST   /api/v1/cases/{id}/actions                    Add action/remark
GET    /api/v1/cases/{id}/history                    Case audit history
POST   /api/v1/cases/{id}/related-cases              Link related cases
```

### Overlap Detection

```
GET    /api/v1/overlaps                              List overlap alerts
GET    /api/v1/overlaps/{id}                         Overlap alert details
POST   /api/v1/overlaps/{id}/review                  Submit review decision
```

### Dashboard & Reports

```
GET    /api/v1/dashboard/summary                     KPI summary counts
GET    /api/v1/dashboard/trends                      Monthly intake/disposal trends
GET    /api/v1/dashboard/workload                    Bureau/regional workload
GET    /api/v1/reports/institutions                  Institution report (JSON or CSV)
GET    /api/v1/reports/ageing                        Pending-case ageing analysis
GET    /api/v1/reports/overlaps                      Overlap alert report
GET    /api/v1/notifications                         User notifications
```

### Documents

```
POST   /api/v1/cases/{id}/documents                  Upload supporting document
GET    /api/v1/documents/{id}/download               Download document (authorised only)
```

---

## Running Tests

Tests use an in-memory SQLite database — no PostgreSQL required.

```bash
cd aicte-complaint-dashboard/backend
source venv/bin/activate   # Windows: venv\Scripts\activate

# Run all tests with coverage
pytest tests/ -v --cov=app --cov-report=term-missing

# Run a specific test file
pytest tests/test_auth.py -v

# Short output
pytest tests/ -q
```

| File | Covers |
|---|---|
| `test_auth.py` | Login, /me, change password |
| `test_institutions.py` | Institution CRUD, search, access control, duplicate-ID prevention |
| `test_complaints.py` | Complaint creation, numbering, bureau filtering |
| `test_cases.py` | Case lifecycle, assignments, transfers, status transitions |
| `test_overlap.py` | Fuzzy matching, alert creation, deduplication, review workflow |
| `test_dashboard.py` | Summary counts, trends, overdue detection |
| `test_notifications.py` | Assignment notifications, mark-read, deadline alerts |
| `test_search_pagination.py` | Pagination correctness, filter accuracy |
| `test_reports.py` | CSV export, date filters, ageing report |

---

## Configuration Reference

All settings are read from `.env` in the `aicte-complaint-dashboard/` directory.

| Variable | Default | Description |
|---|---|---|
| `DATABASE_URL` | `postgresql://aicte_user:aicte_pass@localhost:5432/aicte_db` | PostgreSQL connection string |
| `SECRET_KEY` | *(dev placeholder)* | JWT signing key — **change in production** |
| `ALGORITHM` | `HS256` | JWT algorithm |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | `480` | Access token lifetime (8 hours) |
| `REFRESH_TOKEN_EXPIRE_DAYS` | `7` | Refresh token lifetime |
| `BACKEND_CORS_ORIGINS` | `["http://localhost:5173"]` | Allowed CORS origins |
| `USE_LOCAL_STORAGE` | `true` | Use local filesystem for uploads |
| `LOCAL_STORAGE_PATH` | `./local_storage` | Path for local file uploads |
| `AZURE_STORAGE_CONNECTION_STRING` | *(empty)* | Azure Blob Storage connection string |
| `AZURE_STORAGE_CONTAINER_NAME` | `aicte-documents` | Azure container name |
| `ENVIRONMENT` | `development` | `development` or `production` |
| `LOG_LEVEL` | `INFO` | Logging level |
| `FRONTEND_URL` | `http://localhost:5173` | Used in email notification links |
| `SMTP_HOST` | *(empty)* | SMTP server — leave empty to disable email |
| `SMTP_PORT` | `587` | SMTP port |
| `SMTP_USER` | *(empty)* | SMTP username |
| `SMTP_PASSWORD` | *(empty)* | SMTP password |

---

## End-to-End Acceptance Scenario

1. Login as `admin@aicte.gov.in` and create an institution with a verified AICTE Permanent ID.
2. As PGRC Officer, register a fee-refund complaint for that institution. Create a case and mark it **Under Process**.
3. As RB Officer, register a separate complaint for the same institution.
4. The system detects the common institution and generates a **"Potential Overlapping Cases — Coordination Required"** alert.
5. An authorised official compares the cases side by side and records a review decision (`confirmed_related`).
6. The official links the cases as related — both retain independent statuses and histories.
7. The dashboard updates case counts and overlap statistics from the database.
8. An officer records an action — the system appends an audit-history entry.
9. A case approaching its configured deadline generates an SLA notification.
10. An unauthorised user is blocked from accessing restricted case details and documents.
11. An officer exports a filtered CSV report reflecting the current records.

> Two complaints about the same institution must never be automatically treated as duplicates. Cases remain independent unless explicitly linked by an authorised user.

---

## Production Deployment

### Azure App Service

1. Provision **Azure Database for PostgreSQL Flexible Server**.
2. Create **Azure App Service** (Python 3.12, B2 or higher).
3. Set the following environment variables in App Service Configuration:

   ```
   DATABASE_URL       = <Azure PostgreSQL connection string>
   SECRET_KEY         = <cryptographically random 64-character string>
   AZURE_STORAGE_CONNECTION_STRING = <connection string>
   ENVIRONMENT        = production
   USE_LOCAL_STORAGE  = false
   ```

4. Deploy the backend via GitHub Actions or Azure Pipelines.
5. Run post-deploy commands:

   ```bash
   alembic upgrade head
   python -m app.db.seed   # staging/dev only
   ```

### HTTPS

Terminate TLS at the load balancer or App Service level. Never run FastAPI directly on port 443.

### Secret Management

Store `SECRET_KEY`, database credentials, and SMTP passwords in **Azure Key Vault**. Reference them as App Service environment variables (Key Vault references). Rotate `SECRET_KEY` periodically — this invalidates all active JWT sessions.

### Backups

Enable automated backups in Azure Database for PostgreSQL (daily snapshots, 7-day retention minimum). Test restore procedures quarterly.

---

## Known Limitations

1. **Semantic matching disabled by default.** Set `use_semantic=True` in `MatchConfig` and pre-download the Sentence Transformers model for production use.

2. **Email notifications require SMTP configuration.** Leave `SMTP_HOST` empty to disable. Notifications are still stored in the database and visible in the in-app center.

3. **Azure Blob Storage requires an Azure account.** Set `USE_LOCAL_STORAGE=false` and provide `AZURE_STORAGE_CONNECTION_STRING`. Local storage is used by default in development.

4. **APScheduler runs in-process.** In a multi-worker gunicorn deployment, the scheduler runs in every worker. Use `--workers 1` or migrate to Celery + Redis for production.

---

> All seeded institutions and cases are clearly fictional. Seed data is labelled "DEMO DATA — Not actual AICTE records." Remove all demo accounts before deploying to production.
