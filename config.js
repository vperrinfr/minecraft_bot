// Configuration template for Minecraft Bot Interface
// Copy this file to config.js and modify the values for your setup

module.exports = {
  // Minecraft Server Configuration
  minecraft: {
    host: 'localhost',        // Your Minecraft server address
    port: 56340,              // Server port (default is 25565)
    username: 'MinecraftBot', // Bot username (must be available on server)
    password: '',             // Bot password (leave empty for offline mode)
    version: '1.21.8'         // Server version (must match your server)
  },

  // Ollama Configuration (optional)
  ollama: {
    host: 'http://localhost:11434',  // Ollama server address
    model: 'llama2'                  // Model to use for natural language processing
  },

  // Web Server Configuration
  server: {
    port: 3000,               // Web interface port
    websocketPort: 8080       // WebSocket server port
  },

  // Bot Behavior Configuration
  bot: {
    autoReconnect: true,      // Automatically reconnect if disconnected
    reconnectDelay: 5000,     // Delay between reconnection attempts (ms)
    movementDuration: 1000,   // How long to hold movement keys (ms)
    chatPrefix: '[Bot]'       // Prefix for bot chat messages
  }
};
