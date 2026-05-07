import { NextResponse } from "next/server";
import { generateQuestionsForBook } from "@/lib/rag";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const bookId = typeof body?.bookId === "string" ? body.bookId : "";
    const prompt = typeof body?.prompt === "string" ? body.prompt : "";

    if (!bookId || !prompt) {
      return NextResponse.json({ error: "bookId and prompt are required." }, { status: 400 });
    }

    const questions = await generateQuestionsForBook(bookId, prompt);
    return NextResponse.json({ questions });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to generate questions.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
