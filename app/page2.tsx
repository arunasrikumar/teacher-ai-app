'use client';
import { useState } from 'react';

export default function Home() {
  const [text, setText] = useState('');
  const [result, setResult] = useState('');

  const generate = async () => {
    const res = await fetch('/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }),
    });

    //const data = await res.json();
    //setResult(JSON.stringify(data.questions, null, 2));
    setResult((await res.text()).toString());
  };

  return (
    <div style={{ padding: 20 }}>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Paste text here..."
      />
      <br />
      <button onClick={generate}>Generate Questions</button>
      <pre>{result}</pre>
    </div>
  );
}