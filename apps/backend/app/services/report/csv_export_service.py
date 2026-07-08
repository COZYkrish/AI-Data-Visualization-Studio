import os
import json
import pandas as pd
from datetime import datetime
from app.models.project import Project
from app.models.report import Report

class CSVExportService:
    def __init__(self, output_dir="uploads/exports"):
        self.output_dir = output_dir
        if not os.path.exists(self.output_dir):
            os.makedirs(self.output_dir)

    def generate_csv(self, project: Project, report: Report = None) -> str:
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = f"project_{project.id}_{timestamp}.csv"
        filepath = os.path.join(self.output_dir, filename)

        # In a real app, we'd load the dataset, filter it, and export it.
        # Here we'll export project metadata as a simple CSV to demonstrate.
        data = {
            "Project ID": [project.id],
            "Project Name": [project.name],
            "Created At": [project.created_at],
            "Version": [project.version]
        }
        
        df = pd.DataFrame(data)
        df.to_csv(filepath, index=False)
        
        return filepath

csv_export_service = CSVExportService()
