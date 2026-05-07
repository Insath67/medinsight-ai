from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.schemas.report_comparison import ReportComparisonCreate, ReportComparisonResponse
from app.services.report_comparison_service import compare_reports
from app.models.report_comparison import ReportComparison

router = APIRouter(prefix="/report-comparisons", tags=["Report Comparisons"])


@router.post("/", response_model=ReportComparisonResponse)
def create_report_comparison(payload: ReportComparisonCreate, db: Session = Depends(get_db)):
    try:
        comparison = compare_reports(db, payload.old_report_id, payload.new_report_id)
        return comparison
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Comparison failed: {str(e)}")


@router.get("/{comparison_id}", response_model=ReportComparisonResponse)
def get_report_comparison(comparison_id: str, db: Session = Depends(get_db)):
    comparison = db.query(ReportComparison).filter(ReportComparison.id == comparison_id).first()
    if not comparison:
        raise HTTPException(status_code=404, detail="Comparison not found")
    return comparison


@router.get("/patient/{patient_id}")
def get_patient_comparisons(patient_id: str, db: Session = Depends(get_db)):
    comparisons = (
        db.query(ReportComparison)
        .filter(ReportComparison.patient_id == patient_id)
        .order_by(ReportComparison.created_at.desc())
        .all()
    )
    return comparisons