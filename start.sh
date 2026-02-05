#!/bin/bash

echo "🚀 Starting Cloud Analytics Dashboard..."
echo "📊 Perfect for college projects and learning!"
echo ""

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker first."
    exit 1
fi

# Check if Docker Compose is available
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

echo "🔧 Building and starting services..."
echo "⏳ This may take a few minutes on first run..."
echo ""

# Build and start services
docker-compose up --build

echo ""
echo "🎉 Application should be running at:"
echo "   Frontend: http://localhost:3000"
echo "   Backend:  http://localhost:5000"
echo ""
echo "📝 To stop the application, press Ctrl+C"
echo "🔄 To restart, run: docker-compose up"
echo "🧹 To clean up, run: docker-compose down"