import uuid
import os
import sys
from datetime import datetime
from sqlalchemy import Column, String, Integer, Float, Boolean, DateTime, ForeignKey, Text, JSON
from sqlalchemy.orm import relationship

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
sys.path.insert(0, os.path.abspath(os.path.dirname(__file__)))

try:
    from backend.database import Base
except ModuleNotFoundError:
    from database import Base

def generate_uuid():
    return str(uuid.uuid4())

class User(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True, default=generate_uuid)
    session_id = Column(String, unique=True, index=True)
    name = Column(String(50), nullable=False)
    avatar = Column(String(255), default="😊")
    created_at = Column(DateTime, default=datetime.utcnow)

class Room(Base):
    __tablename__ = "rooms"

    id = Column(String, primary_key=True, default=generate_uuid)
    code = Column(String(10), unique=True, index=True, nullable=False)
    title = Column(String(100), default="Best Friend Challenge")
    creator_id = Column(String, ForeignKey("users.id"), nullable=False)
    friend_id = Column(String, ForeignKey("users.id"), nullable=True)
    status = Column(String(20), default="WAITING")  # WAITING, IN_PROGRESS, COMPLETED
    question_count = Column(Integer, default=5)
    creator_ready = Column(Boolean, default=False)
    friend_ready = Column(Boolean, default=False)
    creator_finished = Column(Boolean, default=False)
    friend_finished = Column(Boolean, default=False)
    question_ids = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    completed_at = Column(DateTime, nullable=True)

    creator = relationship("User", foreign_keys=[creator_id])
    friend = relationship("User", foreign_keys=[friend_id])
    answers = relationship("Answer", back_populates="room", cascade="all, delete-orphan")
    results = relationship("Result", back_populates="room", uselist=False, cascade="all, delete-orphan")

class Question(Base):
    __tablename__ = "questions"

    id = Column(String, primary_key=True, default=generate_uuid)
    text = Column(Text, nullable=False)
    category = Column(String(50), default="General")
    type = Column(String(20), default="mcq")  # mcq, tf, text, emoji, rating
    options = Column(Text, nullable=True)  # JSON encoded list of options for MCQ/emoji
    is_default = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

class CustomQuestion(Base):
    __tablename__ = "custom_questions"

    id = Column(String, primary_key=True, default=generate_uuid)
    room_id = Column(String, ForeignKey("rooms.id"), nullable=False)
    text = Column(Text, nullable=False)
    type = Column(String(20), default="mcq")
    options = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

class Answer(Base):
    __tablename__ = "answers"

    id = Column(String, primary_key=True, default=generate_uuid)
    room_id = Column(String, ForeignKey("rooms.id"), nullable=False)
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    question_id = Column(String, nullable=False)
    question_type = Column(String(20), default="mcq")
    answer_text = Column(Text, nullable=False)
    submitted_at = Column(DateTime, default=datetime.utcnow)

    room = relationship("Room", back_populates="answers")

class Result(Base):
    __tablename__ = "results"

    id = Column(String, primary_key=True, default=generate_uuid)
    room_id = Column(String, ForeignKey("rooms.id"), unique=True, nullable=False)
    total_questions = Column(Integer, default=0)
    matched_answers = Column(Integer, default=0)
    match_percentage = Column(Float, default=0.0)
    compatibility_score = Column(Integer, default=0)
    winner_id = Column(String, nullable=True)
    winner_name = Column(String(100), default="Tied!")
    achievement = Column(String(100), default="Good Friends")
    detailed_breakdown = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    room = relationship("Room", back_populates="results")

class Leaderboard(Base):
    __tablename__ = "leaderboard"

    id = Column(String, primary_key=True, default=generate_uuid)
    room_id = Column(String, nullable=False)
    creator_name = Column(String(50), nullable=False)
    friend_name = Column(String(50), nullable=False)
    match_percentage = Column(Float, nullable=False)
    achievement = Column(String(100), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
