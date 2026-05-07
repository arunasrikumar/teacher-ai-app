export type StoredChunk = {
  id: string;
  text: string;
  page?: number;
  embedding: number[];
};

export type IngestResult = {
  bookId: string;
  chunkCount: number;
};

export type GeneratedQuestion = {
  question: string;
  type: "factual" | "analytical" | "misconception";
  difficulty: "easy" | "medium" | "hard";
  answer: string;
  citationChunkId?: string;
};
