from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from app.utils.init_db import create_tables
from app.routers.auth import authRouter
from app.routers.professeur.stt import sttRouter
from app.routers.professeur.summarization import router as summarizationRouter
from app.routers.professeur.cours import router as coursRouter
from app.utils.protectRoute import get_current_user
from app.db.schemas.user import UserOutput
import os

@asynccontextmanager
async def lifespan(app : FastAPI):
    print("created")
    create_tables()
    yield

app = FastAPI(lifespan=lifespan)

# Get allowed origins from environment variable or use default
ALLOWED_ORIGINS = os.getenv("ALLOWED_ORIGINS", "http://localhost:3000").split(",")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["Content-Type", "Authorization", "Accept"],
    expose_headers=["Content-Type", "Authorization"]
)

app.include_router(router=authRouter, tags=["auth"], prefix="/auth")
app.include_router(router=sttRouter, tags=["stt"], prefix="/stt")
app.include_router(router=summarizationRouter, tags=["professeur"], prefix="/professeur")
app.include_router(router=coursRouter, tags=["professeur"], prefix="/professeur")

@app.get("/")
def test():
    return("status : running")

@app.get("/protected")
def read_protected(user : UserOutput = Depends(get_current_user)):
    return{"data" : user}

