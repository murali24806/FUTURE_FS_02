#!/bin/bash
# LeadFlow CRM Startup Script

echo "🚀 Starting LeadFlow CRM..."
echo ""
echo "Starting Backend on port 5000..."
cd backend && npm install --silent && npm start &

sleep 2

echo "Starting Frontend on port 3000..."
cd ../frontend && npm install --silent && npm run dev &

echo ""
echo "✅ CRM is running!"
echo "   Admin Panel:  http://localhost:3000"
echo "   API Backend:  http://localhost:5000"
echo "   Login:        admin@crm.com / Admin@123"
