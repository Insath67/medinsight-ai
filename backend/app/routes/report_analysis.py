from datetime import datetime, timedelta

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.user import User
from app.models.medical_report import MedicalReport
from app.models.report_analysis import ReportAnalysis
from app.models.lab_test_result import LabTestResult
from app.models.reminder import Reminder
from app.services.report_reader import extract_text_from_report
from app.services.gemini_service import analyze_medical_report_text
from app.services.medical_explainer import explain_lab_value
from app.services.trend_analyzer import analyze_trend
from app.services.gemini_lab_extractor import extract_lab_values_with_gemini
from app.services.notification_service import create_notification
from app.services.reminder_service import create_reminder
from app.services.report_comparator import compare_lab_results
from app.services.audit_log_service import create_audit_log
from app.services.clinical_interpreter import (
    interpret_single_result,
    interpret_comparison_result,
    build_comparison_clinical_summary
)
from app.utils.permissions import require_patient

router = APIRouter(prefix="/reports", tags=["Report Analysis"])


def parse_ai_response(ai_text: str):
    summary = ""
    key_findings = ""
    doctor_questions = ""

    if "SUMMARY:" in ai_text and "KEY_FINDINGS:" in ai_text and "DOCTOR_QUESTIONS:" in ai_text:
        try:
            summary_part = ai_text.split("SUMMARY:")[1].split("KEY_FINDINGS:")[0].strip()
            findings_part = ai_text.split("KEY_FINDINGS:")[1].split("DOCTOR_QUESTIONS:")[0].strip()
            questions_part = ai_text.split("DOCTOR_QUESTIONS:")[1].strip()

            summary = summary_part
            key_findings = findings_part
            doctor_questions = questions_part
        except Exception:
            summary = ai_text
    else:
        summary = ai_text

    return summary, key_findings, doctor_questions


