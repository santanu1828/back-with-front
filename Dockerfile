# Multi-stage Dockerfile for full-stack deployment on Render
# Stage 1: Build the Vite Frontend
FROM node:20-alpine AS frontend-builder
WORKDIR /app/frontend

COPY frontend/package*.json ./
RUN npm install

COPY frontend/ ./
RUN npm run build

# Stage 2: Python FastAPI Backend + Serve Frontend
FROM python:3.11-slim
WORKDIR /app

# Ensure unbuffered logs for real-time streaming in Render logs
ENV PYTHONUNBUFFERED=1 \
    PORT=8000

# Install Python backend dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend application source
COPY backend/ ./backend/

# Copy built frontend assets from builder stage
COPY --from=frontend-builder /app/frontend/dist ./frontend/dist

# Expose container port
EXPOSE 8000

# Start Uvicorn with dynamic Render PORT support
CMD ["sh", "-c", "uvicorn backend.main:app --host 0.0.0.0 --port ${PORT:-8000}"]
