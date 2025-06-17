# AI-Powered Task Evaluation Platform

A full-stack application that allows users to submit coding tasks (either as raw code or screenshots) and receive AI-powered evaluations with scores and constructive feedback.

## 🚀 Features

- **AI-Powered Evaluation**: Uses Google's Gemini AI to analyze code quality
- **Multiple Submission Types**: Support for both code text and image uploads
- **OCR Integration**: Automatically extracts code from screenshots using Tesseract.js
- **TypeScript**: Full type safety across frontend and backend
- **Modern UI**: Built with React, Tailwind CSS, and consolidated UI components
- **Database Storage**: MySQL database with Prisma ORM for evaluation history
- **Real-time Feedback**: Instant scoring and detailed feedback

## 🛠️ Tech Stack

### Frontend
- **Vite** + **React** + **TypeScript**
- **Tailwind CSS** + **Consolidated UI components**
- **React Router** for navigation
- **React Query** for API state management

### Backend
- **Node.js** + **Express** + **TypeScript**
- **Prisma** ORM with **MySQL** database
- **Google Gemini AI** for code evaluation
- **Tesseract.js** for OCR (image to text)
- **Multer** for file uploads

## 📋 Prerequisites

- Node.js 18+ 
- MySQL database
- Google Gemini API key (free tier available)

## 🚀 Quick Start

### 1. Clone and Setup

```bash
git clone <repository-url>
cd task-ai
```

### 2. Frontend Setup

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

The frontend will be available at `http://localhost:5173`

### 3. Backend Setup

#### Option A: Using PowerShell Script (Windows)
```powershell
.\install-backend.ps1
```

#### Option B: Manual Setup
```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Generate Prisma client
npx prisma generate

# Copy environment file
cp env.example .env
```

### 4. Environment Configuration

Update `backend/.env` with your configuration:

```env
# Database
DATABASE_URL="mysql://your_username:your_password@localhost:3306/task_ai_db"

# Gemini AI API
GEMINI_API_KEY="AIzaSyAuuUb_S9c3qZwFhyecek4EM0Uh-sJHod0"

# Server
PORT=3001
NODE_ENV=development

# CORS
FRONTEND_URL="http://localhost:3000"
```

### 5. Database Setup

1. Create a MySQL database
2. Run database migrations:

```bash
cd backend
npx prisma db push
```

### 6. Start Backend

```bash
cd backend
npm run dev
```

The backend API will be available at `http://localhost:3001`

## 📖 Usage

1. **Navigate to the evaluation page**: Go to `http://localhost:5173/evaluate`

2. **Submit a task**:
   - Enter a task name (e.g., "Create a responsive login form")
   - Choose submission type: Code or Screenshot
   - For code: Paste your TypeScript/React code
   - For screenshot: Upload an image of your code

3. **Get AI evaluation**:
   - The system will analyze your submission
   - Receive a score out of 10
   - Get detailed feedback on code quality, best practices, and improvements

## 🔧 API Endpoints

### POST `/api/evaluate`
Submit a task for evaluation

**Request Body:**
```json
{
  "taskName": "Create a login form",
  "submissionType": "code",
  "code": "// Your TypeScript/React code here"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "score": 8,
    "feedback": "Excellent code structure...",
    "taskName": "Create a login form",
    "submissionType": "code",
    "timestamp": "2024-01-01T00:00:00.000Z"
  }
}
```

### GET `/api/evaluations`
Get evaluation history

### GET `/api/evaluations/:id`
Get specific evaluation by ID

## 🎯 AI Evaluation Criteria

The AI evaluates submissions based on:

- **React Component Structure**: Proper component organization and patterns
- **TypeScript Usage**: Type safety, interfaces, and best practices
- **Tailwind CSS Implementation**: Class organization and responsive design
- **Code Logic**: Functionality, readability, and maintainability
- **Task Completion**: How well the code meets the stated objectives

## 🏗️ Simplified Project Structure

```
task-ai/
├── src/                    # Frontend source
│   ├── components/
│   │   └── ui.tsx         # Consolidated UI components
│   ├── pages/             # Page components
│   │   ├── Index.tsx      # Redirects to evaluation
│   │   ├── TaskEvaluation.tsx
│   │   └── NotFound.tsx
│   ├── services/          # API services
│   ├── types/             # TypeScript types
│   └── hooks/             # Custom hooks
├── backend/               # Backend source
│   ├── src/
│   │   ├── routes/        # API routes
│   │   ├── services/      # Business logic
│   │   └── types/         # TypeScript types
│   └── prisma/            # Database schema
├── install-backend.ps1    # Backend setup script
└── README.md
```

## 🚀 Deployment

### Frontend (Vercel/Netlify)
```bash
npm run build
```

### Backend (Railway/Render)
1. Set environment variables
2. Run database migrations
3. Deploy with `npm start`

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📝 License

MIT License - see LICENSE file for details

## 🆘 Support

For issues and questions:
1. Check the documentation
2. Search existing issues
3. Create a new issue with detailed information

---

**Note**: This project uses the free tier of Google's Gemini AI API. For production use, consider upgrading to a paid plan for higher rate limits and better performance.
