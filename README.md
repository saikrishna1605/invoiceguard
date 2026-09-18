# InvoiceGuard — Backend

Agentic invoice processing pipeline for GIBC V2, Track 02 (Applied Finance).
All data is synthetic — no real vendors, invoices, or payments.

## Architecture

```
Upload/Text  ->  ORCHESTRATE AGENT
                     |
   1. EXTRACT   — pulls vendor, invoice #, amount, due date, line items
   2. RETRIEVE  — looks up vendor record, matches an open PO, checks for
                  duplicate invoice numbers
   3. VALIDATE  — invoice vs PO: amounts match? vendor approved? line
                  items consistent?
   4. ASSESS    — risk scoring: duplicates, amount anomalies vs vendor
                  history, unapproved vendors -> risk_level (low/med/high)
   5. MONITOR   — dashboard stats, alerts on high-risk items
                     |
              status = "pending_review"   <-- ALWAYS, never auto-approved
                     |
              Human calls /approve or /reject
```

Every agent writes to the `audit_logs` table, so the dashboard can show
*why* an invoice was flagged, not just that it was — this is the "Controlled
Autonomy" story: automation does the work, a person makes the call.

## Setup

```bash
python -m venv venv
source venv/bin/activate      # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env          # ANTHROPIC_API_KEY and notification channels are optional — see below
python -m app.seed_data       # creates 5 synthetic vendors + 4 POs
uvicorn app.main:app --reload
```

API docs: http://127.0.0.1:8000/docs

### LLM key is optional
If `ANTHROPIC_API_KEY` is unset, the Extract Agent uses a deterministic
regex-based extractor instead of an LLM call. The whole pipeline still
runs end-to-end — useful for a demo where you don't want a flaky network
call or API key on stage. Set the key in `.env` to switch to real LLM
extraction (model: `claude-sonnet-4-6`).

### OCR for scanned invoices (system dependencies)
Scanned or photographed invoices with no text layer are handled via OCR
fallback (pytesseract + pdf2image). This needs two OS-level packages, not
just pip installs:

```bash
# Debian/Ubuntu
sudo apt-get install tesseract-ocr poppler-utils

# macOS
brew install tesseract poppler
```

Without these, `POST /invoices/upload` still works for normal (text-layer)
PDFs and `/submit-text` — only genuinely scanned/image-only PDFs need OCR.

## Try it immediately

`app/seed_data.py` includes four ready-made sample invoices as plain text
(`SAMPLE_INVOICES` dict) that exercise every risk path:

| Sample | What it demonstrates |
|---|---|
| `clean_match` | Passes validation, low risk |
| `duplicate` | Same invoice number seen twice -> flagged, high risk |
| `amount_anomaly` | 3.3x vendor's historical average -> flagged, high risk |
| `unapproved_vendor` | Vendor not on approved list, no PO -> flagged, medium risk |

Fastest way to test — POST the raw text directly (no PDF needed):

```bash
curl -X POST http://127.0.0.1:8000/invoices/submit-text \
  -F "raw_text=Invoice Number: INV-9001
Vendor: Acme Office Supplies
Due Date: 2026-10-15
Office chairs 5 x \$150.00
Standing desks 2 x \$250.00
Total Amount Due: \$1250.00"
```

Or upload a real PDF:
```bash
curl -X POST http://127.0.0.1:8000/invoices/upload -F "file=@sample_invoice.pdf"
```

## Synthetic PDF invoices for demo uploads

`generate_synthetic_pdfs.py` renders 7 ready-made invoice PDFs into
`sample_invoices_pdf/` so you can demo `POST /invoices/upload` with real
files instead of typing text into Swagger:

```bash
pip install reportlab   # not in requirements.txt — only needed to generate these
python generate_synthetic_pdfs.py
```

| File | What it demonstrates |
|---|---|
| `invoice_clean_match.pdf` | Acme Office Supplies, matches PO-1001 exactly -> low risk |
| `invoice_clean_brightline.pdf` | Brightline Logistics, matches PO-1002 exactly -> low risk |
| `invoice_duplicate.pdf` | Identical to `invoice_clean_match.pdf` — upload AFTER it to trigger the duplicate flag -> high risk |
| `invoice_amount_anomaly.pdf` | Brightline Logistics, $15,000 vs their $4,500 average and PO -> high risk |
| `invoice_unapproved_vendor.pdf` | Shadow Consulting LLC — not approved, no PO, flagged pending compliance review in the supplier KB -> high risk |
| `invoice_po_number_match.pdf` | Meridian Cloud Services, cites `PO Number: PO-1003` directly -> matched by PO number, not amount guessing -> low risk |
| `invoice_po_vendor_mismatch.pdf` | Sterling Print & Signage cites `PO-1003`, which actually belongs to Meridian -> flagged as a PO/vendor mismatch |

Upload order matters for #3 (the duplicate check needs #1 in the database
first). Verified end-to-end through the real `POST /invoices/upload` path,
not just the extractor in isolation.

## Realistic stress-test invoices

`generate_realistic_invoices.py` generates 3 harder cases — still fully
synthetic, but modeled on real-world invoice messiness rather than clean
templates:

```bash
python generate_realistic_invoices.py
```

| File | What it tests |
|---|---|
| `invoice_freight_style.pdf` | Different label phrasing throughout, a Subtotal/Tax/Total breakdown, a slash-formatted date, and an unrelated "Bill To" customer line right after the vendor line |
| `invoice_marketing_style.pdf` | A written-out date ("October 22, 2026") the regex can't parse, "Grand Total" instead of "Total Amount Due", and a non-standard line-item format |
| `invoice_scanned_no_text_layer.pdf` | A genuinely image-only PDF (no text layer at all) — only readable via the OCR fallback |

