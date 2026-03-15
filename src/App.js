import React, { useState, useEffect, useRef } from 'react';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';
import { useWhisper } from '@chengsokdara/use-whisper';
import './App.css';

const STORAGE_KEY = 'vetTrain_session';

const ALL_QUESTIONS = [
  { id: 1,  question: 'Tell me about yourself. What are you looking for currently?',                                                                                                                             category: 'Introduction',                       answer: '', Label: '', Reasoning: '', confidence: 0 },
  { id: 2,  question: 'How do you react in a situation where you need to make an immediate decision on a major issue? Can you give me an example where you were involved in such a situation?',                  category: 'Mental Capability',                  answer: '', Label: '', Reasoning: '', confidence: 0 },
  { id: 3,  question: 'How do you react in a situation where you need to make an immediate decision on a major issue?',                                                                                          category: 'Mental Capability',                  answer: '', Label: '', Reasoning: '', confidence: 0 },
  { id: 4,  question: 'What is your biggest achievement/accomplishment that you are proud of?',                                                                                                                  category: 'Knowledge and Skills',               answer: '', Label: '', Reasoning: '', confidence: 0 },
  { id: 5,  question: 'What are the strengths you think are transferrable from your service in military?',                                                                                                       category: 'Knowledge and Skills',               answer: '', Label: '', Reasoning: '', confidence: 0 },
  { id: 6,  question: 'What do you think is an area of improvement for you?',                                                                                                                                   category: 'Knowledge and Skills',               answer: '', Label: '', Reasoning: '', confidence: 0 },
  { id: 7,  question: "What would be the most impactful leadership role that you've had that would demonstrate that behavior?",                                                                                  category: 'Leadership',                         answer: '', Label: '', Reasoning: '', confidence: 0 },
  { id: 8,  question: 'How do you define leadership?',                                                                                                                                                          category: 'Leadership',                         answer: '', Label: '', Reasoning: '', confidence: 0 },
  { id: 9,  question: 'What questions would you ask to a candidate when you are selecting someone for your team?',                                                                                               category: 'Communication and Interpersonal Skills', answer: '', Label: '', Reasoning: '', confidence: 0 },
  { id: 10, question: 'How do you handle a conversation with someone with a different opinion than yours?',                                                                                                      category: 'Communication and Interpersonal Skills', answer: '', Label: '', Reasoning: '', confidence: 0 },
  { id: 11, question: 'What is the most challenging work or school group that you had to collaborate with, and how did you establish rapport with that group? What actions did you take to gain their confidence?', category: 'Communication and Interpersonal Skills', answer: '', Label: '', Reasoning: '', confidence: 0 },
  { id: 12, question: 'Can you describe a time where you had to deal with a major change in your work process? How did you deal with that change?',                                                             category: 'Basic Personality Tendencies',        answer: '', Label: '', Reasoning: '', confidence: 0 },
  { id: 13, question: 'Tell me about a time when you, or your team were not meeting an established goal or deadline. What steps did you take to ensure that goal or deadline was met?',                          category: 'Basic Personality Tendencies',        answer: '', Label: '', Reasoning: '', confidence: 0 },
  { id: 14, question: 'When there is a difference of opinion, how do you arbitrate a system?',                                                                                                                  category: 'Persuasion and Negotiation',          answer: '', Label: '', Reasoning: '', confidence: 0 },
  { id: 15, question: 'Can you think of a situation where there was some kind of tension, or conflict between a couple of your team members, and how you negotiated that with them?',                            category: 'Persuasion and Negotiation',          answer: '', Label: '', Reasoning: '', confidence: 0 },
  { id: 16, question: 'What is your focus after graduation?',                                                                                                                                                   category: 'Interests and Preferences',           answer: '', Label: '', Reasoning: '', confidence: 0 },
  { id: 17, question: 'What role would be of interest to you?',                                                                                                                                                 category: 'Interests and Preferences',           answer: '', Label: '', Reasoning: '', confidence: 0 },
  { id: 18, question: 'Do you have any questions for us?',                                                                                                                                                      category: 'Conclusion',                         answer: '', Label: '', Reasoning: '', confidence: 0 },
  { id: 19, question: 'Why should we hire you?',                                                                                                                                                                category: 'Why',                                answer: '', Label: '', Reasoning: '', confidence: 0 },
];

