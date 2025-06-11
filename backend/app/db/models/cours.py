from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.core.database import Base

class Cours(Base):
    __tablename__ = "cours"

    id = Column(Integer, primary_key=True, index=True)
    module_id = Column(Integer, ForeignKey("modules.id"), nullable=False)
    name = Column(String(255), nullable=False)
    transcription = Column(Text, nullable=False)
    summary = Column(Text, nullable=False)
    professeur_id = Column(Integer, ForeignKey("Users.id"), nullable=False)
    time_inserted = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    # Relationships
    module = relationship("Module", back_populates="cours")
    professeur = relationship("User", back_populates="cours") 