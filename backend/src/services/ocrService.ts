// backend/src/services/ocrService.ts
import Tesseract from 'tesseract.js';
import { writeFile, unlink } from 'fs/promises';
import { join } from 'path';
import { tmpdir } from 'os';

export class OCRService {
  /**
   * Extracts text content from an image buffer using Tesseract.js.
   * A temporary file is created for Tesseract to process, then deleted.
   * @param imageBuffer The image data as a Buffer.
   * @returns A promise that resolves with the extracted text.
   * @throws An error if OCR fails.
   */
  static async extractTextFromImage(imageBuffer: Buffer): Promise<string> {
    let tempFilePath: string | undefined;
    try {
      // Create a unique temporary file path
      tempFilePath = join(tmpdir(), `ocr-temp-${Date.now()}-${Math.random().toString(36).substring(7)}.png`);

      // Write the buffer to a temporary file
      await writeFile(tempFilePath, imageBuffer);
      console.log(`Temporary image file created at: ${tempFilePath}`);

      // Perform OCR
      const result = await Tesseract.recognize(tempFilePath, 'eng', {
        // Optional: log progress. Tesseract.js logs to console by default.
        // logger: m => console.log(`OCR Progress: ${m.status} - ${(m.progress * 100).toFixed(2)}%`)
      });

      const extractedText = result.data.text.trim();
      console.log('OCR extraction complete.');

      return extractedText;
    } catch (error) {
      console.error('OCRService: Error extracting text from image:', error);
      throw new Error(`OCR failed: ${error instanceof Error ? error.message : 'Unknown OCR error'}. Please ensure the image contains clear text.`);
    } finally {
      // Clean up the temporary file, regardless of success or failure
      if (tempFilePath) {
        try {
          await unlink(tempFilePath);
          console.log(`Temporary image file deleted: ${tempFilePath}`);
        } catch (cleanupError) {
          console.warn(`OCRService: Failed to delete temporary image file ${tempFilePath}:`, cleanupError);
        }
      }
    }
  }
}