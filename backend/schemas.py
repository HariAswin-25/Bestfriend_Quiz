from typing import List, Optional, Any
from pydantic import BaseModel, Field
from datetime import datetime

class UserBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=50)
    avatar: Optional[str] = "😊"

class UserCreate(UserBase):
    pass

class UserResponse(UserBase):
    id: str
    session_id: str
    created_at: datetime

    class Config:
        from_attributes = True

class QuestionBase(BaseModel):
    text: str
    category: str = "General"
    type: str = "mcq"  # mcq, tf, text, emoji, rating
    options: Optional[List[str]] = None

class QuestionCreate(QuestionBase):
    pass

class QuestionResponse(QuestionBase):
    id: str
    is_default: bool = True

    class Config:
        from_attributes = True

class CustomQuestionCreate(BaseModel):
    text: str
    type: str = "mcq"
    options: Optional[List[str]] = None

class RoomCreate(BaseModel):
    creator_name: str
    creator_avatar: Optional[str] = "😊"
    title: Optional[str] = "Best Friend Challenge"
    question_ids: Optional[List[str]] = None
    custom_questions: Optional[List[CustomQuestionCreate]] = None

class JoinRoomRequest(BaseModel):
    room_code: str
    player_name: str
    player_avatar: Optional[str] = "😎"

class RoomResponse(BaseModel):
    id: str
    code: str
    title: str
    creator_id: str
    creator_name: Optional[str] = None
    creator_avatar: Optional[str] = None
    friend_id: Optional[str] = None
    friend_name: Optional[str] = None
    friend_avatar: Optional[str] = None
    status: str
    question_count: int
    creator_ready: bool
    friend_ready: bool
    creator_finished: bool
    friend_finished: bool
    created_at: datetime

    class Config:
        from_attributes = True

class AnswerSubmit(BaseModel):
    room_id: str
    user_id: str
    question_id: str
    question_type: str
    answer_text: str

class ToggleReadyRequest(BaseModel):
    room_id: str
    user_id: str
    ready: bool

class FinishQuizRequest(BaseModel):
    room_id: str
    user_id: str

class AnswerComparisonItem(BaseModel):
    question_id: str
    question_text: str
    question_type: str
    creator_answer: str
    friend_answer: str
    is_match: bool

class ResultResponse(BaseModel):
    id: str
    room_id: str
    total_questions: int
    matched_answers: int
    match_percentage: float
    compatibility_score: int
    winner_id: Optional[str] = None
    winner_name: str
    achievement: str
    creator_name: str
    friend_name: str
    creator_avatar: str
    friend_avatar: str
    breakdown: List[AnswerComparisonItem]
    status: str  # "COMPLETED" or "WAITING_FOR_PARTNER"

class LeaderboardItem(BaseModel):
    id: str
    creator_name: str
    friend_name: str
    match_percentage: float
    achievement: str
    created_at: datetime

    class Config:
        from_attributes = True
