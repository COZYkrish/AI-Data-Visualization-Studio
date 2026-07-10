"""phase9_premium_models

Revision ID: 233b686ef1d2
Revises: 1f17a29974bc
Create Date: 2026-07-10 19:14:02.564969

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '233b686ef1d2'
down_revision: Union[str, None] = '1f17a29974bc'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table('activity_logs',
    sa.Column('id', sa.String(length=36), nullable=False),
    sa.Column('user_id', sa.String(length=36), nullable=False),
    sa.Column('action', sa.String(length=64), nullable=False),
    sa.Column('entity_type', sa.String(length=64), nullable=True),
    sa.Column('entity_id', sa.String(length=64), nullable=True),
    sa.Column('entity_name', sa.String(length=256), nullable=True),
    sa.Column('status', sa.String(length=32), nullable=False),
    sa.Column('description', sa.Text(), nullable=True),
    sa.Column('metadata', sa.JSON(), nullable=True),
    sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
    sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_activity_logs_user_id'), 'activity_logs', ['user_id'], unique=False)
    op.create_table('dashboard_suggestions',
    sa.Column('id', sa.String(length=36), nullable=False),
    sa.Column('user_id', sa.String(length=36), nullable=False),
    sa.Column('dataset_id', sa.String(length=64), nullable=True),
    sa.Column('suggestion_type', sa.String(length=64), nullable=False),
    sa.Column('title', sa.String(length=256), nullable=False),
    sa.Column('description', sa.Text(), nullable=False),
    sa.Column('why', sa.Text(), nullable=False),
    sa.Column('priority', sa.Integer(), nullable=False),
    sa.Column('config', sa.JSON(), nullable=True),
    sa.Column('dismissed', sa.Boolean(), nullable=False),
    sa.Column('applied', sa.Boolean(), nullable=False),
    sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
    sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
    sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_dashboard_suggestions_dataset_id'), 'dashboard_suggestions', ['dataset_id'], unique=False)
    op.create_index(op.f('ix_dashboard_suggestions_user_id'), 'dashboard_suggestions', ['user_id'], unique=False)
    op.create_table('persistent_notifications',
    sa.Column('id', sa.String(length=36), nullable=False),
    sa.Column('user_id', sa.String(length=36), nullable=False),
    sa.Column('type', sa.String(length=16), nullable=False),
    sa.Column('title', sa.String(length=256), nullable=False),
    sa.Column('message', sa.Text(), nullable=False),
    sa.Column('action_label', sa.String(length=64), nullable=True),
    sa.Column('action_url', sa.String(length=512), nullable=True),
    sa.Column('entity_type', sa.String(length=64), nullable=True),
    sa.Column('entity_id', sa.String(length=64), nullable=True),
    sa.Column('read', sa.Boolean(), nullable=False),
    sa.Column('dismissed', sa.Boolean(), nullable=False),
    sa.Column('metadata', sa.JSON(), nullable=True),
    sa.Column('version', sa.Integer(), nullable=False),
    sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
    sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
    sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_persistent_notifications_user_id'), 'persistent_notifications', ['user_id'], unique=False)
    op.create_table('saved_shortcuts',
    sa.Column('id', sa.String(length=36), nullable=False),
    sa.Column('user_id', sa.String(length=36), nullable=False),
    sa.Column('action_id', sa.String(length=64), nullable=False),
    sa.Column('label', sa.String(length=128), nullable=False),
    sa.Column('default_keys', sa.JSON(), nullable=False),
    sa.Column('custom_keys', sa.JSON(), nullable=True),
    sa.Column('category', sa.String(length=64), nullable=False),
    sa.Column('enabled', sa.Boolean(), nullable=False),
    sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
    sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
    sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_saved_shortcuts_user_id'), 'saved_shortcuts', ['user_id'], unique=False)
    op.create_table('user_preferences',
    sa.Column('id', sa.String(length=36), nullable=False),
    sa.Column('user_id', sa.String(length=36), nullable=False),
    sa.Column('theme', sa.String(length=32), nullable=False),
    sa.Column('accent_color', sa.String(length=32), nullable=False),
    sa.Column('compact_mode', sa.Boolean(), nullable=False),
    sa.Column('large_font', sa.Boolean(), nullable=False),
    sa.Column('reduced_motion', sa.Boolean(), nullable=False),
    sa.Column('high_contrast', sa.Boolean(), nullable=False),
    sa.Column('focus_visible', sa.Boolean(), nullable=False),
    sa.Column('color_blind_mode', sa.String(length=32), nullable=True),
    sa.Column('timezone', sa.String(length=64), nullable=False),
    sa.Column('date_format', sa.String(length=32), nullable=False),
    sa.Column('number_format', sa.String(length=16), nullable=False),
    sa.Column('language', sa.String(length=16), nullable=False),
    sa.Column('default_chart_type', sa.String(length=32), nullable=True),
    sa.Column('default_dataset_id', sa.String(length=64), nullable=True),
    sa.Column('notification_preferences', sa.JSON(), nullable=False),
    sa.Column('metadata', sa.JSON(), nullable=True),
    sa.Column('version', sa.Integer(), nullable=False),
    sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
    sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
    sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_user_preferences_user_id'), 'user_preferences', ['user_id'], unique=True)


def downgrade() -> None:
    op.drop_index(op.f('ix_user_preferences_user_id'), table_name='user_preferences')
    op.drop_table('user_preferences')
    op.drop_index(op.f('ix_saved_shortcuts_user_id'), table_name='saved_shortcuts')
    op.drop_table('saved_shortcuts')
    op.drop_index(op.f('ix_persistent_notifications_user_id'), table_name='persistent_notifications')
    op.drop_table('persistent_notifications')
    op.drop_index(op.f('ix_dashboard_suggestions_user_id'), table_name='dashboard_suggestions')
    op.drop_index(op.f('ix_dashboard_suggestions_dataset_id'), table_name='dashboard_suggestions')
    op.drop_table('dashboard_suggestions')
    op.drop_index(op.f('ix_activity_logs_user_id'), table_name='activity_logs')
    op.drop_table('activity_logs')
