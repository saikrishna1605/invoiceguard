from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.database import Base, engine
from app.routers import invoices, vendors, dashboard

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="InvoiceGuard API",
    description=(
        "Agentic invoice processing pipeline: Extract -> Retrieve -> "
        "Validate -> Assess, orchestrated with a mandatory human-approval "
        "gate, plus Monitor for status/alerts. No invoice is ever "
        "auto-approved."
    ),
    version="0.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(invoices.router)
app.include_router(vendors.router)
app.include_router(dashboard.router)


@app.get("/")
def root():
    return {"service": "InvoiceGuard API", "status": "ok"}
