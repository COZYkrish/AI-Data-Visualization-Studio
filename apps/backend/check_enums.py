import sys
sys.path.insert(0, '.')
from app.database.session import engine
from sqlalchemy import text

with engine.connect() as conn:
    q = "SELECT pg_type.typname, enumlabel FROM pg_enum JOIN pg_type ON pg_enum.enumtypid = pg_type.oid WHERE pg_type.typname LIKE 'ml%' ORDER BY pg_type.typname, pg_enum.enumsortorder"
    result = conn.execute(text(q))
    for r in result.fetchall():
        print(r[0], '->', r[1])
