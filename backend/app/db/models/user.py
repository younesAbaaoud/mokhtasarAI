from app.core.database import Base
from sqlalchemy import Column, Integer, String, Enum, DateTime, ForeignKey
import enum
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship

class UserRole(enum.Enum):
    ETUDIANT = "ETUDIANT"
    PROFESSEUR = "PROFESSEUR"

class User(Base):
    __tablename__ = "Users"
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(100))
    email = Column(String(255), unique=True, nullable=False)
    password = Column(String(255), nullable=False)
    role = Column(String(50), nullable=False)
    time_inserted = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    # Relationships
    cours = relationship("Cours", back_populates="professeur")
