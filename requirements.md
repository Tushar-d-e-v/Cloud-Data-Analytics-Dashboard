Cloud Data Analytics Dashboard with Smart Insights & Anomaly Detection

1. Problem Statement
Modern organizations continuously collect large-scale numerical datasets such as sales figures, revenue logs, sensor readings, and operational KPIs. However, most teams face the following challenges:
Lack of fast, on-demand insight generation
Difficulty identifying multiple anomalies instead of single spikes
Poor visualization of trends and deviations
Repeated recomputation of analytics for the same datasets
Limited scalability and cloud readiness
This system addresses these problems by providing a cloud-native analytics dashboard where users can upload datasets, run advanced MongoDB-powered analytics, detect multiple anomalies, cache results for performance, and visualize insights interactively.

2. Target Users
Business Analysts – revenue and KPI monitoring
Operations Managers – anomaly and outage detection
Data Engineers – lightweight analytics without heavy pipelines
Researchers / Product Teams – exploratory trend analysis

3. Functional Requirements
3.1 User Management
Email-based user registration
Secure login using email and password
JWT-based authentication and authorization(for his own data)
3.2 Dataset Management
Upload CSV or JSON datasets
Dataset versioning (multiple uploads per user)
Dataset lifecycle states:
Uploaded
Processed
Cached
Dataset deletion and reprocessing
3.3 Analytics & Visualization
Time-series metric analysis (e.g., revenue over time)
Detection of multiple anomalies using statistical techniques
Summary statistics (mean, median, standard deviation)
Interactive charts and graphs
3.4 Performance Optimization
Redis-based caching of analytics results
Cache invalidation on dataset updates or reprocessing
3.5 Cloud & Deployment
Dockerized frontend and backend services
AWS EC2 for compute
AWS S3 for dataset and report storage

4. Non-Functional Requirements
Horizontally scalable backend APIs
Secure and validated file uploads
Low latency for repeated analytics requests
Fault-tolerant caching layer
Cloud-native and container-first design

5. Complete Tech Stack
Frontend
ReactJS + Typescript
Plotly.js + D3.js for visualizations
Axios for API communication
JWT handling for authentication
Backend
Node.js + typescript
Express.js
Analytics processing and validation layer
Databases & Storage
Purpose
Technology
User authentication
PostgreSQL
Dataset metadata & analytics
MongoDB
Caching
Redis
File & report storage
AWS S3

Cloud & DevOps
Docker
AWS EC2
Nginx reverse proxy
Environment-based secrets management

6. Database Design
6.1 PostgreSQL – User Authentication
users table
Field
Type
id
UUID
email
VARCHAR (unique)
password_hash
TEXT
created_at
TIMESTAMP
last_login
TIMESTAMP


6.2 MongoDB – Dataset Metadata
datasets collection
{
  _id: ObjectId,
  userId: UUID,
  datasetName: "January Sales",
  s3FilePath: "s3://bucket/sales_jan.csv",
  uploadedAt: ISODate,
  columns: ["date", "revenue", "orders"],
  status: "processed"
}


6.3 MongoDB – Analytics Results
analytics collection
{
  datasetId: ObjectId,
  metric: "revenue",
  summary: {
    mean: 24600,
    median: 24200,
    stdDev: 1800
  },
  anomalies: [
    {
      date: "2024-01-03",
      value: 89000,
      type: "z-score",
      severity: "high"
    },
    {
      date: "2024-01-15",
      value: 62000,
      type: "iqr",
      severity: "medium"
    }
  ],
  createdAt: ISODate
}


7. MongoDB Aggregations (Core Feature)
7.1 Revenue per Day
$group: {
  _id: "$date",
  totalRevenue: { $sum: "$revenue" }
}

7.2 Rolling Average
Implemented using $setWindowFields
7.3 Multiple Anomaly Detection
Compute global mean and standard deviation
Calculate Z-score for each record
Detect multiple spikes above threshold
Classify severity levels
Interview Point:
"We rely on MongoDB aggregations to push computation closer to data and reduce application-side load."

