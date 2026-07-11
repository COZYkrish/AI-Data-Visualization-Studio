"""
Shortcut Service — Phase 9: Premium Features

Manages the user's keyboard shortcut registry.
Provides default shortcuts and allows per-user customization with conflict detection.
"""
from __future__ import annotations

from typing import List, Optional
from sqlalchemy.orm import Session
import structlog

from app.models.premium import SavedShortcut
from app.schemas.premium import ShortcutUpdate

logger = structlog.get_logger(__name__)

# ─── Default Shortcut Registry ────────────────────────────────────────────────

DEFAULT_SHORTCUTS = [
    {"action_id": "open_command_palette", "label": "Open Command Palette", "default_keys": ["mod", "k"], "category": "navigation"},
    {"action_id": "search",              "label": "Search",                "default_keys": ["mod", "f"], "category": "navigation"},
    {"action_id": "toggle_theme",        "label": "Toggle Theme",          "default_keys": ["mod", "shift", "t"], "category": "appearance"},
    {"action_id": "go_dashboard",        "label": "Go to Dashboard",       "default_keys": ["g", "d"], "category": "navigation"},
    {"action_id": "go_datasets",         "label": "Go to Datasets",        "default_keys": ["g", "e"], "category": "navigation"},
    {"action_id": "go_ml",               "label": "Go to ML Workspace",    "default_keys": ["g", "m"], "category": "navigation"},
    {"action_id": "go_analytics",        "label": "Go to Analytics",       "default_keys": ["g", "a"], "category": "navigation"},
    {"action_id": "go_projects",         "label": "Go to Projects",        "default_keys": ["g", "p"], "category": "navigation"},
    {"action_id": "go_reports",          "label": "Go to Reports",         "default_keys": ["g", "r"], "category": "navigation"},
    {"action_id": "go_settings",         "label": "Go to Settings",        "default_keys": ["g", "s"], "category": "navigation"},
    {"action_id": "upload_dataset",      "label": "Upload Dataset",        "default_keys": ["mod", "u"], "category": "actions"},
    {"action_id": "save_project",        "label": "Save Project",          "default_keys": ["mod", "s"], "category": "actions"},
    {"action_id": "open_notifications",  "label": "Open Notifications",    "default_keys": ["mod", "shift", "n"], "category": "navigation"},
    {"action_id": "generate_report",     "label": "Generate Report",       "default_keys": ["mod", "shift", "r"], "category": "actions"},
    {"action_id": "show_help",           "label": "Show Keyboard Help",    "default_keys": ["?"], "category": "help"},
]


class ShortcutService:
    def get_or_create_defaults(self, db: Session, user_id: str) -> List[SavedShortcut]:
        """Returns the user's shortcut set, seeding defaults on first call."""
        existing = db.query(SavedShortcut).filter(
            SavedShortcut.user_id == str(user_id)
        ).all()

        existing_action_ids = {s.action_id for s in existing}
        new_entries: List[SavedShortcut] = []

        for defn in DEFAULT_SHORTCUTS:
            if defn["action_id"] not in existing_action_ids:
                sc = SavedShortcut(
                    user_id=str(user_id),
                    action_id=defn["action_id"],
                    label=defn["label"],
                    default_keys=defn["default_keys"],
                    custom_keys=None,
                    category=defn["category"],
                    enabled=True,
                )
                db.add(sc)
                new_entries.append(sc)

        if new_entries:
            db.commit()
            for s in new_entries:
                db.refresh(s)
            existing.extend(new_entries)

        return existing

    def update(
        self,
        db: Session,
        user_id: str,
        action_id: str,
        update: ShortcutUpdate,
    ) -> Optional[SavedShortcut]:
        """Updates a specific shortcut's key binding or enabled state."""
        sc = db.query(SavedShortcut).filter(
            SavedShortcut.user_id == str(user_id),
            SavedShortcut.action_id == action_id,
        ).first()

        if not sc:
            return None

        # Conflict check: ensure new keys don't conflict with another shortcut
        if update.custom_keys is not None:
            conflict = db.query(SavedShortcut).filter(
                SavedShortcut.user_id == str(user_id),
                SavedShortcut.action_id != action_id,
            ).all()
            for other in conflict:
                effective = other.custom_keys or other.default_keys
                if effective == update.custom_keys:
                    logger.warning(
                        "shortcut_conflict",
                        user_id=str(user_id),
                        action_id=action_id,
                        conflicting_action=other.action_id,
                    )
                    # Return None signals conflict to the API layer
                    return None

        if update.custom_keys is not None:
            sc.custom_keys = update.custom_keys  # type: ignore
        if update.enabled is not None:
            sc.enabled = update.enabled  # type: ignore

        db.commit()
        db.refresh(sc)
        logger.info(
            "shortcut_modified",
            user_id=str(user_id),
            action_id=action_id,
            custom_keys=sc.custom_keys,
            enabled=sc.enabled,
        )
        return sc

    def reset(self, db: Session, user_id: str, action_id: str) -> Optional[SavedShortcut]:
        """Resets a shortcut to its default keys."""
        sc = db.query(SavedShortcut).filter(
            SavedShortcut.user_id == str(user_id),
            SavedShortcut.action_id == action_id,
        ).first()
        if sc:
            sc.custom_keys = None  # type: ignore
            db.commit()
            db.refresh(sc)
        return sc


shortcut_service = ShortcutService()
