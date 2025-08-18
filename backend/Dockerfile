# ---- Base ----
FROM python:3.12-slim AS base

# Prevent Python from writing .pyc and buffering stdout
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

# System deps (add others if you need them, e.g., libgomp1 for xgboost)
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# ---- Deps layer (cached) ----
# Keep requirements separate for better Docker layer caching
COPY requirements.txt /app/requirements.txt
RUN pip install --no-cache-dir --upgrade pip \
 && pip install --no-cache-dir -r /app/requirements.txt

# ---- App layer ----
# Copy only the backend folder contents (since Dockerfile is here, “.” is backend/)
COPY . /app

# If your model is committed in backend/models/model.joblib, it’s copied above.
# Otherwise, mount or download it at runtime.

# Render provides $PORT; default to 8000 for local runs
ENV PORT=8000

# (Optional) Make a non-root user for security
RUN useradd -m appuser
USER appuser

# Expose for local clarity (Render uses $PORT env)
EXPOSE 8000

# Start FastAPI (api/index.py exports `app`)
CMD ["uvicorn", "api.index:app", "--host", "0.0.0.0", "--port", "8000"]
