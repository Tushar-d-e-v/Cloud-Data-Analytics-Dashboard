# Analytics Dashboard - Next.js Frontend

A simple and clean Next.js frontend for the analytics dashboard application.

## Features

- **Authentication**: Login and registration
- **Dashboard**: Overview of datasets and quick actions
- **Dataset Management**: Upload, view, and delete CSV datasets
- **Analytics**: Run analytics on processed datasets
- **Reports**: Generate comprehensive reports with multiple metrics

## Tech Stack

- Next.js 16 with App Router
- TypeScript
- Tailwind CSS
- React Query for data fetching
- Axios for API calls
- React Hot Toast for notifications

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
```bash
cp .env.local.example .env.local
```

3. Start the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## API Integration

The frontend connects to the backend API through:
- Proxy configuration in `next.config.ts`
- API client in `src/lib/api.ts`
- Environment variable `NEXT_PUBLIC_API_URL`

## Pages

- `/` - Dashboard (protected)
- `/login` - User login
- `/register` - User registration
- `/datasets` - Dataset management (protected)
- `/analytics/[datasetId]` - Analytics for specific dataset (protected)
- `/reports` - Report generation (protected)

## Build

```bash
npm run build
npm start
```

## Docker

```bash
docker build -t analytics-frontend .
docker run -p 3000:3000 analytics-frontend
```