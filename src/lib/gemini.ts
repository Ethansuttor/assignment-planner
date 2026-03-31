import { GoogleGenerativeAI } from "@google/generative-ai";
import type { GeminiResponse } from "@/types";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function analyzeAssignment(
  content: string,
  course: string,
  dueDate: string
): Promise<GeminiResponse> {
  const model = genAI.getGenerativeModel({
    model: "gemini-1.5-flash",
    generationConfig: {
      responseMimeType: "application/json",
    },
  });

  const prompt = `You are an academic assistant helping a college student.
Analyze this assignment and return ONLY valid JSON with exactly these fields:
{
  "title": "short descriptive title (max 60 chars)",
  "summary": "plain english explanation of what the assignment requires",
  "time_estimate_hours": 3.5,
  "subtasks": ["step 1", "step 2", "step 3"],
  "difficulty": "easy"
}

Rules:
- difficulty must be exactly one of: easy, medium, hard
- time_estimate_hours must be a number (decimals allowed)
- subtasks must be an array of strings in logical completion order
- Return ONLY the JSON object, no markdown, no explanation

Course: ${course}
Due date: ${dueDate}

Assignment content:
${content}`;

  const result = await model.generateContent(prompt);
  const text = result.response.text();

  const parsed: GeminiResponse = JSON.parse(text);

  // Validate required fields
  if (!parsed.title || !parsed.summary || !parsed.time_estimate_hours || !parsed.subtasks || !parsed.difficulty) {
    throw new Error("Gemini response missing required fields");
  }

  return parsed;
}
