// backend/src/services/evaluationService.ts
import { PrismaClient } from '@prisma/client';
import { GeminiService } from './geminiService.js'; // Ensure .js extension
import { OCRService } from './ocrService.js';     // Ensure .js extension
import { TaskSubmission, EvaluationResult, GeminiEvaluationRequest } from '../types/index.js'; // Ensure .js extension

const prisma = new PrismaClient();

export class EvaluationService {
  /**
   * Evaluates a user's task submission using AI and OCR if an image is provided.
   * Saves the evaluation result to the database.
   * @param submission - The task submission data (task name, code OR image).
   * @returns A promise that resolves with the evaluation result.
   */
  static async evaluateTask(submission: TaskSubmission): Promise<EvaluationResult> {
    try {
      let contentToEvaluate: string;
      let imageUrlForDb: string | null = null; // Will store a reference if image uploaded

      // Determine content for AI and handle image processing
      if (submission.submissionType === 'code') {
        if (!submission.code) {
          throw new Error('Code content is required for code submissions.');
        }
        contentToEvaluate = submission.code;
      } else if (submission.submissionType === 'image') {
        if (!submission.image || !submission.image.buffer) {
          throw new Error('Image file is required and must have a buffer for image submissions.');
        }
        // Use OCR to extract text from the image buffer
        contentToEvaluate = await OCRService.extractTextFromImage(submission.image.buffer);
        if (!contentToEvaluate.trim()) {
          throw new Error('OCR failed to extract readable content from the image. Please try a clearer image.');
        }
        // In a real application, you'd upload this image to a cloud storage (e.g., S3, Cloudinary)
        // and store its URL here. For this example, we'll use a placeholder.
        imageUrlForDb = `uploaded-image-${Date.now()}-${submission.image.originalname}`;
        console.warn('Image URL placeholder used. In production, upload image to cloud storage.');

      } else {
        throw new Error('Invalid submission type provided.');
      }

      // Prepare request for Gemini AI
      const geminiRequest: GeminiEvaluationRequest = {
        taskName: submission.taskName,
        submissionType: submission.submissionType,
      };

      if (submission.submissionType === 'code') {
        geminiRequest.code = contentToEvaluate;
      } else { // 'image'
        geminiRequest.extractedText = contentToEvaluate;
      }

      // Get AI evaluation
      const aiEvaluation = await GeminiService.evaluateSubmission(geminiRequest);
      console.log('AI Evaluation received:', aiEvaluation);

      // Save evaluation to database
      const savedEvaluation = await prisma.evaluation.create({
        data: {
          taskName: submission.taskName,
          submissionType: submission.submissionType,
          code: submission.submissionType === 'code' ? submission.code || null : null,
          imageUrl: imageUrlForDb, // Store image reference/URL
          score: aiEvaluation.score,
          feedback: aiEvaluation.feedback, // Stored as plain string
        },
      });

      return {
        id: savedEvaluation.id,
        taskName: savedEvaluation.taskName,
        submissionType: savedEvaluation.submissionType as 'code' | 'image',
        code: savedEvaluation.code,
        imageUrl: savedEvaluation.imageUrl,
        score: savedEvaluation.score,
        feedback: savedEvaluation.feedback,
        createdAt: savedEvaluation.createdAt,
        updatedAt: savedEvaluation.updatedAt
      };
    } catch (error) {
      console.error('EvaluationService: Error evaluating task:', error);
      throw error; // Re-throw to be caught by the route handler
    }
  }

  /**
   * Retrieves all evaluation history from the database.
   * @returns A promise that resolves with an array of evaluation results.
   */
  static async getEvaluationHistory(): Promise<EvaluationResult[]> {
    try {
      const evaluations = await prisma.evaluation.findMany({
        orderBy: { createdAt: 'desc' },
      });

      return evaluations.map(evalItem => ({
        id: evalItem.id,
        score: evalItem.score,
        feedback: evalItem.feedback,
        taskName: evalItem.taskName,
        submissionType: evalItem.submissionType as 'code' | 'image',
        code: evalItem.code,
        imageUrl: evalItem.imageUrl,
        createdAt: evalItem.createdAt,
        updatedAt: evalItem.updatedAt,
      }));
    } catch (error) {
      console.error('EvaluationService: Error fetching evaluation history:', error);
      throw error;
    }
  }

  /**
   * Retrieves a single evaluation by its ID.
   * @param id The ID of the evaluation.
   * @returns A promise that resolves with the evaluation result or null if not found.
   */
  static async getEvaluationById(id: string): Promise<EvaluationResult | null> {
    try {
      const evaluation = await prisma.evaluation.findUnique({
        where: { id },
      });

      if (!evaluation) return null;

      return {
        id: evaluation.id,
        score: evaluation.score,
        feedback: evaluation.feedback,
        taskName: evaluation.taskName,
        submissionType: evaluation.submissionType as 'code' | 'image',
        code: evaluation.code,
        imageUrl: evaluation.imageUrl,
        createdAt: evaluation.createdAt,
        updatedAt: evaluation.updatedAt,
      };
    } catch (error) {
      console.error(`EvaluationService: Error fetching evaluation by ID (${id}):`, error);
      throw error;
    }
  }
}