FROM python:3.12-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

WORKDIR /app

# System deps (add libgl1 if you use OpenCV)
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libgl1 \
  && rm -rf /var/lib/apt/lists/*

# Copy reqs first for better caching
COPY requirements.txt /app/requirements.txt

# Install PyTorch CPU wheels first (avoids pip trying to compile anything)
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir \
      torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cpu && \
    pip install --no-cache-dir -r /app/requirements.txt

# Copy the rest of your app (Dockerfile is inside backend/)
COPY . /app

ENV PORT=8000
EXPOSE 8000

# If not already a package, ensure app/ has __init__.py (you added it earlier)
CMD ["sh", "-c", "uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000}"]
