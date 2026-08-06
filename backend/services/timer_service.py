from datetime import datetime, timedelta

DEFAULT_QUESTION_TIMEOUT_SECONDS = 30

def is_answer_submitted_in_time(submission_time: datetime, started_at: datetime, timeout_sec: int = DEFAULT_QUESTION_TIMEOUT_SECONDS) -> bool:
    """Verifies that an answer submission occurred within the valid timeframe + grace buffer."""
    grace_period = timedelta(seconds=timeout_sec + 5)
    return (submission_time - started_at) <= grace_period
