import { randomUUID } from "crypto";
import { chunkText } from "./chunk";
import { embedQuery, embedTexts } from "./embeddings";
import { generateStudentQuestions } from "./llm";
import { extractPdfText } from "./pdf";
import type { IngestResult, StoredChunk } from "./types";
import { hasBook, saveBookChunks, searchSimilarChunks } from "./vectorStore";

export async function ingestBookFromPdf(fileBuffer: Buffer): Promise<IngestResult> {
  const text = await extractPdfText(fileBuffer);
  const chunks = chunkText(text);

  if (!chunks.length) {
    throw new Error("No readable text found in the uploaded PDF.");
  }

  const vectors = await embedTexts(chunks);
  const bookId = randomUUID();

  const storedChunks: StoredChunk[] = chunks.map((chunk, i) => ({
    id: `${bookId}-chunk-${i + 1}`,
    text: chunk,
    embedding: vectors[i],
  }));

  saveBookChunks(bookId, storedChunks);

  return {
    bookId,
    chunkCount: storedChunks.length,
  };
}

export async function generateQuestionsForBook(bookId: string, prompt: string) {
  if (!hasBook(bookId)) {
    throw new Error("Book not found. Please ingest the PDF first.");
  }

  const queryEmbedding = await embedQuery(prompt);
  const topChunks = searchSimilarChunks(bookId, queryEmbedding, 4);

  if (!topChunks.length) {
    throw new Error("No context chunks found for this book.");
  }

  return generateStudentQuestions(topChunks, prompt);
}
