"""Add ML models (Phase 7 — Machine Learning & Forecasting)

Revision ID: a1b2c3d4e5f6
Revises: e8f4396575c3
Create Date: 2026-07-07 20:00:00.000000

Tables created:
  ml_models
  ml_model_runs
  ml_predictions
  ml_forecasts
  ml_evaluation_results
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'a1b2c3d4e5f6'
down_revision: Union[str, None] = 'e8f4396575c3'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # ── ml_models ──────────────────────────────────────────────────────────
    op.create_table(
        'ml_models',
        sa.Column('id', sa.String(length=36), nullable=False),
        sa.Column('user_id', sa.String(length=36), nullable=False),
        sa.Column('dataset_id', sa.String(length=36), nullable=False),
        sa.Column('name', sa.String(length=255), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('model_type', sa.Enum(
            'regression', 'classification', 'clustering', 'forecasting',
            name='mlmodeltype'
        ), nullable=False),
        sa.Column('algorithm', sa.Enum(
            'linear_regression', 'random_forest_regressor',
            'logistic_regression', 'decision_tree_classifier', 'random_forest_classifier',
            'kmeans', 'dbscan',
            'prophet', 'arima',
            name='mlalgorithm'
        ), nullable=False),
        sa.Column('status', sa.Enum(
            'training', 'trained', 'failed', 'archived',
            name='mlmodelstatus'
        ), nullable=False),
        sa.Column('model_path', sa.String(length=512), nullable=True),
        sa.Column('model_version', sa.String(length=50), nullable=False),
        sa.Column('hyperparameters', sa.JSON(), nullable=True),
        sa.Column('feature_columns', sa.JSON(), nullable=True),
        sa.Column('target_column', sa.String(length=255), nullable=True),
        sa.Column('test_size', sa.Float(), nullable=False),
        sa.Column('random_state', sa.Integer(), nullable=False),
        sa.Column('evaluation_summary', sa.JSON(), nullable=True),
        sa.Column('feature_importances', sa.JSON(), nullable=True),
        sa.Column('training_duration', sa.Float(), nullable=True),
        sa.Column('dataset_version', sa.String(length=50), nullable=True),
        sa.Column('error_message', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(['dataset_id'], ['datasets.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index('ix_ml_models_user_id', 'ml_models', ['user_id'])
    op.create_index('ix_ml_models_dataset_id', 'ml_models', ['dataset_id'])
    op.create_index('ix_ml_models_model_type', 'ml_models', ['model_type'])

    # ── ml_model_runs ───────────────────────────────────────────────────────
    op.create_table(
        'ml_model_runs',
        sa.Column('id', sa.String(length=36), nullable=False),
        sa.Column('model_id', sa.String(length=36), nullable=False),
        sa.Column('run_number', sa.Integer(), nullable=False),
        sa.Column('status', sa.Enum(
            'training', 'trained', 'failed', 'archived',
            name='mlmodelstatus'
        ), nullable=False),
        sa.Column('hyperparameters', sa.JSON(), nullable=True),
        sa.Column('metrics', sa.JSON(), nullable=True),
        sa.Column('feature_importances', sa.JSON(), nullable=True),
        sa.Column('training_duration', sa.Float(), nullable=True),
        sa.Column('error_message', sa.Text(), nullable=True),
        sa.Column('started_at', sa.DateTime(), nullable=True),
        sa.Column('completed_at', sa.DateTime(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(['model_id'], ['ml_models.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index('ix_ml_model_runs_model_id', 'ml_model_runs', ['model_id'])

    # ── ml_predictions ──────────────────────────────────────────────────────
    op.create_table(
        'ml_predictions',
        sa.Column('id', sa.String(length=36), nullable=False),
        sa.Column('model_id', sa.String(length=36), nullable=False),
        sa.Column('user_id', sa.String(length=36), nullable=False),
        sa.Column('prediction_type', sa.Enum(
            'single', 'batch',
            name='predictiontype'
        ), nullable=False),
        sa.Column('input_data', sa.JSON(), nullable=True),
        sa.Column('predicted_value', sa.JSON(), nullable=True),
        sa.Column('prediction_confidence', sa.Float(), nullable=True),
        sa.Column('feature_contributions', sa.JSON(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(['model_id'], ['ml_models.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index('ix_ml_predictions_model_id', 'ml_predictions', ['model_id'])
    op.create_index('ix_ml_predictions_user_id', 'ml_predictions', ['user_id'])

    # ── ml_forecasts ────────────────────────────────────────────────────────
    op.create_table(
        'ml_forecasts',
        sa.Column('id', sa.String(length=36), nullable=False),
        sa.Column('model_id', sa.String(length=36), nullable=False),
        sa.Column('user_id', sa.String(length=36), nullable=False),
        sa.Column('date_column', sa.String(length=255), nullable=False),
        sa.Column('value_column', sa.String(length=255), nullable=False),
        sa.Column('horizon', sa.Integer(), nullable=False),
        sa.Column('forecast_data', sa.JSON(), nullable=True),
        sa.Column('trend_data', sa.JSON(), nullable=True),
        sa.Column('seasonality_data', sa.JSON(), nullable=True),
        sa.Column('metrics', sa.JSON(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(['model_id'], ['ml_models.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index('ix_ml_forecasts_model_id', 'ml_forecasts', ['model_id'])

    # ── ml_evaluation_results ───────────────────────────────────────────────
    op.create_table(
        'ml_evaluation_results',
        sa.Column('id', sa.String(length=36), nullable=False),
        sa.Column('model_id', sa.String(length=36), nullable=False),
        sa.Column('run_id', sa.String(length=36), nullable=True),
        sa.Column('metrics', sa.JSON(), nullable=True),
        sa.Column('confusion_matrix', sa.JSON(), nullable=True),
        sa.Column('classification_report', sa.JSON(), nullable=True),
        sa.Column('roc_curve_data', sa.JSON(), nullable=True),
        sa.Column('residuals_data', sa.JSON(), nullable=True),
        sa.Column('actual_vs_predicted', sa.JSON(), nullable=True),
        sa.Column('cluster_stats', sa.JSON(), nullable=True),
        sa.Column('cluster_assignments', sa.JSON(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(['model_id'], ['ml_models.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['run_id'], ['ml_model_runs.id'], ondelete='SET NULL'),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index('ix_ml_evaluation_results_model_id', 'ml_evaluation_results', ['model_id'])


def downgrade() -> None:
    op.drop_index('ix_ml_evaluation_results_model_id', table_name='ml_evaluation_results')
    op.drop_table('ml_evaluation_results')

    op.drop_index('ix_ml_forecasts_model_id', table_name='ml_forecasts')
    op.drop_table('ml_forecasts')

    op.drop_index('ix_ml_predictions_user_id', table_name='ml_predictions')
    op.drop_index('ix_ml_predictions_model_id', table_name='ml_predictions')
    op.drop_table('ml_predictions')

    op.drop_index('ix_ml_model_runs_model_id', table_name='ml_model_runs')
    op.drop_table('ml_model_runs')

    op.drop_index('ix_ml_models_model_type', table_name='ml_models')
    op.drop_index('ix_ml_models_dataset_id', table_name='ml_models')
    op.drop_index('ix_ml_models_user_id', table_name='ml_models')
    op.drop_table('ml_models')

    # Drop enum types
    op.execute('DROP TYPE IF EXISTS mlmodeltype')
    op.execute('DROP TYPE IF EXISTS mlalgorithm')
    op.execute('DROP TYPE IF EXISTS mlmodelstatus')
    op.execute('DROP TYPE IF EXISTS predictiontype')
