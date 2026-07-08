from typing import List
from sqlalchemy.orm import Session
from fastapi import HTTPException
from app.models.project import Project
from app.models.project_history import ProjectSnapshot

class SnapshotService:
    def create_snapshot(self, db: Session, project: Project, name: str, description: str = None) -> ProjectSnapshot:
        snapshot = ProjectSnapshot(
            project_id=project.id,
            name=name,
            description=description,
            version=project.version,
            dataset_references=project.dataset_references,
            dashboard_layout=project.dashboard_layout,
            filters=project.filters,
            charts=project.charts,
            analytics_results=project.analytics_results,
            ml_models=project.ml_models,
            forecast_results=project.forecast_results,
            theme=project.theme
        )
        db.add(snapshot)
        db.commit()
        db.refresh(snapshot)
        return snapshot

    def get_snapshots(self, db: Session, project_id: str) -> List[ProjectSnapshot]:
        return db.query(ProjectSnapshot).filter(ProjectSnapshot.project_id == project_id).order_by(ProjectSnapshot.created_at.desc()).all()

    def get_snapshot(self, db: Session, snapshot_id: str) -> ProjectSnapshot:
        snapshot = db.query(ProjectSnapshot).filter(ProjectSnapshot.id == snapshot_id).first()
        if not snapshot:
            raise HTTPException(status_code=404, detail="Snapshot not found")
        return snapshot
        
    def restore_snapshot(self, db: Session, snapshot_id: str, project: Project) -> Project:
        snapshot = self.get_snapshot(db, snapshot_id)
        
        project.dataset_references = snapshot.dataset_references
        project.dashboard_layout = snapshot.dashboard_layout
        project.filters = snapshot.filters
        project.charts = snapshot.charts
        project.analytics_results = snapshot.analytics_results
        project.ml_models = snapshot.ml_models
        project.forecast_results = snapshot.forecast_results
        project.theme = snapshot.theme
        
        project.version += 1
        
        db.commit()
        db.refresh(project)
        return project

snapshot_service = SnapshotService()
