from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.models import User
from app.schemas.schemas import UserCreate, UserResponse
from app.core.auth import generate_session_id

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
