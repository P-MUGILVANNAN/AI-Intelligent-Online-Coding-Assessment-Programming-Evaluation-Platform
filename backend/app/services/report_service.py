import io
import csv
from datetime import datetime
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib import colors

class ReportService:
    @staticmethod
    def generate_assessment_csv(assessment_title: str, results: list) -> str:
        output = io.StringIO()
        writer = csv.writer(output)
        writer.writerow([
            "Assessment", "Student Name", "Email", "Total Score",
            "Percentage", "Status", "Submission Time", "Violations"
        ])
        for r in results:
            writer.writerow([
                assessment_title,
                r.get("student_name", "N/A"),
                r.get("student_email", "N/A"),
                r.get("score", 0),
                f"{r.get('percentage', 0)}%",
                r.get("status", "Completed"),
                r.get("submitted_at", "N/A"),
                r.get("violations", 0)
            ])
        return output.getvalue()

    @staticmethod
    def generate_student_pdf(
        student_name: str,
        assessment_title: str,
        total_marks: float,
        obtained_marks: float,
        percentage: float,
        submissions_data: list,
        quality_feedback: list
    ) -> bytes:
        buffer = io.BytesIO()
        doc = SimpleDocTemplate(buffer, pagesize=letter, rightMargin=36, leftMargin=36, topMargin=36, bottomMargin=36)
        styles = getSampleStyleSheet()
        
        # Custom styles
        title_style = ParagraphStyle(
            'TitleStyle',
            parent=styles['Heading1'],
            fontSize=22,
            leading=26,
            textColor=colors.HexColor("#2F2D7D"),
            alignment=1
        )
        subtitle_style = ParagraphStyle(
            'SubTitleStyle',
            parent=styles['Normal'],
            fontSize=11,
            leading=14,
            textColor=colors.HexColor("#475569"),
            alignment=1
        )
        h2_style = ParagraphStyle(
            'H2Style',
            parent=styles['Heading2'],
            fontSize=14,
            leading=18,
            textColor=colors.HexColor("#0f172a"),
            spaceBefore=12,
            spaceAfter=6
        )
        body_style = ParagraphStyle(
            'BodyStyle',
            parent=styles['Normal'],
            fontSize=10,
            leading=13,
            textColor=colors.HexColor("#334155")
        )

        elements = []

        # Title & Header
        elements.append(Paragraph("FIIT Coding Assessment - Performance Evaluation Report", title_style))
        elements.append(Paragraph(f"Generated on {datetime.now().strftime('%Y-%m-%d %H:%M UTC')}", subtitle_style))
        elements.append(Spacer(1, 15))

        # Student & Assessment Summary Table
        summary_data = [
            [Paragraph("<b>Candidate Name:</b>", body_style), Paragraph(student_name, body_style),
             Paragraph("<b>Assessment:</b>", body_style), Paragraph(assessment_title, body_style)],
            [Paragraph("<b>Total Marks:</b>", body_style), Paragraph(str(total_marks), body_style),
             Paragraph("<b>Marks Obtained:</b>", body_style), Paragraph(f"<b>{obtained_marks} ({percentage:.1f}%)</b>", body_style)],
            [Paragraph("<b>Evaluation Result:</b>", body_style),
             Paragraph("<font color='green'><b>PASSED</b></font>" if percentage >= 50 else "<font color='red'><b>NEEDS IMPROVEMENT</b></font>", body_style),
             Paragraph("<b>Verified By:</b>", body_style), Paragraph("FIIT Evaluation Engine", body_style)]
        ]
        summary_table = Table(summary_data, colWidths=[100, 160, 100, 160])
        summary_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor("#f8fafc")),
            ('BOX', (0, 0), (-1, -1), 1, colors.HexColor("#cbd5e1")),
            ('INNERGRID', (0, 0), (-1, -1), 0.5, colors.HexColor("#e2e8f0")),
            ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
            ('TOPPADDING', (0, 0), (-1, -1), 6),
        ]))
        elements.append(summary_table)
        elements.append(Spacer(1, 15))

        # Question-wise Breakdown
        elements.append(Paragraph("Question Evaluation Breakdown", h2_style))
        sub_table_data = [["Question", "Language", "Verdict", "Test Cases", "Time (s)", "Memory (MB)", "Score"]]
        for sub in submissions_data:
            sub_table_data.append([
                Paragraph(sub.get("question_title", "Question"), body_style),
                sub.get("programming_language", "Python"),
                sub.get("verdict", "Accepted"),
                f"{sub.get('passed_test_cases', 0)}/{sub.get('total_test_cases', 0)}",
                f"{sub.get('execution_time', 0.0):.3f}",
                f"{sub.get('memory_usage', 0.0):.1f}",
                f"{sub.get('score', 0):.0f}"
            ])
        sub_table = Table(sub_table_data, colWidths=[150, 60, 90, 70, 50, 60, 40])
        sub_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor("#2F2D7D")),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor("#cbd5e1")),
            ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
            ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.HexColor("#f8fafc")]),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 5),
            ('TOPPADDING', (0, 0), (-1, -1), 5),
        ]))
        elements.append(sub_table)
        elements.append(Spacer(1, 15))

        # AI Quality Feedback
        if quality_feedback:
            elements.append(Paragraph("AI Code Quality & Complexity Feedback", h2_style))
            for qf in quality_feedback:
                elements.append(Paragraph(f"<b>{qf.get('question_title', 'Solution')}:</b> Quality Score: {qf.get('quality_score', 85)}/100 | Complexity: {qf.get('complexity', 1)} | Time: {qf.get('time_complexity', 'O(N)')}", body_style))
                elements.append(Paragraph(f"<i>{qf.get('explanation', '')}</i>", subtitle_style))
                elements.append(Spacer(1, 4))
                for sug in qf.get("suggestions", []):
                    elements.append(Paragraph(f"• {sug}", body_style))
                elements.append(Spacer(1, 8))

        doc.build(elements)
        buffer.seek(0)
        return buffer.getvalue()
