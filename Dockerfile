# Production Dockerfile for Best Friend Challenge App
FROM python:3.11-slim

WORKDIR /app

# Install dependencies
COPY backend/requirements.txt /app/backend/requirements.txt
RUN pip install --no-cache-dir -r backend/requirements.txt

# Copy source code
COPY . /app

EXPOSE 8000

ENV PYTHONPATH=/app
ENV DATABASE_URL=sqlite:///./bf_challenge.db

CMD ["python", "-m", "uvicorn", "backend.main:app", "--host", "0.0.0.0", "--port", "8000"]
