"""
Timer service helper for background or game timers.
"""
import time

def calculate_time_remaining(start_timestamp: float, duration_seconds: int = 30) -> int:
    elapsed = int(time.time() - start_timestamp)
    remaining = duration_seconds - elapsed
    return max(0, remaining)
