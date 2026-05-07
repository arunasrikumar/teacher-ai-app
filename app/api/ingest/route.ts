import { NextResponse } from "next/server";
import { ingestBookFromPdf } from "@/lib/rag";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "Please provide a PDF file in form-data key 'file'." }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const result = await ingestBookFromPdf(buffer);

    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to ingest PDF.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
