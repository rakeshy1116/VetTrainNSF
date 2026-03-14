# VetTrain NSF

A web-based interview preparation application for veterans, built with React and Python Flask. It guides users through structured mock interviews with AI-powered answer evaluation.

## Features

- 19 pre-defined interview questions across 8 categories
- Randomized question selection per session (Introduction + 6 random + Conclusion)
- Real-time speech-to-text using OpenAI Whisper API
- ML-based answer evaluation via a Flask backend
- Per-question answer persistence during a session
- Start Over and Reset Answer functionality

## Project Structure

```
VetTrainNSF/
├── src/                        # React frontend
│   ├── App.js                  # Main interview component
│   ├── App.css                 # Application styles
│   ├── AudioRecord.js          # Alternative audio recording component
│   ├── AudioUpload.js          # Audio file upload component
│   ├── hooks/
│   │   └── useSpeechToText/    # Custom Web Speech API hook
│   └── ...
├── flask_backend.py            # Flask API server
├── model.py                    # ML model loader and predictor
├── api_dev_model_binary_text.pkl  # Pre-trained binary classification model
├── public/                     # Static assets
└── requirements.txt            # Python dependencies
```

## Prerequisites

- Node.js >= 16
- Python >= 3.8
- An OpenAI API key (for Whisper speech-to-text)
- A browser with Web Speech API support (Chrome recommended)

## Setup

### Frontend

```bash
npm install
```

Create a `.env` file in the project root (see `.env.example`):

```bash
cp .env.example .env
# Edit .env and add your OpenAI API key
```

Start the development server:

```bash
npm start
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Backend

Install Python dependencies:

```bash
pip install -r requirements.txt
```

Start the Flask server:

```bash
python flask_backend.py
```

The API runs on [http://localhost:5000](http://localhost:5000).

## Environment Variables

| Variable | Description | Required |
|---|---|---|
| `REACT_APP_OPENAI_API_KEY` | OpenAI API key for Whisper transcription | Yes |
| `REACT_APP_BACKEND_URL` | Flask backend URL (default: `http://localhost:5000`) | No |

See `.env.example` for a template.

## Interview Question Categories

| Category | Questions |
|---|---|
| Introduction | 1 |
| Mental Capability | 2 |
| Knowledge and Skills | 3 |
| Leadership | 2 |
| Communication and Interpersonal Skills | 3 |
| Basic Personality Tendencies | 2 |
| Persuasion and Negotiation | 2 |
| Interests and Preferences | 2 |
| Why | 1 |
| Conclusion | 1 |

Each session presents: the Introduction question, 6 randomly selected questions from the middle categories, and the Conclusion question.

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/health` | Health check |
| `POST` | `/` | Submit answer for evaluation. Body: `{"answer": "..."}` |

The POST endpoint returns a JSON object with `Label` and `Reasoning` fields from the ML model.

## Available Scripts

| Command | Description |
|---|---|
| `npm start` | Run the app in development mode |
| `npm test` | Run tests in interactive watch mode |
| `npm run build` | Build the app for production |

## Known Limitations

- Browser must support the Web Speech API (Chrome recommended)
- The ML model evaluates answer quality as a binary classification (succinct vs. verbose)
- No persistent storage — answers are lost on page refresh
- CORS is currently open to all origins; restrict in production

## Contributing

1. Create a feature branch from `master`
2. Make your changes
3. Submit a pull request with a clear description of the improvement

## License

This project is part of the NSF VetTrain research initiative.
