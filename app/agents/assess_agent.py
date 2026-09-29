from app.agents.base import BaseAgent
from app.config import settings


class AssessAgent(BaseAgent):
    """Flags suspicious patterns on top of validation: duplicate invoice
    numbers, unusually large amounts for a vendor, and other red flags.
    Produces a risk_level (low/medium/high) that drives queue priority.
    """

    name = "assess_agent"

    def run(self, invoice_id: int, extracted: dict, context: dict, validation: dict) -> dict:
        flags = []
        score = 0  # higher = riskier

        if context.get("duplicate_invoice_ids"):
            flags.append(
                f"Possible duplicate: invoice number already exists "
                f"(invoice id(s) {context['duplicate_invoice_ids']})."
            )
            score += 50

        avg_amount = context.get("vendor_avg_amount") or 0
        invoice_amount = extracted.get("amount") or 0
        if avg_amount > 0:
            multiplier = invoice_amount / avg_amount
            if multiplier >= settings.ANOMALY_MULTIPLIER:
                flags.append(
                    f"Amount is {multiplier:.1f}x this vendor's historical average "
                    f"(${avg_amount:,.2f})."
                )
                score += 30

        if not context.get("vendor_found"):
            flags.append("Vendor has no history in the system — first-time payee.")
            score += 15

        if context.get("po_vendor_mismatch"):
            flags.append(
                f"PO vendor mismatch: invoice cites "
                f"{context.get('matched_po_number')}, but that purchase order "
                f"belongs to a different vendor."
            )
            score += 50
        elif not validation.get("passed"):
            score += 20 * len(validation.get("issues", []))
            flags.append("Failed one or more PO validation checks.")

        if score >= 50:
            risk_level = "high"
        elif score >= 20:
            risk_level = "medium"
        else:
            risk_level = "low"

        result = {
            "risk_score": score,
            "risk_level": risk_level,
            "flags": flags,
        }

        self.log(invoice_id, "assessed", {
            "risk_level": risk_level,
            "risk_score": score,
            "flag_count": len(flags),
        })
        return result