These caught two real bugs during development, both now fixed:
- **The Subtotal trap**: `"Subtotal: $200.00 ... Total Amount Due: $216.00"` used to extract `$200` instead of `$216`, because the old regex matched the substring "total" inside "Sub**total**" with no word boundary.
- **Vendor extraction stopping too early**: if an unrecognized label (like "Bill To") appeared on the line right after the vendor's name, extraction used to fail entirely rather than just stopping at the end of that line.

**Known, documented limitation** (not silently hidden): the line-item
extractor only recognizes the `description qty x $price` pattern. Invoices
that describe items differently (like `invoice_marketing_style.pdf`'s
`"Description: X | Qty: Y | Rate: Z"` format) will extract other fields
correctly but come back with an empty `line_items` list. This is a real
gap worth mentioning to judges as a known next step, not something to
paper over — a production version would use `pdfplumber`'s table
extraction or a fully LLM-driven line-item parser instead of regex.

## Testing against a public invoice dataset

For a genuinely external test (not data you or I generated), the
[`GokulRajaR/invoice-ocr-json`](https://huggingface.co/datasets/GokulRajaR/invoice-ocr-json)
dataset on Hugging Face is the best fit: it's explicitly built from
synthetic/anonymized invoices, so it's safe to use under GIBC's
public-or-de-identified data rule. It has real invoice images and expects
you to know their real answers, which is genuinely useful for spot-checking.

Other public datasets exist (SROIE, CORD, FUNSD) but are receipt/form
datasets, not B2B invoices — they lack PO references and vendor payment
terms, so they won't exercise this pipeline's actual logic well.

To try it:
1. Download a handful of images from the dataset (requires a free Hugging
   Face account for some dataset viewers).
2. Upload them via `POST /invoices/upload` in Swagger, same as the
   synthetic PDFs — image files go through the OCR path automatically.
3. Compare the pipeline's `extracted_data` against the dataset's own
   labeled JSON to see how the deterministic extractor holds up on invoice
   layouts you didn't design yourself. Expect it to need the LLM path
   (`ANTHROPIC_API_KEY` set) for good results — the regex extractor was
   tuned against known label patterns, not arbitrary real-world phrasing.

## API Reference

| Endpoint | Method | Purpose |
|---|---|---|
| `/invoices/upload` | POST | Upload PDF/txt invoice, runs full pipeline |
| `/invoices/submit-text` | POST | Same, but with raw text (form field `raw_text`) |
| `/invoices` | GET | List invoices, filter with `?status=pending_review` |
| `/invoices/{id}` | GET | Full detail incl. audit trail |
| `/invoices/{id}/approve` | POST | Human approval — the only way status changes |
| `/invoices/{id}/reject` | POST | Human rejection |
| `/vendors` | GET/POST | List/create vendors |
| `/purchase-orders` | GET/POST | List/create POs |
| `/dashboard/stats` | GET | Monitor Agent's aggregate stats for the staff dashboard |
| `/dashboard/alerts` | GET | High-risk invoices still pending review, right now — the "worth pushing to Slack/ERP" feed |

## Project structure

```
app/
  main.py              FastAPI app, router registration
  config.py            Env-driven settings
  database.py          SQLAlchemy engine/session
  models.py            Vendor, PurchaseOrder, Invoice, AuditLog
  schemas.py           Pydantic request/response models
  seed_data.py          Synthetic vendors/POs + 4 sample invoices
  agents/
    base.py            Shared BaseAgent (handles audit logging)
    extract_agent.py
    retrieve_agent.py
    validate_agent.py
    assess_agent.py
    orchestrate_agent.py   Coordinates the pipeline + the human-approval gate
    monitor_agent.py
  services/
    llm_client.py       LLM call + deterministic regex fallback
    pdf_parser.py        PDF -> text (pdfplumber) / plain text passthrough
    supplier_kb.py        Hardcoded supplier knowledge base (payment terms, policy/risk notes)
  routers/
    invoices.py, vendors.py, dashboard.py
```

## Notes for the demo

- The Orchestrate Agent's `run_pipeline` never sets status to `approved` —
  only `apply_decision`, called from the human-facing `/approve` and
  `/reject` endpoints, can do that. This is deliberate and worth pointing
  out to judges as the "Controlled Autonomy" differentiator.
- Vendor average amount updates after each approval, so the anomaly
  threshold adapts over time rather than being a fixed number.
- `app/services/supplier_kb.py` holds a hardcoded per-vendor profile
  (payment terms, contact info, policy/risk notes) for all 5 seeded
  vendors that Retrieve pulls in and Validate checks against — this is
  the "Retrieve" agent doing more than a lookup.
- PO matching prefers an explicit PO number stated on the invoice over
  amount-proximity guessing (`retrieval_context.po_match_method` shows
  which one was used). If the cited PO belongs to a different vendor than
  the invoice states, that's flagged as its own validation issue rather
  than silently matched.
- `GET /dashboard/alerts` is the "worth an ERP/Slack notification right
  now" list. `MonitorAgent.alert_if_high_risk` also pushes to Slack and/or
  email if `SLACK_WEBHOOK_URL` or `SMTP_HOST`+`ALERT_EMAIL_TO` are set in
  `.env` — both are best-effort: a failed send is logged and never breaks
  the pipeline, so the demo is safe to run with or without either
  configured.
- Extraction tries the LLM first whenever `ANTHROPIC_API_KEY` is set
  (`extracted_data.extraction_method` reports `"llm"`), and falls back to
  the deterministic regex extractor on any error — so a flaky connection
  mid-demo degrades gracefully instead of failing the upload.
