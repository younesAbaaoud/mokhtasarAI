from pydantic import BaseModel
from typing import Optional

class ModuleBase(BaseModel):
    name: str
    abreviation: str
    description: Optional[str] = None

class ModuleCreate(ModuleBase):
    pass

class ModuleUpdate(ModuleBase):
    pass

class Module(ModuleBase):
    id: int

    class Config:
        from_attributes = True 