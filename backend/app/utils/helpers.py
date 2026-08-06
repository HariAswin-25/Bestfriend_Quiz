import random
import string

def generate_room_code(length: int = 6) -> str:
    characters = string.ascii_uppercase + string.digits
    return ''.join(random.choices(characters, k=length))

def calculate_match_percentage(matched: int, total: int) -> float:
    if total <= 0:
        return 0.0
    return round((matched / total) * 100, 1)

def get_achievement(match_percentage: float) -> str:
    if match_percentage >= 90:
        return "Soulmates ✨"
    elif match_percentage >= 75:
        return "Great Friends 🔥"
    elif match_percentage >= 60:
        return "Almost Twins 👯"
    elif match_percentage >= 40:
        return "Good Friends 👍"
    else:
        return "Need More Time Together ⏳"
