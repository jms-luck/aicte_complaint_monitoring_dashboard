# MASTER PROJECT EXECUTION PROMPT
## AICTE Integrated Institution Complaint Monitoring and Status Dashboard

### 1. Project Objective

Act as a senior full-stack software engineer, system architect, database designer, AI/ML engineer, UI/UX designer, and QA engineer.

Build a complete, functional, secure, and responsive web application titled **AICTE Integrated Institution Complaint Monitoring and Status Dashboard**.

The platform must centralize institution-related complaints and regulatory cases across the All India Council for Technical Education (AICTE), including the Regulation Bureau (RB), Public Grievance Redressal Cell (PGRC), regional offices, and other authorized Bureaus/Cells.

The primary objective is to prevent duplicated efforts, detect potentially overlapping cases, improve interdepartmental coordination, track case movement, monitor deadlines, and provide management with consolidated reports.

Do not build only a static dashboard. Implement the complete frontend, backend, database, business logic, authentication, workflows, and testing.

### 2. Mandatory Technology Stack

Use the following stack:

**Frontend**
- React with Vite
- TypeScript
- Tailwind CSS
- shadcn/ui or an equivalent accessible component library
- React Router
- TanStack Query for API data fetching and caching
- Recharts for dashboard visualizations
- React Hook Form and Zod for form validation
- Lucide React for icons

**Backend**
- Python 3.12 or a compatible supported version
- FastAPI
- Pydantic for validation
- SQLAlchemy 2.x ORM
- Alembic for database migrations
- JWT-based authentication using a secure implementation
- Argon2 or bcrypt for password hashing
- Pytest for automated testing

**Database**
- PostgreSQL
- Enforce foreign keys, indexes, unique constraints, and database transactions.
- Use UUIDs or appropriately generated unique identifiers for internal records.
- Use a separate human-readable identifier for each complaint/case.

**Matching and AI**
- RapidFuzz for institution-name and text matching.
- Sentence Transformers for optional semantic similarity of complaint descriptions.
- A configurable rule-based overlap detection engine.
- Make semantic matching optional so the core application works without downloading a machine-learning model.

**Document storage**
- Azure Blob Storage for production document storage.
- Implement a local development storage adapter for testing.
- Keep file metadata, storage keys, and access permissions in PostgreSQL.
- Never expose private document URLs or storage credentials publicly.

**Background processing**
- APScheduler or an equivalent lightweight scheduler for the initial prototype.
- Redis and Celery may be introduced if reliable distributed background processing becomes necessary.
- Ensure deadline checks and reminders can be executed repeatedly without generating duplicate notifications.

**Development and deployment**
- Git
- Docker and Docker Compose
- Environment variables managed through `.env`
- PostgreSQL for local development and production
- Azure App Service or another compatible hosting platform
- Swagger/OpenAPI documentation through FastAPI

Do not introduce unnecessary technologies, microservices, or paid APIs. Prefer a modular monolithic architecture for the first complete version.

### 3. User Roles and Permissions

Implement role-based access control for the following users:

1. System Administrator
   - Manage users, roles, institution records, Bureau/Cell configuration, categories, and SLA settings.
   - View audit logs and system-wide statistics.
   - Configure matching thresholds and notification rules.

2. RB Officer
   - View and process cases assigned to RB.
   - Update case status, remarks, assignments, and action history.
   - View authorized related-case information.

3. PGRC Officer
   - View and process cases assigned to PGRC.
   - Record grievance actions, request documents, and update case progress.
   - Review and respond to potential overlap alerts.

4. Other Bureau/Cell Officer
   - Manage cases within the user's authorized Bureau/Cell.

5. Regional Office User
   - View and manage authorized cases associated with the assigned region.

6. Senior Management / Competent Authority
   - Access consolidated dashboards, pending-case reports, escalations, workload analytics, and institution-wise histories according to granted permissions.

Implement authorization on the backend for every protected operation. Hiding a frontend button is not sufficient security.

Create a development-only seed command that provisions demo users with documented credentials. Never seed production accounts with publicly known passwords.

### 4. Core Application Modules

#### Module A: Authentication and User Management

Implement:
- Login and logout.
- Secure password hashing.
- Role-based access control.
- Session expiration and token validation.
- User creation, editing, activation, and deactivation.
- Bureau/Cell and regional assignments.
- Password reset or an administrator-controlled reset workflow.
- Appropriate protection against unauthorized access.

Do not hardcode JWT secrets or database passwords.

#### Module B: Institution Management

