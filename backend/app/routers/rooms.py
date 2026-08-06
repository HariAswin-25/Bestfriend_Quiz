from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.models import Room, User
from app.schemas.schemas import RoomCreate, JoinRoomRequest, RoomResponse, ToggleReadyRequest
from app.services.room_service import create_challenge_room, join_challenge_room

router = APIRouter(prefix="/rooms", tags=["Rooms"])

@router.post("/create", response_model=dict)
def create_room_endpoint(req: RoomCreate, db: Session = Depends(get_db)):
    try:
        room, creator = create_challenge_room(
            db,
            creator_name=req.creator_name,
            creator_avatar=req.creator_avatar,
            title=req.title,
            question_ids=req.question_ids,
            custom_questions=req.custom_questions
        )
        return {
            "status": "success",
            "room_id": room.id,
            "room_code": room.code,
            "creator_id": creator.id,
            "title": room.title,
            "question_count": room.question_count
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/join", response_model=dict)
def join_room_endpoint(req: JoinRoomRequest, db: Session = Depends(get_db)):
    try:
        room, friend = join_challenge_room(
            db,
            room_code=req.room_code,
            player_name=req.player_name,
            player_avatar=req.player_avatar
        )
        return {
            "status": "success",
            "room_id": room.id,
            "room_code": room.code,
            "friend_id": friend.id,
            "title": room.title,
            "creator_id": room.creator_id,
            "question_count": room.question_count
        }
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))

@router.get("/{room_id}", response_model=RoomResponse)
def get_room_details(room_id: str, db: Session = Depends(get_db)):
    room = db.query(Room).filter((Room.id == room_id) | (Room.code == room_id.upper())).first()
    if not room:
        raise HTTPException(status_code=404, detail="Room not found.")

    creator = db.query(User).filter(User.id == room.creator_id).first()
    friend = db.query(User).filter(User.id == room.friend_id).first() if room.friend_id else None

    return RoomResponse(
        id=room.id,
        code=room.code,
        title=room.title,
        creator_id=room.creator_id,
        creator_name=creator.name if creator else "Creator",
        creator_avatar=creator.avatar if creator else "😊",
        friend_id=room.friend_id,
        friend_name=friend.name if friend else None,
        friend_avatar=friend.avatar if friend else None,
        status=room.status,
        question_count=room.question_count,
        creator_ready=room.creator_ready,
        friend_ready=room.friend_ready,
        creator_finished=room.creator_finished,
        friend_finished=room.friend_finished,
        created_at=room.created_at
    )

@router.post("/ready", response_model=dict)
def toggle_ready_endpoint(req: ToggleReadyRequest, db: Session = Depends(get_db)):
    room = db.query(Room).filter(Room.id == req.room_id).first()
    if not room:
        raise HTTPException(status_code=404, detail="Room not found.")

    if req.user_id == room.creator_id:
        room.creator_ready = req.ready
    elif req.user_id == room.friend_id:
        room.friend_ready = req.ready
    else:
        raise HTTPException(status_code=403, detail="User not part of this room.")

    if room.creator_ready and room.friend_ready:
        room.status = "IN_PROGRESS"

    db.commit()
    return {
        "status": "success",
        "creator_ready": room.creator_ready,
        "friend_ready": room.friend_ready,
        "room_status": room.status
    }