// ── Confidence star widget ─────────────────────────────────────────────────
function StarRating({ value, onChange }) {
  return (
    <div className="star-rating" aria-label="Self-confidence rating">
      <span className="star-label">Your confidence:</span>
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          className={`star-btn ${star <= value ? 'star-filled' : 'star-empty'}`}
          onClick={() => onChange(star)}
          aria-label={`${star} star${star !== 1 ? 's' : ''}`}
          title={`Rate ${star} out of 5`}
        >
          ★
        </button>
      ))}
    </div>
  );
}

// ── Results summary page ───────────────────────────────────────────────────
function SummaryPage({ questions, onStartOver }) {
  const answered   = questions.filter((q) => q.answer.trim()).length;
  const evaluated  = questions.filter((q) => q.Label && q.Label !== 'Error').length;
  const avgConf    = questions.reduce((sum, q) => sum + (q.confidence || 0), 0) / questions.length;

  const handleExport = () => {
    const lines = questions.map((q, i) =>
      [
        `Q${i + 1} [${q.category}]: ${q.question}`,
        `Answer: ${q.answer || '(no answer)'}`,
        q.Label ? `Evaluation: ${q.Label}` : '',
        q.Reasoning ? `Reasoning: ${q.Reasoning}` : '',
        q.confidence ? `Self-confidence: ${'★'.repeat(q.confidence)}` : '',
        '',
      ].filter(Boolean).join('\n')
    );

    const blob = new Blob(
      [`VetTrain NSF – Interview Results\n${'='.repeat(40)}\n\n`, ...lines.map((l) => l + '\n')],
      { type: 'text/plain' }
    );
    const url = URL.createObjectURL(blob);
    const a   = document.createElement('a');
    a.href    = url;
    a.download = 'vettrain_results.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="summary-page">
      <h1 className="summary-title">Interview Complete</h1>

      <div className="summary-stats">
        <div className="stat-card"><span className="stat-number">{questions.length}</span><span className="stat-label">Questions</span></div>
        <div className="stat-card"><span className="stat-number">{answered}</span><span className="stat-label">Answered</span></div>
        <div className="stat-card"><span className="stat-number">{evaluated}</span><span className="stat-label">Evaluated</span></div>
        <div className="stat-card"><span className="stat-number">{avgConf > 0 ? avgConf.toFixed(1) : '—'}</span><span className="stat-label">Avg Confidence</span></div>
      </div>

      <div className="summary-list">
        {questions.map((q, i) => (
          <div key={q.id} className="summary-item">
            <div className="summary-q-header">
              <span className="summary-q-num">Q{i + 1}</span>
              <span className="summary-category">{q.category}</span>
              {q.confidence > 0 && (
                <span className="summary-stars">{'★'.repeat(q.confidence)}{'☆'.repeat(5 - q.confidence)}</span>
              )}
              {q.Label && q.Label !== 'Error' && (
                <span className={`summary-label label-${q.Label.toLowerCase().replace(/\s+/g, '-')}`}>{q.Label}</span>
              )}
            </div>
            <div className="summary-question">{q.question}</div>
            {q.answer.trim() ? (
              <div className="summary-answer">{q.answer}</div>
            ) : (
              <div className="summary-answer summary-no-answer">No answer provided</div>
            )}
            {q.Reasoning && (
              <div className="summary-reasoning"><strong>Feedback:</strong> {q.Reasoning}</div>
            )}
          </div>
        ))}
      </div>

      <div className="summary-actions">
        <button className="export-button" onClick={handleExport}>Download Results</button>
        <button className="start-over-button" onClick={onStartOver}>Start New Interview</button>
      </div>
    </div>
  );
}

