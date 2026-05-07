import { createRequire } from "module";

type PdfParseResult = {
  text?: string;
};

type PdfParseFn = (dataBuffer: Buffer) => Promise<PdfParseResult>;

const require = createRequire(import.meta.url);
const pdfParse: PdfParseFn = require("pdf-parse/lib/pdf-parse.js");

export async function extractPdfText(fileBuffer: Buffer): Promise<string> {
  const parsed = await pdfParse(fileBuffer);
  return parsed.text ?? "";
}
