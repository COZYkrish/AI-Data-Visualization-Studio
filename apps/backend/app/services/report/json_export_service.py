import os
import json
from datetime import datetime
from app.models.project import Project
from app.models.report import Report

class JSONExportService:
    def __init__(self, output_dir="uploads/exports"):
        self.output_dir = output_dir
        if not os.path.exists(self.output_dir):
            os.makedirs(self.output_dir)

    def generate_json(self, project: Project, report: Report = None) -> str:
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = f"project_{project.id}_{timestamp}.json"
        filepath = os.path.join(self.output_dir, filename)

        data = {
            "project": {
                "id": project.id,
                "name": project.name,
                "description": project.description,
                "version": project.version,
                "status": project.status,
                "created_at": project.created_at.isoformat() if project.created_at else None,
                "updated_at": project.updated_at.isoformat() if project.updated_at else None,
                "dataset_references": project.dataset_references,
                "dashboard_layout": project.dashboard_layout,
                "filters": project.filters,
                "charts": project.charts,
                "analytics_results": project.analytics_results,
                "ml_models": project.ml_models,
                "forecast_results": project.forecast_results,
                "theme": project.theme
            }
        }
        
        if report:
            data["report"] = {
                "id": report.id,
                "name": report.name,
                "template_type": report.template_type,
                "configuration": report.configuration
            }
            
        with open(filepath, 'w') as f:
            json.dump(data, f, indent=2)
            
        return filepath

json_export_service = JSONExportService()
