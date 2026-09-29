"""
Reset transactional demo data while preserving seeded vendors
and purchase orders.

Usage:
    python -m app.reset_demo
"""

from app.database import SessionLocal
from app.models import AuditLog, Invoice, Vendor, PurchaseOrder


def reset_demo():
    db = SessionLocal()

    try:
        before = {
            "invoices": db.query(Invoice).count(),
            "audit_logs": db.query(AuditLog).count(),
            "vendors": db.query(Vendor).count(),
            "purchase_orders": db.query(PurchaseOrder).count(),
        }

        print("InvoiceGuard — Demo Reset")
        print("=" * 40)

        print("\nBefore reset:")
        print(f"  Invoices:        {before['invoices']}")
        print(f"  Audit logs:      {before['audit_logs']}")
        print(f"  Vendors:         {before['vendors']}")
        print(f"  Purchase Orders: {before['purchase_orders']}")

        # Audit logs reference invoices, so delete them first.
        db.query(AuditLog).delete(synchronize_session=False)

        # Remove only transactional invoice records.
        db.query(Invoice).delete(synchronize_session=False)

        db.commit()

        after = {
            "invoices": db.query(Invoice).count(),
            "audit_logs": db.query(AuditLog).count(),
            "vendors": db.query(Vendor).count(),
            "purchase_orders": db.query(PurchaseOrder).count(),
        }

        print("\nAfter reset:")
        print(f"  Invoices:        {after['invoices']}")
        print(f"  Audit logs:      {after['audit_logs']}")
        print(f"  Vendors:         {after['vendors']}")
        print(f"  Purchase Orders: {after['purchase_orders']}")

        print("\n✓ Demo transactional data reset successfully.")
        print("✓ Seeded vendors and purchase orders preserved.")

    except Exception:
        db.rollback()
        raise
    finally:
        db.close()


if __name__ == "__main__":
    reset_demo()
