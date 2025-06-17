// backend/src/services/geminiService.ts
import { GoogleGenerativeAI } from '@google/generative-ai';
import { GeminiEvaluationRequest, GeminiApiResponse } from '../types/index.js'; // Ensure .js extension for module imports
import dotenv from 'dotenv';

dotenv.config(); // Load environment variables

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

if (!GEMINI_API_KEY) {
  throw new Error('GEMINI_API_KEY environment variable is required in the backend .env file.');
}

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

const EVALUATION_PROMPT = `You are an expert AI code reviewer embedded in a task evaluation platform.

A user is working on a frontend or full-stack development task using **Vite**, **React**, **TypeScript**, and **Tailwind CSS**. The user submits a **task name** and either:
- Raw code (usually in TypeScript/React JSX)
- Or an image/screenshot of their code (extracted via OCR)

Your job is to evaluate the submission and return:
1. A score out of 10 (indicating how well the code meets the task objective and overall quality).
2. Detailed, constructive feedback about the code quality and task completion. This feedback should cover:
   - React component structure (e.g., hooks, state, reusability)
   - TypeScript usage (e.g., strong typing, interfaces, 'any' avoidance)
   - Tailwind CSS implementation (e.g., utility-first, responsiveness)
   - Logic and readability (e.g., efficiency, naming, comments, error handling)
   - Task fulfillment (does it meet the stated goals?)

If the user submits incomplete, non-compilable, or invalid code/extracted text, still provide helpful, empathetic, and constructive feedback focusing on what could be improved or corrected. Do not just state it's invalid; guide them with actionable advice related to the technologies used.

---

🎯 The format of your response MUST be ONLY valid JSON and adhere strictly to the following structured format. Do NOT include any other text, markdown outside the JSON block, or conversational filler before or after the JSON.

\`\`\`json
{
  "score": 7,
  "feedback": "The code is mostly functional and clean. However, state is being mutated directly in one place, and component naming could be improved. Tailwind classes are well used. Consider adding prop types for better type safety. This feedback covers React component structure, TypeScript usage, Tailwind CSS implementation, logic and readability, and task fulfillment. For example, regarding React structure, avoid direct state mutation. For TypeScript, ensure prop types are explicit. Tailwind usage is good. Logic is clear but variable names could be better. Task fulfillment is partially met as some features seem missing."
}
\`\`\`

IMPORTANT: Respond ONLY with valid JSON. Do not include any other text or formatting.
`;

export class GeminiService {
  static async evaluateSubmission(request: GeminiEvaluationRequest): Promise<GeminiApiResponse> {
    try {
      const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

      let submissionContent = '';
      if (request.submissionType === 'code' && request.code) {
        submissionContent = `User's Submission (Raw Code):\n\`\`\`typescript\n${request.code}\n\`\`\``;
      } else if (request.submissionType === 'image' && request.extractedText) {
        submissionContent = `User's Submission (Extracted from Image):\n\`\`\`typescript\n${request.extractedText}\n\`\`\``;
      } else {
        throw new Error('Invalid submission: missing code or extracted text for evaluation.');
      }

      const prompt = `Task Name: "${request.taskName}"\n\n${submissionContent}\n\n${EVALUATION_PROMPT}`;

      console.log('Sending prompt to Gemini AI...');
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      console.log('Raw Gemini API Response:', text); // Log raw response for debugging

      // Robustly extract JSON from the response text
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('Gemini API returned an invalid response format (could not find JSON).');
      }

      const evaluation: GeminiApiResponse = JSON.parse(jsonMatch[0]);

      // Validate the parsed response structure
      if (typeof evaluation.score !== 'number' || typeof evaluation.feedback !== 'string') {
        throw new Error('Invalid evaluation response structure from Gemini API: missing score or feedback.');
      }

      // Ensure score is within valid range (0-10)
      evaluation.score = Math.max(0, Math.min(10, Math.round(evaluation.score)));

      return evaluation;

    } catch (error) {
      console.error('GeminiService: Error evaluating submission with Gemini API:', error);
      throw new Error(`AI evaluation failed: ${error instanceof Error ? error.message : 'Unknown error occurred during AI evaluation.'}`);
    }
  }
}