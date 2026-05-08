'use client';

import { CSSProperties, useState } from 'react';
import Image from 'next/image';

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
      <section style={{ marginTop: 28 }}>
        <h2 style={styles.sectionHeading}>{title}</h2>
        {filtered.map((q, idx) => {
          const globalIndex = questions.indexOf(q);
          const isOpen = openIndex === globalIndex;

          return (
            <article
              key={idx}
              style={{
                ...styles.questionCard,
                borderColor: isOpen ? '#b45309' : '#efe6d6',
                boxShadow: isOpen ? '0 12px 24px -20px rgba(180, 83, 9, 0.75)' : 'none',
                cursor: 'pointer',
              }}
              onClick={() => toggleAnswer(globalIndex)}
            >
              <div style={styles.questionHeader}>
                <span style={styles.label}>Q</span>
                <p style={styles.questionText}>{q.question}</p>
              </div>

              {isOpen && (
                <div style={styles.answerBlock}>
                  <span style={styles.answerLabel}>A</span>
                  <p style={styles.answerText}>{q.answer}</p>
                </div>
              )}

              <div style={styles.metaRow}>
                <span style={styles.difficultyPill}>Difficulty: {q.difficulty}</span>
                <span style={styles.toggleHint}>{isOpen ? 'Click to hide answer' : 'Click to view answer'}</span>
              </div>
            </article>
          );
        })}
      </section>
    );
  };

  return (
    <main style={styles.page}>
      <div style={styles.shell}>
        <header style={styles.hero}>
          <p style={styles.kicker}>Teacher tools</p>
          <h1 style={styles.title}>Teacher AI Assistant</h1>
          <p style={styles.subtitle}>Upload a chapter PDF and generate student-facing questions you can use right away.</p>

          <div style={styles.heroImageWrap}>
            <Image
              src="https://marissateachablemoments.com/wp-content/uploads/2020/06/Classroom-1024x576.jpg"
              alt="Teacher reading with students"
              width={520}
              height={292}
              style={styles.heroImage}
              priority
            />
          </div>
        </header>

        <section style={styles.card}>
          <div style={styles.cardHeaderWithImage}>
            <h2 style={styles.cardTitle}>1) Upload and Ingest</h2>
            <Image
              src="https://marissateachablemoments.com/wp-content/uploads/2021/03/20200717_073852-1-1024x576.jpg"
              alt="Teacher and classroom themed photo"
              width={150}
              height={98}
              style={styles.cardImage}
            />
          </div>
          <input
            type="file"
            accept="application/pdf"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            style={styles.fileInput}
          />
          <button style={styles.primaryButton} onClick={ingest} disabled={loadingIngest}>
            {loadingIngest ? 'Ingesting...' : 'Upload + Ingest PDF'}
          </button>

          <div style={styles.statusRow}>
            <span style={styles.statusBadge}>Status</span>
            <span>{status || 'No action yet.'}</span>
          </div>
          {bookId && (
            <div style={styles.bookIdRow}>
              <strong>bookId:</strong> <code>{bookId}</code>
            </div>
          )}
        </section>

        <section style={styles.card}>
          <h2 style={styles.cardTitle}>2) Generate Questions</h2>
          <label style={styles.promptLabel} htmlFor="prompt">
            Prompt
          </label>
          <textarea
            id="prompt"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="What kind of questions should be generated?"
            rows={5}
            style={styles.textarea}
          />
          <button style={styles.secondaryButton} onClick={generate} disabled={loadingGenerate || !bookId}>
            {loadingGenerate ? 'Generating...' : 'Generate Questions'}
          </button>
        </section>

        <section style={styles.resultsCard}>
          <h2 style={styles.resultsTitle}>Generated Question Sets</h2>
          {!questions.length && <p style={styles.emptyState}>No questions yet. Ingest a PDF and generate to begin.</p>}

          {/* Sections */}
          {renderSection('Basic Questions', 'factual')}
          {renderSection('Analytical Questions', 'analytical')}
          {renderSection('Misconceptions', 'misconception')}
        </section>
      </div>
    </main>
  );
}

