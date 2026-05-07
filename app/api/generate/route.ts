import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { text } = body;

    if (!text || typeof text !== 'string') {
      return NextResponse.json({ error: 'Missing or invalid "text" field.' }, { status: 400 });
    }

    const prompt = `
You are an educational assistant. Based on the following text, generate a list of 3 relevant questions a student might ask to help them understand the content better. 
Text: """${text}"""
Return JSON in this format:
{
  "questions": [
    {
      "question": "...",
      "type": "factual | analytical | misconception",
      "difficulty": "easy | medium | hard",
      "answer": "..."
    }
  ]
}
  Make sure to return valid JSON that works with JSON.parse() and is not a string.`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: 'You generate student questions for educational content.' },
        { role: 'user', content: prompt }
      ],
      max_tokens: 300,
      temperature: 0.7,
    });

    // Extract the questions from the completion
    const answer = completion.choices[0]?.message?.content ?? '';
    console.log(answer);
    //const parsed = JSON.parse(answer);

    //console.log(parsed);

    return new Response(answer, { status: 200 });
  } catch (error) {
    console.log(error);
    const message = error instanceof Error ? error.message : 'Internal Server Error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

