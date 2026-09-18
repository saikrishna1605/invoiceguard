import io


def extract_text_from_upload(filename: str, content: bytes) -> str:
    """Return raw text from an uploaded invoice file (PDF, image, or plain
    text). Real invoices are often scans with no text layer at all, so PDFs
    fall back to OCR when pdfplumber comes back empty, and image uploads
    (a photographed/scanned invoice) go straight to OCR.
    """
    lower = filename.lower()

    if lower.endswith((".png", ".jpg", ".jpeg", ".tif", ".tiff", ".bmp")):
        return _ocr_image_bytes(content)

    if lower.endswith(".pdf"):
        text = _extract_pdf_text_layer(content)
        if text.strip():
            return text
        # No text layer found (scanned/image-only PDF) — fall back to OCR.
        return _ocr_pdf_bytes(content)

    # Fallback: treat as plain text (.txt) — useful for quickly testing
    # synthetic invoices without generating PDFs.
    return content.decode("utf-8", errors="ignore")


def _extract_pdf_text_layer(content: bytes) -> str:
    import pdfplumber

    text_parts = []
    with pdfplumber.open(io.BytesIO(content)) as pdf:
        for page in pdf.pages:
            text_parts.append(page.extract_text() or "")
    return "\n".join(text_parts)


def _ocr_pdf_bytes(content: bytes) -> str:
    from pdf2image import convert_from_bytes

    images = convert_from_bytes(content)
    return "\n".join(_ocr_image(img) for img in images)


def _ocr_image_bytes(content: bytes) -> str:
    from PIL import Image

    img = Image.open(io.BytesIO(content))
    return _ocr_image(img)


def _ocr_image(img) -> str:
    import pytesseract

    return pytesseract.image_to_string(img)
