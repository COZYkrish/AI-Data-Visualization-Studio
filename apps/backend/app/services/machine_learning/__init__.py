"""
Machine Learning Services Package — Phase 7

Sub-packages / modules:
    utils.py                     — Shared helpers (file paths, serialisation)
    validators.py                — Dataset / feature / target validation
    dataset_preparation_service  — Preprocessing, encoding, splitting
    feature_engineering_service  — Feature selection, transformation
    regression_service           — Linear Regression, Random Forest Regressor
    classification_service       — Logistic Regression, Decision Tree, RF Classifier
    clustering_service           — K-Means, DBSCAN
    forecasting_service          — Prophet, ARIMA
    evaluation_service           — Metric computation for all model types
    model_persistence_service    — Serialise / deserialise trained models
    model_recommendation_service — Deterministic model recommender
    prediction_service           — Single & batch prediction engine
    model_training_service       — Orchestrator — wires all services together
"""
