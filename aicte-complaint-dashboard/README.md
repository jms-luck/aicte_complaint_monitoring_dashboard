# AICTE Integrated Institution Complaint Monitoring and Status Dashboard

> DEMO DATA - Not actual AICTE records.

## Overview

The AICTE Integrated Institution Complaint Monitoring and Status Dashboard is a centralised platform for managing institution-related complaints and cases across AICTE's internal Bureaus and Cells. It provides:

- Unified complaint intake from multiple sources (portal, email, letter, RTI, court orders)
- Case management with status lifecycle tracking and SLA monitoring
- Cross-bureau overlap detection using fuzzy name matching and semantic similarity
- Role-based access control (admin, RB officer, PGRC officer, bureau officer, regional officer, senior management)
- Real-time dashboard with ageing analysis, workload distribution, and trend charts
- CSV/JSON report exports with date-range and bureau filters
- Background scheduler for deadline notifications and SLA escalations

## Architecture

| Component | Technology | Port |
|-----------|-----------|------|
| Frontend | React 18 + Vite + TypeScript + Tailwind CSS | 5173 |
| Backend | Python 3.12 + FastAPI + SQLAlchemy 2 | 8000 |
| Database | PostgreSQL 16 | 5432 |
| Background jobs | APScheduler | — |
| Document storage | Local filesystem (dev) / Azure Blob Storage (prod) | — |

## Prerequisites

**Option A — Docker (recommended)**
- Docker 24+ and Docker Compose v2

**Option B — Local development**
- Node.js 20+
- Python 3.12+
- PostgreSQL 16
- (Optional) Git

## Quick Start (Docker)

```bash
git clone <repo-url>
cd aicte-complaint-dashboard

# Copy and edit environment file
cp .env .env.local
# Edit .env — set SECRET_KEY to a random 32+ character string

docker compose up -d

# Wait for services to start (~30 seconds), then seed demo data
docker compose exec backend python -m app.db.seed

# Verify services
bash scripts/verify_setup.sh

# Access the dashboard
# Frontend:  http://localhost:5173
# API docs:  http://localhost:8000/api/docs
```

## Local Development Setup

### Backend

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Configure environment
# Edit the .env file in the repository root (see Configuration Reference below)

# Apply database migrations
alembic upgrade head

# Seed demo data
python -m app.db.seed

# Start development server
uvicorn app.main:app --reload --port 8000
```

The backend API will be available at `http://localhost:8000`.
Interactive docs: `http://localhost:8000/api/docs`

### Frontend

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

The frontend will be available at `http://localhost:5173`.

## Demo Accounts (development only)

All demo accounts use the password `Demo@1234`.

| Email | Role | Bureau Access |
|-------|------|---------------|
| admin@aicte.gov.in | System Administrator | All |
| rb.officer@aicte.gov.in | RB Officer | Regional Bureau |
| pgrc.officer@aicte.gov.in | PGRC Officer | PGRC Cell |
| ab.officer@aicte.gov.in | Bureau Officer | Approval Bureau |
| north.regional@aicte.gov.in | Regional Officer | Northern Region |
| management@aicte.gov.in | Senior Management | Read-all |

## API Documentation

Once the backend is running:

- Swagger UI: http://localhost:8000/api/docs
- ReDoc: http://localhost:8000/api/redoc
- OpenAPI JSON: http://localhost:8000/api/openapi.json

Key API endpoints:

```
POST   /api/v1/auth/login             Login and receive JWT tokens
GET    /api/v1/auth/me                Get current user profile
GET    /api/v1/institutions           List/search institutions
POST   /api/v1/institutions           Create institution (admin/officer)
GET    /api/v1/complaints             List complaints
POST   /api/v1/complaints             Create complaint
GET    /api/v1/cases                  List cases
POST   /api/v1/cases                  Create case
PATCH  /api/v1/cases/{id}/status      Update case status
POST   /api/v1/cases/{id}/assign      Assign case to officer
POST   /api/v1/cases/{id}/transfer    Transfer case to another bureau
GET    /api/v1/overlaps               List overlap alerts
POST   /api/v1/overlaps/{id}/review   Submit overlap review decision
GET    /api/v1/dashboard/summary      Dashboard KPI summary
GET    /api/v1/dashboard/trends       Monthly intake/disposal trends
GET    /api/v1/reports/institutions   Institution report (JSON or CSV)
GET    /api/v1/reports/ageing         Ageing analysis report
GET    /api/v1/notifications          User notifications
```

## Running Tests

Tests use an in-memory SQLite database — no PostgreSQL installation required.

