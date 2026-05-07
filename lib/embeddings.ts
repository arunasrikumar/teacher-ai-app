import { OpenAIEmbeddings } from "@langchain/openai";

const embeddings = new OpenAIEmbeddings({
  model: "text-embedding-3-small",
});

export async function embedTexts(texts: string[]): Promise<number[][]> {
  if (!texts.length) return [];
  return embeddings.embedDocuments(texts);
}

export async function embedQuery(text: string): Promise<number[]> {
  return embeddings.embedQuery(text);
}
