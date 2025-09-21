class MinecraftBotInterface {
    constructor() {
        this.ws = null;
        this.isConnected = false;
        this.initializeElements();
        this.attachEventListeners();
        this.connectWebSocket();
    }

    initializeElements() {
        // Connection elements
        this.connectBtn = document.getElementById('connect-btn');
        this.disconnectBtn = document.getElementById('disconnect-btn');
        this.connectionStatus = document.getElementById('connection-status');
        this.ollamaStatus = document.getElementById('ollama-status');

        // Movement elements
        this.forwardBtn = document.getElementById('forward-btn');
        this.backwardBtn = document.getElementById('backward-btn');
        this.leftBtn = document.getElementById('left-btn');
        this.rightBtn = document.getElementById('right-btn');
        this.jumpBtn = document.getElementById('jump-btn');

        // Natural language elements
        this.nlInput = document.getElementById('nl-input');
        this.nlSendBtn = document.getElementById('nl-send-btn');
        this.nlStatus = document.getElementById('nl-status');

        // Dropdown command elements
        this.commandSelect = document.getElementById('command-select');
        this.chatInput = document.getElementById('chat-input');
        this.executeBtn = document.getElementById('execute-btn');

        // Status elements
        this.positionValue = document.getElementById('position-value');
        this.healthValue = document.getElementById('health-value');
        this.foodValue = document.getElementById('food-value');
        this.inventoryCount = document.getElementById('inventory-count');

        // Chat elements
        this.chatLog = document.getElementById('chat-log');
        this.chatMessage = document.getElementById('chat-message');
        this.sendChatBtn = document.getElementById('send-chat');
    }

    attachEventListeners() {
        // Connection controls
        this.connectBtn.addEventListener('click', () => this.connectBot());
        this.disconnectBtn.addEventListener('click', () => this.disconnectBot());

        // Movement controls
        this.forwardBtn.addEventListener('click', () => this.move('forward'));
        this.backwardBtn.addEventListener('click', () => this.move('backward'));
        this.leftBtn.addEventListener('click', () => this.move('left'));
        this.rightBtn.addEventListener('click', () => this.move('right'));
        this.jumpBtn.addEventListener('click', () => this.executeCommand('jump'));

        // Natural language
        this.nlSendBtn.addEventListener('click', () => this.sendNaturalLanguageCommand());
        this.nlInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendNaturalLanguageCommand();
            }
        });

        // Dropdown commands
        this.commandSelect.addEventListener('change', (e) => {
            this.chatInput.style.display = e.target.value === 'chat' ? 'block' : 'none';
        });
        this.executeBtn.addEventListener('click', () => this.executeDropdownCommand());

        // Chat
        this.sendChatBtn.addEventListener('click', () => this.sendChatMessage());
        this.chatMessage.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.sendChatMessage();
            }
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
            
            switch(e.key.toLowerCase()) {
                case 'w':
                case 'arrowup':
                    this.move('forward');
                    break;
                case 's':
                case 'arrowdown':
                    this.move('backward');
                    break;
                case 'a':
                case 'arrowleft':
                    this.move('left');
                    break;
                case 'd':
                case 'arrowright':
                    this.move('right');
                    break;
                case ' ':
                    e.preventDefault();
                    this.executeCommand('jump');
                    break;
            }
        });
    }

    connectWebSocket() {
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const wsUrl = `${protocol}//${window.location.hostname}:8080`;
        
        this.ws = new WebSocket(wsUrl);

        this.ws.onopen = () => {
            this.isConnected = true;
            this.addChatMessage('WebSocket connected', 'system');
            this.checkServerStatus();
        };

        this.ws.onmessage = (event) => {
            const data = JSON.parse(event.data);
            this.handleWebSocketMessage(data);
        };

        this.ws.onclose = () => {
            this.isConnected = false;
            this.connectionStatus.textContent = 'Disconnected';
            this.connectionStatus.className = 'status disconnected';
            this.addChatMessage('WebSocket disconnected', 'system');
            
            // Attempt to reconnect after 3 seconds
            setTimeout(() => {
                if (!this.isConnected) {
                    this.addChatMessage('Attempting to reconnect...', 'system');
                    this.connectWebSocket();
                }
            }, 3000);
        };

        this.ws.onerror = (error) => {
            this.addChatMessage('WebSocket error: ' + error.message, 'error');
        };
    }

    handleWebSocketMessage(data) {
        switch (data.type) {
            case 'status':
                this.addChatMessage(data.message, 'system');
                break;
                
            case 'chat':
                this.addChatMessage(`<${data.username}> ${data.message}`, 'chat');
                break;
                
            case 'health':
                this.updateHealthStatus(data.data);
                break;
                
            case 'initial_status':
                this.updateBotStatus(data.data);
                break;
                
            case 'command_result':
                this.handleCommandResult(data.result);
                break;
                
            case 'error':
                this.addChatMessage(`Error: ${data.message}`, 'error');
                this.showStatusMessage(data.message, 'error');
                break;
        }
    }

    handleCommandResult(result) {
        if (result.success) {
            this.addChatMessage(`✓ ${result.message}`, 'system');
            if (result.data) {
                this.handleCommandData(result.data);
            }
        } else {
            this.addChatMessage(`✗ ${result.message}`, 'error');
        }
    }

    handleCommandData(data) {
        if (Array.isArray(data)) {
            // Inventory data
            this.inventoryCount.textContent = `${data.length} items`;
            if (data.length > 0) {
                this.addChatMessage(`Inventory: ${data.map(item => `${item.count}x ${item.name}`).join(', ')}`, 'system');
            }
        } else if (data.health !== undefined) {
            // Health data
            this.updateHealthStatus(data);
        } else if (data.x !== undefined) {
            // Position data
            this.updatePositionStatus(data);
        }
    }

    sendWebSocketMessage(message) {
        if (this.isConnected && this.ws.readyState === WebSocket.OPEN) {
            this.ws.send(JSON.stringify(message));
        } else {
            this.addChatMessage('Not connected to WebSocket', 'error');
        }
    }

    connectBot() {
        this.sendWebSocketMessage({ type: 'connect_bot' });
        this.connectBtn.disabled = true;
        setTimeout(() => {
            this.connectBtn.disabled = false;
        }, 2000);
    }

    disconnectBot() {
        this.sendWebSocketMessage({ type: 'disconnect_bot' });
    }

    move(direction) {
        this.executeCommand('move', { direction });
    }

    executeCommand(action, params = {}) {
        this.sendWebSocketMessage({
            type: 'command',
            command: action,
            params: params
        });
    }

    sendNaturalLanguageCommand() {
        const message = this.nlInput.value.trim();
        if (!message) return;

        this.nlInput.value = '';
        this.showStatusMessage('Processing natural language command...', 'success');
        
        this.sendWebSocketMessage({
            type: 'natural_language',
            message: message
        });

        this.addChatMessage(`Natural language: "${message}"`, 'system');
    }

    executeDropdownCommand() {
        const command = this.commandSelect.value;
        if (!command) return;

        if (command === 'chat') {
            const message = this.chatInput.value.trim();
            if (!message) return;
            this.executeCommand('chat', { message });
            this.chatInput.value = '';
        } else if (command.startsWith('move:')) {
            const direction = command.split(':')[1];
            this.move(direction);
        } else {
            this.executeCommand(command);
        }

        this.commandSelect.value = '';
        this.chatInput.style.display = 'none';
    }

    sendChatMessage() {
        const message = this.chatMessage.value.trim();
        if (!message) return;

        this.executeCommand('chat', { message });
        this.chatMessage.value = '';
    }

    addChatMessage(message, type = 'chat') {
        const messageDiv = document.createElement('div');
        messageDiv.className = `chat-message ${type}`;
        messageDiv.innerHTML = message;
        
        this.chatLog.appendChild(messageDiv);
        this.chatLog.scrollTop = this.chatLog.scrollHeight;
    }

    showStatusMessage(message, type) {
        this.nlStatus.textContent = message;
        this.nlStatus.className = `status-message ${type}`;
        
        setTimeout(() => {
            this.nlStatus.style.display = 'none';
        }, 3000);
    }

    updateBotStatus(data) {
        if (data.connected) {
            this.connectionStatus.textContent = 'Connected';
            this.connectionStatus.className = 'status connected';
        }
        
        if (data.position) {
            this.updatePositionStatus(data.position);
        }
        
        if (data.health) {
            this.updateHealthStatus(data.health);
        }
        
        if (data.inventory) {
            this.inventoryCount.textContent = `${data.inventory.length} items`;
        }
    }

    updatePositionStatus(position) {
        this.positionValue.textContent = `(${position.x}, ${position.y}, ${position.z})`;
    }

    updateHealthStatus(health) {
        this.healthValue.textContent = `${health.health}/20`;
        this.foodValue.textContent = `${health.food}/20`;
    }

    async checkServerStatus() {
        try {
            const response = await fetch('/api/status');
            const status = await response.json();
            
            this.ollamaStatus.textContent = status.ollamaAvailable ? 'Ollama: Available' : 'Ollama: Unavailable';
            this.ollamaStatus.className = `status ${status.ollamaAvailable ? 'connected' : 'disconnected'}`;
            
            if (status.botConnected) {
                this.connectionStatus.textContent = 'Bot Connected';
                this.connectionStatus.className = 'status connected';
                
                if (status.position) {
                    this.updatePositionStatus(status.position);
                }
                
                if (status.health) {
                    this.updateHealthStatus(status.health);
                }
            }
        } catch (error) {
            console.error('Failed to check server status:', error);
        }
    }
}

// Initialize the interface when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new MinecraftBotInterface();
});

// Add some helpful console messages
console.log('Minecraft Bot Interface loaded!');
console.log('Keyboard shortcuts:');
console.log('- W/↑: Move forward');
console.log('- S/↓: Move backward');
console.log('- A/←: Move left');
console.log('- D/→: Move right');
console.log('- Space: Jump');
