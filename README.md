# Cloud Data Analytics Dashboard

A simple analytics platform for dataset analysis and anomaly detection - perfect for college projects!

## 🚀 Features

- **User Authentication**: Secure login/register
- **Dataset Upload**: Upload CSV/JSON files
- **Analytics**: Statistical analysis with charts
- **Anomaly Detection**: Find outliers in your data
- **Interactive Charts**: Visualize your data trends
- **Reports**: Generate comprehensive analysis reports

## 🛠️ Tech Stack

- **Frontend**: React + TypeScript + Material-UI
- **Backend**: Node.js + Express + TypeScript
- **Databases**: PostgreSQL (users) + MongoDB (data) + Redis (cache)
- **Charts**: Plotly.js
- **Deployment**: Docker

## � Quick Start

### Prerequisites
- Docker and Docker Compose installed
- 4GB+ RAM recommended

### 1. Clone and Start
```bash
git clone <your-repo>
cd cloud-analytics-dashboard
docker-compose up --build
```

### 2. Access Application
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000

### 3. Test with Sample Data
Create `sample-sales.csv`:
```csv
date,revenue,orders
2024-01-01,24000,120
2024-01-02,25500,130
2024-01-03,89000,420
2024-01-04,23800,118
2024-01-05,24500,121
2024-01-15,62000,310
2024-01-27,8000,40
```

## � How to Use

1. **Register**: Create your account
2. **Upload Dataset**: Drag & drop your CSV/JSON file
3. **Run Analytics**: Select a metric and click "Run Analytics"
4. **View Results**: See charts, statistics, and anomalies
5. **Generate Reports**: Create comprehensive analysis reports

## 🔧 Development

### Backend Development
```bash
cd backend
npm install
npm run dev
```

### Frontend Development
```bash
cd frontend
npm install
npm start
```

## 📁 File Storage

- **Development**: Files stored locally in `uploads/` folder
- **Production**: Can be configured to use AWS S3

## 🎯 Key Features Explained

### Anomaly Detection
- **Z-Score Method**: Finds values beyond 2.5 standard deviations
- **IQR Method**: Uses interquartile range to detect outliers
- **Severity Levels**: Low, Medium, High based on deviation

### Analytics
- **Summary Stats**: Mean, median, standard deviation
- **Time Series**: Date-based analysis
- **Interactive Charts**: Zoom, pan, hover for details

## � Troubleshooting

### Common Issues
1. **Port Conflicts**: Make sure ports 3000, 5000, 5432, 27017, 6379 are free
2. **Memory Issues**: Ensure Docker has at least 4GB RAM allocated
3. **Build Errors**: Try `docker-compose down` then `docker-compose up --build`

### View Logs
```bash
# All services
docker-compose logs

# Specific service
docker-compose logs backend
docker-compose logs frontend
```

## 📈 Sample Results

With the sample data above, you'll see:
- **Mean Revenue**: ~34,400
- **3 Anomalies Detected**: 
  - Jan 3: ₹89,000 (High spike)
  - Jan 15: ₹62,000 (Medium spike)  
  - Jan 27: ₹8,000 (Low dip)

## 🎓 For College Projects

This project demonstrates:
- **Full-stack development** (React + Node.js)
- **Database design** (PostgreSQL + MongoDB)
- **API development** (RESTful APIs)
- **Data analysis** (Statistical algorithms)
- **Containerization** (Docker)
- **Real-time features** (Caching with Redis)

## 📝 API Endpoints

- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/datasets/upload` - Upload dataset
- `GET /api/datasets` - List datasets
- `POST /api/analytics/run` - Run analytics
- `GET /api/analytics/:id` - Get results
- `POST /api/reports/generate` - Generate report

## 🔒 Security

- JWT authentication
- Password hashing
- Input validation
- File upload restrictions

## 📦 Project Structure

```
cloud-analytics-dashboard/
├── backend/          # Node.js API
├── frontend/         # React app
├── docker-compose.yml
└── README.md
```

## 🚀 Deployment Tips

### For AWS Free Tier:
1. Use t2.micro instance
2. Enable swap memory
3. Use RDS free tier for PostgreSQL
4. Use MongoDB Atlas free tier
5. Use ElastiCache free tier for Redis

### Memory Optimization:
```bash
# Add swap on EC2
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

---

**Perfect for college projects, hackathons, and learning full-stack development!** 🎓

Built with ❤️ for students and developers