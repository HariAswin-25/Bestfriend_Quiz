import json
from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.models import Question, CustomQuestion, Room, Answer
from app.schemas.schemas import QuestionResponse, AnswerSubmit, FinishQuizRequest

router = APIRouter(prefix="/quiz", tags=["Quiz"])

@router.get("/questions", response_model=List[QuestionResponse])
def get_question_library(db: Session = Depends(get_db)):
    questions = db.query(Question).filter(Question.is_default == True).all()
    res = []
    for q in questions:
        opts = json.loads(q.options) if q.options else []
        res.append(QuestionResponse(
            id=q.id,
            text=q.text,
            category=q.category,
            type=q.type,
            options=opts,
            is_default=q.is_default
        ))
    return res

@router.get("/room/{room_id}/questions")
def get_room_questions(room_id: str, db: Session = Depends(get_db)):
    room = db.query(Room).filter(Room.id == room_id).first()
    if not room:
        raise HTTPException(status_code=404, detail="Room not found.")

    raw_ids = json.loads(room.question_ids) if room.question_ids else []
    result_questions = []

    for idx, q_id in enumerate(raw_ids, start=1):
        if q_id.startswith("custom_"):
            actual_id = q_id.replace("custom_", "")
            cq = db.query(CustomQuestion).filter(CustomQuestion.id == actual_id).first()
            if cq:
                opts = json.loads(cq.options) if cq.options else []
                result_questions.append({
                    "id": q_id,
                    "number": idx,
                    "text": cq.text,
                    "category": "Custom",
                    "type": cq.type,
                    "options": opts
                })
        else:
            q = db.query(Question).filter(Question.id == q_id).first()
            if q:
                opts = json.loads(q.options) if q.options else []
                result_questions.append({
                    "id": q.id,
                    "number": idx,
                    "text": q.text,
                    "category": q.category,
                    "type": q.type,
                    "options": opts
                })

    return {
        "room_id": room.id,
        "title": room.title,
        "total_questions": len(result_questions),
        "questions": result_questions
    }

@router.post("/submit-answer")
def submit_answer_endpoint(req: AnswerSubmit, db: Session = Depends(get_db)):
    existing = db.query(Answer).filter(
        Answer.room_id == req.room_id,
        Answer.user_id == req.user_id,
        Answer.question_id == req.question_id
    ).first()

    if existing:
        return {
            "status": "locked",
            "message": "Answer already submitted and permanently locked.",
            "answer_id": existing.id
        }

    answer = Answer(
        room_id=req.room_id,
        user_id=req.user_id,
        question_id=req.question_id,
        question_type=req.question_type,
        answer_text=req.answer_text
    )
    db.add(answer)
    db.commit()

    return {
        "status": "success",
        "message": "Answer submitted and locked successfully.",
        "answer_id": answer.id
    }

@router.post("/finish")
def finish_quiz_endpoint(req: FinishQuizRequest, db: Session = Depends(get_db)):
    room = db.query(Room).filter(Room.id == req.room_id).first()
    if not room:
        raise HTTPException(status_code=404, detail="Room not found.")

    if req.user_id == room.creator_id:
        room.creator_finished = True
    elif req.user_id == room.friend_id:
        room.friend_finished = True
    else:
        raise HTTPException(status_code=403, detail="User not in room.")

    db.commit()

    both_finished = room.creator_finished and room.friend_finished

    return {
        "status": "success",
        "creator_finished": room.creator_finished,
        "friend_finished": room.friend_finished,
        "both_finished": both_finished
    }
