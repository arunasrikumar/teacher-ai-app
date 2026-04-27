'use client';

import { useState } from 'react';

type Question = {
  question: string;
  type: 'factual' | 'analytical' | 'misconception';
  difficulty: 'easy' | 'medium' | 'hard';
  answer: string;
};

export default function Home() {
  const [text, setText] = useState('');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(false);
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const generate = async () => {
    setLoading(true);

    const res = await fetch('/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }),
    });

    const data = await res.json();
    setQuestions(data.questions || []);
    setLoading(false);
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

      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Paste book text here..."
        rows={6}
        style={{ width: '100%', marginBottom: 10 }}
      />

      <button onClick={generate} disabled={loading}>
        {loading ? 'Generating...' : 'Generate Questions'}
      </button>

      {/* Sections */}
      {renderSection('📘 Basic Questions', 'factual')}
      {renderSection('🧠 Analytical Questions', 'analytical')}
      {renderSection('⚠️ Misconceptions', 'misconception')}
    </div>
  );
}