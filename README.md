# AI-Powered Task Evaluation Platform

A full-stack application designed to evaluate coding tasks using an advanced AI model. Users can submit their code directly or as a screenshot, receiving a performance score and detailed constructive feedback.

## 🚀 Features

*   **Intelligent Evaluation**: Utilizes a powerful AI model for in-depth analysis of submitted code.
*   **Flexible Submission**: Supports direct code text input and intelligent extraction from image uploads (screenshots).
*   **Robust Backend**: Built on Node.js with a secure and efficient Express framework.
*   **Modern Frontend**: A responsive and intuitive user interface developed with React and Tailwind CSS.
*   **Data Persistence**: Stores all evaluation history in a reliable MySQL database.
*   **Comprehensive Feedback**: Provides a score (out of 10) and detailed, actionable insights on code quality and task completion.

## 🛠️ Tech Stack

### Frontend
*   **Framework**: Vite + React + TypeScript
*   **Styling**: Tailwind CSS + Shadcn UI components
*   **Routing**: React Router
*   **API Management**: React Query

### Backend
*   **Runtime**: Node.js + Express + TypeScript
*   **Database**: MySQL with Prisma ORM
*   **AI Integration**: Google Gemini API for code analysis
*   **Image Processing**: Tesseract.js for Optical Character Recognition (OCR)
*   **File Handling**: Multer for efficient file uploads

## 📋 Getting Started

Follow these steps to get your development environment set up and the application running.

### Prerequisites

