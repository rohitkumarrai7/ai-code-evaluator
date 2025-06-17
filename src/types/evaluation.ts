// frontend/src/types/evaluation.ts

// Type for the data sent to the backend for evaluation
export interface SubmitEvaluationPayload {
  taskName: string;
  submissionType: 'code' | 'image';
  code?: string;
  image?: File; // For file input element
}

// Type for the evaluation result received from the backend
export interface EvaluationResult {
  id: string; // Matches backend's CUID
  taskName: string;
  submissionType: 'code' | 'image';
  code: string | null;
  imageUrl: string | null; // Placeholder if image was uploaded
  score: number;
  feedback: string; // This is a plain string now based on your schema
  createdAt: string; // Date comes as string from API
  updatedAt: string; // Date comes as string from API
}

// Generic API response structure from backend
export interface APIResponse<T> {
  success: boolean;
  data?: T;
  error?: string | string[];
  details?: any; // For Zod validation errors, if applicable
}