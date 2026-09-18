from collections import Counter

from sqlalchemy.orm import Session

from app.agents.base import BaseAgent
from app.models import Invoice
from app.services.notifications import notify_high_risk_invoice


class MonitorAgent(BaseAgent):
    """Tracks invoice status across the system, raises alerts for
    high-risk items, and computes the numbers behind the dashboard.
    In a real deployment this is also where ERP webhooks / email alerts
    would fire from.
    """

    name = "monitor_agent"

    def alert_if_high_risk(self, invoice: Invoice):
        if invoice.risk_level != "high":
            return

        flags = (invoice.assessment_result or {}).get("flags", [])
        vendor_name = invoice.vendor.name if invoice.vendor else None
        result = notify_high_risk_invoice(invoice.invoice_number, vendor_name, invoice.amount, flags)

        # Always logged to the audit trail regardless of whether Slack/email
        # are configured — this is what GET /dashboard/alerts reads from.
        self.log(invoice.id, "alert_raised", {
            "reason": "high_risk_invoice_pending_review",
            **result,
        })

    def get_active_alerts(self) -> list[dict]:
        """Returns the current set of high-risk invoices still awaiting a
        human decision — the "worth an ERP/Slack notification right now"
        list, as opposed to digging through the full audit trail.
        """
        db: Session = self.db
        invoices = (
            db.query(Invoice)
            .filter(Invoice.status == "pending_review", Invoice.risk_level == "high")
            .order_by(Invoice.created_at.desc())
            .all()
        )
        return [
            {
                "invoice_id": inv.id,
                "invoice_number": inv.invoice_number,
                "vendor_id": inv.vendor_id,
                "amount": inv.amount,
                "risk_level": inv.risk_level,
                "flags": (inv.assessment_result or {}).get("flags", []),
                "created_at": inv.created_at,
            }
            for inv in invoices
        ]

    def compute_dashboard_stats(self) -> dict:
        db: Session = self.db
        invoices = db.query(Invoice).all()

        status_counts = Counter(inv.status for inv in invoices)
        pending = [inv for inv in invoices if inv.status == "pending_review"]
        high_risk_open = [inv for inv in pending if inv.risk_level == "high"]

        flagged_reasons = Counter()
        for inv in pending:
            for flag in (inv.assessment_result or {}).get("flags", []):
                # Bucket by the leading phrase so similar flags group together.
                key = flag.split(":")[0].split(".")[0][:40]
                flagged_reasons[key] += 1

        return {
            "total_invoices": len(invoices),
            "pending_review": status_counts.get("pending_review", 0),
            "approved": status_counts.get("approved", 0),
            "rejected": status_counts.get("rejected", 0),
            "high_risk_open": len(high_risk_open),
            "total_amount_pending": sum((inv.amount or 0) for inv in pending),
            "flagged_reasons": dict(flagged_reasons),
        }
