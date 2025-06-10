import jwt
from decouple import config
import time
from fastapi import HTTPException, status

JWT_SECRET = config("JWT_SECRET")
JWT_ALGORITHM = config("JWT_ALGORITHM")

class AuthHandler(object):

    @staticmethod
    def sign_jwt(user_id : int) -> str:
        payload = {
            "user_id" : user_id,
            "expires" : time.time() + 604800  # One week in seconds
        }

        try:
            token = jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)
            return token
        except Exception as e:
            print(f"Error signing JWT: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Error generating authentication token"
            )
    
    @staticmethod
    def decode_jwt(token : str) -> dict:
        try:
            decode_token = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
            if decode_token["expires"] < time.time():
                print("Token has expired")
                return None
            return decode_token
        except jwt.ExpiredSignatureError:
            print("Token has expired")
            return None
        except jwt.InvalidTokenError as e:
            print(f"Invalid token: {str(e)}")
            return None
        except Exception as e:
            print(f"Error decoding token: {str(e)}")
            return None