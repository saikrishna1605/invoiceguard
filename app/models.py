import datetime as dt

from sqlalchemy import (
    Column, Integer, String, Float, Boolean, DateTime, ForeignKey, JSON, Text
)
from sqlalchemy.orm import relationship

from app.database import Base


class Vendor(Base):
    __tablename__ = "vendors"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True, nullable=False)
    approved = Column(Boolean, default=True)
    avg_invoice_amount = Column(Float, default=0.0)
    invoice_count = Column(Integer, default=0)

    purchase_orders = relationship("PurchaseOrder", back_populates="vendor")
    invoices = relationship("Invoice", back_populates="vendor")


class PurchaseOrder(Base):
    __tablename__ = "purchase_orders"

    id = Column(Integer, primary_key=True, index=True)
    po_number = Column(String, unique=True, index=True, nullable=False)
    vendor_id = Column(Integer, ForeignKey("vendors.id"), nullable=False)
    amount = Column(Float, nullable=False)
    line_items = Column(JSON, default=list)  # [{"description":..., "qty":..., "unit_price":...}]
    status = Column(String, default="open")  # open | closed

    vendor = relationship("Vendor", back_populates="purchase_orders")
    invoices = relationship("Invoice", back_populates="purchase_order")


class Invoice(Base):
    __tablename__ = "invoices"

    id = Column(Integer, primary_key=True, index=True)
    invoice_number = Column(String, index=True, nullable=False)
    vendor_id = Column(Integer, ForeignKey("vendors.id"), nullable=True)
    po_id = Column(Integer, ForeignKey("purchase_orders.id"), nullable=True)

    raw_text = Column(Text, nullable=True)
    extracted_data = Column(JSON, default=dict)
    validation_result = Column(JSON, default=dict)
    assessment_result = Column(JSON, default=dict)
    retrieval_context = Column(JSON, default=dict)

    amount = Column(Float, nullable=True)
    due_date = Column(String, nullable=True)

    # pending_review | approved | rejected
    status = Column(String, default="pending_review")
    risk_level = Column(String, default="unknown")  # low | medium | high

    created_at = Column(DateTime, default=lambda: dt.datetime.now(dt.UTC).replace(tzinfo=None))
    decided_at = Column(DateTime, nullable=True)
    decided_by = Column(String, nullable=True)

    vendor = relationship("Vendor", back_populates="invoices")
    purchase_order = relationship("PurchaseOrder", back_populates="invoices")
    audit_logs = relationship("AuditLog", back_populates="invoice", order_by="AuditLog.timestamp")


class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, index=True)
    invoice_id = Column(Integer, ForeignKey("invoices.id"), nullable=False)
    agent_name = Column(String, nullable=False)
    action = Column(String, nullable=False)
    detail = Column(JSON, default=dict)
    timestamp = Column(DateTime, default=lambda: dt.datetime.now(dt.UTC).replace(tzinfo=None))

    invoice = relationship("Invoice", back_populates="audit_logs")