*   Node.js (LTS version, 18+ recommended)
*   npm (Node Package Manager)
*   MySQL Database (ensure it's running and accessible, e.g., via Docker or a local installation)
*   Google Gemini API Key (obtain one from [Google AI Studio](https://makersuite.google.com/app/apikey))

### Step 1: Clone the Repository

First, clone the project to your local machine:

```bash
git clone <repository-url>
cd task-ai
```

### Step 2: Backend Setup

Navigate into the `backend` directory and install dependencies:

```bash
cd backend
npm install
```

### Step 3: Backend Environment Configuration

Create a `.env` file inside the `backend/` directory (`backend/.env`) and populate it with your environment variables. **Ensure your MySQL password is URL-encoded if it contains special characters (e.g., `@` becomes `%40`).**

```env
# Database Connection String for MySQL
# Replace 'root' with your MySQL username, and 'RKR27%40mom' with your URL-encoded password
DATABASE_URL="mysql://root:RKR27%40mom@localhost:3306/task_ai_db"

# Your Google Gemini API Key
GEMINI_API_KEY="YOUR_ACTUAL_GEMINI_API_KEY"

# Backend Server Configuration
PORT=3001
NODE_ENV=development

# Frontend URL for CORS (Cross-Origin Resource Sharing)
FRONTEND_URL="http://localhost:3000"
```
**Important:** Replace `YOUR_ACTUAL_GEMINI_API_KEY` with the key you obtained from Google AI Studio.

### Step 4: Database Migration

With your `.env` configured, apply the Prisma database migrations to create the necessary tables in your MySQL database. Ensure you are still in the `backend/` directory.

```bash
npx prisma migrate dev --name init_database
```
This command will:
*   Generate the Prisma client.
*   Apply the schema changes to your `task_ai_db` database in MySQL.

### Step 5: Frontend Setup

Open a **new terminal window**. Navigate back to the project root directory (`task-ai`).

```bash
cd .. # if you are in backend/
# or simply: cd task-ai
npm install
```

### Step 6: Frontend Environment Configuration

Create a `.env` file in the **root directory** of your project (`frontend.env`) and add the backend API URL:

```env
VITE_API_BASE_URL=http://localhost:3001/api
```

### Step 7: Start the Backend Server

Go back to your **first terminal** (where you are in `backend/`) and start the backend:

```bash
npm run dev
```
You should see output similar to:
```
✅ Database connected successfully!
🚀 Server running on http://localhost:3001
📊 Health check: http://localhost:3001/health
🔗 API base URL: http://localhost:3001/api
```

### Step 8: Start the Frontend Server

Go to your **second terminal** (where you are in the project root `task-ai`) and start the frontend:

```bash
npm run dev
```
You should see output similar to:
```
  VITE v5.x.x  ready in xxx ms
  ➜  Local:   http://localhost:3000/
```

## 💡 How It's Implemented

The application is structured into a clear frontend and backend, communicating via a REST API.

*   **Frontend (`src/`):** A React application that provides the user interface for task submission and evaluation history. It interacts with the backend using `fetch` calls, encapsulated in `src/services/evaluationService.ts`. UI components are consolidated in `src/components/ui.tsx` for consistency and reusability.
*   **Backend (`backend/src/`):** A Node.js Express server that handles API requests, orchestrates AI evaluation, and manages database interactions.
    *   **`index.ts`**: The main entry point, setting up the Express server, CORS, and routing. It also performs a database health check on startup.
    *   **`routes/evaluation.ts`**: Defines the API endpoints (`/api/evaluate`, `/api/evaluations`, `/api/evaluations/:id`) for handling task submissions and retrieving evaluation data.
    *   **`services/geminiService.ts`**: Integrates with the Google Gemini API, responsible for sending the evaluation prompt and parsing the AI's feedback. It uses the `gemini-2.5-flash-preview-05-20` model for text generation.
    *   **`services/ocrService.ts`**: Utilizes Tesseract.js to extract text from submitted image files (screenshots).
    *   **`services/evaluationService.ts`**: Coordinates the entire evaluation flow: receiving submissions, calling OCR (if needed), interacting with the Gemini service, and saving results to the database via Prisma.
    *   **`prisma/schema.prisma`**: Defines the database schema for the `Evaluation` model, using MySQL as the provider. The `code` and `feedback` fields are configured as `TEXT` types to accommodate long strings.

## 🚀 Usage

1.  **Access the Application**: Open your web browser and go to `http://localhost:3000`.
2.  **Submit a Task**:
    *   Enter a `Task Name` (e.g., "Build a responsive product card").
    *   Choose your `Submission Type`: `Code` or `Upload Screenshot`.
    *   If `Code`: Paste your TypeScript/React code into the text area.
    *   If `Upload Screenshot`: Click "Upload Screenshot" and select an image file of your code.
3.  **Get AI Feedback**: Click the "Get AI Feedback" button. The system will process your submission and display the AI's score and detailed feedback.
4.  **View History**: Click "View Evaluation History" to see past submissions and their evaluations.

## 🔒 API Endpoints

All backend API endpoints are prefixed with `/api`.

*   **`POST /api/evaluate`**
    *   **Description**: Submits a coding task for AI evaluation.
    *   **Request Body (multipart/form-data)**:
        *   `taskName`: String - Name of the task.
        *   `submissionType`: String - Either `"code"` or `"image"`.
        *   `code`: String (optional) - The raw code text if `submissionType` is `"code"`.
        *   `image`: File (optional) - The image file if `submissionType` is `"image"`.
    *   **Success Response (200 OK)**:
        ```json
        {
          "success": true,
          "data": {
            "id": "...",
            "taskName": "...",
            "submissionType": "...",
            "code": "...",
            "imageUrl": "...",
            "score": 8,
            "feedback": "...",
            "createdAt": "...",
            "updatedAt": "..."
          }
        }
        ```

*   **`GET /api/evaluations`**
    *   **Description**: Retrieves a list of all previous task evaluations.
    *   **Success Response (200 OK)**:
        ```json
        {
          "success": true,
          "data": [
            { /* Evaluation object 1 */ },
            { /* Evaluation object 2 */ }
          ]
        }
        ```

*   **`GET /api/evaluations/:id`**
    *   **Description**: Retrieves a single evaluation by its ID.
    *   **Parameters**: `id` (string) - The unique ID of the evaluation.
    *   **Success Response (200 OK)**:
        ```json
        {
          "success": true,
          "data": { /* Single Evaluation object */ }
        }
        ```
    *   **Not Found Response (404 Not Found)**:
        ```json
        {
          "success": false,
          "error": "Evaluation not found."
        }
        ```

## 🎯 AI Evaluation Criteria

The AI model evaluates submissions based on a multi-faceted approach, providing feedback on:

*   **React Component Structure**: Assessing effective use of React hooks, state management, component reusability, and overall architecture.
*   **TypeScript Usage**: Evaluating strong typing, proper interface definitions, and avoidance of `any` types for robust code.
*   **Tailwind CSS Implementation**: Reviewing the application of utility-first classes, responsive design principles, and adherence to best practices.
*   **Logic and Readability**: Analyzing code efficiency, clarity of variable/function names, appropriate commenting, and error handling mechanisms.
*   **Task Fulfillment**: Determining how comprehensively the submitted code addresses the stated task objectives and requirements.

## 📂 Project Structure

```
task-ai/
├── backend/                  # Backend Node.js/Express application
│   ├── env.example           # Example environment variables
│   ├── package.json          # Backend dependencies
│   ├── prisma/               # Prisma ORM configuration
│   │   └── schema.prisma     # Database schema (MySQL)
│   └── src/                  # Backend source code
│       ├── index.ts          # Main Express server setup
│       ├── routes/           # API route definitions
│       │   └── evaluation.ts
│       ├── services/         # Business logic and external integrations
│       │   ├── evaluationService.ts
│       │   ├── geminiService.ts
│       │   └── ocrService.ts
│       └── types/            # Backend-specific TypeScript types
│           └── index.ts
├── public/                   # Frontend static assets
├── src/                      # Frontend React application
│   ├── App.tsx               # Main React component
│   ├── components/
│   │   └── ui.tsx            # Consolidated UI components (shadcn/ui)
│   ├── hooks/
│   │   └── use-toast.ts      # Custom hook for toast notifications
│   ├── lib/
│   │   └── utils.ts          # Frontend utility functions
│   ├── pages/                # Page-level components
│   │   ├── Index.tsx
│   │   ├── NotFound.tsx
│   │   └── TaskEvaluation.tsx
│   ├── services/
│   │   └── evaluationService.ts # Frontend service for API calls
│   └── types/
│       └── evaluation.ts     # Frontend-specific TypeScript types
├── frontend.env              # Frontend environment variables
├── vite.config.ts            # Vite configuration
└── README.md                 # This file
```

## 🚀 Deployment

### Frontend (e.g., Vercel, Netlify)
To build the frontend for deployment:
```bash
npm run build
```
The output will be in the `dist` directory.

### Backend (e.g., Railway, Render, Fly.io)
1.  Set up environment variables (`DATABASE_URL`, `GEMINI_API_KEY`, `PORT`, `FRONTEND_URL`) in your deployment platform's configuration.
2.  Ensure your deployment platform runs `npm install` and then `npx prisma migrate deploy` (or `npx prisma db push` for simpler setups) to apply database migrations.
3.  Start the server with `npm start` (ensure your `package.json` has a `start` script, typically `node dist/index.js` after a `tsc` build).

## 🤝 Contributing

Contributions are welcome! Please fork the repository, create a new branch for your features or bug fixes, and submit a pull request.

## 📝 License

This project is licensed under the MIT License. See the `LICENSE` file for details (if present, otherwise assume MIT).

## 🆘 Support

For any issues or questions, please:
1.  Consult this `README.md` and the existing code.
2.  Check the repository's issue tracker for similar problems.
3.  If your issue is new, please open a new issue with detailed information.

---

**Developed by: [RKR]**
