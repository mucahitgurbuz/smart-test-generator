#!/bin/bash

# Smart Test Generator - End-to-End Demo Script
# This script demonstrates the full functionality of the Smart Test Generator

echo "🚀 Smart Test Generator - Production Demo"
echo "=========================================="
echo ""
echo "This script will demonstrate:"
echo "1. 📊 Real-time Dashboard with Live Data"
echo "2. 🔍 Code Analysis Engine"
echo "3. 🧪 Test Generation Pipeline"
echo "4. ⚙️  Configuration Management"
echo "5. 📈 Analytics & Metrics"

echo ""
echo "Prerequisites:"
echo "- Node.js 18+ installed"
echo "- npm installed"
echo "- All dependencies installed (npm install)"

echo ""
read -p "Press Enter to start the demo..."

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Please run this script from the Smart Test Generator root directory"
    exit 1
fi

# Check if all packages are built
echo ""
echo "🔧 Building all packages..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Build failed. Please check the error messages above."
    exit 1
fi

# Start the API server
echo ""
echo "🚀 Starting API Server..."
cd packages/api
npm run start &
API_PID=$!
cd ../..

# Wait for API server to start
echo "⏳ Waiting for API server to start..."
sleep 5

# Check if API server is running
if ! curl -s http://localhost:3002/api/projects > /dev/null; then
    echo "❌ API server failed to start"
    kill $API_PID 2>/dev/null
    exit 1
fi

echo "✅ API Server started successfully on port 3002"

# Start the dashboard
echo ""
echo "🎨 Starting Dashboard..."
cd packages/dashboard
npm run dev &
DASHBOARD_PID=$!
cd ../..

# Wait for dashboard to start
echo "⏳ Waiting for dashboard to start..."
sleep 8

# Check if dashboard is running
if ! curl -s http://localhost:3001 > /dev/null; then
    echo "❌ Dashboard failed to start"
    kill $API_PID $DASHBOARD_PID 2>/dev/null
    exit 1
fi

echo "✅ Dashboard started successfully on port 3001"

echo ""
echo "🎉 Demo is now running!"
echo "=========================================="
echo ""
echo "📊 Dashboard: http://localhost:3001"
echo "   - View real-time test statistics"
echo "   - Browse test results with filtering"
echo "   - Analyze code complexity and coverage"
echo "   - Configure AI and testing settings"
echo ""
echo "🔌 API Endpoints: http://localhost:3002/api"
echo "   - /projects - Project management"
echo "   - /tests - Test suite operations"
echo "   - /analysis - Code analysis results"
echo "   - /settings - Configuration management"
echo ""
echo "🚀 Key Features Demonstrated:"
echo "   ✓ Real-time data fetching with React Query"
echo "   ✓ SQLite database with sample data"
echo "   ✓ RESTful API with Express.js"
echo "   ✓ Modern React dashboard with Vite"
echo "   ✓ TypeScript throughout the stack"
echo "   ✓ Responsive design with Tailwind CSS"
echo "   ✓ Animated UI with Framer Motion"
echo "   ✓ Data visualization with Recharts"
echo ""
echo "📱 Try the following in the dashboard:"
echo "   1. Navigate between Dashboard, Test Results, and Code Analysis"
echo "   2. Filter test results by status (passed/failed/pending)"
echo "   3. Click on files in Code Analysis to see detailed metrics"
echo "   4. Modify settings and save them (they persist to the API)"
echo "   5. Watch real-time data updates every 30 seconds"
echo ""
echo "Press Ctrl+C to stop all services..."

# Trap to cleanup processes on exit
trap "echo '🛑 Stopping services...'; kill $API_PID $DASHBOARD_PID 2>/dev/null; echo '✅ All services stopped.'; exit 0" INT

# Keep the script running
while true; do
    sleep 10
    # Check if services are still running
    if ! kill -0 $API_PID 2>/dev/null; then
        echo "❌ API server stopped unexpectedly"
        kill $DASHBOARD_PID 2>/dev/null
        exit 1
    fi
    if ! kill -0 $DASHBOARD_PID 2>/dev/null; then
        echo "❌ Dashboard stopped unexpectedly"
        kill $API_PID 2>/dev/null
        exit 1
    fi
done