Create an institution management page with:
- AICTE Permanent ID.
- Institution name.
- Alternative names and abbreviations.
- Address.
- State and district.
- Region.
- Institution type, if applicable.
- Contact details where authorized.
- Record creation and modification timestamps.
- Active/inactive status.

The AICTE Permanent ID must be unique when present.

Provide institution creation, editing, viewing, search, and filtering.

Each institution must have a profile page displaying its consolidated complaint history across authorized Bureaus/Cells.

If a complaint refers to an institution that cannot be confidently identified, allow an authorized user to select or create an institution after verification. Do not automatically create duplicate institution records from uncertain text matches.

#### Module C: Complaint and Case Management

Implement complaint registration with the following fields:
- Unique complaint ID.
- Institution.
- Received date.
- Complaint source.
- Complaint category.
- Subject.
- Detailed description.
- Supporting documents.
- Receiving Bureau/Cell.
- Assigned officer.
- Priority.
- Initial status.
- Applicable SLA or expected disposal date.

Support complaint statuses such as:
- Received.
- Pending Assignment.
- Under Process.
- Awaiting Information.
- Transferred.
- Escalated.
- Disposed.
- Closed, if applicable to the configured workflow.

Make status transitions configurable and validate them on the backend.

Support:
- Create complaint.
- View complaint details.
- Edit permitted fields.
- Assign or reassign officers.
- Transfer between authorized Bureaus/Cells.
- Add remarks and actions.
- Upload supporting documents.
- Record decisions and disposal details.
- Reopen cases when explicitly authorized.
- Search, sort, filter, and paginate records.

Use a unique case ID and preserve the original complaint identity throughout its lifecycle.

If a single complaint can generate multiple departmental cases, model complaints and cases separately. Use an explicit relationship between them rather than duplicating the original complaint.

#### Module D: Institution-Centric Unified Dashboard

Create a professional dashboard with KPI cards for:
- Total complaints received.
- Total active cases.
- Pending cases.
- Cases under process.
- Cases awaiting information.
- Transferred cases.
- Escalated cases.
- Disposed cases.
- Overdue cases.
- Potentially overlapping cases requiring review.

Include visualizations for:
- Cases by status.
- Cases by Bureau/Cell.
- Monthly complaint intake.
- Monthly disposal trends.
- Pending-case ageing.
- Regional workload.
- Overlap alerts and their review status.

Every metric and chart must be calculated from real database records through backend APIs.

Do not hardcode dashboard statistics.

Provide filters for date range, region, Bureau/Cell, complaint category, status, and priority. Apply filters consistently to KPI cards, charts, and tables.

Provide a consolidated institution table showing:
- Institution name and Permanent ID.
- Total complaints and cases.
- Active cases.
- Bureau/Cell distribution.
- Overlap count.
- Overdue count.
- Latest case activity.

Clicking an institution must open its detailed profile.

#### Module E: Cross-Bureau Overlap Detection

This is the primary innovation of the project.

Build a dedicated matching service that evaluates incoming complaints against existing institution and case records.

Implement matching in the following stages.

Stage 1: Exact identifier matching
- Match using a verified AICTE Permanent ID.
- Match using an existing complaint or case reference when available.
- Normalize case references before comparison.

Stage 2: Institution-name matching
- Normalize capitalization, whitespace, punctuation, and common abbreviations.
- Use RapidFuzz to compare institution names.
- Consider address, district, state, and alternative institution names when available.
- Never assume that a similar institution name alone proves identity.

Stage 3: Complaint relationship matching
- Compare complaint category, subject, description, and other permitted metadata.
- Optionally generate sentence embeddings using Sentence Transformers.
- Use cosine similarity to identify potentially related complaint descriptions.
- Make similarity thresholds configurable.
- Restrict comparisons to plausible candidate cases to avoid unnecessary computation.

Stage 4: Overlap classification
Classify findings as:
- Same verified institution.
- Possible institution match requiring verification.
- Potentially related complaint.
- Same or repeated complaint reference.
- No meaningful match found.

Do not equate multiple complaints about one institution with duplicate complaints. Two different issues involving the same institution must remain separate cases.

Generate an overlap alert containing:
- Incoming complaint/case ID.
- Existing related complaint/case IDs.
- Institution details.
- Concerned Bureaus/Cells.
- Current status of each case.
- Assigned officers, subject to permissions.
- Match type and matching evidence.
- Similarity score when applicable.
- Alert creation timestamp.
- Review status.
- Reviewer and decision remarks.

Use the alert title:

"Potential Overlapping Cases — Coordination Required"

