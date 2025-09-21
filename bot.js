const mineflayer = require('mineflayer');
const WebSocket = require('ws');
const express = require('express');
const cors = require('cors');
const path = require('path');
const { Ollama } = require('ollama');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Configuration
const config = {
  host: 'localhost', // Change to your Minecraft server
  port: 25565,
  username: 'MinecraftBot', // Change to your bot's username
  password: '', // Add password if needed
  version: '1.20.1' // Change to your server version
};

let bot = null;
let ollama = null;

// Initialize Ollama
try {
  ollama = new Ollama({ host: 'http://localhost:11434' });
} catch (error) {
  console.log('Ollama not available:', error.message);
}

// Bot commands
const commands = {
  move: {
    forward: () => {
      if (bot && bot.entity) {
        const direction = bot.entity.yaw;
        bot.setControlState('forward', true);
        setTimeout(() => bot.setControlState('forward', false), 1000);
      }
    },
    backward: () => {
      if (bot && bot.entity) {
        bot.setControlState('back', true);
        setTimeout(() => bot.setControlState('back', false), 1000);
      }
    },
    left: () => {
      if (bot && bot.entity) {
        bot.look(bot.entity.yaw - Math.PI / 2, bot.entity.pitch);
        bot.setControlState('forward', true);
        setTimeout(() => {
          bot.setControlState('forward', false);
          bot.look(bot.entity.yaw, bot.entity.pitch);
        }, 1000);
      }
    },
    right: () => {
      if (bot && bot.entity) {
        bot.look(bot.entity.yaw + Math.PI / 2, bot.entity.pitch);
        bot.setControlState('forward', true);
        setTimeout(() => {
          bot.setControlState('forward', false);
          bot.look(bot.entity.yaw, bot.entity.pitch);
        }, 1000);
      }
    }
  },
  jump: () => {
    if (bot && bot.entity) {
      bot.setControlState('jump', true);
      setTimeout(() => bot.setControlState('jump', false), 200);
    }
  },
  attack: () => {
    if (bot && bot.entity) {
      const entity = bot.nearestEntity();
      if (entity && entity.type === 'mob') {
        bot.attack(entity);
      }
    }
  },
  chat: (message) => {
    if (bot) {
      bot.chat(message);
    }
  },
  getInventory: () => {
    if (bot && bot.inventory) {
      return bot.inventory.items();
    }
    return [];
  },
  getHealth: () => {
    if (bot && bot.health) {
      return {
        health: bot.health,
        food: bot.food,
        saturation: bot.foodSaturation
      };
    }
    return null;
  },
  getPosition: () => {
    if (bot && bot.entity) {
      return {
        x: Math.round(bot.entity.position.x),
        y: Math.round(bot.entity.position.y),
        z: Math.round(bot.entity.position.z),
        yaw: Math.round(bot.entity.yaw * 180 / Math.PI),
        pitch: Math.round(bot.entity.pitch * 180 / Math.PI)
      };
    }
    return null;
  }
};

// Process natural language commands with Ollama
async function processNaturalLanguageCommand(message) {
  if (!ollama) {
    return { error: 'Ollama not available' };
  }

  try {
    const prompt = `You are a Minecraft bot assistant. Convert this natural language command to a JSON action: "${message}"

Available actions:
- move: {direction: "forward|backward|left|right"}
- jump: {}
- attack: {}
- chat: {message: "text to say"}
- getInventory: {}
- getHealth: {}
- getPosition: {}

Respond with ONLY valid JSON for the action. If unclear, return {"error": "unclear command"}.`;

    const response = await ollama.generate({
      model: 'llama2', // Change to your preferred model
      prompt: prompt,
      stream: false
    });

    return JSON.parse(response.response);
  } catch (error) {
    return { error: 'Failed to process command: ' + error.message };
  }
}