8. Redis Caching Strategy
Cache Keys
analytics:{datasetId}:{metric}

Cached Data
Summary statistics
Anomaly lists
Precomputed chart points
Cache Invalidation
Dataset re-upload
Manual recompute action

9. End-to-End User Flow
Step 1: User Registration
User enters email and password
Backend hashes password and stores it in PostgreSQL
User is redirected to dashboard after login
Step 2: Dataset Upload
User uploads dataset and selects metric & time columns
File is stored in AWS S3
Metadata is saved in MongoDB
Analytics pipeline is triggered
Step 3: Analytics Generation
Dataset is parsed
MongoDB aggregations compute statistics
Multiple anomalies are detected
Results are cached in Redis
Step 4: Dashboard Visualization
User sees:
Time-series line chart
Highlighted anomaly points
Histogram and box plot
Insight panel summarizing findings
Step 5: Cached Reload
Subsequent requests hit Redis
Analytics load in milliseconds
Step 6: Dataset Management
View datasets
Re-run analytics
Delete datasets

10. Real-World Revenue Anomaly Example
Normal revenue: ₹24,000/day
Anomalies detected:
Jan 3: ₹89,000 (marketing campaign)
Jan 15: ₹62,000 (flash sale)
Jan 27: ₹8,000 (system outage)
Each anomaly is visually highlighted, statistically explained, and stored persistently.

11. API Design (Swagger-Style Overview)
Authentication
POST /api/auth/register
POST /api/auth/login
Dataset Management
POST /api/datasets/upload
GET /api/datasets
DELETE /api/datasets/{datasetId}
Analytics
POST /api/analytics/run
GET /api/analytics/{datasetId}?metric=revenue
Reports
POST /api/reports/generate

12. System Architecture
Logical Architecture
Frontend (React) → Nginx → Node.js API → MongoDB / PostgreSQL / Redis → AWS S3
Deployment (AWS EC2)
Docker container: Frontend
Docker container: Backend
Redis service
Nginx reverse proxy
Interview Explanation:
"We decouple compute, storage, caching, and authentication. Heavy analytics live close to MongoDB, repeated reads hit Redis, and S3 handles all binary storage."

13. Security & Best Practices
JWT-based authentication
Secure S3 uploads
Password hashing (bcrypt)
Environment-based secrets
Optional API rate limiting

14. Sequence Diagrams (Upload → Analytics → Cache)
14.1 Dataset Upload Flow
User
 │
 │ Upload CSV + metadata
 ▼
Frontend (React)
 │  POST /api/datasets/upload
 ▼
Backend (Node.js)
 │  ├─ Validate JWT
 │  ├─ Validate file & columns
 │  ├─ Upload file to S3
 │  ├─ Store metadata in MongoDB
 │  └─ Set dataset status = "processing"
 ▼
AWS S3
 │
 ▼
MongoDB (datasets)
 │
 ▼
Response → Frontend (datasetId, processing)


14.2 Analytics Generation Flow
Backend Scheduler / API Trigger
 │  POST /api/analytics/run
 ▼
Node.js Analytics Service
 │  ├─ Check Redis cache
 │  ├─ Cache MISS
 │  ├─ Read dataset records
 │  ├─ Run MongoDB aggregations
 │  │    • mean, stdDev
 │  │    • z-score anomalies
 │  ├─ Persist analytics → MongoDB
 │  └─ Store results → Redis
 ▼
Redis Cache
 │
 ▼
Response → Frontend (analytics summary)


14.3 Cached Analytics Fetch Flow
Frontend
 │  GET /api/analytics/{datasetId}
 ▼
Backend
 │  ├─ Check Redis
 │  ├─ Cache HIT
 │  └─ Return cached analytics
 ▼
Frontend (Charts render instantly)


