"""
Clustering Service — Phase 7

Responsibility: Train and evaluate unsupervised clustering models.
Supported algorithms:
  - K-Means
  - DBSCAN

Returns fitted model, cluster assignments and cluster-level statistics.
"""

from typing import Any, Dict, List, Optional, Tuple

import numpy as np
import pandas as pd
from sklearn.cluster import KMeans, DBSCAN  # type: ignore[import-untyped]

from app.services.machine_learning.utils import json_safe


class ClusteringService:
    """Trains clustering models and extracts cluster statistics."""

    # ------------------------------------------------------------------
    # K-Means
    # ------------------------------------------------------------------

    def train_kmeans(
        self,
        X: pd.DataFrame,
        hyperparameters: Optional[Dict[str, Any]] = None,
    ) -> Tuple[KMeans, np.ndarray, Dict[str, Any]]:
        """
        Fit KMeans clustering.

        Returns:
            model          — fitted KMeans
            labels         — cluster assignment array
            stats          — inertia, centroid shapes, per-cluster size
        """
        params = hyperparameters or {}
        model = KMeans(
            n_clusters=int(params.get("n_clusters", 3)),
            max_iter=int(params.get("max_iter", 300)),
            random_state=int(params.get("random_state", 42)),
            n_init="auto",
        )
        model.fit(X)
        labels = model.labels_

        stats: Dict[str, Any] = {
            "inertia": float(model.inertia_),
            "n_clusters": int(model.n_clusters),
            "cluster_centers": json_safe(model.cluster_centers_.tolist()),
        }
        return model, labels, stats

    # ------------------------------------------------------------------
    # DBSCAN
    # ------------------------------------------------------------------

    def train_dbscan(
        self,
        X: pd.DataFrame,
        hyperparameters: Optional[Dict[str, Any]] = None,
    ) -> Tuple[DBSCAN, np.ndarray, Dict[str, Any]]:
        """
        Fit DBSCAN clustering.

        Returns:
            model  — fitted DBSCAN
            labels — cluster assignment array (-1 = noise)
            stats  — n_clusters, n_noise, core_sample count
        """
        params = hyperparameters or {}
        model = DBSCAN(
            eps=float(params.get("eps", 0.5)),
            min_samples=int(params.get("min_samples", 5)),
        )
        model.fit(X)
        labels = model.labels_

        unique_labels = set(labels)
        n_clusters = len(unique_labels - {-1})
        n_noise = int(np.sum(labels == -1))

        stats: Dict[str, Any] = {
            "n_clusters": n_clusters,
            "n_noise_points": n_noise,
            "n_core_samples": int(len(model.core_sample_indices_)),
        }
        return model, labels, stats

    # ------------------------------------------------------------------
    # Cluster assignment extraction (for storage / visualisation)
    # ------------------------------------------------------------------

    def extract_cluster_assignments(
        self, X: pd.DataFrame, labels: np.ndarray, max_rows: int = 2000
    ) -> List[Dict[str, Any]]:
        """
        Return a sampled list of {feature_values..., cluster} dicts for
        2-D scatter visualisation on the frontend.
        """
        df = X.copy()
        df["cluster"] = labels.tolist()

        if len(df) > max_rows:
            df = df.sample(max_rows, random_state=42)

        return json_safe(df.to_dict(orient="records"))

    # ------------------------------------------------------------------
    # Cluster statistics per cluster
    # ------------------------------------------------------------------

    def compute_cluster_stats(
        self, X: pd.DataFrame, labels: np.ndarray
    ) -> Dict[str, Any]:
        """
        Per-cluster: mean, std, min, max for each numeric feature.
        """
        df = X.copy()
        df["_cluster"] = labels
        stats: Dict[str, Any] = {}

        for cluster_id in sorted(df["_cluster"].unique()):
            subset = df[df["_cluster"] == cluster_id].drop(columns=["_cluster"])
            stats[str(cluster_id)] = {
                "size": len(subset),
                "means": json_safe(subset.mean().to_dict()),
                "stds": json_safe(subset.std().to_dict()),
                "mins": json_safe(subset.min().to_dict()),
                "maxs": json_safe(subset.max().to_dict()),
            }
        return stats
