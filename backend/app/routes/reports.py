import os
import uuid
import shutil
from uuid import uuid4

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from fastapi.responses import PlainTextResponse, FileResponse, StreamingResponse
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.user import User
from app.models.medical_report import MedicalReport
from app.models.report_analysis import ReportAnalysis
from app.models.lab_test_result import LabTestResult
from app.models.doctor_note import DoctorNote
from app.models.care_plan import CarePlan
from app.services.notification_service import create_notification
from app.services.audit_log_service import create_audit_log
from app.services.report_exporter import (
    build_report_summary_text,
    build_report_summary_pdf,
)
from app.utils.permissions import require_patient
from app.routes.auth import get_current_user

router = APIRouter(prefix="/reports", tags=["Reports"])

UPLOAD_DIR = "/tmp/reports"
os.makedirs(UPLOAD_DIR, exist_ok=True)


@router.post("/upload")
def upload_report(
    report_file: UploadFile = File(...),
    report_type: str = Form(None),
    current_user: User = Depends(require_patient),
    db: Session = Depends(get_db)
):
    allowed_types = [".pdf", ".png", ".jpg", ".jpeg"]
    file_ext = os.path.splitext(report_file.filename)[1].lower()

    if file_ext not in allowed_types:
        raise HTTPException(
            status_code=400,
            detail="Only PDF, PNG, JPG, JPEG files are allowed"
        )

    unique_filename = f"{uuid.uuid4()}{file_ext}"
    save_path = os.path.join(UPLOAD_DIR, unique_filename)

    with open(save_path, "wb") as buffer:
        buffer.write(report_file.file.read())

    new_report = MedicalReport(
        patient_id=current_user.id,
        file_name=report_file.filename,
        stored_file_name=unique_filename,
        file_path=save_path,
        report_type=report_type
    )

    db.add(new_report)
    db.commit()
    db.refresh(new_report)

    create_notification(
        db=db,
        user_id=new_report.patient_id,
        title="Report Uploaded",
        message="Your medical report has been uploaded successfully.",
        type="report_uploaded"
    )

    create_audit_log(
        db=db,
        user_id=current_user.id,
        action="REPORT_UPLOADED",
        target_type="MedicalReport",
        target_id=str(new_report.id),
        description=f"Patient uploaded report: {new_report.file_name}"
    )

    return {
        "message": "Report uploaded successfully",
        "report": {
            "id": str(new_report.id),
            "patient_id": str(new_report.patient_id),
            "file_name": new_report.file_name,
            "stored_file_name": new_report.stored_file_name,
            "file_path": new_report.file_path,
            "report_type": new_report.report_type,
            "uploaded_at": new_report.uploaded_at
        }
    }


