// frontend/src/services/evaluationService.ts
import { SubmitEvaluationPayload, EvaluationResult, APIResponse } from '@/types/evaluation'; // Corrected import path

// Use Vite's environment variable for the API base URL
const API_BASE_URL: string = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';

/**
 * Submits a task for AI evaluation.
 * @param payload - The submission data including taskName, submissionType, and either code or an image file.
 * @returns A promise that resolves with the EvaluationResult.
 * @throws An error if the API call fails or returns an error.
 */
export const submitEvaluation = async (payload: SubmitEvaluationPayload): Promise<EvaluationResult> => {
  const formData = new FormData();
  formData.append('taskName', payload.taskName);
  formData.append('submissionType', payload.submissionType);

  if (payload.submissionType === 'code' && payload.code) {
    formData.append('code', payload.code);
  } else if (payload.submissionType === 'image' && payload.image) {
    formData.append('image', payload.image);
  } else {
    // This should ideally be caught by client-side validation before calling the API
    throw new Error('Invalid submission payload: missing code or image for the specified submission type.');
  }

  try {
    const response = await fetch(`${API_BASE_URL}/evaluate`, {
      method: 'POST',
      body: formData, // Multer expects multipart/form-data via FormData
    });

    const result: APIResponse<EvaluationResult> = await response.json();

    if (!response.ok || !result.success) {
      const errorMessage = Array.isArray(result.error) ? result.error.join(', ') : result.error || 'Unknown error during submission.';
      throw new Error(`Submission failed: ${errorMessage}`);
    }

    if (!result.data) {
      throw new Error('Submission successful, but no data received from server.');
    }

    return result.data;
  } catch (error) {
    console.error('API Error in submitEvaluation:', error);
    throw error;
  }
};

/**
 * Fetches all evaluation history.
 * @returns A promise that resolves with an array of EvaluationResult.
 * @throws An error if the API call fails.
 */
export const getEvaluationHistory = async (): Promise<EvaluationResult[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/evaluations`);
    const result: APIResponse<EvaluationResult[]> = await response.json();

    if (!response.ok || !result.success) {
      throw new Error(result.error?.toString() || 'Failed to fetch evaluation history.');
    }

    return result.data || [];
  } catch (error) {
    console.error('API Error in getEvaluationHistory:', error);
    throw error;
  }
};

/**
 * Fetches a single evaluation by ID.
 * @param id - The ID of the evaluation.
 * @returns A promise that resolves with the EvaluationResult or null if not found.
 * @throws An error if the API call fails.
 */
export const getEvaluationById = async (id: string): Promise<EvaluationResult | null> => {
  try {
    const response = await fetch(`${API_BASE_URL}/evaluations/${id}`);
    const result: APIResponse<EvaluationResult> = await response.json();

    if (response.status === 404) {
      return null; // Explicitly return null if not found
    }

    if (!response.ok || !result.success) {
      throw new Error(result.error?.toString() || `Failed to fetch evaluation with ID ${id}.`);
    }

    return result.data || null;
  } catch (error) {
    console.error(`API Error in getEvaluationById (${id}):`, error);
    throw error;
  }
};