15. Full OpenAPI (Swagger) Specification (YAML)
openapi: 3.0.3
info:
  title: Cloud Data Analytics API
  version: 1.0.0
  description: API for dataset analytics, anomaly detection, and insights

servers:
  - url: https://api.example.com

components:
  securitySchemes:
    bearerAuth:
      type: http
      scheme: bearer
      bearerFormat: JWT

security:
  - bearerAuth: []

paths:
  /api/auth/register:
    post:
      summary: Register a new user
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              properties:
                email:
                  type: string
                password:
                  type: string
      responses:
        '201':
          description: User registered

  /api/auth/login:
    post:
      summary: Login user
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              properties:
                email:
                  type: string
                password:
                  type: string
      responses:
        '200':
          description: JWT token returned

  /api/datasets/upload:
    post:
      summary: Upload dataset
      requestBody:
        required: true
        content:
          multipart/form-data:
            schema:
              type: object
              properties:
                file:
                  type: string
                  format: binary
                datasetName:
                  type: string
                timeColumn:
                  type: string
                metricColumn:
                  type: string
      responses:
        '200':
          description: Dataset uploaded

  /api/datasets:
    get:
      summary: List user datasets
      responses:
        '200':
          description: List of datasets

  /api/analytics/run:
    post:
      summary: Run analytics
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              properties:
                datasetId:
                  type: string
                metric:
                  type: string
      responses:
        '200':
          description: Analytics generated

  /api/analytics/{datasetId}:
    get:
      summary: Fetch analytics (cached)
      parameters:
        - in: path
          name: datasetId
          required: true
          schema:
            type: string
      responses:
        '200':
          description: Analytics response


16. Sample Dataset & Expected Analytics Output
16.1 Sample Dataset (sales.csv)
date,revenue,orders
2024-01-01,24000,120
2024-01-02,25500,130
2024-01-03,89000,420
2024-01-04,23800,118
2024-01-05,24500,121
2024-01-15,62000,310
2024-01-27,8000,40


16.2 Expected Summary Statistics
Mean Revenue: ~34,400
Median Revenue: ~24,500
Standard Deviation: High (due to spikes)


16.3 Expected Anomaly Detection Output
Detected Anomalies:

1. 2024-01-03
   Revenue: 89,000
   Z-Score: > 4
   Severity: High
   Reason: Marketing campaign spike

2. 2024-01-15
   Revenue: 62,000
   Z-Score: ~3
   Severity: Medium
   Reason: Flash sale

3. 2024-01-27
   Revenue: 8,000
   Z-Score: < -3
   Severity: High
   Reason: System outage


16.4 Dashboard Visualization Outcome
Line chart with highlighted anomaly points
Histogram showing long-tail distribution
Box plot indicating outliers
Insight panel auto-generated from analytics

17. Folder Structure & Code Skeleton (TypeScript + Node.js + MongoDB + Redis)
17.1 Project Folder Structure
cloud-analytics-dashboard/
│
├── backend/
│   ├── src/
│   │   ├── app.ts
│   │   ├── server.ts
│   │   │
│   │   ├── config/
│   │   │   ├── mongo.ts
│   │   │   ├── postgres.ts
│   │   │   ├── redis.ts
│   │   │   └── s3.ts
│   │   │
│   │   ├── routes/
│   │   │   ├── auth.routes.ts
│   │   │   ├── dataset.routes.ts
│   │   │   ├── analytics.routes.ts
│   │   │   └── report.routes.ts
│   │   │
│   │   ├── controllers/
│   │   │   ├── auth.controller.ts
│   │   │   ├── dataset.controller.ts
│   │   │   ├── analytics.controller.ts
│   │   │   └── report.controller.ts
│   │   │
│   │   ├── services/
│   │   │   ├── analytics.service.ts
│   │   │   ├── cache.service.ts
│   │   │   ├── dataset.service.ts
│   │   │   └── anomaly.service.ts
│   │   │
│   │   ├── models/
│   │   │   ├── dataset.model.ts
│   │   │   ├── record.model.ts
│   │   │   └── analytics.model.ts
│   │   │
│   │   ├── middlewares/
│   │   │   ├── auth.middleware.ts
│   │   │   └── error.middleware.ts
│   │   │
│   │   ├── utils/
│   │   │   ├── csvParser.ts
│   │   │   ├── jwt.ts
│   │   │   └── validators.ts
│   │   │
│   │   └── jobs/
│   │       └── analytics.job.ts
│   │
│   ├── tsconfig.json
│   ├── Dockerfile
│   ├── package.json
│   └── .env
│
├── frontend/
│   ├── src/
│   ├── Dockerfile
│   └── package.json
│
├── docker-compose.yml
└── README.md


