"""Add index_attempt_errors table

Revision ID: c5b692fa265c
Revises: 4a951134c801
Create Date: 2024-08-08 14:06:39.581972

"""

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = "c5b692fa265c"
down_revision = "4a951134c801"
branch_labels: None = None
depends_on: None = None


def upgrade() -> None:
    op.create_table(
        "index_attempt_errors",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("index_attempt_id", sa.Integer(), nullable=True),
        sa.Column("batch", sa.Integer(), nullable=True),
        sa.Column(
            "doc_summaries",
            postgresql.JSONB(astext_type=sa.Text()),
            nullable=False,
        ),
        sa.Column("error_msg", sa.Text(), nullable=True),
        sa.Column("traceback", sa.Text(), nullable=True),
        sa.Column(
            "time_created",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.ForeignKeyConstraint(
            ["index_attempt_id"],
            ["index_attempt.id"],
        ),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(
        "index_attempt_id",
        "index_attempt_errors",
        ["time_created"],
        unique=False,
    )
    # ### end Alembic commands ###


def downgrade() -> None:
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_index("index_attempt_id", table_name="index_attempt_errors")
    op.drop_table("index_attempt_errors")
    # ### end Alembic commands ###
