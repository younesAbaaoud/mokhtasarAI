from app.db.schemas.user import UserOutput, UserInCreate, UserInLogin, UserWithToken
from app.db.repository.user import UserRepository
from app.core.security.authHandler import AuthHandler
from app.db.models.user import User
from sqlalchemy.orm import Session
from app.core.security.hashHelper import HashHelper
from fastapi import HTTPException

class UserService:
    def __init__(self, session : Session):
        self.__userRepository = UserRepository(session=session)
        
    def signup(self, user_details : UserInCreate) -> UserOutput:
        if self.__userRepository.user_existe_by_email(email=user_details.email):
            raise HTTPException(status_code = 400, detail = "Email already registered. Please login instead.")
        
        hashed_password = HashHelper.get_password_hash(plain_password=user_details.password)
        user_details.password = hashed_password
        return self.__userRepository.create_user(user_data=user_details)
    
    def login(self, login_details : UserInLogin) -> UserWithToken:
        if not self.__userRepository.user_existe_by_email(email=login_details.email):
            raise HTTPException(status_code = 400, detail = "Account not found. Please create an account first.")
        
        user = self.__userRepository.get_user_by_email(email=login_details.email)
        if HashHelper.verify_password(plain_password=login_details.password, hashed_password=user.password):
            token = AuthHandler.sign_jwt(user_id=user.id)
            if token:
                return UserWithToken(token=token, role=user.role)
            raise HTTPException(status_code = 500, detail = "Unable to generate authentication token")
        raise HTTPException(status_code = 400, detail = "Invalid email or password")

    def get_user_by_id(self, user_id : int):
        user = self.__userRepository.get_user_by_id(user_id=user_id)
        if user:
            return user
        raise HTTPException(status_code = 400, detail = "User not found")
        
        
        