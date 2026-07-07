"""
Evaluation Service — Phase 7

Responsibility: Compute comprehensive evaluation metrics for every
supported model type (regression, classification, clustering, forecasting).
Returns plain Python dicts (JSON-safe) for storage in the database.
"""

from typing import Any, Dict, List, Optional

import numpy as np
import pandas as pd

from app.services.machine_learning.utils import json_safe


class EvaluationService:
    """Stateless metric computation for all ML model types."""

    # ------------------------------------------------------------------
    # Regression metrics
    # ------------------------------------------------------------------

    def regression_metrics(
        self, y_true: Any, y_pred: Any
    ) -> Dict[str, Any]:
        """Compute MAE, MSE, RMSE, R², MAPE."""
        from sklearn.metrics import (  # type: ignore[import-untyped]
            mean_absolute_error,
            mean_squared_error,
            r2_score,
        )

        y_true = np.array(y_true, dtype=float)
        y_pred = np.array(y_pred, dtype=float)

        mae = float(mean_absolute_error(y_true, y_pred))
        mse = float(mean_squared_error(y_true, y_pred))
        rmse = float(np.sqrt(mse))
        r2 = float(r2_score(y_true, y_pred))

        # MAPE — avoid division by zero
        nonzero_mask = y_true != 0
        if nonzero_mask.sum() > 0:
            mape = float(
                np.mean(np.abs((y_true[nonzero_mask] - y_pred[nonzero_mask]) / y_true[nonzero_mask])) * 100
            )
        else:
            mape = None  # type: ignore[assignment]

        return json_safe({
            "mae": mae,
            "mse": mse,
            "rmse": rmse,
            "r2": r2,
            "mape": mape,
        })

    def regression_residuals(
        self, y_true: Any, y_pred: Any, max_points: int = 500
    ) -> List[Dict[str, float]]:
        """Return sampled residual points for visualisation."""
        y_true = np.array(y_true, dtype=float)
        y_pred = np.array(y_pred, dtype=float)
        residuals = y_true - y_pred
        n = len(y_true)
        indices = np.linspace(0, n - 1, min(n, max_points), dtype=int)
        return json_safe([
            {"index": int(i), "actual": float(y_true[i]), "predicted": float(y_pred[i]), "residual": float(residuals[i])}
            for i in indices
        ])

    # ------------------------------------------------------------------
    # Classification metrics
    # ------------------------------------------------------------------

    def classification_metrics(
        self,
        y_true: Any,
        y_pred: Any,
        y_prob: Optional[Any] = None,
        class_labels: Optional[List[str]] = None,
    ) -> Dict[str, Any]:
        """Compute accuracy, precision, recall, F1, ROC-AUC, confusion matrix."""
        from sklearn.metrics import (  # type: ignore[import-untyped]
            accuracy_score,
            precision_score,
            recall_score,
            f1_score,
            confusion_matrix,
            classification_report,
            roc_auc_score,
        )

        y_true = np.array(y_true)
        y_pred = np.array(y_pred)
        n_classes = len(np.unique(y_true))
        average = "binary" if n_classes == 2 else "weighted"

        metrics: Dict[str, Any] = {
            "accuracy": float(accuracy_score(y_true, y_pred)),
            "precision": float(precision_score(y_true, y_pred, average=average, zero_division=0)),
            "recall": float(recall_score(y_true, y_pred, average=average, zero_division=0)),
            "f1": float(f1_score(y_true, y_pred, average=average, zero_division=0)),
            "n_classes": n_classes,
        }

        # ROC-AUC
        if y_prob is not None:
            try:
                y_prob_arr = np.array(y_prob)
                if n_classes == 2:
                    prob_input = y_prob_arr[:, 1] if y_prob_arr.ndim == 2 else y_prob_arr
                    metrics["roc_auc"] = float(roc_auc_score(y_true, prob_input))
                else:
                    metrics["roc_auc"] = float(
                        roc_auc_score(y_true, y_prob_arr, multi_class="ovr", average="weighted")
                    )
            except Exception:
                metrics["roc_auc"] = None

        # Confusion matrix
        cm = confusion_matrix(y_true, y_pred).tolist()

        # Classification report
        report = classification_report(
            y_true, y_pred,
            target_names=class_labels if class_labels else None,
            output_dict=True,
            zero_division=0,
        )

        return json_safe(metrics), json_safe(cm), json_safe(report)

    def roc_curve_data(
        self, y_true: Any, y_prob: Any, n_classes: int = 2
    ) -> Dict[str, Any]:
        """Compute ROC curve data for binary or multi-class scenarios."""
        from sklearn.metrics import roc_curve, auc  # type: ignore[import-untyped]
        from sklearn.preprocessing import label_binarize  # type: ignore[import-untyped]

        try:
            y_true = np.array(y_true)
            y_prob = np.array(y_prob)

            if n_classes == 2:
                prob = y_prob[:, 1] if y_prob.ndim == 2 else y_prob
                fpr, tpr, thresholds = roc_curve(y_true, prob)
                roc_auc = auc(fpr, tpr)
                return json_safe({
                    "type": "binary",
                    "fpr": fpr.tolist(),
                    "tpr": tpr.tolist(),
                    "auc": float(roc_auc),
                })
            else:
                classes = np.unique(y_true)
                y_bin = label_binarize(y_true, classes=classes)
                result: Dict[str, Any] = {"type": "multiclass", "classes": {}}
                for i, cls in enumerate(classes):
                    fpr, tpr, _ = roc_curve(y_bin[:, i], y_prob[:, i])
                    roc_auc = auc(fpr, tpr)
                    result["classes"][str(cls)] = {
                        "fpr": fpr.tolist(),
                        "tpr": tpr.tolist(),
                        "auc": float(roc_auc),
                    }
                return json_safe(result)
        except Exception as e:
            return {"error": str(e)}

    # ------------------------------------------------------------------
    # Clustering metrics
    # ------------------------------------------------------------------

    def clustering_metrics(
        self, X: Any, labels: Any, inertia: Optional[float] = None
    ) -> Dict[str, Any]:
        """Compute Silhouette Score, Davies-Bouldin Index, cluster distribution."""
        from sklearn.metrics import (  # type: ignore[import-untyped]
            silhouette_score,
            davies_bouldin_score,
        )

        X = np.array(X)
        labels = np.array(labels)
        unique_labels = np.unique(labels)
        # Exclude noise label from DBSCAN (-1)
        non_noise = labels[labels != -1]
        n_clusters = len(unique_labels[unique_labels != -1])

        metrics: Dict[str, Any] = {
            "n_clusters": int(n_clusters),
            "noise_points": int(np.sum(labels == -1)),
        }

        if inertia is not None:
            metrics["inertia"] = float(inertia)

        # Silhouette requires at least 2 clusters and > 1 sample per cluster
        if n_clusters >= 2 and len(non_noise) > n_clusters:
            X_valid = X[labels != -1]
            labels_valid = labels[labels != -1]
            try:
                metrics["silhouette_score"] = float(silhouette_score(X_valid, labels_valid))
                metrics["davies_bouldin_index"] = float(davies_bouldin_score(X_valid, labels_valid))
            except Exception:
                pass

        # Cluster distribution
        dist: Dict[str, int] = {}
        for lbl in unique_labels:
            dist[str(lbl)] = int(np.sum(labels == lbl))
        metrics["cluster_distribution"] = dist

        return json_safe(metrics)

    # ------------------------------------------------------------------
    # Forecasting metrics
    # ------------------------------------------------------------------

    def forecasting_metrics(
        self, y_true: Any, y_pred: Any
    ) -> Dict[str, Any]:
        """Compute MAE, RMSE, MAPE on a held-out forecast window."""
        return self.regression_metrics(y_true, y_pred)
