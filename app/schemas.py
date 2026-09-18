import datetime as dt
from typing import Any, Optional

from pydantic import BaseModel


class VendorCreate(BaseModel):
    name: str
    approved: bool = True


class VendorOut(BaseModel):
    id: int
    name: str
    approved: bool
    avg_invoice_amount: float
    invoice_count: int

    class Config:
        from_attributes = True


class LineItem(BaseModel):
    description: str
    qty: float
    unit_price: float


class PurchaseOrderCreate(BaseModel):
    po_number: str
    vendor_name: str
    amount: float
    line_items: list[LineItem] = []


class PurchaseOrderOut(BaseModel):
    id: int
    po_number: str
    vendor_id: int
    amount: float
    line_items: list
    status: str

    class Config:
        from_attributes = True


class AuditLogOut(BaseModel):
    agent_name: str
    action: str
    detail: dict
    timestamp: dt.datetime

    class Config:
        from_attributes = True


class InvoiceOut(BaseModel):
    id: int
    invoice_number: str
    vendor_id: Optional[int]
    po_id: Optional[int]
    amount: Optional[float]
    due_date: Optional[str]
    status: str
    risk_level: str
    extracted_data: dict
    validation_result: dict
    assessment_result: dict
    retrieval_context: dict
    created_at: dt.datetime
    decided_at: Optional[dt.datetime]
    decided_by: Optional[str]
    audit_logs: list[AuditLogOut] = []

    class Config:
        from_attributes = True


class InvoiceSummary(BaseModel):
    id: int
    invoice_number: str
    vendor_id: Optional[int]
    amount: Optional[float]
    status: str
    risk_level: str
    created_at: dt.datetime

    class Config:
        from_attributes = True


class DecisionRequest(BaseModel):
    decided_by: str = "staff_user"
    note: Optional[str] = None


class DashboardStats(BaseModel):
    total_invoices: int
    pending_review: int
    approved: int
    rejected: int
    high_risk_open: int
    total_amount_pending: float
    flagged_reasons: dict[str, int]


class AlertOut(BaseModel):
    invoice_id: int
    invoice_number: str
    vendor_id: Optional[int]
    amount: Optional[float]
    risk_level: str
    flags: list[str]
    created_at: dt.datetime
