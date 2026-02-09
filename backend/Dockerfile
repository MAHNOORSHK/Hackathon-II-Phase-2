FROM python:3.10-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    g++ \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements and install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Create non-root user
RUN useradd --create-home --shell /bin/bash app \
    && mkdir -p /home/app/.local/share/Cargo \
    && chown -R app:app /home/app
USER app

# Copy the application code
COPY . .

# Expose the port
EXPOSE 7860

# Run the application
CMD ["uvicorn", "src.main:app", "--host", "0.0.0.0", "--port", "7860"]