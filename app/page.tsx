'use client';

import { useState } from 'react';

type Question = {
  question: string;
  type: 'factual' | 'analytical' | 'misconception';
  difficulty: 'easy' | 'medium' | 'hard';
  answer: string;
};

export default function Home() {
  const [bookId, setBookId] = useState('');
  const [prompt, setPrompt] = useState('Generate likely student questions for this chapter.');
  const [file, setFile] = useState<File | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loadingIngest, setLoadingIngest] = useState(false);
  const [loadingGenerate, setLoadingGenerate] = useState(false);
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [status, setStatus] = useState('');

  const ingest = async () => {
    if (!file) {
      setStatus('Please select a PDF first.');
      return;
    }

    setLoadingIngest(true);
    setStatus('Ingesting PDF...');
    setQuestions([]);
    setBookId('');

    const formData = new FormData();
    formData.append('file', file);

    const res = await fetch('/api/ingest', {
      method: 'POST',
      body: formData,
    });

    const data = await res.json();
    setLoadingIngest(false);

    if (!res.ok) {
      setStatus(data.error || 'Ingestion failed.');
      return;
    }

    setBookId(data.bookId);
    setStatus(`Ingested successfully. Chunks: ${data.chunkCount}`);
  };

  const generate = async () => {
    if (!bookId) {
      setStatus('Please ingest a PDF before generating questions.');
      return;
    }

    setLoadingGenerate(true);
    setStatus('Generating questions...');

    const res = await fetch('/api/questions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ bookId, prompt }),
    });

    const data = await res.json();
    setLoadingGenerate(false);

    if (!res.ok) {
      setStatus(data.error || 'Question generation failed.');
      return;
    }

    setQuestions(data.questions || []);
    setStatus(`Generated ${data.questions?.length || 0} questions.`);
  };

  const toggleAnswer = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  const renderSection = (title: string, type: Question['type']) => {
    const filtered = questions.filter((q) => q.type === type);

    if (filtered.length === 0) return null;

    return (
      <div style={{ marginTop: 30 }}>
        <h2>{title}</h2>
        {filtered.map((q, idx) => {
          const globalIndex = questions.indexOf(q);

          return (
            <div
              key={idx}
              style={{
                border: '1px solid #ddd',
                padding: 10,
                marginBottom: 10,
                borderRadius: 6,
                cursor: 'pointer',
              }}
              onClick={() => toggleAnswer(globalIndex)}
            >
              <div>
                <strong>Q:</strong> {q.question}
              </div>

              {openIndex === globalIndex && (
                <div style={{ marginTop: 8 }}>
                  <strong>A:</strong> {q.answer}
                </div>
              )}

              <div style={{ fontSize: 12, marginTop: 5, color: 'gray' }}>
                Difficulty: {q.difficulty}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div style={{ padding: 20, maxWidth: 800, margin: 'auto' }}>
      <h1>Teacher AI Assistant</h1>

      <input
        type="file"
        accept="application/pdf"
        onChange={(e) => setFile(e.target.files?.[0] ?? null)}
        style={{ marginBottom: 10, display: 'block' }}
      />

      <button onClick={ingest} disabled={loadingIngest}>
        {loadingIngest ? 'Ingesting...' : 'Upload + Ingest PDF'}
      </button>

      <div style={{ marginTop: 12, marginBottom: 12, color: '#555' }}>
        {status}
        {bookId ? ` | bookId: ${bookId}` : ''}
      </div>

      <textarea
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder="What kind of questions should be generated?"
        rows={4}
        style={{ width: '100%', marginBottom: 10 }}
      />

      <button onClick={generate} disabled={loadingGenerate || !bookId}>
        {loadingGenerate ? 'Generating...' : 'Generate Questions'}
      </button>

      {/* Sections */}
      {renderSection('📘 Basic Questions', 'factual')}
      {renderSection('🧠 Analytical Questions', 'analytical')}
      {renderSection('⚠️ Misconceptions', 'misconception')}
    </div>
  );
}