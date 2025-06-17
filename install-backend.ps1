Write-Host "🚀 Installing Backend Dependencies..." -ForegroundColor Green

# Navigate to backend directory
Set-Location backend

# Install dependencies
Write-Host "📦 Installing npm packages..." -ForegroundColor Yellow
npm install

# Generate Prisma client
Write-Host "🗄️ Generating Prisma client..." -ForegroundColor Yellow
npx prisma generate

Write-Host "✅ Backend setup complete!" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "1. Copy backend/env.example to backend/.env" -ForegroundColor White
Write-Host "2. Update backend/.env with your configuration:" -ForegroundColor White
Write-Host "   - DATABASE_URL (MySQL connection string)" -ForegroundColor White
Write-Host "   - GEMINI_API_KEY (from https://makersuite.google.com/app/apikey)" -ForegroundColor White
Write-Host "3. Set up your MySQL database" -ForegroundColor White
Write-Host "4. Run: npx prisma db push" -ForegroundColor White
Write-Host "5. Start backend: npm run dev" -ForegroundColor White 