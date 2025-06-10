from pydantic import EmailStr, BaseModel
from typing import Union
from enum import Enum

class UserRole(str, Enum):
    ETUDIANT = "ETUDIANT"
    PROFESSEUR = "PROFESSEUR"

class UserBase(BaseModel):
    email: EmailStr
    username: str

class UserInCreate(UserBase):
    password: str
    role: UserRole

class UserOutput(UserBase):
    id: int
    role: UserRole

    class Config:
        from_attributes = True

class UserInUpdate(BaseModel):
    id : int
    username : Union[str, None] = None
    email : Union[EmailStr, None] = None
    password : Union[str, None] = None
    role : Union[UserRole, None] = None

class UserInLogin(BaseModel):
    email : EmailStr
    password : str

class UserWithToken(BaseModel):
    token : str
    role: UserRole