from fastapi import Depends, Header, HTTPException, status
from sqlalchemy.orm import Session
from typing import Annotated, Union
from app.core.security.authHandler import AuthHandler
from app.services.userService import UserService
from app.core.database import get_db
from app.db.schemas.user import UserOutput
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from datetime import datetime, timedelta
from app.core.security.hashHelper import HashHelper
from app.db.repository.user import UserRepository
import os

AUTH_PREFIX = 'Bearer '  
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")

def get_current_user(
        session : Session = Depends(get_db),
        authorization : Annotated[Union[str,None],Header()] = None
) -> UserOutput :
    if not authorization:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="No authorization header provided"
        )
    
    if not authorization.startswith(AUTH_PREFIX):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authorization header format. Expected 'Bearer <token>'"
        )
    
    token = authorization[len(AUTH_PREFIX):]
    payload = AuthHandler.decode_jwt(token=token)

    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token"
        )

    if not payload.get("user_id"):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token payload"
        )

    try:
        user = UserService(session=session).get_user_by_id(payload["user_id"])
        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="User not found"
            )
        return UserOutput(
            id=user.id,
            username=user.username,
            email=user.email,
            role=user.role
        )
    except Exception as error:
        print(f"Error getting user: {str(error)}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Error authenticating user"
        )