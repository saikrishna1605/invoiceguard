"""
Small hardcoded supplier knowledge base — payment terms, contact info, and
policy/risk notes per vendor. Stands in for the kind of supplier master
data a real deployment would pull from an ERP or vendor management system.

Keyed by vendor name (case-insensitive lookup via get_supplier_profile).
All entries are fabricated for the demo — no real company data.
"""

SUPPLIER_KNOWLEDGE_BASE = {
    "acme office supplies": {
        "payment_terms": "Net 30",
        "preferred_payment_method": "ACH",
        "contact_email": "ap-contact@acme-office-supplies.example",
        "phone": "+1-555-0101",
        "account_manager": "Dana Whitfield",
        "category": "Office equipment & furniture",
        "policy_notes": "Standard net-30 vendor. No special approval routing required.",
        "risk_notes": "No prior incidents on file.",
    },
    "brightline logistics": {
        "payment_terms": "Net 15",
        "preferred_payment_method": "Wire transfer",
        "contact_email": "billing@brightline-logistics.example",
        "phone": "+1-555-0147",
        "account_manager": "Marcus Oyelaran",
        "category": "Freight & logistics",
        "policy_notes": "Freight invoices should be cross-checked against the shipment manifest, not just the PO, when one is available.",
        "risk_notes": "Amounts can vary invoice-to-invoice with fuel surcharges — moderate anomaly tolerance is expected for this vendor.",
    },
    "shadow consulting llc": {
        "payment_terms": "Unknown — not yet onboarded",
        "preferred_payment_method": "Unknown",
        "contact_email": None,
        "phone": None,
        "account_manager": None,
        "category": "Professional services",
        "policy_notes": "Vendor has not completed onboarding / approval. Any invoice from this vendor requires procurement sign-off before payment.",
        "risk_notes": "Flagged in vendor master as pending compliance review.",
    },
    "meridian cloud services": {
        "payment_terms": "Net 30, auto-renewing monthly subscription",
        "preferred_payment_method": "ACH",
        "contact_email": "billing@meridian-cloud.example",
        "phone": "+1-555-0192",
        "account_manager": "Priya Nakamura",
        "category": "Software / cloud infrastructure",
        "policy_notes": "Recurring subscription vendor — amount should be nearly identical month to month; any material change is worth a second look even below the standard anomaly threshold.",
        "risk_notes": "Stable billing history. No incidents on file.",
    },
    "sterling print & signage": {
        "payment_terms": "Net 30",
        "preferred_payment_method": "Check",
        "contact_email": "orders@sterling-print.example",
        "phone": "+1-555-0163",
        "account_manager": "Owen Castellano",
        "category": "Print & marketing materials",
        "policy_notes": "Small, occasional-use vendor. Low invoice volume — treat unfamiliarity as normal, not suspicious, for this vendor specifically.",
        "risk_notes": "Low invoice volume; no incidents on file.",
    },
}


def get_supplier_profile(vendor_name: str) -> dict | None:
    if not vendor_name:
        return None
    return SUPPLIER_KNOWLEDGE_BASE.get(vendor_name.strip().lower())
