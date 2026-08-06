import json
import os
import sys

# Ensure sys.path includes both project root and backend dir
current_dir = os.path.abspath(os.path.dirname(__file__))
parent_dir = os.path.abspath(os.path.join(current_dir, ".."))

if current_dir not in sys.path:
    sys.path.insert(0, current_dir)
if parent_dir not in sys.path:
    sys.path.insert(0, parent_dir)

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse

try:
    from backend.config import settings
    from backend.database import engine, Base, SessionLocal
    from backend.models import Question
    from backend.routers import rooms, quiz, users, results
except ModuleNotFoundError:
    from config import settings
    from database import engine, Base, SessionLocal
    from models import Question
    from routers import rooms, quiz, users, results

# Create DB Tables on application startup
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    openapi_url=f"{settings.API_PREFIX}/openapi.json",
    docs_url=f"{settings.API_PREFIX}/docs"
)

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register API Routers under /api prefix FIRST
app.include_router(rooms.router, prefix=settings.API_PREFIX)
app.include_router(quiz.router, prefix=settings.API_PREFIX)
app.include_router(users.router, prefix=settings.API_PREFIX)
app.include_router(results.router, prefix=settings.API_PREFIX)

# Seed Question Library (50+ Sample Questions)
def seed_default_questions():
    db = SessionLocal()
    try:
        if db.query(Question).count() >= 50:
            return

        sample_questions = [
            # Food & Drink
            {"text": "What is my absolute favorite food?", "category": "Food", "type": "mcq", "options": ["Pizza", "Sushi", "Tacos", "Burgers"]},
            {"text": "Tea or Coffee?", "category": "Food", "type": "tf", "options": ["Tea 🍵", "Coffee ☕"]},
            {"text": "What is my go-to pizza topping?", "category": "Food", "type": "mcq", "options": ["Extra Cheese", "Pepperoni", "Mushrooms", "Pineapple"]},
            {"text": "Rate how much I love sweet desserts on a scale of 1-10", "category": "Food", "type": "rating", "options": []},
            {"text": "Sweet or Savory snacks?", "category": "Food", "type": "tf", "options": ["Sweet 🍫", "Savory 🥨"]},
            {"text": "What is my preferred breakfast item?", "category": "Food", "type": "mcq", "options": ["Pancakes", "Eggs & Toast", "Fruit Smoothie", "Cereal"]},
            {"text": "What emoji represents my favorite vibe?", "category": "Food", "type": "emoji", "options": ["🚀", "🔥", "🌈", "😎", "🥳"]},
            {"text": "Spicy food lover or mild flavor fan?", "category": "Food", "type": "tf", "options": ["Super Spicy 🌶️", "Mild & Gentle 🍯"]},
            {"text": "What is my favorite fast food chain?", "category": "Food", "type": "text", "options": []},
            {"text": "Ice Cream or Frozen Yogurt?", "category": "Food", "type": "tf", "options": ["Ice Cream 🍦", "FroYo 🍨"]},

            # Lifestyle & Personal
            {"text": "Am I a morning person or a night owl?", "category": "Lifestyle", "type": "tf", "options": ["Morning Bird 🌅", "Night Owl 🦉"]},
            {"text": "Cats or Dogs?", "category": "Lifestyle", "type": "tf", "options": ["Cats 🐱", "Dogs 🐶"]},
            {"text": "What is my ideal weekend activity?", "category": "Lifestyle", "type": "mcq", "options": ["Binge-watching TV", "Outdoor Adventure", "Gaming Night", "Sleeping in"]},
            {"text": "Rate my level of patience on a scale of 1-10", "category": "Lifestyle", "type": "rating", "options": []},
            {"text": "Beach vacation or mountain cabin getaway?", "category": "Lifestyle", "type": "tf", "options": ["Tropical Beach 🏖️", "Mountain Cabin 🏔️"]},
            {"text": "What app do I spend the most time on?", "category": "Lifestyle", "type": "mcq", "options": ["Instagram", "TikTok", "YouTube", "WhatsApp"]},
            {"text": "How clean is my bedroom usually?", "category": "Lifestyle", "type": "rating", "options": []},
            {"text": "Am I an introvert or an extrovert?", "category": "Lifestyle", "type": "tf", "options": ["Introvert 🏠", "Extrovert 🎉"]},
            {"text": "What is my biggest dream destination?", "category": "Lifestyle", "type": "text", "options": []},
            {"text": "How quickly do I reply to text messages?", "category": "Lifestyle", "type": "mcq", "options": ["Instantly ⚡", "Within an hour ⌛", "Takes 3-5 business days 🐌", "Read & forget 🙈"]},

            # Entertainment & Hobbies
            {"text": "What movie genre do I enjoy the most?", "category": "Entertainment", "type": "mcq", "options": ["Action / Sci-Fi", "Comedy", "Horror / Thriller", "Romance"]},
            {"text": "PC Gaming or Console Gaming?", "category": "Entertainment", "type": "tf", "options": ["PC Master Race 💻", "Console Master 🎮"]},
            {"text": "Favorite music genre?", "category": "Entertainment", "type": "mcq", "options": ["Pop / Top 40", "Hip-Hop / Rap", "Rock / Indie", "EDM / Electronic"]},
            {"text": "Rate my dancing skills from 1 to 10", "category": "Entertainment", "type": "rating", "options": []},
            {"text": "Do I prefer binge-watching a series or watching movies?", "category": "Entertainment", "type": "tf", "options": ["Series Binge 📺", "Movie Marathon 🍿"]},
            {"text": "Who is my current celebrity crush or favorite icon?", "category": "Entertainment", "type": "text", "options": []},
            {"text": "Pick the emoji that describes my sense of humor", "category": "Entertainment", "type": "emoji", "options": ["😂", "🤡", "💀", "😏", "🤖"]},
            {"text": "Books or Audiobooks?", "category": "Entertainment", "type": "tf", "options": ["Physical Books 📖", "Audiobooks 🎧"]},
            {"text": "What board game am I best at?", "category": "Entertainment", "type": "text", "options": []},
            {"text": "Concerts or Movie Theaters?", "category": "Entertainment", "type": "tf", "options": ["Live Concerts 🎤", "Movie Cinema 🎬"]},

            # School, Work & Superpowers
            {"text": "What subject was my absolute favorite in school?", "category": "Personal", "type": "mcq", "options": ["Math / Science", "Arts / Music", "History / Literature", "PE / Sports"]},
            {"text": "If I could have any superpower, what would it be?", "category": "Personal", "type": "mcq", "options": ["Flight 🕊️", "Invisibility 👻", "Teleportation 🌀", "Time Travel ⏳"]},
            {"text": "How do I react under stress?", "category": "Personal", "type": "mcq", "options": ["Stay Calm & Collected", "Panic a Little", "Vent to Friends", "Eat Snacks"]},
            {"text": "Rate my cooking skills on a scale of 1-10", "category": "Personal", "type": "rating", "options": []},
            {"text": "What is my biggest pet peeve?", "category": "Personal", "type": "mcq", "options": ["Chewing loudly", "Being late", "Slow Wi-Fi", "Unread notification badges"]},
            {"text": "Am I a spender or a saver?", "category": "Personal", "type": "tf", "options": ["Big Spender 💸", "Smart Saver 💰"]},
            {"text": "What is my favorite season of the year?", "category": "Personal", "type": "mcq", "options": ["Summer ☀️", "Autumn 🍁", "Winter ❄️", "Spring 🌸"]},
            {"text": "What color dominates my wardrobe?", "category": "Personal", "type": "text", "options": []},
            {"text": "How competitive am I in games?", "category": "Personal", "type": "rating", "options": []},
            {"text": "Plan everything or be completely spontaneous?", "category": "Personal", "type": "tf", "options": ["Master Planner 📅", "Spontaneous Adventurer 🎒"]},

            # Fun & Quirky
            {"text": "What emoji represents our friendship?", "category": "Fun", "type": "emoji", "options": ["💎", "🔥", "🤝", "🥳", "👻"]},
            {"text": "Would I survive a zombie apocalypse?", "category": "Fun", "type": "tf", "options": ["Leader of Survivors 🧟‍♂️", "First to go 💀"]},
            {"text": "How often do I drop or misplace my phone?", "category": "Fun", "type": "mcq", "options": ["Never", "Once a week", "Every single day", "It's currently cracked"]},
            {"text": "What kind of superhero sidekick would I be?", "category": "Fun", "type": "mcq", "options": ["Tech Genius 💻", "Sarcastic Commentator 🗣️", "Muscle Power 💪", "Distraction Master 🎭"]},
            {"text": "If I won 1 Million dollars today, what would I buy first?", "category": "Fun", "type": "text", "options": []},
            {"text": "Rate how superstitious I am on a scale of 1-10", "category": "Fun", "type": "rating", "options": []},
            {"text": "Are hot dogs sandwiches?", "category": "Fun", "type": "tf", "options": ["Yes, obviously 🌭", "No way! 🛑"]},
            {"text": "Pineapple on pizza?", "category": "Fun", "type": "tf", "options": ["Delicious Masterpiece 🍍", "Absolute Crime 🚓"]},
            {"text": "What karaoke song would I sing with full passion?", "category": "Fun", "type": "text", "options": []},
            {"text": "Who is more likely to forget a password?", "category": "Fun", "type": "tf", "options": ["Definitely Me 🙋", "You 👈"]}
        ]

        for q in sample_questions:
            q_model = Question(
                text=q["text"],
                category=q["category"],
                type=q["type"],
                options=json.dumps(q["options"]) if q["options"] else None,
                is_default=True
            )
            db.add(q_model)
        db.commit()
    finally:
        db.close()

seed_default_questions()

# Mount Static Frontend at Root Directory cleanly whether executed from root or backend directory
frontend_dir = os.path.abspath(os.path.join(current_dir, "..", "frontend"))
if not os.path.exists(frontend_dir):
    frontend_dir = os.path.abspath(os.path.join(current_dir, "frontend"))

if os.path.exists(frontend_dir):
    app.mount("/", StaticFiles(directory=frontend_dir, html=True), name="frontend")
