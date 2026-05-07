from io import BytesIO
from reportlab.lib.pagesizes import A4
from reportlab.pdfgen import canvas


def build_report_summary_text(
    report,
    analysis=None,
    lab_results=None,
    doctor_note=None
):
    lines = []

    lines.append("MEDINSIGHT AI - REPORT SUMMARY")
    lines.append("=" * 40)
    lines.append("")

    lines.append("REPORT DETAILS")
    lines.append(f"Report ID: {report.id}")
    lines.append(f"File Name: {report.file_name}")
    lines.append(f"Report Type: {report.report_type}")
    lines.append(f"Uploaded At: {report.uploaded_at}")
    lines.append("")

    if analysis:
        lines.append("AI ANALYSIS")
        lines.append(f"Summary: {analysis.summary or 'N/A'}")
        lines.append(f"Key Findings: {analysis.key_findings or 'N/A'}")
        lines.append(f"Doctor Questions: {analysis.doctor_questions or 'N/A'}")
        lines.append("")

    if lab_results:
        lines.append("LAB RESULTS")
        for item in lab_results:
            lines.append(
                f"- {item.test_name}: {item.test_value} "
                f"(Normal Range: {item.normal_range or 'N/A'}, Status: {item.status or 'N/A'})"
            )
        lines.append("")

        abnormal_results = [
            item for item in lab_results
            if item.status and str(item.status).lower() != "normal"
        ]

        if abnormal_results:
            lines.append("ABNORMAL RESULTS")
            for item in abnormal_results:
                lines.append(
                    f"- {item.test_name}: {item.test_value} "
                    f"(Normal Range: {item.normal_range or 'N/A'}, Status: {item.status})"
                )
            lines.append("")

    if doctor_note:
        lines.append("DOCTOR NOTE")
        lines.append(f"Notes: {doctor_note.notes or 'N/A'}")
        lines.append(f"Recommendations: {doctor_note.recommendations or 'N/A'}")
        lines.append(f"Follow Up: {doctor_note.follow_up or 'N/A'}")
        lines.append("")

    return "\n".join(lines)


def build_report_summary_pdf(
    report,
    analysis=None,
    lab_results=None,
    doctor_note=None,
    care_plan=None
):
    buffer = BytesIO()
    pdf = canvas.Canvas(buffer, pagesize=A4)
    width, height = A4

    y = height - 50

    def write_line(text="", gap=18):
        nonlocal y
        if y < 50:
            pdf.showPage()
            y = height - 50
        pdf.drawString(40, y, str(text))
        y -= gap

    write_line("MEDINSIGHT AI - REPORT SUMMARY PDF", 22)
    write_line("=" * 50, 20)

    write_line("REPORT DETAILS", 20)
    write_line(f"Report ID: {report.id}")
    write_line(f"File Name: {report.file_name}")
    write_line(f"Report Type: {report.report_type}")
    write_line(f"Uploaded At: {report.uploaded_at}")
    write_line("")

    if analysis:
        write_line("AI ANALYSIS", 20)
        write_line(f"Summary: {analysis.summary or 'N/A'}")
        write_line(f"Key Findings: {analysis.key_findings or 'N/A'}")
        write_line(f"Doctor Questions: {analysis.doctor_questions or 'N/A'}")
        write_line("")

    if lab_results:
        write_line("LAB RESULTS", 20)
        for item in lab_results:
            write_line(
                f"- {item.test_name}: {item.test_value} "
                f"(Normal: {item.normal_range or 'N/A'}, Status: {item.status or 'N/A'})"
            )
        write_line("")

        abnormal_results = [
            item for item in lab_results
            if item.status and str(item.status).lower() != "normal"
        ]

        if abnormal_results:
            write_line("ABNORMAL RESULTS", 20)
            for item in abnormal_results:
                write_line(
                    f"- {item.test_name}: {item.test_value} "
                    f"(Normal: {item.normal_range or 'N/A'}, Status: {item.status})"
                )
            write_line("")

    if doctor_note:
        write_line("DOCTOR NOTE", 20)
        write_line(f"Notes: {doctor_note.notes or 'N/A'}")
        write_line(f"Recommendations: {doctor_note.recommendations or 'N/A'}")
        write_line(f"Follow Up: {doctor_note.follow_up or 'N/A'}")
        write_line("")

    if care_plan:
        write_line("CARE PLAN", 20)
        write_line(f"Medicines: {care_plan.medicines or 'N/A'}")
        write_line(f"Dosage: {care_plan.dosage or 'N/A'}")
        write_line(f"Instructions: {care_plan.instructions or 'N/A'}")
        write_line(f"Follow-up Advice: {care_plan.follow_up_advice or 'N/A'}")
        write_line(f"Status: {care_plan.status or 'N/A'}")
        write_line("")

    pdf.save()
    buffer.seek(0)
    return buffer