Allow authorized officials to:
- Review a potential overlap.
- Confirm that cases are related.
- Mark the alert as a false positive.
- Link related cases.
- Record coordination remarks.
- Assign a coordination owner where appropriate.
- Record a decision to maintain separate handling.
- Track the alert until review is completed.

Never automatically merge cases, close complaints, change statutory responsibility, or suspend an investigation solely because an algorithm reports a match.

Use a database-backed overlap-alert lifecycle and prevent repeated processing from creating duplicate active alerts for the same candidate relationship.

#### Module F: Related-Case and Coordination Workspace

Provide a unified view of linked cases across departments.

Show:
- Institution identity.
- Related case references.
- Responsible Bureau/Cell for each case.
- Assigned officer.
- Current status.
- Last action date.
- Next action.
- Expected disposal date.
- Link or relationship rationale.
- Coordination history.

Allow authorized officials to add coordination notes and request interdepartmental review.

Record all coordination decisions in the audit trail.

Keep the original case records independent unless an explicitly authorized workflow provides otherwise.

#### Module G: Workflow and Audit Trail

Record a chronological history for all important operations, including:
- Complaint creation.
- Assignment and reassignment.
- Status changes.
- Remarks and action entries.
- Document uploads.
- Transfers.
- Escalations.
- Related-case links.
- Overlap reviews.
- Disposal decisions.

Each audit entry should include:
- Entity affected.
- Action performed.
- Actor.
- Timestamp.
- Relevant before-and-after values where appropriate.
- Remarks.
- Request or correlation ID where useful.

Use server-generated timestamps. Ordinary users must not be able to modify or delete audit history.

Store action history separately from current case state.

#### Module H: SLA Monitoring and Notifications

Implement configurable SLA rules based on complaint category, priority, Bureau/Cell, and applicable deadlines.

Support:
- Pending-case reminders.
- Approaching-deadline alerts.
- Overdue-case alerts.
- Escalation reminders.
- Unreviewed overlap alerts.
- Assignment notifications.

Store notification status and delivery attempts.

Use idempotent scheduled processing so that running the same reminder job multiple times does not create duplicate notifications.

Provide an in-app notification center with unread counts and links to relevant cases.

Where external email or messaging services are not configured, store notifications in the database and clearly document the optional integration.

Do not invent official AICTE SLA values. Use configurable demonstration defaults and label them as demo settings until actual policies are supplied.

#### Module I: Search and Filtering

Implement backend-powered search and filtering for:
- Institution name.
- AICTE Permanent ID.
- Complaint ID.
- Case ID.
- Bureau/Cell.
- Region.
- Complaint category.
- Status.
- Assigned officer.
- Priority.
- Overlap review status.
- Date range.
- Overdue status.

Use pagination and database indexes.

Prevent SQL injection by using parameterized ORM queries.

#### Module J: Reports and Analytics

Provide reports for:
- Institution-wise complaint history.
- Bureau/Cell-wise workload.
- Region-wise case distribution.
- Status-wise case counts.
- Pending-case ageing.
- Overdue cases.
- Disposal rates.
- Monthly and quarterly trends.
- Potential overlaps and review outcomes.
- Transfer and escalation history.

Allow authorized users to export filtered reports to CSV.

If PDF reporting is implemented, ensure the generated report matches the applied filters and includes the report generation date.

All analytics must be derived from database queries.

### 5. Database Design

Create normalized PostgreSQL tables with appropriate foreign keys, indexes, uniqueness constraints, and timestamps.

At minimum, include:

1. users
2. roles or a documented role model
3. bureaus
4. regions
5. institutions
6. institution_aliases
7. complaints
8. cases
9. case_assignments
10. case_actions
11. related_cases
12. overlap_alerts
13. overlap_reviews
14. documents
15. notifications
16. audit_logs
17. sla_rules

You may simplify this design where appropriate, but do not omit the core requirements of case tracking, overlap review, access control, and auditability.

Use appropriate enum or lookup models for statuses and categories.

Define explicit relationships, deletion policies, and indexes.

Use database transactions for operations that update a case and create its corresponding audit event or notification.

Avoid destructive cascading deletes for regulatory case histories.

Create Alembic migrations and a repeatable database initialization process.

### 6. API Design

Create RESTful FastAPI endpoints grouped by module.

Suggested endpoints:

Authentication:
- POST /api/v1/auth/login
- GET /api/v1/auth/me
- POST /api/v1/auth/logout, if required by the selected authentication design

