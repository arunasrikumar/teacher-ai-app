import type { StoredChunk } from "./types";

const memoryStore = new Map<string, StoredChunk[]>();

function cosineSimilarity(a: number[], b: number[]): number {
  let dot = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < a.length; i += 1) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }

  if (normA === 0 || normB === 0) return 0;
  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}

export function saveBookChunks(bookId: string, chunks: StoredChunk[]): void {
  memoryStore.set(bookId, chunks);
}

export function hasBook(bookId: string): boolean {
  return memoryStore.has(bookId);
}

export function searchSimilarChunks(bookId: string, queryEmbedding: number[], topK = 4): StoredChunk[] {
  const chunks = memoryStore.get(bookId) ?? [];
  if (!chunks.length) return [];

  return [...chunks]
    .map((chunk) => ({
      chunk,
      score: cosineSimilarity(queryEmbedding, chunk.embedding),
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, topK)
    .map(({ chunk }) => chunk);
}
