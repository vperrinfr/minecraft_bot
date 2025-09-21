# Minecraft Bot Web Interface

A modern web interface for controlling a Minecraft bot using the Mineflayer API. Features both natural language commands powered by Ollama and traditional dropdown-based controls.

## Features

- 🤖 **Minecraft Bot Control**: Full integration with Mineflayer API
- 🗣️ **Natural Language Commands**: Use Ollama-powered LLM for intuitive commands
- 🎮 **Movement Controls**: 4-directional movement with visual buttons
- 📱 **Responsive Design**: Modern, mobile-friendly interface
- 💬 **Real-time Chat**: Monitor Minecraft chat and send messages
- ⌨️ **Keyboard Shortcuts**: WASD and arrow key controls
- 📊 **Live Status**: Real-time bot position, health, and inventory display

## Prerequisites

1. **Node.js** (v16 or higher)
2. **Minecraft Server** (Java Edition)
3. **Ollama** (optional, for natural language processing)

## Installation

1. **Clone or download this project**
2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Install Ollama** (optional):
   ```bash
   # macOS
   brew install ollama
   
   # Linux
   curl -fsSL https://ollama.ai/install.sh | sh
   
   # Windows - download from https://ollama.ai
   ```

4. **Start Ollama** (if using natural language features):
   ```bash
   ollama serve
   
   # In another terminal, pull a model
   ollama pull llama2
   ```

## Configuration

Edit `bot.js` to configure your Minecraft server connection:

```javascript
const config = {
  host: 'localhost',        // Your Minecraft server address
  port: 25565,              // Server port
  username: 'MinecraftBot', // Bot username
  password: '',             // Bot password (if needed)
  version: '1.20.1'         // Server version
};
```

## Usage

1. **Start the application**:
   ```bash
   npm start
   ```

2. **Open your browser** and go to:
   ```
   http://localhost:3000
   ```

3. **Connect your bot**:
   - Click "Connect Bot" to connect to your Minecraft server
   - Make sure your Minecraft server is running and accessible

## Controls

### Movement Controls
- **Visual Buttons**: Click the arrow buttons for movement
- **Keyboard Shortcuts**:
  - `W` or `↑`: Move forward
  - `S` or `↓`: Move backward
  - `A` or `←`: Move left
  - `D` or `→`: Move right
  - `Space`: Jump

### Natural Language Commands
Type commands in natural language:
- "move forward"
- "jump"
- "attack the nearest zombie"
- "say hello to everyone"
- "check my inventory"
- "what's my health?"

### Quick Commands
Use the dropdown menu for common actions:
- Move in any direction
- Jump
- Attack nearest entity
- Send chat message
- Check inventory, health, or position

## API Endpoints

The server provides REST API endpoints:

- `GET /api/status` - Get bot and Ollama status
- `POST /api/connect` - Connect the bot
- `POST /api/disconnect` - Disconnect the bot

## WebSocket Events

The interface communicates with the bot via WebSocket:

### Client to Server:
- `command` - Execute a specific command
- `natural_language` - Process natural language command
- `connect_bot` - Connect to Minecraft server
- `disconnect_bot` - Disconnect from server

### Server to Client:
- `status` - Bot status updates
- `chat` - Minecraft chat messages
- `health` - Health updates
- `command_result` - Command execution results
- `error` - Error messages

## Troubleshooting

### Bot Won't Connect
1. Check your Minecraft server is running
2. Verify server address and port in `bot.js`
3. Ensure the bot username is available
4. Check server whitelist/bans

### Ollama Not Working
1. Make sure Ollama is installed and running: `ollama serve`
2. Pull a model: `ollama pull llama2`
3. Check the Ollama host URL in `bot.js`

### WebSocket Connection Issues
1. Ensure ports 3000 and 8080 are available
2. Check firewall settings
3. Try refreshing the browser page

## Customization

### Adding New Commands
Edit `bot.js` to add new commands in the `commands` object:

```javascript
const commands = {
  // ... existing commands
  myNewCommand: (param) => {
    // Your command logic here
    return { success: true, message: 'Command executed' };
  }
};
```

### Styling
Modify `public/style.css` to customize the appearance.

### Natural Language Processing
Update the Ollama prompt in `processNaturalLanguageCommand()` to improve command recognition.

## Dependencies

- **mineflayer**: Minecraft bot API
- **ws**: WebSocket library
- **express**: Web server
- **ollama**: Local LLM integration
- **cors**: Cross-origin resource sharing

## License

MIT License - feel free to modify and distribute.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## Support

For issues and questions:
1. Check the troubleshooting section
2. Review the console logs in your browser
3. Check the server logs in your terminal
