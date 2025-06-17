// frontend/src/pages/TaskEvaluation.tsx
import React, { useState, useCallback } from 'react';
import { submitEvaluation, getEvaluationHistory } from '../services/evaluationService.ts'; // Corrected import
import { EvaluationResult } from '../types/evaluation.ts'; // Corrected import
import { Upload, FileText, Camera, Send, Star } from 'lucide-react';
import { Button, Input, Textarea, Card, Badge, useToast } from '@/components/ui';
// import '../index.css'; // Global CSS is usually imported in main.tsx or App.tsx

function TaskEvaluation() {
  // --- State Management ---
  const [taskName, setTaskName] = useState<string>('');
  const [submissionType, setSubmissionType] = useState<'code' | 'image'>('code');
  const [code, setCode] = useState<string>('');
  const [image, setImage] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [evaluationResult, setEvaluationResult] = useState<EvaluationResult | null>(null);
  const [showHistory, setShowHistory] = useState<boolean>(false);
  const [historyResults, setHistoryResults] = useState<EvaluationResult[]>([]);
  const { toast } = useToast();

  // --- Handlers ---
  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (file) {
      if (file.type.startsWith('image/')) {
        setImage(file);
      } else {
        toast({
          title: "Invalid file type",
          description: "Please upload an image file.",
          variant: "destructive"
        });
      }
    }
  }, []);

  const handleCodeChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setCode(e.target.value);
    if (e.target.value) {
      setSubmissionType('code');
      setImage(null); // Clear image if code is being typed
      // Manually clear the file input value
      const fileInput = document.getElementById('image-upload') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
    }
  }, []);

  const handleSubmissionTypeChange = useCallback((type: 'code' | 'image') => {
    setSubmissionType(type);
    if (type === 'code') {
      setImage(null);
      const fileInput = document.getElementById('image-upload') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
    } else { // type === 'image'
      setCode('');
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setError(null);
    setEvaluationResult(null);
    setIsLoading(true);
    setShowHistory(false); // Hide history when submitting new task

    // Client-side validation
    if (!taskName.trim()) {
      setError('Task name is required.');
      setIsLoading(false);
      return;
    }

    if (submissionType === 'code' && !code.trim()) {
      setError('Please provide code for evaluation.');
      setIsLoading(false);
      return;
    }

    if (submissionType === 'image' && !image) {
      setError('Please upload a screenshot for evaluation.');
      setIsLoading(false);
      return;
    }

    try {
      const submission = {
        taskName: taskName.trim(),
        submissionType,
        code: submissionType === 'code' ? code : undefined,
        image: submissionType === 'image' ? image : undefined,
      };

      const result = await submitEvaluation(submission);
      setEvaluationResult(result);
      // Clear form fields after successful submission
      setTaskName('');
      setCode('');
      setImage(null);
      const fileInput = document.getElementById('image-upload') as HTMLInputElement;
      if (fileInput) fileInput.value = '';

      toast({
        title: "Evaluation complete!",
        description: `Your task received a score of ${result.score}/10`,
      });
    } catch (err: any) {
      setError(err.message || 'An unknown error occurred during submission.');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchHistory = async () => {
    setIsLoading(true);
    setError(null);
    setEvaluationResult(null); // Hide current evaluation when showing history
    try {
      const history = await getEvaluationHistory();
      setHistoryResults(history);
      setShowHistory(true);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch evaluation history.');
    } finally {
      setIsLoading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 8) return 'text-green-600 bg-green-50 border-green-200';
    if (score >= 6) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    return 'text-red-600 bg-red-50 border-red-200';
  };

  const getScoreStars = (score: number) => {
    const stars = [];
    const fullStars = Math.floor(score / 2);
    const hasHalfStar = score % 2 !== 0;
    
    for (let i = 0; i < fullStars; i++) {
      stars.push(<Star key={i} className="h-4 w-4 fill-current text-yellow-400" />);
    }
    
    if (hasHalfStar) {
      stars.push(<Star key="half" className="h-4 w-4 fill-current text-yellow-400 opacity-50" />);
    }
    
    const remainingStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
    for (let i = 0; i < remainingStars; i++) {
      stars.push(<Star key={`empty-${i}`} className="h-4 w-4 text-gray-300" />);
    }
    
    return stars;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col items-center p-6">
      {/* Main Container for Form */}
      <div className="bg-white p-10 rounded-xl shadow-2xl w-full max-w-4xl mb-10 border border-gray-200">
        <h1 className="text-5xl font-extrabold text-center text-gray-900 mb-8 drop-shadow">
          AI Code Evaluator
        </h1>
        <p className="text-center text-lg text-gray-600 mb-8">
          Submit your code or a screenshot for an AI-powered score and detailed feedback.
        </p>

        {/* Submission Form */}
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Task Name Input */}
          <div>
            <label htmlFor="taskName" className="block text-base font-semibold text-gray-800 mb-2">
              Task Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="taskName"
              className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-200"
              value={taskName}
              onChange={(e) => setTaskName(e.target.value)}
              placeholder="e.g., Build a responsive e-commerce product card"
              required
            />
          </div>

          {/* Submission Type Toggle */}
          <div className="flex justify-center mb-6">
            <button
              type="button"
              onClick={() => handleSubmissionTypeChange('code')}
              className={`px-6 py-3 rounded-l-lg text-lg font-semibold transition-colors duration-200
                ${submissionType === 'code' ? 'bg-indigo-600 text-white shadow-lg' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
            >
              Submit Code
            </button>
            <button
              type="button"
              onClick={() => handleSubmissionTypeChange('image')}
              className={`px-6 py-3 rounded-r-lg text-lg font-semibold transition-colors duration-200
                ${submissionType === 'image' ? 'bg-indigo-600 text-white shadow-lg' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
            >
              Upload Screenshot
            </button>
          </div>

          {/* Conditional Input Area */}
          {submissionType === 'code' && (
            <div>
              <label htmlFor="code" className="block text-base font-semibold text-gray-800 mb-2">
                Paste Your Code Here <span className="text-red-500">*</span>
              </label>
              <textarea
                id="code"
                rows={12}
                className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 font-mono text-sm resize-y custom-scrollbar"
                value={code}
                onChange={handleCodeChange}
                placeholder="Paste your React, TypeScript, or Tailwind CSS code here..."
              ></textarea>
            </div>
          )}

          {submissionType === 'image' && (
            <div>
              <label htmlFor="image-upload" className="block text-base font-semibold text-gray-800 mb-2">
                Upload Code Screenshot <span className="text-red-500">*</span>
              </label>
              <div className="flex items-center space-x-4">
                <input
                  type="file"
                  id="image-upload"
                  accept="image/*"
                  className="block w-full text-sm text-gray-600
                    file:mr-4 file:py-2.5 file:px-5
                    file:rounded-lg file:border-0
                    file:text-base file:font-semibold
                    file:bg-indigo-100 file:text-indigo-700
                    hover:file:bg-indigo-200 transition duration-200 cursor-pointer"
                  onChange={handleFileChange}
                />
                {image && (
                  <span className="text-sm text-gray-700 whitespace-nowrap overflow-hidden text-ellipsis max-w-[150px]">
                    {image.name}
                  </span>
                )}
              </div>
              <p className="mt-2 text-sm text-gray-500">
                Accepted formats: PNG, JPG, GIF. Max size: 10MB. Clear screenshots yield better results.
              </p>
            </div>
          )}

          {/* Error Message Display */}
          {error && (
            <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg" role="alert">
              <strong className="font-bold">Error!</strong>
              <span className="block sm:inline ml-2">{error}</span>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full py-3 px-6 bg-indigo-600 text-white font-bold text-lg rounded-lg shadow-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-60 disabled:cursor-not-allowed transition duration-200 transform hover:scale-105"
            disabled={isLoading || !taskName.trim() || (submissionType === 'code' && !code.trim()) || (submissionType === 'image' && !image)}
          >
            {isLoading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Evaluating...
              </span>
            ) : 'Get AI Feedback'}
          </button>
        </form>

        {/* History Button */}
        <div className="mt-8 text-center">
          <button
            onClick={fetchHistory}
            className="px-6 py-3 bg-gray-700 text-white font-bold text-lg rounded-lg shadow-md hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-600 disabled:opacity-60 disabled:cursor-not-allowed transition duration-200"
            disabled={isLoading}
          >
            {isLoading && showHistory ? 'Loading History...' : 'View Evaluation History'}
          </button>
        </div>
      </div>

      {/* AI Evaluation Results Display Area */}
      {evaluationResult && (
        <div className="w-full max-w-4xl">
          <Card className="p-8">
            <div className="space-y-6">
              <div className="text-center">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  Evaluation Results
                </h2>
                
                {/* Score Display */}
                <div className={`inline-flex items-center gap-3 px-6 py-3 rounded-full border-2 ${getScoreColor(evaluationResult.score)}`}>
                  <span className="text-2xl font-bold">
                    {evaluationResult.score}/10
                  </span>
                  <div className="flex gap-1">
                    {getScoreStars(evaluationResult.score)}
                  </div>
                </div>
              </div>

              {/* Feedback */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  Detailed Feedback
                </h3>
                <div className="bg-gray-50 rounded-lg p-6">
                  <p className="text-gray-700 leading-relaxed">
                    {evaluationResult.feedback}
                  </p>
                </div>
              </div>

              {/* Task Info */}
              <div className="border-t pt-4">
                <div className="flex items-center gap-2">
                  <Badge variant="outline">Task: {evaluationResult.taskName}</Badge>
                  <Badge variant="outline">
                    Type: {evaluationResult.submissionType === 'code' ? 'Code' : 'Screenshot'}
                  </Badge>
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Evaluation History Display Area */}
      {showHistory && !isLoading && !evaluationResult && (
        <div className="w-full max-w-4xl mt-8 p-8 bg-white rounded-xl shadow-2xl border border-gray-200">
          <h2 className="text-4xl font-extrabold text-center text-gray-900 mb-6 drop-shadow">
            Evaluation History
          </h2>
          {historyResults.length === 0 ? (
            <p className="text-center text-gray-600 text-lg">No past evaluations found.</p>
          ) : (
            <ul className="space-y-6">
              {historyResults.map((evalItem) => (
                <li key={evalItem.id} className="p-6 bg-gray-50 rounded-lg shadow-sm border border-gray-100 flex flex-col md:flex-row justify-between items-start md:items-center">
                  <div className="flex-grow">
                    <p className="text-xl font-semibold text-indigo-700 mb-1">{evalItem.taskName}</p>
                    <p className="text-sm text-gray-600 mb-2">
                      Score: <span className="font-bold text-indigo-600">{evalItem.score}/10</span> | Type: {evalItem.submissionType}
                    </p>
                    <p className="text-sm text-gray-500">
                      Evaluated on: {new Date(evalItem.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <div className="mt-4 md:mt-0 md:ml-4">
                    {/* You could add a button here to view full details of a past evaluation */}
                    <button
                      onClick={() => {
                        setEvaluationResult(evalItem); // Display this specific evaluation
                        setShowHistory(false); // Hide the list
                      }}
                      className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors duration-200"
                    >
                      View Details
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

export default TaskEvaluation;