@router.post("/analyze/{report_id}")
def analyze_report(
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

    existing_analysis = db.query(ReportAnalysis).filter(
        ReportAnalysis.report_id == report.id
    ).first()

    if existing_analysis:
        return {
            "message": "Report already analyzed",
            "analysis": {
                "id": str(existing_analysis.id),
                "report_id": str(existing_analysis.report_id),
                "extracted_text": existing_analysis.extracted_text,
                "summary": existing_analysis.summary,
                "key_findings": existing_analysis.key_findings,
                "doctor_questions": existing_analysis.doctor_questions
            }
        }

    extracted_text = extract_text_from_report(report.file_path)

    if not extracted_text:
        raise HTTPException(status_code=400, detail="Could not extract text from PDF")

    ai_result = analyze_medical_report_text(extracted_text)
    summary, key_findings, doctor_questions = parse_ai_response(ai_result)

    new_analysis = ReportAnalysis(
        report_id=report.id,
        extracted_text=extracted_text,
        summary=summary,
        key_findings=key_findings,
        doctor_questions=doctor_questions
    )

    db.add(new_analysis)
    db.commit()
    db.refresh(new_analysis)

    create_notification(
        db=db,
        user_id=report.patient_id,
        title="AI Analysis Completed",
        message="Your report analysis has been completed successfully.",
        type="ai_analysis_completed"
    )

    create_audit_log(
        db=db,
        user_id=current_user.id,
        action="REPORT_ANALYZED",
        target_type="ReportAnalysis",
        target_id=str(new_analysis.id),
        description=f"AI analysis completed for report {report.id}"
    )

    return {
        "message": "Report analyzed successfully",
        "analysis": {
            "id": str(new_analysis.id),
            "report_id": str(new_analysis.report_id),
            "summary": new_analysis.summary,
            "key_findings": new_analysis.key_findings,
            "doctor_questions": new_analysis.doctor_questions
        }
    }


@router.post("/regenerate-analysis/{report_id}")
def regenerate_report_analysis(
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

    extracted_text = extract_text_from_report(report.file_path)

    if not extracted_text:
        raise HTTPException(status_code=400, detail="Could not extract text from report")

    existing_analysis = db.query(ReportAnalysis).filter(
        ReportAnalysis.report_id == report.id
    ).first()

    if existing_analysis:
        db.delete(existing_analysis)
        db.commit()

    ai_result = analyze_medical_report_text(extracted_text)
    summary, key_findings, doctor_questions = parse_ai_response(ai_result)

    new_analysis = ReportAnalysis(
        report_id=report.id,
        extracted_text=extracted_text,
        summary=summary,
        key_findings=key_findings,
        doctor_questions=doctor_questions
    )

    db.add(new_analysis)
    db.commit()
    db.refresh(new_analysis)

    create_notification(
        db=db,
        user_id=report.patient_id,
        title="AI Analysis Regenerated",
        message="Your report analysis has been regenerated successfully.",
        type="ai_analysis_completed"
    )

    create_audit_log(
        db=db,
        user_id=current_user.id,
        action="REPORT_ANALYSIS_REGENERATED",
        target_type="ReportAnalysis",
        target_id=str(new_analysis.id),
        description=f"AI analysis regenerated for report {report.id}"
    )

    return {
        "message": "Report analysis regenerated successfully",
        "analysis": {
            "id": str(new_analysis.id),
            "report_id": str(new_analysis.report_id),
            "extracted_text": new_analysis.extracted_text,
            "summary": new_analysis.summary,
            "key_findings": new_analysis.key_findings,
            "doctor_questions": new_analysis.doctor_questions
        }
    }


@router.get("/analysis/{report_id}")
def get_report_analysis(
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

    if not analysis:
        raise HTTPException(status_code=404, detail="Analysis not found")

    return {
        "id": str(analysis.id),
        "report_id": str(analysis.report_id),
        "extracted_text": analysis.extracted_text,
        "summary": analysis.summary,
        "key_findings": analysis.key_findings,
        "doctor_questions": analysis.doctor_questions
    }


@router.post("/detect-values/{report_id}")
def detect_report_values(
    report_id: str,
    current_user: User = Depends(require_patient),
    db: Session = Depends(get_db)
):
    try:
        report = db.query(MedicalReport).filter(
            MedicalReport.id == report_id,
            MedicalReport.patient_id == current_user.id
        ).first()

        if not report:
            raise HTTPException(status_code=404, detail="Report not found")

        existing_results = db.query(LabTestResult).filter(
            LabTestResult.report_id == report.id
        ).all()

        if existing_results:
            return {
                "message": "Lab values already stored for this report",
                "report_id": report_id,
                "detected_values": [
                    {
                        "test": item.test_name,
                        "value": item.test_value,
                        "normal_range": item.normal_range,
                        "status": item.status
                    }
                    for item in existing_results
                ]
            }

        extracted_text = extract_text_from_report(report.file_path)

        if not extracted_text:
            raise HTTPException(status_code=400, detail="No text detected from report")

        detected_values = extract_lab_values_with_gemini(extracted_text)

        if not isinstance(detected_values, list):
            detected_values = []

        saved_values = []

        for item in detected_values:
            if not isinstance(item, dict):
                continue

            test_name = str(
                item.get("test")
                or item.get("test_name")
                or item.get("name")
                or item.get("parameter")
                or ""
            ).strip()

            test_value = str(
                item.get("value")
                or item.get("test_value")
                or item.get("result")
                or item.get("finding")
                or ""
            ).strip()

            normal_range = str(
                item.get("normal_range")
                or item.get("reference_range")
                or item.get("range")
                or ""
            ).strip()

            status = str(item.get("status") or "UNKNOWN").upper().strip()

            if status not in ["NORMAL", "HIGH", "LOW", "ABNORMAL", "UNKNOWN"]:
                status = "UNKNOWN"

            if not test_name or not test_value:
                continue

            new_result = LabTestResult(
                report_id=report.id,
                patient_id=current_user.id,
                test_name=test_name,
                test_value=test_value,
                normal_range=normal_range,
                status=status
            )

            db.add(new_result)

            saved_values.append({
                "test": test_name,
                "value": test_value,
                "normal_range": normal_range,
                "status": status
            })

        db.commit()

        abnormal_values = [
            item for item in saved_values
            if str(item.get("status", "")).upper() != "NORMAL"
        ]

        if abnormal_values:
            try:
                create_notification(
                    db=db,
                    user_id=report.patient_id,
                    title="Abnormal Values Detected",
                    message="Some abnormal lab values were detected in your uploaded report.",
                    type="abnormal_values_detected"
                )

                existing_reminder = db.query(Reminder).filter(
                    Reminder.user_id == report.patient_id,
                    Reminder.reminder_type == "repeat_test",
                    Reminder.title == f"Repeat Test Reminder - Report {report.id}",
                    Reminder.is_completed == False
                ).first()

                if not existing_reminder:
                    create_reminder(
                        db=db,
                        user_id=report.patient_id,
                        title=f"Repeat Test Reminder - Report {report.id}",
                        message="Some abnormal lab values were found. Please repeat your test or consult your doctor.",
                        reminder_type="repeat_test",
                        due_at=datetime.utcnow() + timedelta(days=7)
                    )
            except Exception as notify_error:
                print("Notification/reminder creation skipped:", str(notify_error))

        return {
            "message": "Lab values detected and saved successfully",
            "report_id": report_id,
            "detected_values": saved_values
        }

    except HTTPException:
        raise

    except Exception as e:
        db.rollback()
        print("Detect values endpoint error:", str(e))
        raise HTTPException(
            status_code=500,
            detail=f"Detect values failed: {str(e)}"
        )


@router.post("/explain-values/{report_id}")
def explain_report_values(
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

    extracted_text = extract_text_from_report(report.file_path)

    if not extracted_text:
        raise HTTPException(status_code=400, detail="No text detected")

    detected_values = extract_lab_values_with_gemini(extracted_text)

    explanations = []
    for item in detected_values:
        explanation = explain_lab_value(
            test=item["test"],
            value=item["value"],
            normal_range=item.get("normal_range"),
            status=item["status"]
        )

        explanations.append({
            "test": item["test"],
            "value": item["value"],
            "unit": item.get("unit"),
            "normal_range": item.get("normal_range"),
            "status": item["status"],
            "explanation": explanation
        })

    return {
        "report_id": report_id,
        "explanations": explanations
    }


@router.get("/lab-results/{report_id}")
def get_saved_lab_results(
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

    results = db.query(LabTestResult).filter(
        LabTestResult.report_id == report.id
    ).all()

    return {
        "report_id": report_id,
        "lab_results": [
            {
                "id": str(item.id),
                "test_name": item.test_name,
                "test_value": item.test_value,
                "normal_range": item.normal_range,
                "status": item.status,
                "clinical_interpretation": interpret_single_result(
                    test_name=item.test_name,
                    value=item.test_value,
                    normal_range=item.normal_range,
                    status=item.status
                )
            }
            for item in results
        ]
    }


@router.get("/health-trend/{test_name}")
def get_health_trend(
    test_name: str,
    current_user: User = Depends(require_patient),
    db: Session = Depends(get_db)
):
    results = db.query(LabTestResult).filter(
        LabTestResult.patient_id == current_user.id,
        LabTestResult.test_name.ilike(test_name)
    ).order_by(LabTestResult.created_at.asc()).all()

    if not results:
        raise HTTPException(status_code=404, detail="No lab results found for this test")

    history = []
    values = []

    for item in results:
        history.append({
            "date": item.created_at.strftime("%Y-%m-%d"),
            "value": item.test_value,
            "status": item.status
        })
        values.append(item.test_value)

    trend_result = analyze_trend(values)

    return {
        "test_name": test_name,
        "history": history,
        "trend": trend_result["trend"],
        "message": trend_result["message"]
    }


@router.get("/compare/{old_report_id}/{new_report_id}")
def compare_reports(
    old_report_id: str,
    new_report_id: str,
    current_user: User = Depends(require_patient),
    db: Session = Depends(get_db)
):
    old_report = db.query(MedicalReport).filter(
        MedicalReport.id == old_report_id,
        MedicalReport.patient_id == current_user.id
    ).first()

    if not old_report:
        raise HTTPException(status_code=404, detail="Old report not found")

    new_report = db.query(MedicalReport).filter(
        MedicalReport.id == new_report_id,
        MedicalReport.patient_id == current_user.id
    ).first()

    if not new_report:
        raise HTTPException(status_code=404, detail="New report not found")

    old_results = db.query(LabTestResult).filter(
        LabTestResult.report_id == old_report.id
    ).all()

    new_results = db.query(LabTestResult).filter(
        LabTestResult.report_id == new_report.id
    ).all()

    if not old_results or not new_results:
        raise HTTPException(
            status_code=400,
            detail="Both reports must have saved lab results before comparison"
        )

    old_data = [
        {
            "test_name": item.test_name,
            "value": item.test_value,
            "status": item.status
        }
        for item in old_results
    ]

    new_data = [
        {
            "test_name": item.test_name,
            "value": item.test_value,
            "status": item.status
        }
        for item in new_results
    ]

    comparison_result = compare_lab_results(old_data, new_data)

    clinical_interpretations = [
        interpret_comparison_result(item)
        for item in comparison_result["comparisons"]
    ]

    clinical_summary = build_comparison_clinical_summary(
        comparison_result["comparisons"]
    )

    return {
        "old_report_id": str(old_report.id),
        "new_report_id": str(new_report.id),
        "summary": comparison_result["summary"],
        "comparisons": comparison_result["comparisons"],
        "clinical_interpretations": clinical_interpretations,
        "clinical_summary": clinical_summary
    }


@router.get("/health-trend-summary")
def get_health_trend_summary(
    current_user: User = Depends(require_patient),
    db: Session = Depends(get_db)
):
    results = db.query(LabTestResult).filter(
        LabTestResult.patient_id == current_user.id
    ).order_by(
        LabTestResult.test_name.asc(),
        LabTestResult.created_at.asc()
    ).all()

    if not results:
        raise HTTPException(status_code=404, detail="No lab results found")

    grouped = {}

    for item in results:
        test_name = item.test_name.strip() if item.test_name else "Unknown"

        if test_name not in grouped:
            grouped[test_name] = []

        grouped[test_name].append({
            "date": item.created_at.strftime("%Y-%m-%d"),
            "value": item.test_value,
            "status": item.status
        })

    trend_summaries = []
    improving_tests = []
    worsening_tests = []
    stable_tests = []
    insufficient_data_tests = []

    for test_name, history in grouped.items():
        values = [entry["value"] for entry in history]
        trend_result = analyze_trend(values)
        latest_status = history[-1]["status"] if history else None

        summary_item = {
            "test_name": test_name,
            "history": history,
            "trend": trend_result["trend"],
            "message": trend_result["message"],
            "clinical_note": (
                "Requires follow-up"
                if latest_status and str(latest_status).lower() != "normal"
                else "Currently stable"
            )
        }

        trend_summaries.append(summary_item)

        trend_lower = str(trend_result["trend"]).lower()

        if trend_lower in ["decreasing", "improving"]:
            improving_tests.append(test_name)
        elif trend_lower in ["increasing", "worsening"]:
            worsening_tests.append(test_name)
        elif trend_lower == "stable":
            stable_tests.append(test_name)
        else:
            insufficient_data_tests.append(test_name)

    return {
        "total_tests": len(trend_summaries),
        "improving_tests": improving_tests,
        "worsening_tests": worsening_tests,
        "stable_tests": stable_tests,
        "insufficient_data_tests": insufficient_data_tests,
        "trend_summaries": trend_summaries
    }