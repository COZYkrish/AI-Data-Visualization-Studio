import os
import pandas as pd
from datetime import datetime
from app.models.project import Project
from app.models.report import Report

class ExcelExportService:
    def __init__(self, output_dir="uploads/exports"):
        self.output_dir = output_dir
        if not os.path.exists(self.output_dir):
            os.makedirs(self.output_dir)

    def generate_excel(self, project: Project, report: Report = None) -> str:
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = f"project_{project.id}_{timestamp}.xlsx"
        filepath = os.path.join(self.output_dir, filename)

        with pd.ExcelWriter(filepath, engine='openpyxl') as writer:
            # Sheet 1: Project Info
            info_df = pd.DataFrame({
                "Property": ["Project ID", "Name", "Version", "Created At"],
                "Value": [project.id, project.name, project.version, project.created_at]
            })
            info_df.to_excel(writer, sheet_name="Project Info", index=False)
            
            # Sheet 2: Analytics Summary
            if project.analytics_results:
                analytics_df = pd.DataFrame([{"Summary": "Analytics Present"}])
                analytics_df.to_excel(writer, sheet_name="Analytics", index=False)
                
            # Sheet 3: ML Forecast
            if project.forecast_results:
                forecast_df = pd.DataFrame([{"Summary": "Forecast Present"}])
                forecast_df.to_excel(writer, sheet_name="Forecast", index=False)
                
        return filepath

excel_export_service = ExcelExportService()
