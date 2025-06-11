from sqlalchemy import Column, Integer, String, Text, DateTime
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.core.database import Base

class Module(Base):
    __tablename__ = "modules"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    abreviation = Column(String(50), nullable=False)
    description = Column(Text, nullable=True)
    time_inserted = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    # Relationships
    cours = relationship("Cours", back_populates="module") 