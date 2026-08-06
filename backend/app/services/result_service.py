import json
from sqlalchemy.orm import Session
from app.models.models import Room, Answer, Question, CustomQuestion, Result, Leaderboard, User
from app.utils.helpers import calculate_match_percentage, get_achievement

def compare_single_answer(q_type: str, creator_ans: str, friend_ans: str) -> bool:
    if not creator_ans or not friend_ans:
        return False
    
    clean_creator = creator_ans.strip().lower()
    clean_friend = friend_ans.strip().lower()

    if q_type == "text":
        return clean_creator == clean_friend
    elif q_type == "rating":
        try:
            val1 = float(clean_creator)
            val2 = float(clean_friend)
            return abs(val1 - val2) <= 1.0
        except ValueError:
            return clean_creator == clean_friend
    else:
        return clean_creator == clean_friend

def evaluate_room_results(db: Session, room: Room) -> Result:
    existing_result = db.query(Result).filter(Result.room_id == room.id).first()
    if existing_result:
        return existing_result

    creator_answers = {
        a.question_id: a for a in db.query(Answer).filter(Answer.room_id == room.id, Answer.user_id == room.creator_id).all()
    }
    friend_answers = {
        a.question_id: a for a in db.query(Answer).filter(Answer.room_id == room.id, Answer.user_id == room.friend_id).all()
    }

    raw_q_ids = json.loads(room.question_ids) if room.question_ids else []
    
    question_map = {}
    for q_id in raw_q_ids:
        if q_id.startswith("custom_"):
            actual_id = q_id.replace("custom_", "")
            cq = db.query(CustomQuestion).filter(CustomQuestion.id == actual_id).first()
            if cq:
                question_map[q_id] = {"text": cq.text, "type": cq.type}
        else:
            q = db.query(Question).filter(Question.id == q_id).first()
            if q:
                question_map[q_id] = {"text": q.text, "type": q.type}

    breakdown = []
    matched_count = 0
    total_count = len(raw_q_ids)

    for q_id in raw_q_ids:
        q_info = question_map.get(q_id, {"text": "Question", "type": "mcq"})
        c_ans = creator_answers.get(q_id).answer_text if q_id in creator_answers else "(No Answer)"
        f_ans = friend_answers.get(q_id).answer_text if q_id in friend_answers else "(No Answer)"
        
        is_match = compare_single_answer(q_info["type"], c_ans, f_ans)
        if is_match:
            matched_count += 1

        breakdown.append({
            "question_id": q_id,
            "question_text": q_info["text"],
            "question_type": q_info["type"],
            "creator_answer": c_ans,
            "friend_answer": f_ans,
            "is_match": is_match
        })

    pct = calculate_match_percentage(matched_count, total_count)
    achievement_title = get_achievement(pct)

    creator = db.query(User).filter(User.id == room.creator_id).first()
    friend = db.query(User).filter(User.id == room.friend_id).first()

    c_name = creator.name if creator else "Creator"
    f_name = friend.name if friend else "Friend"

    winner_id = None
    if pct >= 50:
        winner_name = f"{c_name} & {f_name}!"
    else:
        winner_name = "Room for Improvement! 💡"

    compatibility_score = int(pct)

    result = Result(
        room_id=room.id,
        total_questions=total_count,
        matched_answers=matched_count,
        match_percentage=pct,
        compatibility_score=compatibility_score,
        winner_id=winner_id,
        winner_name=winner_name,
        achievement=achievement_title,
        detailed_breakdown=json.dumps(breakdown)
    )
    db.add(result)

    leaderboard_entry = Leaderboard(
        room_id=room.id,
        creator_name=c_name,
        friend_name=f_name,
        match_percentage=pct,
        achievement=achievement_title
    )
    db.add(leaderboard_entry)

    room.status = "COMPLETED"
    db.commit()
    db.refresh(result)

    return result