// ── Main App ───────────────────────────────────────────────────────────────
function App() {
  const [showIntro,            setShowIntro]            = useState(true);
  const [showSummary,          setShowSummary]          = useState(false);
  const [currentQuestions,     setCurrentQuestions]     = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isListening,          setIsListening]          = useState(false);
  const [apiResponse,          setApiResponse]          = useState({ Label: '', Reasoning: '' });
  const [isSubmitting,         setIsSubmitting]         = useState(false);
  const [resumeAvailable,      setResumeAvailable]      = useState(false);
  const [textAreaValue,        setTextAreaValue]        = useState('');
  const [buttonColor,          setButtonColor]          = useState(true);
  const textareaRef = useRef(null);

  const { transcript, startRecording, stopRecording } = useWhisper({
    apiKey: process.env.REACT_APP_OPENAI_API_KEY,
  });

  // ── Session persistence ──────────────────────────────────────────────────
  // On mount: check for a saved session
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) setResumeAvailable(true);
    } catch (_) {}
  }, []);

  const saveSession = (questions, index) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ questions, index }));
    } catch (_) {}
  };

  const clearSession = () => {
    try { localStorage.removeItem(STORAGE_KEY); } catch (_) {}
  };

  const resumeSession = () => {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
      if (saved?.questions?.length) {
        setCurrentQuestions(saved.questions);
        setCurrentQuestionIndex(saved.index || 0);
        setShowIntro(false);
        setResumeAvailable(false);
      }
    } catch (_) {}
  };

  // Persist whenever questions or index change (but only during an active session)
  useEffect(() => {
    if (!showIntro && !showSummary && currentQuestions.length > 0) {
      saveSession(currentQuestions, currentQuestionIndex);
    }
  }, [currentQuestions, currentQuestionIndex, showIntro, showSummary]);

  // ── Interview flow ───────────────────────────────────────────────────────
  const startInterview = () => {
    const intro      = ALL_QUESTIONS.filter((q) => q.category === 'Introduction');
    const conclusion = ALL_QUESTIONS.filter((q) => q.category === 'Conclusion');
    const others     = ALL_QUESTIONS.filter((q) => q.category !== 'Introduction' && q.category !== 'Conclusion');

    // Fisher-Yates shuffle
    const shuffled = [...others];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }

    const session = [...intro, ...shuffled.slice(0, 6), ...conclusion];
    setCurrentQuestions(session);
    setCurrentQuestionIndex(0);
    setShowIntro(false);
    setResumeAvailable(false);
    clearSession();
  };

  const startOver = () => {
    clearSession();
    setShowIntro(true);
    setShowSummary(false);
    setCurrentQuestionIndex(0);
    setCurrentQuestions([]);
    setApiResponse({ Label: '', Reasoning: '' });
    setTextAreaValue('');
  };

  const goToNextQuestion = () =>
    setCurrentQuestionIndex((prev) => Math.min(prev + 1, currentQuestions.length - 1));

  const goToPreviousQuestion = () =>
    setCurrentQuestionIndex((prev) => Math.max(prev - 1, 0));

  // ── Answer helpers ───────────────────────────────────────────────────────
  const updateCurrentQuestion = (patch) => {
    setCurrentQuestions((prev) =>
      prev.map((q, i) => (i === currentQuestionIndex ? { ...q, ...patch } : q))
    );
  };

  const handleTextAreaChange = (e) => {
    setTextAreaValue(e.target.value);
    updateCurrentQuestion({ answer: e.target.value });
    const ta = textareaRef.current;
    if (ta) { ta.style.height = 'auto'; ta.style.height = `${ta.scrollHeight}px`; }
  };

  const resetAnswer = () => {
    setTextAreaValue('');
    updateCurrentQuestion({ answer: '' });
  };

  // Sync textarea when navigating between questions
  useEffect(() => {
    const answer = currentQuestions[currentQuestionIndex]?.answer || '';
    setTextAreaValue(answer);
    setApiResponse(
      currentQuestions[currentQuestionIndex]?.Label
        ? { Label: currentQuestions[currentQuestionIndex].Label, Reasoning: currentQuestions[currentQuestionIndex].Reasoning }
        : { Label: '', Reasoning: '' }
    );
  }, [currentQuestionIndex]); // eslint-disable-line react-hooks/exhaustive-deps

  // Append Whisper transcript to textarea
  useEffect(() => {
    if (!transcript.text) return;
    setTextAreaValue((prev) => `${prev} ${transcript.text}`.trimStart());
    const ta = textareaRef.current;
    if (ta) { ta.style.height = 'auto'; ta.style.height = `${ta.scrollHeight}px`; }
  }, [transcript.text]);

  // ── Recording ────────────────────────────────────────────────────────────
  const onRecordingButton = () => {
    setIsListening((prev) => !prev);
    setButtonColor((prev) => !prev);
  };

  useEffect(() => {
    if (isListening) startRecording(); else stopRecording();
  }, [isListening]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Submit ───────────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    const answer = currentQuestions[currentQuestionIndex]?.answer || textAreaValue;
    if (!answer.trim()) {
      alert('Please provide an answer before submitting.');
      return;
    }

    setIsSubmitting(true);
    const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000';
    try {
      const res = await fetch(backendUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answer }),
      });

      if (!res.ok) throw new Error(`Server responded with status ${res.status}`);

      const data = await res.json();
      const response = { Label: data.Label || String(data), Reasoning: data.Reasoning || '' };
      setApiResponse(response);
      updateCurrentQuestion({ Label: response.Label, Reasoning: response.Reasoning });
    } catch (err) {
      console.error('Submission error:', err);
      const errResponse = { Label: 'Error', Reasoning: `Could not reach the evaluation server: ${err.message}` };
      setApiResponse(errResponse);
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Progress ─────────────────────────────────────────────────────────────
  const answeredCount = currentQuestions.filter((q) => q.answer.trim()).length;
  const progressPct   = currentQuestions.length > 0
    ? Math.round((answeredCount / currentQuestions.length) * 100)
    : 0;

  // ── Guards ───────────────────────────────────────────────────────────────
  if (!SpeechRecognition.browserSupportsSpeechRecognition()) {
    return (
      <div className="intro-page">
        <h1>Browser Not Supported</h1>
        <p>This app requires a browser that supports the Web Speech API (e.g. Chrome).</p>
      </div>
    );
  }

  // ── Summary page ─────────────────────────────────────────────────────────
  if (showSummary) {
    return <SummaryPage questions={currentQuestions} onStartOver={startOver} />;
  }

  // ── Intro page ────────────────────────────────────────────────────────────
  if (showIntro) {
    return (
      <div className="intro-page">
        <h1>Welcome to the Veteran's Interview Preparation Web Application</h1>
        <p>This app will guide you through a series of questions to help you prepare for your interview.</p>
        <button onClick={startInterview}>Start Interview Preparation</button>
        {resumeAvailable && (
          <button className="resume-button" onClick={resumeSession}>
            Resume Previous Session
          </button>
        )}
      </div>
    );
  }

  // ── Interview page ────────────────────────────────────────────────────────
  const currentQuestion = currentQuestions[currentQuestionIndex];
  const isLastQuestion  = currentQuestionIndex === currentQuestions.length - 1;
  const btn_class       = buttonColor ? 'record-button' : 'redButton';

  return (
    <div className="app-container">
      <h1 className="app-title">NSF VetTrain</h1>

      {/* Progress bar */}
      <div className="progress-wrapper">
        <div className="progress-bar-bg">
          <div className="progress-bar-fill" style={{ width: `${progressPct}%` }} />
        </div>
        <span className="progress-label">{answeredCount} / {currentQuestions.length} answered</span>
      </div>

      <div className="question-container">
        <div className="question-number">Question {currentQuestionIndex + 1} of {currentQuestions.length}</div>
        <div className="category">Category: {currentQuestion.category}</div>
        <div className="question">{currentQuestion.question}</div>

        <textarea
          ref={textareaRef}
          value={textAreaValue}
          placeholder="Type your answer here"
          onChange={handleTextAreaChange}
          className="answer-input"
        />

        {/* Self-confidence star rating */}
        <StarRating
          value={currentQuestion.confidence || 0}
          onChange={(val) => updateCurrentQuestion({ confidence: val })}
        />

        <div className="button-container">
          <button onClick={goToPreviousQuestion} className="next-button" disabled={currentQuestionIndex === 0}>
            Previous
          </button>
          {isLastQuestion ? (
            <button onClick={() => setShowSummary(true)} className="finish-button">
              Finish & View Results
            </button>
          ) : (
            <button onClick={goToNextQuestion} className="next-button">
              Next
            </button>
          )}
          <button onClick={startOver} className="start-over-button">Start Over</button>
          <button className={btn_class} onClick={onRecordingButton}>
            {isListening ? 'Stop Recording' : 'Record Answer'}
          </button>
          <button className="record-button" onClick={resetAnswer}>Reset Answer</button>
          <button onClick={handleSubmit} className="submit-button" disabled={isSubmitting}>
            {isSubmitting ? 'Evaluating…' : 'Submit'}
          </button>
        </div>

        {apiResponse.Label && (
          <div className="api-response">
            <div className="answer-api-response"><strong>Label:</strong> {apiResponse.Label}</div>
            {apiResponse.Reasoning && (
              <div className="answer-api-response"><strong>Reasoning:</strong> {apiResponse.Reasoning}</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