Institutions:
- GET /api/v1/institutions
- POST /api/v1/institutions
- GET /api/v1/institutions/{institution_id}
- PATCH /api/v1/institutions/{institution_id}
- GET /api/v1/institutions/{institution_id}/cases

Complaints:
- GET /api/v1/complaints
- POST /api/v1/complaints
- GET /api/v1/complaints/{complaint_id}
- PATCH /api/v1/complaints/{complaint_id}

Cases:
- GET /api/v1/cases
- POST /api/v1/cases
- GET /api/v1/cases/{case_id}
- PATCH /api/v1/cases/{case_id}/status
- POST /api/v1/cases/{case_id}/assign
- POST /api/v1/cases/{case_id}/transfer
- POST /api/v1/cases/{case_id}/actions
- GET /api/v1/cases/{case_id}/history

Overlap:
- GET /api/v1/overlaps
- GET /api/v1/overlaps/{overlap_id}
- POST /api/v1/overlaps/{overlap_id}/review
- POST /api/v1/cases/{case_id}/related-cases

Dashboard and reports:
- GET /api/v1/dashboard/summary
- GET /api/v1/dashboard/trends
- GET /api/v1/dashboard/workload
- GET /api/v1/reports/institutions
- GET /api/v1/reports/ageing
- GET /api/v1/reports/overlaps
- GET /api/v1/notifications

Documents:
- POST /api/v1/cases/{case_id}/documents
- GET /api/v1/documents/{document_id}/download

Add pagination, request validation, consistent error responses, and authorization checks.

These endpoint names are a proposed design. Adjust them where needed while maintaining consistent API conventions.

### 7. Frontend Pages

Create a polished administrative interface with:

1. Login page.
2. Main dashboard.
3. Institution directory.
4. Institution profile and complaint history.
5. Complaint registration page.
6. Complaint and case listing.
7. Case details and action timeline.
8. Cross-Bureau overlap review center.
9. Related-case coordination page.
10. Notifications center.
11. Reports and analytics.
12. User and role administration.
13. Bureau/Cell and region configuration.
14. SLA and application settings.
15. Audit-log viewer.

UI requirements:
- Professional government-portal visual style.
- Responsive desktop, tablet, and mobile layouts.
- Consistent navigation and page hierarchy.
- Clear status labels and priority indicators.
- Tables with sorting, pagination, and filters.
- Accessible forms, keyboard navigation, and clear validation messages.
- Loading, empty, success, and error states.
- Confirmation dialogs for sensitive actions.
- No nonfunctional buttons or fake interactions.
- Avoid unnecessary animations and excessive visual effects.

Make the overlap review screen particularly clear: officials should be able to compare two or more cases side by side and understand why the system flagged them.

### 8. Security, Privacy, and Reliability

Implement:
- Backend-enforced role-based permissions.
- Secure password hashing.
- Strong secret management through environment variables.
- HTTPS in production.
- Input validation and safe output rendering.
- Restricted document access.
- File type and file size validation.
- Protection against unauthorized document downloads.
- Audit logging for sensitive actions.
- Database transactions.
- Rate limiting for sensitive endpoints where appropriate.
- Safe error messages that do not expose secrets or stack traces.
- Configurable CORS.
- Database backups and migration documentation.
- Appropriate retention and deletion policies based on approved institutional requirements.

Do not put confidential complaint details into public logs, unprotected embeddings, or externally hosted AI services without authorization.

### 9. Testing Requirements

Write automated tests for the critical workflows.

Test at least:
- Successful and unsuccessful authentication.
- Role-based access restrictions.
- Institution creation and duplicate-ID prevention.
- Complaint registration.
- Case assignment and transfer.
- Status transition validation.
- Institution matching by exact ID.
- Institution-name fuzzy matching.
- Complaint similarity matching when enabled.
- False-positive overlap review.
- Related-case linking.
- Deadline and overdue detection.
- Duplicate notification prevention.
- Audit history creation.
- Dashboard metrics.
- Search, filters, and pagination.
- Document access permissions.
- CSV report generation.

Include unit tests, API integration tests, and a small end-to-end smoke test for the primary user workflow.

Ensure tests can run using a dedicated test database and do not depend on production data.

### 10. Demo Data

Provide a development-only seed script containing:
- At least 10 sample institutions.
- Sample complaints from RB and PGRC.
- Cases with different statuses.
- At least three meaningful potential-overlap scenarios.
- At least one false-positive scenario.
- Several overdue cases.
- Disposed cases.
- Different regions and complaint categories.
- Demo users for each supported role.
- Example action histories and notifications.

Use clearly fictional institution and complaint data. Do not claim that demo data represents actual AICTE records.

