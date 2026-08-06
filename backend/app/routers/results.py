import json
from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.models import Room, Leaderboard, User
from app.schemas.schemas import ResultResponse, LeaderboardItem, AnswerComparisonItem
from app.services.result_service import evaluate_room_results

router = APIRouter(tags=["Results & Health"])

@router.get("/results/{room_id}")
def get_room_results_endpoint(room_id: str, db: Session = Depends(get_db)):
    room = db.query(Room).filter((Room.id == room_id) | (Room.code == room_id.upper())).first()
    if not room:
        raise HTTPException(status_code=404, detail="Room not found.")

    creator = db.query(User).filter(User.id == room.creator_id).first()
    friend = db.query(User).filter(User.id == room.friend_id).first() if room.friend_id else None

    c_name = creator.name if creator else "Creator"
    f_name = friend.name if friend else "Friend"
    c_avatar = creator.avatar if creator else "😊"
    f_avatar = friend.avatar if friend else "😎"

    if not (room.creator_finished and room.friend_finished):
        return {
            "status": "WAITING_FOR_PARTNER",
            "message": "Answers locked! Waiting for both players to complete the quiz before revealing results.",
            "creator_finished": room.creator_finished,
            "friend_finished": room.friend_finished,
            "creator_name": c_name,
            "friend_name": f_name
        }

    result_obj = evaluate_room_results(db, room)

    breakdown_data = json.loads(result_obj.detailed_breakdown) if result_obj.detailed_breakdown else []
    breakdown_items = [AnswerComparisonItem(**item) for item in breakdown_data]

    return ResultResponse(
        id=result_obj.id,
        room_id=room.id,
        total_questions=result_obj.total_questions,
        matched_answers=result_obj.matched_answers,
        match_percentage=result_obj.match_percentage,
        compatibility_score=result_obj.compatibility_score,
        winner_id=result_obj.winner_id,
        winner_name=result_obj.winner_name,
        achievement=result_obj.achievement,
        creator_name=c_name,
        friend_name=f_name,
        creator_avatar=c_avatar,
        friend_avatar=f_avatar,
        breakdown=breakdown_items,
        status="COMPLETED"
    )

@router.get("/leaderboard", response_model=List[LeaderboardItem])
def get_leaderboard_endpoint(db: Session = Depends(get_db)):
    entries = db.query(Leaderboard).order_by(Leaderboard.match_percentage.desc()).limit(20).all()
    return entries

@router.get("/health")
def health_check():
    return {
        "status": "healthy",
        "service": "Best Friend Challenge API",
        "database": "connected"
    }