@router.get("/my-reports")
def get_my_reports(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.role != "patient":
        raise HTTPException(status_code=403, detail="Only patients can view their reports")

    reports = db.query(MedicalReport).filter(
        MedicalReport.patient_id == current_user.id
    ).all()

    return [
        {
            "id": str(report.id),
            "patient_id": str(report.patient_id),
            "file_name": report.file_name,
            "stored_file_name": report.stored_file_name,
            "file_path": report.file_path,
            "report_type": report.report_type,
            "uploaded_at": report.uploaded_at,
        }
        for report in reports
    ]


@router.get("/{report_id}")
def get_single_report(
    report_id: str,
    current_user: User = Depends(require_patient),
    db: Session = Depends(get_db)
):
    report = db.query(MedicalReport).filter(
        MedicalReport.id == report_id,
        MedicalReport.patient_id == current_user.id
    ).first()

    if not report:
        raise HTTPException(status_code=404, detail="Report not found")

    return {
        "id": str(report.id),
        "patient_id": str(report.patient_id),
        "file_name": report.file_name,
        "stored_file_name": report.stored_file_name,
        "file_path": report.file_path,
        "report_type": report.report_type,
        "uploaded_at": report.uploaded_at
    }


@router.get("/export-summary/{report_id}", response_class=PlainTextResponse)
def export_report_summary(
    report_id: str,
    current_user: User = Depends(require_patient),
    db: Session = Depends(get_db)
):
    report = db.query(MedicalReport).filter(
        MedicalReport.id == report_id,
        MedicalReport.patient_id == current_user.id
    ).first()

    if not report:
        raise HTTPException(status_code=404, detail="Report not found")

    analysis = db.query(ReportAnalysis).filter(
        ReportAnalysis.report_id == report.id
    ).first()

    lab_results = db.query(LabTestResult).filter(
        LabTestResult.report_id == report.id
    ).all()

    doctor_note = None

    summary_text = build_report_summary_text(
        report=report,
        analysis=analysis,
        lab_results=lab_results,
        doctor_note=doctor_note
    )

    return summary_text


@router.get("/download/{report_id}")
def download_report(
    report_id: str,
    current_user: User = Depends(require_patient),
    db: Session = Depends(get_db)
):
    report = db.query(MedicalReport).filter(
        MedicalReport.id == report_id,
        MedicalReport.patient_id == current_user.id
    ).first()

    if not report:
        raise HTTPException(status_code=404, detail="Report not found")

    if not report.file_path or not os.path.exists(report.file_path):
        raise HTTPException(status_code=404, detail="File not found on server")

    return FileResponse(
        path=report.file_path,
        filename=report.file_name,
        media_type="application/octet-stream"
    )


@router.delete("/{report_id}")
def delete_report(
    report_id: str,
    current_user: User = Depends(require_patient),
    db: Session = Depends(get_db)
):
    report = db.query(MedicalReport).filter(
        MedicalReport.id == report_id,
        MedicalReport.patient_id == current_user.id
    ).first()

    if not report:
        raise HTTPException(status_code=404, detail="Report not found")

    analysis = db.query(ReportAnalysis).filter(
        ReportAnalysis.report_id == report.id
    ).first()

    if analysis:
        db.delete(analysis)

    lab_results = db.query(LabTestResult).filter(
        LabTestResult.report_id == report.id
    ).all()

    for item in lab_results:
        db.delete(item)

    if report.file_path and os.path.exists(report.file_path):
        os.remove(report.file_path)

    db.delete(report)
    db.commit()

    return {
        "message": "Report deleted successfully"
    }


@router.put("/replace/{report_id}")
def replace_report(
    report_id: str,
    file: UploadFile = File(...),
    report_type: str = Form(...),
    current_user: User = Depends(require_patient),
    db: Session = Depends(get_db)
):
    report = db.query(MedicalReport).filter(
        MedicalReport.id == report_id,
        MedicalReport.patient_id == current_user.id
    ).first()

    if not report:
        raise HTTPException(status_code=404, detail="Report not found")

    allowed_extensions = [".pdf", ".png", ".jpg", ".jpeg"]
    file_ext = os.path.splitext(file.filename)[1].lower()

    if file_ext not in allowed_extensions:
        raise HTTPException(status_code=400, detail="Invalid file type")

    if report.file_path and os.path.exists(report.file_path):
        os.remove(report.file_path)

    old_analysis = db.query(ReportAnalysis).filter(
        ReportAnalysis.report_id == report.id
    ).first()

    if old_analysis:
        db.delete(old_analysis)

    old_lab_results = db.query(LabTestResult).filter(
        LabTestResult.report_id == report.id
    ).all()

    for item in old_lab_results:
        db.delete(item)

    unique_filename = f"{uuid4()}{file_ext}"
    upload_dir = os.path.dirname(report.file_path) if report.file_path else UPLOAD_DIR
    os.makedirs(upload_dir, exist_ok=True)

    new_file_path = os.path.join(upload_dir, unique_filename)

    with open(new_file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    report.file_name = file.filename
    report.stored_file_name = unique_filename
    report.file_path = new_file_path
    report.report_type = report_type

    db.commit()
    db.refresh(report)

    return {
        "message": "Report replaced successfully. Previous analysis and lab results were cleared.",
        "report": {
            "id": str(report.id),
            "patient_id": str(report.patient_id),
            "file_name": report.file_name,
            "stored_file_name": report.stored_file_name,
            "file_path": report.file_path,
            "report_type": report.report_type,
            "uploaded_at": report.uploaded_at
        }
    }


@router.get("/export-summary-pdf/{report_id}")
def export_report_summary_pdf(
    report_id: str,
    current_user: User = Depends(require_patient),
    db: Session = Depends(get_db)
):
    report = db.query(MedicalReport).filter(
        MedicalReport.id == report_id,
        MedicalReport.patient_id == current_user.id
    ).first()

    if not report:
        raise HTTPException(status_code=404, detail="Report not found")

    analysis = db.query(ReportAnalysis).filter(
        ReportAnalysis.report_id == report.id
    ).first()

    lab_results = db.query(LabTestResult).filter(
        LabTestResult.report_id == report.id
    ).all()

    doctor_note = None

    care_plan = db.query(CarePlan).filter(
        CarePlan.patient_id == current_user.id,
        CarePlan.consultation_id.isnot(None)
    ).order_by(CarePlan.created_at.desc()).first()

    pdf_buffer = build_report_summary_pdf(
        report=report,
        analysis=analysis,
        lab_results=lab_results,
        doctor_note=doctor_note,
        care_plan=care_plan
    )

    return StreamingResponse(
        pdf_buffer,
        media_type="application/pdf",
        headers={
            "Content-Disposition": f'attachment; filename="report_summary_{report_id}.pdf"'
        }
    )