const styles: Record<string, CSSProperties> = {
  page: {
    minHeight: '100vh',
    padding: '42px 16px 64px',
    background: '#fffdf7',
    color: '#111827',
    fontFamily:
      'ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, "Apple Color Emoji", "Segoe UI Emoji"',
  },
  shell: {
    maxWidth: 920,
    margin: '0 auto',
    display: 'grid',
    gap: 22,
  },
  hero: {
    padding: '34px 22px',
    borderRadius: 16,
    background: '#fffef9',
    border: '1px solid #e9dfcc',
    textAlign: 'center',
  },
  kicker: {
    margin: 0,
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 2.2,
    color: '#7c5a2e',
  },
  title: {
    margin: '12px 0 0',
    fontSize: 'clamp(2.0rem, 4vw, 2.75rem)',
    lineHeight: 1.15,
    letterSpacing: -0.3,
    fontFamily:
      'ui-serif, Georgia, Cambria, "Times New Roman", Times, serif',
  },
  subtitle: {
    margin: '14px auto 0',
    color: '#5b4a32',
    maxWidth: 650,
    lineHeight: 1.7,
    fontSize: 16,
  },
  heroImageWrap: {
    margin: '18px auto 0',
    maxWidth: 720,
    background: '#fdf5e8',
    borderRadius: 14,
    padding: 10,
    border: '1px solid #eadcc4',
  },
  heroImage: {
    display: 'block',
    borderRadius: 10,
    maxWidth: '100%',
    height: 'auto',
  },
  card: {
    background: '#fffef9',
    borderRadius: 14,
    border: '1px solid #e9dfcc',
    padding: 22,
  },
  cardTitle: {
    margin: 0,
    fontSize: 18,
    color: '#111827',
    fontFamily:
      'ui-serif, Georgia, Cambria, "Times New Roman", Times, serif',
  },
  cardHeaderWithImage: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 10,
    flexWrap: 'wrap',
  },
  cardImage: {
    borderRadius: 10,
    border: '1px solid #eadcc4',
    background: '#fdf5e8',
  },
  fileInput: {
    marginBottom: 12,
    display: 'block',
    width: '100%',
    border: '1px solid #d6d3c7',
    borderRadius: 10,
    padding: 10,
    backgroundColor: '#fffdf7',
  },
  primaryButton: {
    border: '1px solid #7c2d12',
    borderRadius: 999,
    padding: '10px 16px',
    background: '#9a3412',
    color: '#ffffff',
    fontWeight: 700,
    cursor: 'pointer',
    letterSpacing: 0.2,
  },
  secondaryButton: {
    border: '1px solid #9a3412',
    borderRadius: 999,
    padding: '10px 16px',
    background: '#fffef9',
    color: '#7c2d12',
    fontWeight: 700,
    cursor: 'pointer',
    letterSpacing: 0.2,
  },
  statusRow: {
    marginTop: 14,
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    color: '#5b4a32',
    flexWrap: 'wrap',
  },
  statusBadge: {
    fontSize: 12,
    background: '#f3e7d2',
    color: '#7c2d12',
    borderRadius: 999,
    padding: '4px 10px',
    fontWeight: 600,
  },
  bookIdRow: {
    marginTop: 10,
    fontSize: 13,
    color: '#5b4a32',
    display: 'flex',
    gap: 6,
    flexWrap: 'wrap',
  },
  promptLabel: {
    display: 'block',
    fontWeight: 600,
    color: '#111827',
    marginBottom: 8,
  },
  textarea: {
    width: '100%',
    marginBottom: 12,
    borderRadius: 10,
    border: '1px solid #d6d3c7',
    padding: 12,
    background: '#fffdf8',
    lineHeight: 1.5,
    resize: 'vertical',
  },
  resultsCard: {
    background: '#fffef9',
    borderRadius: 14,
    border: '1px solid #e9dfcc',
    padding: 22,
  },
  resultsTitle: {
    margin: 0,
    color: '#111827',
    fontSize: 20,
    fontFamily:
      'ui-serif, Georgia, Cambria, "Times New Roman", Times, serif',
  },
  emptyState: {
    marginTop: 12,
    color: '#7c6a4f',
  },
  sectionHeading: {
    margin: '0 0 12px',
    fontSize: 17,
    color: '#111827',
    fontFamily:
      'ui-serif, Georgia, Cambria, "Times New Roman", Times, serif',
  },
  questionCard: {
    border: '1px solid #eadcc4',
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    transition: 'all 160ms ease',
    background: '#fef7eb',
  },
  questionHeader: {
    display: 'flex',
    gap: 10,
    alignItems: 'flex-start',
  },
  label: {
    width: 22,
    height: 22,
    borderRadius: '50%',
    background: '#f9d9ab',
    color: '#92400e',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 700,
    fontSize: 12,
    flexShrink: 0,
    marginTop: 2,
  },
  questionText: {
    margin: 0,
    color: '#111827',
    lineHeight: 1.45,
  },
  answerBlock: {
    marginTop: 10,
    paddingTop: 10,
    borderTop: '1px dashed #d6d3c7',
    display: 'flex',
    gap: 10,
    alignItems: 'flex-start',
  },
  answerLabel: {
    width: 22,
    height: 22,
    borderRadius: '50%',
    background: '#fde68a',
    color: '#92400e',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 700,
    fontSize: 12,
    flexShrink: 0,
    marginTop: 2,
  },
  answerText: {
    margin: 0,
    color: '#5b4a32',
    lineHeight: 1.5,
  },
  metaRow: {
    marginTop: 10,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    flexWrap: 'wrap',
  },
  difficultyPill: {
    fontSize: 12,
    color: '#7c2d12',
    background: '#f3e7d2',
    borderRadius: 999,
    padding: '4px 9px',
  },
  toggleHint: {
    fontSize: 12,
    color: '#7c6a4f',
  },
};