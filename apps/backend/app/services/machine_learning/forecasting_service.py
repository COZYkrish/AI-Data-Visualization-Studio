"""
Forecasting Service — Phase 7

Responsibility: Train time-series forecasting models and produce
future predictions with confidence intervals.
Supported algorithms:
  - Prophet (Facebook / Meta)
  - ARIMA (via statsmodels)

Both methods:
  1. Accept a cleaned DataFrame with date and value columns
  2. Fit the model
  3. Return forecast DataFrame + decomposition data + metrics on holdout
"""

import warnings
from typing import Any, Dict, List, Optional, Tuple

import numpy as np
import pandas as pd

from app.services.machine_learning.utils import json_safe

# Suppress noisy Prophet / Stan logs
warnings.filterwarnings("ignore", category=FutureWarning)


class ForecastingService:
    """Time-series forecasting with Prophet and ARIMA."""

    # ------------------------------------------------------------------
    # Internal helpers
    # ------------------------------------------------------------------

    def _prepare_series(
        self, df: pd.DataFrame, date_col: str, value_col: str
    ) -> pd.DataFrame:
        """Sort by date, convert to datetime, drop nulls."""
        ts = df[[date_col, value_col]].copy()
        ts[date_col] = pd.to_datetime(ts[date_col], errors="coerce")
        ts = ts.dropna().sort_values(date_col).reset_index(drop=True)
        ts[value_col] = pd.to_numeric(ts[value_col], errors="coerce")
        ts = ts.dropna()
        return ts

    # ------------------------------------------------------------------
    # Prophet
    # ------------------------------------------------------------------

    def train_prophet(
        self,
        df: pd.DataFrame,
        date_col: str,
        value_col: str,
        horizon: int = 30,
        hyperparameters: Optional[Dict[str, Any]] = None,
    ) -> Dict[str, Any]:
        """
        Fit a Prophet model and produce a horizon-step forecast.

        Returns a dict with:
          model            — fitted Prophet instance
          forecast_data    — list of {ds, yhat, yhat_lower, yhat_upper}
          trend_data       — list of {ds, trend}
          seasonality_data — dict of weekly / yearly seasonality arrays
          metrics          — in-sample MAE / RMSE (last 20% as pseudo-holdout)
        """
        try:
            from prophet import Prophet  # type: ignore[import-untyped]
        except ImportError:
            raise ImportError(
                "Prophet is not installed. Add 'prophet' to requirements.txt."
            )

        params = hyperparameters or {}
        ts = self._prepare_series(df, date_col, value_col)

        # Prophet expects columns named 'ds' and 'y'
        prophet_df = ts.rename(columns={date_col: "ds", value_col: "y"})

        model = Prophet(
            yearly_seasonality=params.get("yearly_seasonality", True),
            weekly_seasonality=params.get("weekly_seasonality", True),
            daily_seasonality=params.get("daily_seasonality", False),
            seasonality_mode=params.get("seasonality_mode", "additive"),
            changepoint_prior_scale=float(params.get("changepoint_prior_scale", 0.05)),
        )

        with warnings.catch_warnings():
            warnings.simplefilter("ignore")
            model.fit(prophet_df)

        # Future dataframe for horizon periods (infer frequency)
        freq = pd.infer_freq(prophet_df["ds"]) or "D"
        future = model.make_future_dataframe(periods=horizon, freq=freq)
        forecast = model.predict(future)

        # Build forecast payload (last horizon rows are the future)
        forecast_rows: List[Dict[str, Any]] = []
        for _, row in forecast.iterrows():
            forecast_rows.append({
                "ds": row["ds"].isoformat(),
                "yhat": float(row["yhat"]),
                "yhat_lower": float(row["yhat_lower"]),
                "yhat_upper": float(row["yhat_upper"]),
                "is_future": row["ds"] > prophet_df["ds"].max(),
            })

        # Trend
        trend_data: List[Dict[str, Any]] = [
            {"ds": row["ds"].isoformat(), "trend": float(row["trend"])}
            for _, row in forecast.iterrows()
        ]

        # Seasonality (weekly if available)
        seasonality_data: Dict[str, Any] = {}
        if "weekly" in forecast.columns:
            seasonality_data["weekly"] = json_safe(
                forecast[["ds", "weekly"]].tail(7).to_dict(orient="records")
            )
        if "yearly" in forecast.columns:
            seasonality_data["yearly"] = json_safe(
                forecast[["ds", "yearly"]].tail(365).to_dict(orient="records")
            )

        # Pseudo-holdout metrics (last 20% of historical data)
        n = len(prophet_df)
        holdout_n = max(1, n // 5)
        hist_forecast = forecast[forecast["ds"].isin(prophet_df["ds"])].tail(holdout_n)
        hist_actual = prophet_df.tail(holdout_n)

        metrics: Dict[str, Any] = {}
        if len(hist_forecast) == len(hist_actual):
            y_true = hist_actual["y"].values
            y_pred = hist_forecast["yhat"].values
            mae = float(np.mean(np.abs(y_true - y_pred)))
            rmse = float(np.sqrt(np.mean((y_true - y_pred) ** 2)))
            nonzero = y_true != 0
            mape = float(np.mean(np.abs((y_true[nonzero] - y_pred[nonzero]) / y_true[nonzero])) * 100) if nonzero.any() else None
            metrics = json_safe({"mae": mae, "rmse": rmse, "mape": mape})

        return {
            "model": model,
            "forecast_data": json_safe(forecast_rows),
            "trend_data": json_safe(trend_data),
            "seasonality_data": json_safe(seasonality_data),
            "metrics": metrics,
        }

    # ------------------------------------------------------------------
    # ARIMA
    # ------------------------------------------------------------------

    def train_arima(
        self,
        df: pd.DataFrame,
        date_col: str,
        value_col: str,
        horizon: int = 30,
        hyperparameters: Optional[Dict[str, Any]] = None,
    ) -> Dict[str, Any]:
        """
        Fit an ARIMA(p, d, q) model and produce a horizon-step forecast.

        Returns a dict with:
          model         — fitted ARIMA results
          forecast_data — list of {ds, yhat, yhat_lower, yhat_upper}
          trend_data    — list of {ds, trend} (fitted values)
          metrics       — holdout MAE / RMSE / MAPE
        """
        try:
            from statsmodels.tsa.arima.model import ARIMA  # type: ignore[import-untyped]
        except ImportError:
            raise ImportError(
                "statsmodels is not installed. Add 'statsmodels' to requirements.txt."
            )

        params = hyperparameters or {}
        p = int(params.get("p", 1))
        d = int(params.get("d", 1))
        q = int(params.get("q", 1))

        ts = self._prepare_series(df, date_col, value_col)
        y = ts[value_col].values

        # Holdout: last 20%
        n = len(y)
        holdout_n = max(1, n // 5)
        train_y = y[:-holdout_n]
        test_y = y[-holdout_n:]

        with warnings.catch_warnings():
            warnings.simplefilter("ignore")
            model_fit = ARIMA(train_y, order=(p, d, q)).fit()

        # In-sample fitted values
        fitted = model_fit.fittedvalues

        # Forecast: holdout + horizon
        total_steps = holdout_n + horizon
        forecast_obj = model_fit.get_forecast(steps=total_steps)
        forecast_mean = forecast_obj.predicted_mean
        conf_int = forecast_obj.conf_int()

        # Build date index for future periods
        last_date = ts[date_col].iloc[-1]
        freq = pd.infer_freq(ts[date_col]) or "D"
        future_dates = pd.date_range(start=last_date, periods=total_steps + 1, freq=freq)[1:]

        forecast_rows: List[Dict[str, Any]] = []
        for i, date in enumerate(future_dates):
            forecast_rows.append({
                "ds": date.isoformat(),
                "yhat": float(forecast_mean.iloc[i]) if i < len(forecast_mean) else None,
                "yhat_lower": float(conf_int.iloc[i, 0]) if i < len(conf_int) else None,
                "yhat_upper": float(conf_int.iloc[i, 1]) if i < len(conf_int) else None,
                "is_future": i >= holdout_n,
            })

        # Trend = fitted values on training set
        train_dates = ts[date_col].iloc[: len(train_y)].dt.strftime("%Y-%m-%dT%H:%M:%S").tolist()
        trend_data: List[Dict[str, Any]] = [
            {"ds": d, "trend": float(v)}
            for d, v in zip(train_dates, fitted)
        ]

        # Metrics on holdout
        holdout_pred = forecast_mean.iloc[:holdout_n].values
        mae = float(np.mean(np.abs(test_y - holdout_pred)))
        rmse = float(np.sqrt(np.mean((test_y - holdout_pred) ** 2)))
        nonzero = test_y != 0
        mape = float(np.mean(np.abs((test_y[nonzero] - holdout_pred[nonzero]) / test_y[nonzero])) * 100) if nonzero.any() else None

        return {
            "model": model_fit,
            "forecast_data": json_safe(forecast_rows),
            "trend_data": json_safe(trend_data),
            "seasonality_data": {},
            "metrics": json_safe({"mae": mae, "rmse": rmse, "mape": mape}),
        }
