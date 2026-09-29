from sqlalchemy.orm import Session

from app.agents.base import BaseAgent
from app.agents.extract_agent import ExtractAgent
from app.agents.retrieve_agent import RetrieveAgent
from app.agents.validate_agent import ValidateAgent
from app.agents.assess_agent import AssessAgent
from app.agents.monitor_agent import MonitorAgent
from app.models import Invoice, Vendor


class OrchestrateAgent(BaseAgent):
    """Coordinates Extract -> Retrieve -> Validate -> Assess -> Monitor.

    Critical rule: this agent NEVER sets status to "approved". Every
    invoice that clears the pipeline lands at "pending_review" — a human
    always makes the final call. The pipeline's job is to surface findings
    clearly, not to move money.
    """

    name = "orchestrate_agent"

    def run_pipeline(self, invoice: Invoice, raw_text: str) -> Invoice:
        db: Session = self.db

        self.log(invoice.id, "pipeline_started", {})

        extracted = ExtractAgent(db).run(invoice.id, raw_text)
        context = RetrieveAgent(db).run(invoice.id, extracted)
        validation = ValidateAgent(db).run(invoice.id, extracted, context)
        assessment = AssessAgent(db).run(invoice.id, extracted, context, validation)

        invoice.extracted_data = extracted
        invoice.retrieval_context = context
        invoice.validation_result = validation
        invoice.assessment_result = assessment
        invoice.amount = extracted.get("amount")
        invoice.due_date = extracted.get("due_date")
        invoice.invoice_number = extracted.get("invoice_number") or invoice.invoice_number
        invoice.vendor_id = context.get("vendor_id")
        invoice.po_id = context.get("matched_po_id")
        invoice.risk_level = assessment.get("risk_level", "unknown")
        invoice.status = "pending_review"  # always — see docstring

        db.add(invoice)
        db.commit()
        db.refresh(invoice)

        MonitorAgent(db).alert_if_high_risk(invoice)

        self.log(invoice.id, "pipeline_completed", {
            "risk_level": invoice.risk_level,
            "validation_passed": validation.get("passed"),
        })

        return invoice

    def apply_decision(self, invoice: Invoice, decision: str, decided_by: str, note: str | None) -> Invoice:
        """decision is 'approved' or 'rejected' — this is the ONLY path
        that can move an invoice out of pending_review, and it only runs
        because a human called it via the API.
        """
        db: Session = self.db
        invoice.status = decision
        invoice.decided_by = decided_by
        import datetime as dt
        invoice.decided_at = dt.datetime.now(dt.UTC).replace(tzinfo=None)
        db.add(invoice)

        # Feed approved invoices back into vendor history so future
        # anomaly checks improve over time.
        if decision == "approved" and invoice.vendor_id:
            vendor = db.query(Vendor).filter(Vendor.id == invoice.vendor_id).first()
            if vendor and invoice.amount:
                total = vendor.avg_invoice_amount * vendor.invoice_count + invoice.amount
                vendor.invoice_count += 1
                vendor.avg_invoice_amount = total / vendor.invoice_count
                db.add(vendor)

        db.commit()
        db.refresh(invoice)

        self.log(invoice.id, f"human_{decision}", {"decided_by": decided_by, "note": note})
        return invoice