// Create bot
function createBot() {
  if (bot) {
    bot.quit();
  }

  bot = mineflayer.createBot({
    host: config.host,
    port: config.port,
    username: config.username,
    password: config.password,
    version: config.version
  });

  bot.on('spawn', () => {
    console.log(`Bot spawned at ${bot.entity.position}`);
    broadcastToClients({ type: 'status', message: 'Bot connected and spawned!' });
  });

  bot.on('chat', (username, message) => {
    if (username !== bot.username) {
      broadcastToClients({ type: 'chat', username, message });
    }
  });

  bot.on('health', () => {
    broadcastToClients({ 
      type: 'health', 
      data: commands.getHealth() 
    });
  });

  bot.on('end', () => {
    console.log('Bot disconnected');
    broadcastToClients({ type: 'status', message: 'Bot disconnected' });
  });

  bot.on('error', (err) => {
    console.error('Bot error:', err);
    broadcastToClients({ type: 'error', message: err.message });
  });

  return bot;
}

// WebSocket server
const wss = new WebSocket.Server({ port: 8080 });
const clients = new Set();

function broadcastToClients(data) {
  const message = JSON.stringify(data);
  clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  });
}

wss.on('connection', (ws) => {
  console.log('Client connected');
  clients.add(ws);

  // Send initial bot status
  if (bot && bot.entity) {
    ws.send(JSON.stringify({
      type: 'initial_status',
      data: {
        connected: true,
        position: commands.getPosition(),
        health: commands.getHealth(),
        inventory: commands.getInventory()
      }
    }));
  }

  ws.on('message', async (message) => {
    try {
      const data = JSON.parse(message);
      
      switch (data.type) {
        case 'command':
          const result = await executeCommand(data.command, data.params);
          ws.send(JSON.stringify({ type: 'command_result', result }));
          break;
          
        case 'natural_language':
          const parsed = await processNaturalLanguageCommand(data.message);
          if (parsed.error) {
            ws.send(JSON.stringify({ type: 'error', message: parsed.error }));
          } else {
            const result = await executeCommand(parsed.action || Object.keys(parsed)[0], parsed);
            ws.send(JSON.stringify({ type: 'command_result', result }));
          }
          break;
          
        case 'connect_bot':
          createBot();
          break;
          
        case 'disconnect_bot':
          if (bot) {
            bot.quit();
            bot = null;
          }
          break;
      }
    } catch (error) {
      ws.send(JSON.stringify({ type: 'error', message: error.message }));
    }
  });

  ws.on('close', () => {
    console.log('Client disconnected');
    clients.delete(ws);
  });
});

// Execute commands
async function executeCommand(action, params = {}) {
  try {
    switch (action) {
      case 'move':
        if (params.direction && commands.move[params.direction]) {
          commands.move[params.direction]();
          return { success: true, message: `Moving ${params.direction}` };
        }
        break;
        
      case 'jump':
        commands.jump();
        return { success: true, message: 'Jumping' };
        
      case 'attack':
        commands.attack();
        return { success: true, message: 'Attacking nearest entity' };
        
      case 'chat':
        commands.chat(params.message || 'Hello!');
        return { success: true, message: 'Sent chat message' };
        
      case 'getInventory':
        const inventory = commands.getInventory();
        return { success: true, data: inventory };
        
      case 'getHealth':
        const health = commands.getHealth();
        return { success: true, data: health };
        
      case 'getPosition':
        const position = commands.getPosition();
        return { success: true, data: position };
        
      default:
        return { success: false, message: 'Unknown command' };
    }
  } catch (error) {
    return { success: false, message: error.message };
  }
}

// REST API endpoints
app.get('/api/status', (req, res) => {
  res.json({
    botConnected: !!bot && bot.entity,
    ollamaAvailable: !!ollama,
    position: bot ? commands.getPosition() : null,
    health: bot ? commands.getHealth() : null
  });
});

app.post('/api/connect', (req, res) => {
  try {
    createBot();
    res.json({ success: true, message: 'Bot connection initiated' });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
});

app.post('/api/disconnect', (req, res) => {
  try {
    if (bot) {
      bot.quit();
      bot = null;
    }
    res.json({ success: true, message: 'Bot disconnected' });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
});

// Start server
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Web interface running on http://localhost:${PORT}`);
  console.log(`WebSocket server running on ws://localhost:8080`);
  console.log('Make sure Ollama is running on localhost:11434 for natural language processing');
});