```bash
cd backend

# Activate virtual environment
source venv/bin/activate   # Windows: venv\Scripts\activate

# Run all tests with coverage
pytest tests/ -v --cov=app --cov-report=term-missing

# Run a specific test file
pytest tests/test_auth.py -v

# Run with short output
pytest tests/ -q
```

Test files:

| File | Covers |
|------|--------|
| test_auth.py | Login, /me, change password |
| test_institutions.py | Institution CRUD, search, access control |
| test_complaints.py | Complaint creation, numbering, bureau filtering |
| test_cases.py | Case lifecycle, assignments, transfers, status transitions |
| test_overlap.py | Fuzzy matching, alert creation, deduplication, review |
| test_dashboard.py | Summary counts, trends, overdue detection |
| test_notifications.py | Assignment notifications, mark read, deadline alerts |
| test_search_pagination.py | Pagination correctness, filter accuracy |
| test_reports.py | CSV export, date filters, ageing report |

## End-to-End Acceptance Scenario

The following workflow verifies the complete complaint-to-resolution pipeline:

1. **Login** as `admin@aicte.gov.in`
2. **Create an institution**: Navigation > Institutions > New Institution
3. **Create a complaint**: Navigation > Complaints > New Complaint — link to the institution
4. **Create a case** from the complaint (click "Create Case" on the complaint detail page)
5. **Assign** the case to an RB officer
6. **Update status**: received → pending_assignment → under_process
7. **Create a second case** for the same institution from a different bureau (login as pgrc.officer)
8. **Trigger overlap check**: the system should detect and display an overlap alert
9. **Review the overlap**: decision = confirmed_related
10. **Add a related-case link** between the two cases
11. **Dispose** the case: status → disposed with disposal remarks
12. **Verify dashboard**: summary counts and ageing report reflect the changes
13. **Export CSV report**: Reports > Institutions > Download CSV

## Configuration Reference

All settings are read from the `.env` file in the repository root.

| Variable | Default | Description |
|----------|---------|-------------|
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
| `FRONTEND_URL` | `http://localhost:5173` | Used in email links |
| `SMTP_HOST` | *(empty)* | SMTP server for email notifications |
| `SMTP_PORT` | `587` | SMTP port |
| `SMTP_USER` | *(empty)* | SMTP username |
| `SMTP_PASSWORD` | *(empty)* | SMTP password |

## Production Deployment

### Azure App Service

1. Provision an Azure Database for PostgreSQL Flexible Server.
2. Create an Azure App Service (Python 3.12, B2 or higher).
3. Set environment variables via App Service Configuration:
   - `DATABASE_URL` — Azure PostgreSQL connection string
   - `SECRET_KEY` — cryptographically random 64-character string
   - `AZURE_STORAGE_CONNECTION_STRING` — Azure Blob Storage connection string
   - `ENVIRONMENT=production`
   - `USE_LOCAL_STORAGE=false`
4. Deploy the backend using GitHub Actions or Azure Pipelines.
5. Run migrations post-deploy: `alembic upgrade head`
6. Seed initial data: `python -m app.db.seed`

### HTTPS

In production, terminate TLS at the load balancer or App Service level.
Never run the FastAPI application directly on port 443.

### Secret Management

- Store `SECRET_KEY`, database credentials, and SMTP passwords in Azure Key Vault.
- Reference them as App Service environment variables (Key Vault references).
- Rotate `SECRET_KEY` periodically — this invalidates all active JWT sessions.

### Backups

- Enable automated backups in Azure Database for PostgreSQL (daily snapshots, 7-day retention minimum).
- Test restore procedures quarterly.

## Known Limitations

1. **Semantic matching disabled by default**: The sentence-transformers model is not downloaded automatically. Set `use_semantic=True` in `MatchConfig` and ensure the model is pre-downloaded in production.

2. **Email notifications require SMTP configuration**: Leave `SMTP_HOST` empty to disable email sending. Notifications are still created in the database.

3. **Azure Blob Storage requires an Azure account**: Set `USE_LOCAL_STORAGE=false` and provide `AZURE_STORAGE_CONNECTION_STRING`. Local storage is used by default for development.

4. **APScheduler runs in-process**: In a multi-worker deployment (gunicorn), the background scheduler will run in every worker. Use `--workers 1` or move to an external task queue (Celery) for production.

## Demo Data Notes

All seeded institutions and cases are clearly fictional.
Seed data is labeled "DEMO DATA - Not actual AICTE records."
Seeded user accounts are for development and testing purposes only.
Remove all seed data and demo accounts before deploying to production.
