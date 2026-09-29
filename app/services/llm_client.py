"""
Thin wrapper around the LLM call used by the Extract Agent.

Design note: hackathon demos die when the WiFi drops or a key is missing.
So this always has a deterministic, regex-based fallback path. If
ANTHROPIC_API_KEY is set, we try the real LLM first and fall back on any
error; otherwise we go straight to the deterministic extractor.
"""
import json
import re
from typing import Optional

from app.config import settings

EXTRACTION_PROMPT = """You are an invoice data extraction engine. Extract the following
fields from the raw invoice text below and respond with ONLY a JSON object
(no markdown, no commentary) with these exact keys:

- vendor_name (string)
- invoice_number (string)
- po_number (string or null — the purchase order number this invoice references, if the invoice states one)
- amount (number, total amount due)
- due_date (string, as written in the invoice)
- line_items (array of objects: {{"description": string, "qty": number, "unit_price": number}})

Invoice text:
---
{text}
---
"""


FIELD_LABELS = (
    r"(?:Vendor|From|Supplier|Invoice\s*(?:#|No\.?|Number)|"
    r"Due\s*Date|Total(?:\s*Amount)?(?:\s*Due)?|PO\s*(?:Number|#))"
)


AMOUNT_LABEL = (
    r"(?:\btotal\s*amount\s*due\b|\btotal\s*due\b|\bgrand\s*total\b|"
    r"\bamount\s*due\b|\bbalance\s*due\b|\btotal\b|\bamount\b)"
)


def _deterministic_extract(text: str) -> dict:
    """Regex-based extractor used when no LLM is configured or the LLM call
    fails. Bounded to the next known field label (rather than matching
    greedily to end-of-string) so it holds up even when line breaks get
    collapsed into spaces — e.g. pasted into a single-line form field.
    """

    def find(pattern, default=None, flags=re.IGNORECASE):
        m = re.search(pattern, text, flags)
        return m.group(1).strip() if m else default

    vendor_name = find(
        rf"(?:vendor|from|supplier)\s*[:\-]\s*(.+?)(?=\s*{FIELD_LABELS}\s*[:\-]|\r?\n|$)"
    )
    invoice_number = find(r"invoice\s*(?:#|no\.?|number)\s*[:\-]?\s*([A-Za-z0-9\-]+)")
    po_number = find(r"p\.?o\.?\s*(?:number|no\.?|#)\s*[:\-]?\s*([A-Za-z0-9\-]+)")
    due_date = find(r"due\s*date\s*[:\-]\s*([0-9]{1,4}[\/\-][0-9]{1,2}[\/\-][0-9]{1,4})")

    # \b word boundaries matter here: without them, "Subtotal: $200.00"
    # would match on the "total" inside "Sub-total" and grab the subtotal
    # instead of the real total. The alternation prefers the most specific
    # label (e.g. "total amount due") but any of them stopping on a proper
    # word boundary is enough to avoid the Subtotal trap.
    amount_str = find(rf"{AMOUNT_LABEL}\s*[:\-]?\s*\$?([0-9,]+\.?[0-9]*)")
    amount = None
    if amount_str:
        try:
            amount = float(amount_str.replace(",", ""))
        except ValueError:
            amount = None

    # No ^ / MULTILINE requirement: this needs to work whether the invoice
    # arrives with real line breaks or as one collapsed line. Description
    # allows alphanumerics (product codes like "Q3" have digits in them);
    # price allows thousands-separator commas, stripped before float().
    line_items = []
    for m in re.finditer(
        r"(?P<desc>[A-Za-z][\w \-]{1,40}?)\s+(?P<qty>\d+(?:\.\d+)?)\s*x\s*\$?(?P<price>[\d,]+(?:\.\d+)?)",
        text,
    ):
        line_items.append({
            "description": m.group("desc").strip(),
            "qty": float(m.group("qty")),
            "unit_price": float(m.group("price").replace(",", "")),
        })

    return {
        "vendor_name": vendor_name or "Unknown Vendor",
        "invoice_number": invoice_number or "UNKNOWN-INV",
        "po_number": po_number,
        "amount": amount if amount is not None else 0.0,
        "due_date": due_date,
        "line_items": line_items,
        "extraction_method": "deterministic_fallback",
    }


def extract_invoice_fields(text: str) -> dict:
    if settings.ANTHROPIC_API_KEY:
        try:
            return _llm_extract(text)
        except Exception:
            # Never let a flaky API call kill the pipeline mid-demo.
            data = _deterministic_extract(text)
            data["extraction_method"] = "deterministic_fallback_after_llm_error"
            return data
    return _deterministic_extract(text)


def _llm_extract(text: str) -> dict:
    import anthropic

    client = anthropic.Anthropic(api_key=settings.ANTHROPIC_API_KEY)
    message = client.messages.create(
        model="claude-sonnet-4-6",
        max_tokens=1000,
        messages=[{"role": "user", "content": EXTRACTION_PROMPT.format(text=text)}],
    )
    raw = "".join(block.text for block in message.content if block.type == "text")
    raw = raw.strip().removeprefix("```json").removeprefix("```").removesuffix("```").strip()
    data = json.loads(raw)
    data["extraction_method"] = "llm"
    return data
