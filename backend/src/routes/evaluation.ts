// backend/src/routes/evaluation.ts
import { Router, Request, Response } from 'express';
import multer from 'multer';
import { z } from 'zod'; // Zod for schema validation
import { EvaluationService } from '../services/evaluationService.js'; // Ensure .js extension
import { APIResponse, TaskSubmission } from '../types/index.js'; // Ensure .js extension

const router = Router();

// Configure multer for file uploads. Using memoryStorage to get buffer.
const upload = multer({
  storage: multer.memoryStorage(), // Store files in memory as a Buffer
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit (adjust as needed)
  },
  fileFilter: (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    // Only allow image files
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files (PNG, JPG, JPEG, GIF) are allowed.'));
    }
  },
});

// Zod schema for input validation
const evaluateSchema = z.object({
  taskName: z.string().min(1, 'Task name is required.'),
  submissionType: z.enum(['code', 'image'], {
    errorMap: () => ({ message: "Submission type must be 'code' or 'image'." })
  }),
  // 'code' is optional here, as it's mutually exclusive with 'image' file upload
  code: z.string().optional().or(z.literal('')), // Allow empty string for code field
});

// POST /api/evaluate - Submit a task for evaluation
router.post('/evaluate', upload.single('image'), async (req: Request, res: Response<APIResponse<any>>) => {
  try {
    // Combine fields and file into a single object for Zod validation
    // Multer populates req.body with text fields and req.file with the file
    const body = {
      ...req.body,
      image: req.file, // Pass the Multer file object
    };

    // Validate request body using Zod
    const validationResult = evaluateSchema.safeParse(body);

    if (!validationResult.success) {
      // Extract specific error messages from Zod
      const errors = validationResult.error.errors.map(err => err.message);
      return res.status(400).json({
        success: false,
        error: 'Invalid input data.',
        details: errors
      });
    }

    const { taskName, submissionType, code } = validationResult.data;
    const imageFile = req.file;

    // Further conditional validation based on submissionType
    if (submissionType === 'code' && (!code || code.trim() === '')) {
      return res.status(400).json({
        success: false,
        error: 'Code content is required for code submissions.'
      });
    }

    if (submissionType === 'image' && !imageFile) {
      return res.status(400).json({
        success: false,
        error: 'An image file is required for image submissions.'
      });
    }

    // Construct the submission object for the service
    const submission: TaskSubmission = {
      taskName,
      submissionType,
    };

    if (submissionType === 'code') {
      submission.code = code || ''; // Ensure it's a string, not undefined
    } else if (submissionType === 'image' && imageFile) {
      submission.image = imageFile;
    }

    // Evaluate the submission using the service layer
    const result = await EvaluationService.evaluateTask(submission);

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('Error in POST /api/evaluate endpoint:', error);
    const errorMessage = error instanceof Error ? error.message : 'Internal server error during evaluation.';
    res.status(500).json({
      success: false,
      error: errorMessage,
    });
  }
});

// GET /api/evaluations - Get evaluation history
router.get('/evaluations', async (req: Request, res: Response<APIResponse<any>>) => {
  try {
    const evaluations = await EvaluationService.getEvaluationHistory();
    res.json({
      success: true,
      data: evaluations,
    });
  } catch (error) {
    console.error('Error in GET /api/evaluations endpoint:', error);
    const errorMessage = error instanceof Error ? error.message : 'Internal server error fetching history.';
    res.status(500).json({
      success: false,
      error: errorMessage,
    });
  }
});

// GET /api/evaluations/:id - Get a specific evaluation by ID
router.get('/evaluations/:id', async (req: Request, res: Response<APIResponse<any>>) => {
  try {
    const { id } = req.params;

    const evaluation = await EvaluationService.getEvaluationById(id);

    if (!evaluation) {
      return res.status(404).json({
        success: false,
        error: 'Evaluation not found.'
      });
    }

    res.json({
      success: true,
      data: evaluation,
    });
  } catch (error) {
    console.error(`Error in GET /api/evaluations/${req.params.id} endpoint:`, error);
    const errorMessage = error instanceof Error ? error.message : 'Internal server error fetching evaluation.';
    res.status(500).json({
      success: false,
      error: errorMessage,
    });
  }
});

export default router;