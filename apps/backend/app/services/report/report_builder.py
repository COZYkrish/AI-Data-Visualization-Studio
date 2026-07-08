from app.models.project import Project
from app.models.report import Report, ExportFormat
from app.services.report.pdf_export_service import pdf_export_service
from app.services.report.csv_export_service import csv_export_service
from app.services.report.excel_export_service import excel_export_service
from app.services.report.json_export_service import json_export_service

class ReportBuilder:
    def build_export(self, project: Project, report: Report, format: ExportFormat) -> str:
        if format == ExportFormat.PDF:
            return pdf_export_service.generate_pdf(project, report)
        elif format == ExportFormat.CSV:
            return csv_export_service.generate_csv(project, report)
        elif format == ExportFormat.EXCEL:
            return excel_export_service.generate_excel(project, report)
        elif format == ExportFormat.JSON:
            return json_export_service.generate_json(project, report)
        else:
            raise ValueError(f"Unsupported export format: {format}")

report_builder = ReportBuilder()
