# AI-Powered Task Evaluation Platform

A full-stack application to evaluate coding tasks using an AI model, supporting both direct code input and image uploads.

## Tech Stack

- **Frontend**: Vite, React, TypeScript, Tailwind CSS
- **Backend**: Node.js, Express, TypeScript, Prisma
- **Database**: MySQL
- **AI**: Google Gemini API, Tesseract.js (for OCR)

## Getting Started

Follow these steps to get the project running on your local machine.

### 1. Prerequisites

- Node.js (v18+ recommended)
- npm
- A running MySQL Database (local or cloud-hosted like Railway)
- A Google Gemini API Key

### 2. Clone & Install

First, clone the repository and navigate into the project directory:

```bash
git clone <repository-url>
cd ai-code-evaluator
```

Next, install dependencies for both the backend and frontend:

```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies from the root directory
cd ..
npm install
```

### 3. Configure Environment Variables

You need to create two environment files. Examples are provided in `env.example` and `frontend.env`.

**For the Backend:**

Create a file at `ai-code-evaluator/backend/backend.env` and add the following, replacing the placeholder values:

```env
# URL for your MySQL database. Ensure password is URL-encoded if it contains special characters.
DATABASE_URL="mysql://USER:PASSWORD@HOST:PORT/DATABASE"

# Your API key from Google AI Studio
GEMINI_API_KEY="YOUR_GEMINI_API_KEY"

# The URL of your running frontend for CORS
FRONTEND_URL="http://localhost:3000"

# The port for the backend server
PORT=3001
```

**For the Frontend:**

Create a file at `ai-code-evaluator/frontend.env` with the backend API URL:

```env
VITE_API_BASE_URL="http://localhost:3001/api"
```

### 4. Set Up the Database

Navigate to the `backend` directory and run the Prisma migrations to set up your database schema:

```bash
cd backend
npx prisma migrate deploy
```

### 5. Run the Application

You will need two separate terminals to run both the backend and frontend servers.

**To Start the Backend:**

- In a terminal, navigate to `ai-code-evaluator/backend`.
- Run the command:
  ```bash
  npm run dev
  ```
- The backend API will be running at `http://localhost:3001`.

**To Start the Frontend:**

- In a **new** terminal, navigate to the root project directory `ai-code-evaluator`.
- Run the command:
  ```bash
  npm run dev
  ```
- The application will be accessible in your browser at `http://localhost:3000`.

---

### Accessing from Other Devices (Port Forwarding)

To access the application from another device on your local network (like your phone):

1.  **Expose the Frontend:** In `ai-code-evaluator/package.json`, modify the `dev` script to include the `--host` flag:
    ```json
    "scripts": {
      "dev": "vite --host",
      ...
    }
    ```
2.  **Use Your Local IP:** Find your computer's local network IP address (e.g., `192.168.1.10`).
3.  **Update Environment Files:** In `frontend.env` and `backend/backend.env`, replace `localhost` with your actual IP address.
4.  **Firewall Rule:** You may need to add a firewall rule on your host machine to allow incoming TCP traffic on the backend port (e.g., `3001`).
5.  **Restart Servers:** Stop and restart both the frontend and backend servers. The frontend terminal will now provide a "Network" URL to use.
