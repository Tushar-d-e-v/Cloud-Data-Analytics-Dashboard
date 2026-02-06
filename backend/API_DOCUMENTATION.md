# Cloud Analytics Dashboard API Documentation

## Overview

This is a comprehensive REST API for the Cloud Analytics Dashboard with smart insights and anomaly detection capabilities. The API provides endpoints for user authentication, dataset management, analytics processing, and report generation.

## Features

- **User Authentication**: JWT-based authentication system
- **Dataset Management**: Upload, process, and manage CSV/JSON datasets
- **Advanced Analytics**: Statistical analysis with MongoDB aggregations
- **Anomaly Detection**: Multiple algorithms (Z-score, IQR, Isolation Forest)
- **Performance Optimization**: Redis caching for fast response times
- **Cloud Integration**: AWS S3 for file storage
- **Interactive Documentation**: Swagger UI available

## Quick Start

### 1. Start the Server

```bash
cd backend
npm install
npm run dev
```

The server will start on `http://localhost:5000`

### 2. Access API Documentation

Once the server is running, you can access the interactive Swagger documentation at:

**Swagger UI**: `http://localhost:5000/api-docs`

### 3. Health Check

Test if the API is running:

```bash
curl http://localhost:5000/health
```

Expected response:
```json
{
  "status": "OK",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

## Authentication Flow

### 1. Register a New User

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "securepassword123"
  }'
```

### 2. Login

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "securepassword123"
  }'
```

Response:
```json
{
  "success": true,
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "email": "user@example.com"
  }
}
```

### 3. Use the Token

Include the JWT token in the Authorization header for protected endpoints:

```bash
curl -X GET http://localhost:5000/api/datasets \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## Dataset Management

### Upload a Dataset

```bash
curl -X POST http://localhost:5000/api/datasets/upload \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "file=@sample-data.csv" \
  -F "datasetName=January Sales Data" \
  -F "timeColumn=date" \
  -F "metricColumn=revenue"
```

### List Datasets

```bash
curl -X GET http://localhost:5000/api/datasets \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Get Dataset Details

```bash
curl -X GET http://localhost:5000/api/datasets/{datasetId} \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## Analytics

### Run Analytics

```bash
curl -X POST http://localhost:5000/api/analytics/run \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "datasetId": "65a1b2c3d4e5f6789abcdef0",
    "metric": "revenue"
  }'
```

### Get Analytics Results

```bash
curl -X GET http://localhost:5000/api/analytics/{datasetId}?metric=revenue \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

Expected response:
```json
{
  "success": true,
  "data": {
    "datasetId": "65a1b2c3d4e5f6789abcdef0",
    "metric": "revenue",
    "summary": {
      "mean": 24600.50,
      "median": 24200.00,
      "stdDev": 1800.25,
      "min": 8000.00,
      "max": 89000.00,
      "count": 365
    },
    "anomalies": [
      {
        "date": "2024-01-03",
        "value": 89000.00,
        "type": "z-score",
        "severity": "high",
        "zscore": 4.2
      }
    ],
    "timeSeriesData": [
      {
        "date": "2024-01-01",
        "value": 24000.00
      }
    ]
  },
  "cached": true
}
```

## API Endpoints Summary

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile

### Datasets
- `POST /api/datasets/upload` - Upload dataset
- `GET /api/datasets` - List user datasets
- `GET /api/datasets/{id}` - Get dataset details
- `DELETE /api/datasets/{id}` - Delete dataset
- `POST /api/datasets/{id}/reprocess` - Reprocess dataset

### Analytics
- `POST /api/analytics/run` - Run analytics
- `GET /api/analytics/{datasetId}` - Get analytics results
- `GET /api/analytics/{datasetId}/metrics` - Get available metrics
- `DELETE /api/analytics/{datasetId}/cache` - Clear cache

### Reports
- `POST /api/reports/generate` - Generate report
- `GET /api/reports/{datasetId}/insights` - Get insights

## Error Handling

The API uses standard HTTP status codes and returns consistent error responses:

```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error message",
  "details": "Additional context"
}
```

Common status codes:
- `200` - Success
- `201` - Created
- `400` - Bad Request (validation error)
- `401` - Unauthorized
- `404` - Not Found
- `409` - Conflict (duplicate resource)
- `413` - Payload Too Large
- `500` - Internal Server Error

## Sample Dataset Format

### CSV Format
```csv
date,revenue,orders,region
2024-01-01,24000,120,North
2024-01-02,25500,130,South
2024-01-03,89000,420,North
```

### JSON Format
```json
[
  {
    "date": "2024-01-01",
    "revenue": 24000,
    "orders": 120,
    "region": "North"
  },
  {
    "date": "2024-01-02",
    "revenue": 25500,
    "orders": 130,
    "region": "South"
  }
]
```

## Environment Variables

Required environment variables in `.env`:

```env
NODE_ENV=development
PORT=5000

# Database URLs
POSTGRES_URL=postgresql://analytics_user:analytics_pass@localhost:5432/analytics_auth
MONGO_URI=mongodb://localhost:27017/analytics_data
REDIS_URL=redis://localhost:6379

# JWT Secret
JWT_SECRET=your-super-secret-jwt-key-change-in-production

# AWS S3 Configuration (Optional)
AWS_ACCESS_KEY_ID=your-aws-access-key
AWS_SECRET_ACCESS_KEY=your-aws-secret-key
AWS_REGION=us-east-1
S3_BUCKET_NAME=analytics-datasets-bucket
```

## Database Requirements

Make sure these services are running:
- PostgreSQL (port 5432)
- MongoDB (port 27017)
- Redis (port 6379)

You can start them using Docker:

```bash
# PostgreSQL
docker run -d --name postgres -p 5432:5432 \
  -e POSTGRES_DB=analytics_auth \
  -e POSTGRES_USER=analytics_user \
  -e POSTGRES_PASSWORD=analytics_pass \
  postgres:15-alpine

# MongoDB
docker run -d --name mongodb -p 27017:27017 mongo:6

# Redis
docker run -d --name redis -p 6379:6379 redis:7-alpine
```

## Development

### Project Structure
```
backend/
├── src/
│   ├── app.ts              # Express app setup
│   ├── server.ts           # Server entry point
│   ├── config/             # Database configurations
│   ├── routes/             # API route definitions
│   ├── controllers/        # Request handlers
│   ├── services/           # Business logic
│   ├── models/             # Database models
│   ├── middlewares/        # Custom middleware
│   └── utils/              # Utility functions
├── swagger.yaml            # OpenAPI specification
└── package.json
```

### Available Scripts
- `npm run dev` - Start development server with hot reload
- `npm run build` - Build TypeScript to JavaScript
- `npm start` - Start production server

## Support

For issues and questions:
- Check the Swagger documentation at `/api-docs`
- Review the error responses for debugging
- Ensure all environment variables are properly set
- Verify database connections are working

## License

MIT License - see LICENSE file for details.