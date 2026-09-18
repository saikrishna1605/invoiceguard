from sqlalchemy.orm import Session

from app.models import AuditLog


class BaseAgent:
    """Every agent logs what it did to the audit trail. This is what lets
    the dashboard show *why* an invoice was flagged, not just *that* it was.
    """

    name: str = "base_agent"

    def __init__(self, db: Session):
        self.db = db

    def log(self, invoice_id: int, action: str, detail: dict | None = None):
        entry = AuditLog(
            invoice_id=invoice_id,
            agent_name=self.name,
            action=action,
            detail=detail or {},
        )
        self.db.add(entry)
        self.db.commit()
        return entry
