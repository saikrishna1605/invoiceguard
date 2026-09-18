from app.agents.base import BaseAgent
from app.services.llm_client import extract_invoice_fields


class ExtractAgent(BaseAgent):
    """Reads raw invoice text (already OCR'd/parsed from PDF) and pulls out
    structured fields: vendor name, invoice number, line items, total, due date.
    """

    name = "extract_agent"

    def run(self, invoice_id: int, raw_text: str) -> dict:
        data = extract_invoice_fields(raw_text)
        self.log(invoice_id, "extracted_fields", {
            "vendor_name": data.get("vendor_name"),
            "invoice_number": data.get("invoice_number"),
            "amount": data.get("amount"),
            "method": data.get("extraction_method"),
        })
        return data
