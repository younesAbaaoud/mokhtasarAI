# Mokhtasar AI

A speech-to-text application for summarizing audio content.

## Prerequisites

- Python 3.8 or higher
- Node.js 16 or higher
- PostgreSQL 15
- FFmpeg

## Installation

### Backend Setup

1. Install PostgreSQL 15 and create a database:
   ```sql
   CREATE DATABASE mydatabase;
   ```

2. Set up the Python environment:
   ```bash
   cd backend
   python -m venv venv_pfa
   # On Windows:
   .\venv_pfa\Scripts\activate
   # On Unix/MacOS:
   source venv/bin/activate
   
   pip install -r requirements.txt
   ```

3. Install FFmpeg:
   - Windows: `choco install ffmpeg`
   - MacOS: `brew install ffmpeg`
   - Linux: `sudo apt-get install ffmpeg`

4. Run the backend:
   ```bash
   uvicorn main:app --reload --host 0.0.0.0 --port 8000
   ```

### Frontend Setup

1. Install dependencies:
   ```bash
   cd frontend
   npm install
   ```

2. Run the development server:
   ```bash
   npm run dev
   ```




## Features

- Speech-to-text transcription using OpenAI's Whisper
- User authentication
- Audio file upload and processing
- Real-time transcription status updates

## Technologies Used

- Backend:
  - FastAPI
  - PostgreSQL
  - SQLAlchemy
  - OpenAI Whisper
  - FFmpeg

- Frontend:
  - Next.js
  - TypeScript
  - Tailwind CSS
  - Shadcn UI
