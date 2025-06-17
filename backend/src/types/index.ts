// backend/src/types/index.ts

// Represents the data submitted by the user
export interface TaskSubmission {
  taskName: string;
  submissionType: 'code' | 'image';
  code?: string; // Present if submissionType is 'code'
  image?: Express.Multer.File; // Present if submissionType is 'image'
}

// Data structure for the evaluation result returned by the backend API
export interface EvaluationResult {
  id: string; // Changed to string for CUID
  taskName: string;
  submissionType: 'code' | 'image';
  code: string | null;
  imageUrl: string | null; // Placeholder for image URL (if you implement storage)
  score: number;
  feedback: string; // Matches Prisma schema (String @db.Text)
  createdAt: Date;
  updatedAt: Date;
}

// Data expected by the GeminiService for evaluation
export interface GeminiEvaluationRequest {
  taskName: string;
  code?: string;        // Raw code input
  extractedText?: string; // Text extracted via OCR
  submissionType: 'code' | 'image';
}

// Response structure expected from Gemini AI (simplified based on your prompt)
export interface GeminiApiResponse {
  score: number;
  feedback: string;
}

// Generic API Response structure
export interface APIResponse<T> {
  success: boolean;
  data?: T;
  error?: string | string[]; // Can be a string or an array of error messages (e.g., from Zod)
  details?: any; // For Zod validation errors
}