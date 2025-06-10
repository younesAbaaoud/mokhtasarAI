from app.core.database import Base
from sqlalchemy import Column, Integer, String, Enum
import enum

class UserRole(enum.Enum):
    ETUDIANT = "ETUDIANT"
    PROFESSEUR = "PROFESSEUR"

class User(Base):
    __tablename__ = "Users"
    id = Column(Integer, primary_key=True)
    username = Column(String(100))
    email = Column(String(70), unique=True)
    password = Column(String(250))
    role = Column(Enum(UserRole), nullable=False, default=UserRole.ETUDIANT)
