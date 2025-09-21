#!/bin/bash

echo "🤖 Starting Minecraft Bot Interface..."
echo "=================================="
echo ""
echo "Make sure you have:"
echo "1. A Minecraft server running"
echo "2. Ollama installed and running (optional, for natural language)"
echo ""
echo "Starting the web interface..."
echo "Web interface will be available at: http://localhost:3000"
echo "WebSocket server running on: ws://localhost:8080"
echo ""
echo "Press Ctrl+C to stop the server"
echo ""

# Start the bot
npm start