17.2 Core Backend Bootstrap (TypeScript)
src/app.ts
import express, { Application } from 'express';
import cors from 'cors';

const app: Application = express();

app.use(cors());
app.use(express.json());

app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/datasets', require('./routes/dataset.routes'));
app.use('/api/analytics', require('./routes/analytics.routes'));
app.use('/api/reports', require('./routes/report.routes'));

app.use(require('./middlewares/error.middleware'));

export default app;

src/server.ts
import app from './app';
import './config/mongo';
import './config/postgres';
import './config/redis';

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});


17.3 Database Connections
MongoDB (config/mongo.ts)
import mongoose from 'mongoose';

mongoose
  .connect(process.env.MONGO_URI as string)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error(err));

Redis (config/redis.ts)
import Redis from 'ioredis';

const redis = new Redis(process.env.REDIS_URL as string);
export default redis;


17.4 Authentication Middleware
middlewares/auth.middleware.ts
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export default (req: Request, res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Unauthorized' });

  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET as string);
    next();
  } catch {
    res.status(401).json({ message: 'Invalid token' });
  }
};


17.5 Dataset Upload Controller (Skeleton)
controllers/dataset.controller.ts
import { Request, Response } from 'express';

export const uploadDataset = async (req: Request, res: Response) => {
  const { datasetName, timeColumn, metricColumn } = req.body;

  // 1. Upload file to S3
  // 2. Save metadata to MongoDB
  // 3. Parse CSV and store records
  // 4. Trigger analytics job

  res.json({ status: 'processing' });
};


17.6 Analytics Service (Skeleton)
services/analytics.service.ts
import redis from '../config/redis';

export const runAnalytics = async (datasetId: string, metric: string) => {
  const cacheKey = `analytics:${datasetId}:${metric}`;

  const cached = await redis.get(cacheKey);
  if (cached) return JSON.parse(cached);

  // MongoDB aggregation + anomaly detection

  const result = { summary: {}, anomalies: [] };
  await redis.set(cacheKey, JSON.stringify(result));

  return result;
};


17.7 Docker Compose (Private Network, Frontend Only Exposed)
version: '3.9'

networks:
  analytics_net:
    driver: bridge

services:
  frontend:
    build: ./frontend
    ports:
      - "3000:3000"
    depends_on:
      - backend
    networks:
      - analytics_net

  backend:
    build: ./backend
    expose:
      - "5000"
    env_file:
      - ./backend/.env
    depends_on:
      - postgres
      - mongodb
      - redis
    networks:
      - analytics_net

  postgres:
    image: postgres:15
    environment:
      POSTGRES_DB: analytics_auth
      POSTGRES_USER: analytics_user
      POSTGRES_PASSWORD: analytics_pass
    volumes:
      - postgres_data:/var/lib/postgresql/data
    expose:
      - "5432"
    networks:
      - analytics_net

  mongodb:
    image: mongo:6
    volumes:
      - mongo_data:/data/db
    expose:
      - "27017"
    networks:
      - analytics_net

  redis:
    image: redis:7
    expose:
      - "6379"
    networks:
      - analytics_net

volumes:
  postgres_data:
  mongo_data:





