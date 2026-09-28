# InvoiceGuard 🛡️

> **Autonomous AI-Powered Invoice Verification with Controlled Human Autonomy**  
> Built for GIBC V2, Track 02 (Applied Finance).  
> All demo financial data, vendor profiles, and purchase orders are strictly synthetic.

---

## 1. Executive Summary & Core Principle

**InvoiceGuard** is an agentic financial operations console that automates the labor-intensive stages of Accounts Payable (AP) fraud and error detection—**without ever handing over unsupervised payment authorization**.

### The Core Principle: Controlled Autonomy
In high-stakes enterprise finance, fully autonomous agents that execute wire transfers or approve payments create unacceptable liability, hallucination risks, and compliance vulnerabilities. 

InvoiceGuard implements **Controlled Autonomy**:
1. **Full Automation of Ingestion & Analysis**: Multi-agent pipeline ingests invoices (PDFs or text), parses structured line items, cross-references internal vendor databases and purchase orders, tests mathematical integrity, and scores multi-vector anomalies.
2. **Immutable Traceability**: Every intermediate conclusion is permanently logged to an audit trail with timestamped agent signatures and rationale.
3. **Hard Human-Approval Gate**: Invoices are **strictly placed into a `pending_review` queue**. No invoice can ever be auto-approved by the machine. Status transitions to `approved` or `rejected` require an authenticated human operator to sign off with their identity and justification.

---

## 2. System Architecture

```
                       [ Incoming Invoice ]
                    (PDF Document or Raw Text)
                               │
                               ▼
               ┌────────────────────────────────┐
               │       ORCHESTRATE AGENT        │
               │  (app/agents/orchestrate.py)   │
               └───────────────┬────────────────┘
                               │
       ┌───────────────────────┼───────────────────────┐
       ▼                       ▼                       ▼
┌──────────────┐       ┌──────────────┐       ┌──────────────┐
│ 1. EXTRACT   │ ----> │ 2. RETRIEVE  │ ----> │ 3. VALIDATE  │
│  Line items, │       │  Vendor DB,  │       │  PO match,   │
│  dates, PO#, │       │  Open POs,   │       │  tax math,   │
│  totals, tax │       │  Dup checks  │       │  item match  │
└──────────────┘       └──────────────┘       └──────────────┘
                               │
                               ▼
                       ┌──────────────┐
                       │  4. ASSESS   │
                       │  Risk score  │
                       │  (LOW/MED/   │
                       │     HIGH)    │
                       └───────┬──────┘
                               │
                               ▼
       ┌────────────────────────────────────────────────┐
       │   STATUS = "pending_review"  (HARD GATEWAY)   │
       │    Audit Log Generated with All Agent Diffs     │
       └───────────────────────┬────────────────────────┘
                               │
                ┌──────────────┴──────────────┐
                ▼                             ▼
       ┌─────────────────┐           ┌─────────────────┐
       │   5. MONITOR    │           │  HUMAN OPERATOR │
       │  Real-time KPI  │           │   Console UI    │
       │  alerts & feeds │           │ /approve /reject│
       └─────────────────┘           └─────────────────┘
```

### Specialized Agents

| Agent | Responsibility | Key Mechanics |
|---|---|---|
| **Extract Agent** | Document Parsing | Uses Anthropic Claude (`claude-sonnet-4-6`) when API key is provided; seamlessly falls back to a deterministic regex parser with zero downtime. Handles OCR via `pytesseract` for scanned image PDFs. |
| **Retrieve Agent** | Internal ERP Corroboration | Matches invoices to purchase orders by explicit PO citations or amount-proximity heuristics; fetches vendor compliance records from the Supplier Knowledge Base (`supplier_kb.py`). |
| **Validate Agent** | Deterministic Rule Verification | Cross-verifies line-item price totals, compares PO quantities to invoiced amounts, and confirms vendor authorization status. |
| **Assess Agent** | Anomaly & Fraud Scoring | Evaluates historical transaction anomalies (e.g., invoices exceeding 3x vendor average), duplicate invoice numbers, and vendor approval flags to output `low`, `medium`, or `high` risk tiers with explicit reasons. |
| **Monitor Agent** | System Health & Alerting | Aggregates volume metrics, total spend, pending reviews, and triggers webhook alerts for high-risk flags. |
| **Orchestrate Agent**| Workflow & Gate Enforcement | Sequentially executes pipeline stages, persists audit logs, and controls the state machine so that status remains `pending_review` until signed off by a human. |

---

## 3. Technology Stack

### Backend
- **Framework**: [FastAPI](https://fastapi.tiangolo.com/) (Python 3.10+)
- **ORM & Database**: [SQLAlchemy](https://www.sqlalchemy.org/) with SQLite (`invoiceguard.db`) and in-memory test isolation
- **Data Validation**: [Pydantic v2](https://docs.pydantic.dev/)
- **Document Processing**: `pdfplumber`, `pypdf`, `pytesseract`, `pdf2image`
- **AI / LLM**: Anthropic API (`claude-sonnet-4-6`) with graceful deterministic regex fallback

### Frontend
- **Framework**: [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/) (strict mode)
- **Tooling**: [Vite](https://vitejs.dev/) with Rolldown/ESNext
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) (Sophisticated Dark Mode First palette)
- **Animations & 3D**: [Framer Motion](https://www.framer.com/motion/) & [Three.js](https://threejs.org/) (with `prefers-reduced-motion` accessibility support)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Linter & Test Runner**: [Oxlint](https://oxc-project.github.io/) (0 errors, 0 warnings) & [Node Test Runner](https://nodejs.org/api/test.html) / `tsx`

---

## 4. Quick Start & Local Setup

### Prerequisites
- Python 3.10+
- Node.js 20+ (Node 22 recommended)
- Git

### 1. Backend Setup

```bash
# Clone the repository
git clone https://github.com/saikrishna1605/invoiceguard.git
cd invoiceguard

# Create and activate virtual environment
python -m venv .venv
# On Windows:
.venv\Scripts\activate
# On Linux/macOS:
# source .venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Configure environment variables (optional for demo)
cp .env.example .env

# Seed initial database with synthetic vendors and purchase orders
python -m app.seed_data

# Start the FastAPI server
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```
Backend API will be running at `http://127.0.0.1:8000` (Interactive docs at `http://127.0.0.1:8000/docs`).

> **Note on LLM API Key**: If `ANTHROPIC_API_KEY` is not provided in `.env`, the system automatically runs the deterministic regex engine. No external network connectivity or paid key is required for local testing or demo presentations.

### 2. Frontend Setup

In a separate terminal:

```bash
cd frontend

# Install frontend dependencies
npm install

# (Optional) Verify environment config
# Default Vite proxy connects to http://127.0.0.1:8000
cp .env.example .env

# Run development server
npm run dev
```
Open your browser at `http://localhost:5173`.

---

## 5. Pre-Configured Demo Personas

For rapid hackathon evaluation and compliance role testing, the application includes 3 one-click persona presets on the `/auth` screen:

| Persona | Role | Department | Default Account |
|---|---|---|---|
| **Marcus Vance** | Senior Financial Controller | Financial Operations | `demo@invoiceguard.local` |
| **Sarah Chen** | Lead AP Auditor | Accounts Payable | `sarah.chen@invoiceguard.local` |
| **Elena Rostova** | Risk & Compliance Specialist | Risk Management | `elena.rostova@invoiceguard.local` |

Each persona simulates an authenticated operator with designated role credentials, avatar badges, and audit trail signatures.

---

## 6. Synthetic Test Scenarios & Presets

The frontend upload interface (`/upload`) and backend scripts (`generate_synthetic_pdfs.py`, `generate_realistic_invoices.py`) include ready-to-test scenarios:

1. **Clean Match (`invoice_clean_match.pdf` / Preset)**:
   - Matches purchase order `PO-1001` and approved vendor *Acme Office Supplies* exactly.
   - Result: `LOW RISK`, validation passed.
2. **Duplicate Detection (`invoice_duplicate.pdf`)**:
   - Re-submits an already registered invoice number.
   - Result: `HIGH RISK`, flagged for duplicate payment prevention.
3. **Amount Anomaly (`invoice_amount_anomaly.pdf`)**:
   - Vendor *Brightline Logistics* submitting an invoice for \$15,000 against a historical average of \$4,500.
   - Result: `HIGH RISK`, flagged for standard deviation violation.
4. **Unapproved Vendor (`invoice_unapproved_vendor.pdf`)**:
   - Invoice from *Shadow Consulting LLC*, an unvetted vendor without an active master service agreement.
   - Result: `HIGH RISK` / `MEDIUM RISK`, flagged for compliance review.
5. **PO Vendor Mismatch (`invoice_po_vendor_mismatch.pdf`)**:
   - Cites purchase order `PO-1003` which belongs to *Meridian Cloud Services*, but the invoice originates from *Sterling Print & Signage*.
   - Result: `HIGH RISK`, flagged for unauthorized PO utilization.

---

## 7. API Reference

| Endpoint | Method | Description |
|---|---|---|
| `GET /` | GET | API health and service status |
| `POST /invoices/upload` | POST | Upload PDF/image invoice to trigger full 5-stage pipeline |
| `POST /invoices/submit-text` | POST | Submit raw invoice text directly without a file |
| `GET /invoices` | GET | List all invoices with optional `?status=pending_review` filter |
| `GET /invoices/{id}` | GET | Retrieve full invoice record, extracted data, and immutable audit logs |
| `POST /invoices/{id}/approve` | POST | Operator approval gate (requires `decided_by` and `note`) |
| `POST /invoices/{id}/reject` | POST | Operator rejection gate (requires `decided_by` and `note`) |
| `GET /vendors` | GET | List all approved and unapproved suppliers |
| `POST /vendors` | POST | Create vendor record |
| `GET /purchase-orders` | GET | List registered purchase orders |
| `POST /purchase-orders` | POST | Create purchase order with line items |
| `GET /dashboard/stats` | GET | Real-time AP metrics: total processed, risk counts, pending queue |
| `GET /dashboard/alerts` | GET | Priority high-risk invoices currently awaiting decision |

---

## 8. Verification & Test Suites

InvoiceGuard is equipped with automated unit and regression test suites across both frontend and backend.

### Frontend Quality & Test Suite
```bash
cd frontend

# Run Oxlint (linter check: 0 errors, 0 warnings)
npm run lint

# Run Unit Tests (formatters, date handlers, authentication & demo personas)
npm test

# Production build verification (TypeScript + Vite bundling)
npm run build
```

### Backend Regression Test Suite
```bash
# In project root:
.venv\Scripts\python -m unittest tests/test_backend_regression.py
# (Or on POSIX: python -m unittest tests/test_backend_regression.py)
```
The backend test suite executes against an isolated in-memory SQLite database, verifying:
- Root service discovery
- Vendor registration and PO creation with line-item validation
- Dashboard statistical calculation
- End-to-end invoice submission, text extraction, retrieval, and decision gates (enforcing that approved invoices cannot be re-approved)

---

## 9. Security & Production Hardening Roadmap

While designed as a hackathon submission, InvoiceGuard is architected with enterprise hardening in mind:

- **Strict CORS Isolation**: In production, `allow_origins=["*"]` in `app/main.py` should be restricted to verified domain origins.
- **Zero Dummy Data**: The UI displays real operational states; when lists are empty, clear informative empty states are rendered.
- **Error Boundaries**: Frontend crashes are caught gracefully by `ErrorBoundary.tsx` without leaking sensitive stack traces to users.
- **JWT / OAuth2 Transition**: The demo persona switcher simulates authenticated sessions; production AP consoles should be backed by enterprise SAML / Okta / Azure AD SSO.
- **Sandboxed OCR / PDF Extraction**: Production PDF parsing should run in an isolated container/lambda worker with memory limits to mitigate malicious PDF exploit payloads.

---

## 10. Known Limitations (Honest Disclosure)

1. **Non-Standard Line Items in Regex Mode**: The fallback regex extractor recognizes standard `description qty x $price` patterns. Non-standard layouts (e.g. multi-line wrapped descriptions without column separators) parse invoice headers and totals accurately, but may result in empty `line_items` in fallback mode.
2. **Scanned Image PDFs**: Image-only PDFs require system-level `tesseract-ocr` and `poppler-utils` packages installed on the host operating system. Text-layer PDFs and direct text submissions operate with zero OS dependencies.
3. **Synthetic Scope**: All vendors, tax identification numbers, and purchase orders are synthetic and generated for demonstration purposes.

---

## 11. License & Compliance

InvoiceGuard is created for hackathon demonstration. See [`frontend/src/pages/PrivacyPage.tsx`](frontend/src/pages/PrivacyPage.tsx) and [`frontend/src/pages/TermsPage.tsx`](frontend/src/pages/TermsPage.tsx) for prototype terms and privacy practices.
