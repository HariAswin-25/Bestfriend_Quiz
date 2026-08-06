import os
import sys
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..")))
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

try:
    from backend.database import get_db
    from backend.models import User
    from backend.schemas import UserCreate, UserResponse
    from backend.auth import generate_session_id
except ModuleNotFoundError:
    from database import get_db
    from models import User
    from schemas import UserCreate, UserResponse
    from auth import generate_session_id

router = APIRouter(prefix="/users", tags=["Users"])

@router.post("", response_model=UserResponse)
def create_user_endpoint(user_in: UserCreate, db: Session = Depends(get_db)):
    session_id = generate_session_id()
    user = User(
        name=user_in.name,
        avatar=user_in.avatar or "😊",
        session_id=session_id
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user

@router.get("/{user_id}", response_model=UserResponse)
def get_user_endpoint(user_id: str, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user
