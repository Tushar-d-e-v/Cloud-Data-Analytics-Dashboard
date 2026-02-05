# Quick Start Guide

## Prerequisites
- Node.js 16+ and npm
- Docker and Docker Compose (for containerized setup)
- PostgreSQL, MongoDB, Redis (for local development without Docker)

## Option 1: Docker Setup (Easiest)

```bash
# Build and start all services
docker-compose up --build

# Access the application
# Frontend: http://localhost:3000
# Backend API: http://localhost:5000
# Backend Health: http://localhost:5000/health
```

## Option 2: Local Development

### Step 1: Install Dependencies

```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### Step 2: Start Services

Make sure PostgreSQL, MongoDB, and Redis are running locally, then:

```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm start
```

### Step 3: Update Environment Variables (if needed)

If running locally without Docker, update `backend/.env`:

```env
POSTGRES_URL=postgresql://analytics_user:analytics_pass@localhost:5432/analytics_auth
MONGO_URI=mongodb://localhost:27017/analytics_data
REDIS_URL=redis://localhost:6379
```

## Testing the Fixes

### 1. Test Authentication

Open browser DevTools (F12) → Network tab

**Register:**
```
1. Go to http://localhost:3000/register
2. Enter: email@example.com / password123
3. Click "Sign Up"
4. Should redirect to dashboard
5. Check Network tab - should see successful POST to /api/auth/register
```

**Login:**
```
1. Go to http://localhost:3000/login
2. Enter your credentials
3. Click "Sign In"
4. Should redirect to dashboard
5. Check Network tab - should see:
   - POST /api/auth/login (200 OK)
   - GET /api/auth/profile (200 OK) ← This was returning 403 before!
```

**Verify Token:**
```
1. Open DevTools → Application → Local Storage
2. Should see "token" key with JWT value
3. Refresh the page
4. Should stay logged in (no redirect to login)
```

### 2. Test Plotly.js Charts

**Upload Dataset:**
```
1. Go to Datasets page
2. Upload sample-data.csv
3. Wait for processing
```

**View Analytics:**
```
1. Click on a dataset
2. Go to Analytics tab
3. Select a metric from dropdown
4. Click "Run Analytics"
5. Should see:
   - Time series chart rendered with Plotly
   - Interactive chart (zoom, pan, hover)
   - Anomaly points highlighted
   - Summary statistics
```

## Troubleshooting

### Issue: 403 Forbidden on /api/auth/profile
**Solution**: This is now fixed! The frontend correctly parses `response.data.data` structure.

### Issue: Cannot connect to backend
**Solution**: 
- Docker: Make sure all containers are running (`docker-compose ps`)
- Local: Check backend is running on port 5000 (`curl http://localhost:5000/health`)

### Issue: Plotly charts not rendering
**Solution**:
- Check browser console for errors
- Verify plotly.js is installed: `cd frontend && npm list plotly.js`
- Should show: `plotly.js@2.27.1`

### Issue: TypeScript errors in IDE
**Solution**:
- Run `npm install` in frontend directory
- Restart TypeScript server in your IDE
- The type definitions in `react-plotly.d.ts` are now properly configured

## Verify Everything Works

Run this checklist:

- [ ] Backend starts without errors
- [ ] Frontend starts without errors
- [ ] Can register new user
- [ ] Can login
- [ ] Profile API returns 200 (check Network tab)
- [ ] Token persists after refresh
- [ ] Can upload CSV file
- [ ] Can view datasets
- [ ] Can run analytics
- [ ] Plotly charts render and are interactive
- [ ] Can logout

## Next Steps

1. Create a test user account
2. Upload the provided `sample-data.csv`
3. Explore the analytics features
4. Check the Reports page for insights

## Need Help?

Check the logs:
```bash
# Docker logs
docker-compose logs backend
docker-compose logs frontend

# Local logs
# Backend logs appear in terminal
# Frontend logs in browser console
```
