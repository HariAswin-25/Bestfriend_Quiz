import json
from typing import List, Tuple, Optional
from sqlalchemy.orm import Session
from app.models.models import Room, User, Question, CustomQuestion
from app.utils.helpers import generate_room_code
from app.schemas.schemas import CustomQuestionCreate

def create_challenge_room(
    db: Session,
    creator_name: str,
    creator_avatar: str,
    title: str,
    question_ids: Optional[List[str]] = None,
    custom_questions: Optional[List[CustomQuestionCreate]] = None
) -> Tuple[Room, User]:
    creator = User(name=creator_name, avatar=creator_avatar or "😊")
    db.add(creator)
    db.flush()

    code = generate_room_code(6)
    while db.query(Room).filter(Room.code == code).first() is not None:
        code = generate_room_code(6)

    # Initialize Room first to get valid room.id for foreign key constraints
    room = Room(
        code=code,
        title=title or "Best Friend Challenge",
        creator_id=creator.id,
        question_count=0,
        question_ids="[]",
        status="WAITING"
    )
    db.add(room)
    db.flush()

    final_question_ids = []
    
    if question_ids:
        final_question_ids.extend(question_ids)

    if custom_questions:
        for cq in custom_questions:
            cq_text = cq.text if hasattr(cq, 'text') else cq.get('text')
            cq_type = cq.type if hasattr(cq, 'type') else cq.get('type', 'mcq')
            cq_opts = cq.options if hasattr(cq, 'options') else cq.get('options', [])
            
            custom_q_model = CustomQuestion(
                room_id=room.id,
                text=cq_text,
                type=cq_type,
                options=json.dumps(cq_opts) if cq_opts else None
            )
            db.add(custom_q_model)
            db.flush()
            final_question_ids.append(f"custom_{custom_q_model.id}")

    if not final_question_ids:
        defaults = db.query(Question).filter(Question.is_default == True).limit(5).all()
        final_question_ids = [q.id for q in defaults]

    room.question_count = len(final_question_ids)
    room.question_ids = json.dumps(final_question_ids)

    db.commit()
    db.refresh(room)
    db.refresh(creator)

    return room, creator

def join_challenge_room(
    db: Session,
    room_code: str,
    player_name: str,
    player_avatar: str
) -> Tuple[Room, User]:
    room = db.query(Room).filter(Room.code == room_code.upper()).first()
    if not room:
        raise ValueError("Room code not found. Please check and try again.")

    if room.friend_id is not None:
        friend = db.query(User).filter(User.id == room.friend_id).first()
        if friend and friend.name.lower() == player_name.lower():
            return room, friend
        raise ValueError("This room is already full with 2 players.")

    friend = User(name=player_name, avatar=player_avatar or "😎")
    db.add(friend)
    db.flush()

    room.friend_id = friend.id
    db.commit()
    db.refresh(room)
    db.refresh(friend)

    return room, friend
