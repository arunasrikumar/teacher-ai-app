import { ChatOpenAI } from "@langchain/openai";
import type { GeneratedQuestion, StoredChunk } from "./types";

const model = new ChatOpenAI({
  model: "gpt-4o-mini",
  temperature: 0.4,
});

export async function generateStudentQuestions(contextChunks: StoredChunk[], teacherPrompt: string) {
  const context = contextChunks
    .map((chunk, i) => `[Chunk ${i + 1} | id=${chunk.id}] ${chunk.text}`)
    .join("\n\n");

  const response = await model.invoke(`
You are an assistant for teachers.
Using ONLY the context, generate 5 likely student questions with concise answers.
Balance question types: factual, analytical, misconception.

Teacher request: "${teacherPrompt}"

Context:
${context}

Return strict JSON with this shape:
{
  "questions": [
    {
      "question": "string",
      "type": "factual | analytical | misconception",
      "difficulty": "easy | medium | hard",
      "answer": "string",
      "citationChunkId": "string"
    }
  ]
}
`);

  const raw = typeof response.content === "string" ? response.content : JSON.stringify(response.content);
  const cleaned = raw.replace(/^```json\s*/i, "").replace(/```$/, "").trim();
  const parsed = JSON.parse(cleaned) as { questions: GeneratedQuestion[] };
  return parsed.questions ?? [];
}
