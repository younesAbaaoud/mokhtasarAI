from app.core.database import Base, engine
from sqlalchemy import text

def create_tables():
    # Create the enum type if it doesn't exist
    with engine.connect() as conn:
        conn.execute(text("DO $$ BEGIN CREATE TYPE userrole AS ENUM ('ETUDIANT', 'PROFESSEUR'); EXCEPTION WHEN duplicate_object THEN null; END $$;"))
        conn.commit()
    
    # Create all tables
    Base.metadata.create_all(bind=engine)