The seeded records must produce realistic, internally consistent dashboard statistics.

### 11. Project Structure

Organize the project as a maintainable monorepo, for example:

aicte-complaint-dashboard/
  frontend/
    src/
      api/
      components/
      layouts/
      pages/
      hooks/
      routes/
      schemas/
      types/
  backend/
    app/
      api/
      core/
      models/
      schemas/
      services/
      repositories/
      matching/
      tasks/
      permissions/
      reports/
    migrations/
    tests/
  docker-compose.yml
  .env.example
  README.md

Separate routing, business logic, persistence, matching, and notification processing. Do not place the entire application in a single source file.

### 12. Execution Strategy

Execute the project in the following order.

Phase 1: Repository and environment setup
- Inspect the existing repository before modifying anything.
- Preserve useful existing code.
- Create the frontend and backend structure.
- Configure Docker Compose, environment variables, and PostgreSQL.
- Verify the application can start.

Phase 2: Database and backend foundation
- Implement database models and migrations.
- Implement authentication and permissions.
- Implement institution, complaint, case, assignment, and action-history APIs.
- Add automated tests.

Phase 3: Core frontend
- Implement navigation, login, institution directory, complaint registration, case listing, and case details.
- Connect all pages to working backend APIs.

Phase 4: Overlap detection
- Implement exact matching and fuzzy matching.
- Add optional semantic matching.
- Create overlap alerts and the review workflow.
- Test true matches, uncertain matches, and false positives.

Phase 5: Dashboard and coordination
- Add real database-driven KPIs, charts, filters, case histories, and related-case views.
- Implement role-aware coordination workflows.

Phase 6: Notifications and reporting
- Add SLA configuration, deadline monitoring, in-app notifications, and CSV reports.

Phase 7: Quality and deployment
- Run migrations.
- Seed development data.
- Run backend tests and frontend checks.
- Fix all critical errors.
- Verify the full end-to-end workflow.
- Build the frontend for production.
- Provide deployment instructions.

At the end of each phase, summarize completed functionality, files created or modified, commands executed, tests run, and any remaining issues.

Do not mark a feature complete merely because its page or endpoint exists. Verify that it works with the database and the rest of the application.

### 13. Mandatory End-to-End Acceptance Scenario

The project is not complete until this scenario works:

1. An administrator creates an institution with a verified AICTE Permanent ID.
2. A PGRC officer registers a fee-refund complaint for that institution.
3. The case is assigned to a PGRC officer and marked Under Process.
4. An RB officer registers a separate complaint involving the same institution.
5. The system recognizes the common institution and searches for potentially related cases.
6. A potential-overlap alert is generated and displayed in the overlap review center.
7. An authorized official compares the cases and records a review decision.
8. The official links the cases as related while keeping their independent case statuses and histories.
9. The dashboard updates its case and overlap statistics from the database.
10. An officer records an action and the system appends an audit-history entry.
11. A case approaching its configured deadline generates an appropriate notification.
12. An unauthorized user is prevented from accessing restricted case details and documents.
13. The system exports a report reflecting the current filtered records.

The two complaints must not be automatically treated as duplicates simply because they concern the same institution.

### 14. Final Deliverables

Deliver:
- Complete frontend source code.
- Complete backend source code.
- Database schema and migrations.
- Matching and overlap detection service.
- Authentication and role-based permissions.
- Dashboard and analytics.
- Complaint and case workflows.
- Related-case review and coordination.
- Notifications and SLA monitoring.
- Demo data and seed scripts.
- Automated tests.
- Docker configuration.
- `.env.example` with placeholders only.
- Complete README.
- Local installation and startup commands.
- Database initialization instructions.
- Demo account instructions for development.
- Production deployment instructions.
- Known limitations and future enhancements.

### 15. Final Instructions

Begin by inspecting the existing workspace and identifying its framework, files, and current implementation status.

If the repository is empty, initialize the project using the specified stack.

Then execute the phases in order, creating actual source files and running commands through the available development tools. Do not respond with architecture recommendations alone.

Do not ask for confirmation after every phase. Make reasonable implementation decisions, document them, and continue.

If credentials, external services, or actual AICTE data are unavailable, use documented local development alternatives and clearly state what requires configuration.

Never invent official records, policies, SLA values, or experimental results.

Do not leave placeholder pages, fake charts, unimplemented API calls, or TODO-only core functionality.

Prioritize a working end-to-end application, correct case-handling logic, secure access control, accurate database-driven reporting, and a reliable overlap-review workflow.

Start implementation now.
