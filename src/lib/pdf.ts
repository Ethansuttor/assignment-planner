export async function extractTextFromPdf(buffer: Buffer): Promise<string> {
  // Dynamic import to avoid edge runtime issues
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const pdfParse = require("pdf-parse") as (buf: Buffer) => Promise<{ text: string }>;
  const data = await pdfParse(buffer);
  return data.text.trim();
}
