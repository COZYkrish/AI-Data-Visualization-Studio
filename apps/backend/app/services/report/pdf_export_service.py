import os
import json
from datetime import datetime
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from typing import Any
from app.models.project import Project
from app.models.report import Report

class PDFExportService:
    def __init__(self, output_dir="uploads/exports"):
        self.output_dir = output_dir
        if not os.path.exists(self.output_dir):
            os.makedirs(self.output_dir)

    def generate_pdf(self, project: Project, report: Report = None) -> str:
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = f"project_{project.id}_{timestamp}.pdf"
        filepath = os.path.join(self.output_dir, filename)

        doc = SimpleDocTemplate(filepath, pagesize=letter)
        styles = getSampleStyleSheet()
        
        # Add some custom styles
        styles.add(ParagraphStyle(name='CenterTitle', parent=styles['Heading1'], alignment=1))
        
        Story: list[Any] = []
        
        # Title Page
        title = report.name if report else project.name
        Story.append(Paragraph(f"<b>{title}</b>", styles['CenterTitle']))
        Story.append(Spacer(1, 12))
        
        desc = report.description if report and report.description else project.description
        if desc:
            Story.append(Paragraph(desc, styles['Normal']))
            Story.append(Spacer(1, 12))
            
        # Add basic project info
        Story.append(Paragraph("<b>Project Information</b>", styles['Heading2']))
        Story.append(Paragraph(f"Generated at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}", styles['Normal']))
        Story.append(Spacer(1, 12))
        
        if project.analytics_results:
            Story.append(Paragraph("<b>Analytics Overview</b>", styles['Heading2']))
            # Simplified summary of analytics
            summary = "Analytics data present in the project."
            Story.append(Paragraph(summary, styles['Normal']))
            Story.append(Spacer(1, 12))
            
        if project.forecast_results:
            Story.append(Paragraph("<b>Forecast Results</b>", styles['Heading2']))
            Story.append(Paragraph("Forecast data present in the project.", styles['Normal']))
            Story.append(Spacer(1, 12))

        doc.build(Story)
        
        return filepath

pdf_export_service = PDFExportService()
