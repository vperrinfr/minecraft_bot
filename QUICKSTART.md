# Quick Start Guide

## 🚀 Getting Started in 3 Steps

### 1. Start the Application
```bash
./start.sh
```
Or manually:
```bash
npm start
```

### 2. Open Your Browser
Go to: http://localhost:3000

### 3. Configure Your Bot
Edit `bot.js` and update these settings:
```javascript
const config = {
  host: 'localhost',        // Your Minecraft server
  port: 25565,              // Server port
  username: 'MyBot',        // Bot username
  password: '',             // Password (if needed)
  version: '1.20.1'         // Server version
};
```

## 🎮 How to Use

### Connect Your Bot
1. Click "Connect Bot" button
2. Make sure your Minecraft server is running
3. The bot will join your server

### Movement Controls
- **Click the arrow buttons** for movement
- **Use keyboard shortcuts**:
  - `W` or `↑` - Forward
  - `S` or `↓` - Backward  
  - `A` or `←` - Left
  - `D` or `→` - Right
  - `Space` - Jump

### Natural Language Commands
Type commands like:
- "move forward"
- "jump"
- "attack the nearest zombie"
- "say hello"
- "check my inventory"

### Quick Commands
Use the dropdown menu for instant actions:
- Move in any direction
- Jump
- Attack
- Send chat messages
- Check status

## 🔧 Optional: Ollama Setup

For natural language processing:

1. Install Ollama:
```bash
brew install ollama  # macOS
# or visit https://ollama.ai for other platforms
```

2. Start Ollama:
```bash
ollama serve
```

3. Download a model:
```bash
ollama pull granite3.3:2b
```

## 📁 Project Structure

```
Minecraft/
├── bot.js              # Main bot server
├── package.json        # Dependencies
├── start.sh           # Startup script
├── README.md          # Full documentation
├── config.example.js  # Configuration template
└── public/            # Web interface
    ├── index.html     # Main page
    ├── style.css      # Styling
    └── script.js      # Frontend logic
```

## 🆘 Troubleshooting

**Bot won't connect?**
- Check your Minecraft server is running
- Verify server address in `bot.js`
- Make sure bot username is available

**Natural language not working?**
- Install and start Ollama
- Pull a model: `ollama pull granite3.3:2b`

**Web interface won't load?**
- Check ports 3000 and 8080 are free
- Try refreshing the page

## 🎯 What You Can Do

- ✅ Control bot movement with buttons or keyboard
- ✅ Use natural language to command the bot
- ✅ Monitor Minecraft chat in real-time
- ✅ Send messages to the server
- ✅ Check bot status (health, position, inventory)
- ✅ Attack mobs and interact with the world

Happy botting! 🤖
