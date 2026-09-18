from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas import DashboardStats, AlertOut
from app.agents.monitor_agent import MonitorAgent

router = APIRouter(prefix="/dashboard", tags=["dashboard"])


@router.get("/stats", response_model=DashboardStats)
def dashboard_stats(db: Session = Depends(get_db)):
    return MonitorAgent(db).compute_dashboard_stats()


@router.get("/alerts", response_model=list[AlertOut])
def dashboard_alerts(db: Session = Depends(get_db)):
    """High-risk invoices still awaiting a human decision, right now —
    the feed a real deployment would push to Slack/email/ERP.
    """
    return MonitorAgent(db).get_active_alerts()
