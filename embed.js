// embed.js - Hauptdatei für GitHub
(function() {
    'use strict';
    
    // CSS dynamisch laden
    const css = `
        :root {
            --primary-color: #2c3e50;
            --primary-hover: #34495e;
            --secondary-color: #f8f9fa;
            --text-color: #333;
            --border-color: #e9ecef;
            --shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
            --animation-speed: 0.3s;
        }

        .chat-widget-container * {
            box-sizing: border-box;
        }

        .chat-button {
            position: fixed;
            bottom: 20px;
            right: 20px;
            background: var(--primary-color);
            color: white;
            border: none;
            border-radius: 50%;
            width: 60px;
            height: 60px;
            box-shadow: var(--shadow);
            font-size: 24px;
            cursor: pointer;
            z-index: 10000;
            transition: all var(--animation-speed) ease;
            position: relative;
            overflow: hidden;
        }

        .chat-button:hover {
            background: var(--primary-hover);
            transform: scale(1.05);
        }

        .chat-button:focus {
            outline: 2px solid #007bff;
            outline-offset: 2px;
        }

        .chat-button.loading {
            animation: pulse 1.5s infinite;
        }

        .unread-badge {
            position: absolute;
            top: -5px;
            right: -5px;
            background: #dc3545;
            color: white;
            border-radius: 50%;
            width: 20px;
            height: 20px;
            font-size: 12px;
            display: none;
            align-items: center;
            justify-content: center;
            font-weight: bold;
        }

        .chat-widget {
            position: fixed;
            bottom: 90px;
            right: 20px;
            width: 350px;
            max-width: calc(100vw - 40px);
            background: white;
            border-radius: 12px;
            box-shadow: var(--shadow);
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            z-index: 10000;
            opacity: 0;
            transform: translateY(20px) scale(0.95);
            pointer-events: none;
            transition: all var(--animation-speed) ease;
            max-height: calc(100vh - 120px);
            display: flex;
            flex-direction: column;
        }

        .chat-widget.active {
            opacity: 1;
            transform: translateY(0) scale(1);
            pointer-events: all;
        }

        .chat-header {
            background: var(--primary-color);
            color: white;
            padding: 15px 20px;
            font-weight: 600;
            font-size: 16px;
            border-radius: 12px 12px 0 0;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }

        .chat-close {
            background: none;
            border: none;
            color: white;
            font-size: 20px;
            cursor: pointer;
            padding: 0;
            width: 24px;
            height: 24px;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 4px;
            transition: background-color 0.2s;
        }

        .chat-close:hover {
            background: rgba(255, 255, 255, 0.1);
        }

        .chat-log {
            flex: 1;
            overflow-y: auto;
            padding: 20px;
            background: var(--secondary-color);
            max-height: 300px;
            min-height: 200px;
        }

        .message {
            margin-bottom: 12px;
            animation: slideIn 0.3s ease;
        }

        .message-content {
            padding: 10px 14px;
            border-radius: 18px;
            max-width: 85%;
            word-wrap: break-word;
            font-size: 14px;
            line-height: 1.4;
        }

        .message.user {
            text-align: right;
        }

        .message.user .message-content {
            background: var(--primary-color);
            color: white;
            margin-left: auto;
        }

        .message.bot .message-content {
            background: white;
            color: var(--text-color);
            border: 1px solid var(--border-color);
        }

        .message.system .message-content {
            background: #fff3cd;
            color: #856404;
            border: 1px solid #ffeaa7;
            text-align: center;
            margin: 0 auto;
            font-size: 12px;
        }

        .message-time {
            font-size: 11px;
            color: #6c757d;
            margin-top: 4px;
        }

        .typing-indicator {
            display: none;
            align-items: center;
            padding: 10px 14px;
            background: white;
            border-radius: 18px;
            max-width: 85%;
            border: 1px solid var(--border-color);
            margin-bottom: 12px;
        }

        .typing-indicator.active {
            display: flex;
        }

        .typing-dots {
            display: flex;
            gap: 4px;
        }

        .typing-dot {
            width: 6px;
            height: 6px;
            background: #6c757d;
            border-radius: 50%;
            animation: typing 1.4s infinite ease-in-out;
        }

        .typing-dot:nth-child(2) { animation-delay: 0.2s; }
        .typing-dot:nth-child(3) { animation-delay: 0.4s; }

        .chat-input-container {
            padding: 15px 20px;
            border-top: 1px solid var(--border-color);
            background: white;
            border-radius: 0 0 12px 12px;
        }

        .chat-input {
            width: 100%;
            padding: 12px 15px;
            border: 1px solid var(--border-color);
            border-radius: 20px;
            font-size: 14px;
            outline: none;
            resize: none;
            font-family: inherit;
            transition: border-color 0.2s;
        }

        .chat-input:focus {
            border-color: var(--primary-color);
        }

        .chat-input:disabled {
            background: #f5f5f5;
            cursor: not-allowed;
        }

        .privacy-notice {
            font-size: 10px;
            color: #6c757d;
            text-align: center;
            margin-top: 8px;
            line-height: 1.3;
        }

        .privacy-notice a {
            color: var(--primary-color);
            text-decoration: none;
        }

        .privacy-notice a:hover {
            text-decoration: underline;
        }

        .error-message {
            color: #dc3545;
            font-size: 12px;
            margin-top: 5px;
            text-align: center;
        }

        @keyframes slideIn {
            from {
                opacity: 0;
                transform: translateY(10px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }

        @keyframes pulse {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.05); }
        }

        @keyframes typing {
            0%, 60%, 100% { transform: translateY(0); }
            30% { transform: translateY(-10px); }
        }

        @media (max-width: 480px) {
            .chat-widget {
                bottom: 10px;
                right: 10px;
                left: 10px;
                width: auto;
                max-height: calc(100vh - 30px);
            }
            
            .chat-button {
                bottom: 10px;
                right: 10px;
            }
        }

        @media (prefers-reduced-motion: reduce) {
            * {
                animation-duration: 0.01ms !important;
                animation-iteration-count: 1 !important;
                transition-duration: 0.01ms !important;
            }
        }
    `;

    // CSS in den Head einfügen
    const styleSheet = document.createElement('style');
    styleSheet.textContent = css;
    document.head.appendChild(styleSheet);

    // HTML für das Widget erstellen
    const widgetHTML = `
        <div class="chat-widget-container">
            <button class="chat-button" id="chatButton" aria-label="Chat öffnen" aria-expanded="false">
                💬
                <span class="unread-badge" id="unreadBadge">0</span>
            </button>
            
            <div class="chat-widget" id="chatWidget" role="dialog" aria-labelledby="chatHeader" aria-hidden="true">
                <div class="chat-header" id="chatHeader">
                    <span>Kundensupport</span>
                    <button class="chat-close" id="chatClose" aria-label="Chat schließen">×</button>
                </div>
                
                <div class="chat-log" id="chatLog" role="log" aria-live="polite">
                    <!-- Messages will be added here -->
                </div>
                
                <div class="typing-indicator" id="typingIndicator">
                    <span style="margin-right: 8px; font-size: 12px; color: #6c757d;">Bot tippt</span>
                    <div class="typing-dots">
                        <div class="typing-dot"></div>
                        <div class="typing-dot"></div>
                        <div class="typing-dot"></div>
                    </div>
                </div>
                
                <div class="chat-input-container">
                    <textarea class="chat-input" id="chatInput" placeholder="Ihre Nachricht..." rows="1" aria-label="Nachricht eingeben"></textarea>
                    <div class="error-message" id="errorMessage"></div>
                    <div class="privacy-notice">
                        Mit dem Absenden akzeptieren Sie unsere 
                        <a href="/datenschutz" target="_blank" rel="noopener">Datenschutzerklärung</a>
                    </div>
                </div>
            </div>
        </div>
    `;

    // ChatWidget Klasse
    class ChatWidget {
        constructor(config = {}) {
            this.config = {
                apiEndpoint: config.apiEndpoint || 'https://agentflowai.app.n8n.cloud/webhook/f5926bb4-7e51-41d1-8d87-3f2d336ac1ed',
                maxMessages: config.maxMessages || 50,
                rateLimitDelay: config.rateLimitDelay || 1000,
                welcomeMessage: config.welcomeMessage || 'Hallo! Wie kann ich Ihnen helfen?',
                ...config
            };

            this.isOpen = false;
            this.isLoading = false;
            this.unreadCount = 0;
            this.lastMessageTime = 0;
            this.messages = this.loadMessages();
            this.sessionId = this.getOrCreateSessionId();

            this.initElements();
            this.initEventListeners();
            this.init();
        }

        initElements() {
            this.chatButton = document.getElementById('chatButton');
            this.chatWidget = document.getElementById('chatWidget');
            this.chatClose = document.getElementById('chatClose');
            this.chatLog = document.getElementById('chatLog');
            this.chatInput = document.getElementById('chatInput');
            this.unreadBadge = document.getElementById('unreadBadge');
            this.typingIndicator = document.getElementById('typingIndicator');
            this.errorMessage = document.getElementById('errorMessage');
        }

        initEventListeners() {
            this.chatButton.addEventListener('click', () => this.toggleChat());
            this.chatClose.addEventListener('click', () => this.closeChat());
            this.chatInput.addEventListener('keydown', (e) => this.handleInputKeydown(e));
            this.chatInput.addEventListener('input', () => this.adjustInputHeight());

            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape' && this.isOpen) {
                    this.closeChat();
                }
            });

            document.addEventListener('click', (e) => {
                if (this.isOpen && !this.chatWidget.contains(e.target) && !this.chatButton.contains(e.target)) {
                    this.closeChat();
                }
            });
        }

        init() {
            this.renderMessages();
            if (this.messages.length === 0) {
                this.addMessage('bot', this.config.welcomeMessage);
            }
            this.updateUnreadBadge();
        }

        getOrCreateSessionId() {
            const storageKey = 'chatSessionId';
            let sessionId = sessionStorage.getItem(storageKey);
            
            if (!sessionId) {
                sessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
                sessionStorage.setItem(storageKey, sessionId);
            }
            
            return sessionId;
        }

        loadMessages() {
            try {
                const stored = sessionStorage.getItem('chatMessages');
                return stored ? JSON.parse(stored) : [];
            } catch (error) {
                console.warn('Failed to load chat messages:', error);
                return [];
            }
        }

        saveMessages() {
            try {
                const messagesToSave = this.messages.slice(-this.config.maxMessages);
                sessionStorage.setItem('chatMessages', JSON.stringify(messagesToSave));
            } catch (error) {
                console.warn('Failed to save chat messages:', error);
            }
        }

        toggleChat() {
            if (this.isOpen) {
                this.closeChat();
            } else {
                this.openChat();
            }
        }

        openChat() {
            this.isOpen = true;
            this.chatWidget.classList.add('active');
            this.chatButton.setAttribute('aria-expanded', 'true');
            this.chatWidget.setAttribute('aria-hidden', 'false');
            this.chatInput.focus();
            this.unreadCount = 0;
            this.updateUnreadBadge();
            this.scrollToBottom();
        }

        closeChat() {
            this.isOpen = false;
            this.chatWidget.classList.remove('active');
            this.chatButton.setAttribute('aria-expanded', 'false');
            this.chatWidget.setAttribute('aria-hidden', 'true');
        }

        async handleInputKeydown(event) {
            if (event.key === 'Enter' && !event.shiftKey) {
                event.preventDefault();
                await this.sendMessage();
            }
        }

        adjustInputHeight() {
            const input = this.chatInput;
            input.style.height = 'auto';
            input.style.height = Math.min(input.scrollHeight, 100) + 'px';
        }

        async sendMessage() {
            const message = this.chatInput.value.trim();
            
            if (!message || this.isLoading) return;

            const now = Date.now();
            if (now - this.lastMessageTime < this.config.rateLimitDelay) {
                this.showError('Bitte warten Sie einen Moment zwischen den Nachrichten.');
                return;
            }

            if (message.length > 1000) {
                this.showError('Nachricht ist zu lang. Maximal 1000 Zeichen erlaubt.');
                return;
            }

            this.lastMessageTime = now;
            this.clearError();
            
            this.addMessage('user', message);
            this.chatInput.value = '';
            this.adjustInputHeight();
            
            this.showTyping();
            
            try {
                const response = await this.callAPI(message);
                this.hideTyping();
                
                if (response && response.message) {
                    this.addMessage('bot', response.message);
                } else {
                    this.addMessage('system', 'Keine Antwort vom Server erhalten.');
                }
            } catch (error) {
                this.hideTyping();
                console.error('API Error:', error);
                this.addMessage('system', 'Entschuldigung, es gab einen Fehler. Bitte versuchen Sie es erneut.');
            }
        }

        async callAPI(message) {
            this.isLoading = true;
            this.chatInput.disabled = true;
            this.chatButton.classList.add('loading');

            try {
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 10000);

                const response = await fetch(this.config.apiEndpoint, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        message: this.sanitizeInput(message),
                        userId: this.sessionId,
                        timestamp: new Date().toISOString()
                    }),
                    signal: controller.signal
                });

                clearTimeout(timeoutId);

                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                }

                return await response.json();
            } finally {
                this.isLoading = false;
                this.chatInput.disabled = false;
                this.chatButton.classList.remove('loading');
            }
        }

        sanitizeInput(input) {
            return input.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
                       .replace(/[<>]/g, '')
                       .trim();
        }

        addMessage(type, content) {
            const message = {
                type,
                content,
                timestamp: new Date().toISOString(),
                id: Date.now() + Math.random()
            };

            this.messages.push(message);
            this.renderMessage(message);
            this.saveMessages();
            this.scrollToBottom();

            if (!this.isOpen && type === 'bot') {
                this.unreadCount++;
                this.updateUnreadBadge();
            }
        }

        renderMessages() {
            this.chatLog.innerHTML = '';
            this.messages.forEach(message => this.renderMessage(message));
            this.scrollToBottom();
        }

        renderMessage(message) {
            const messageDiv = document.createElement('div');
            messageDiv.className = `message ${message.type}`;
            messageDiv.setAttribute('data-id', message.id);

            const contentDiv = document.createElement('div');
            contentDiv.className = 'message-content';
            contentDiv.textContent = message.content;

            const timeDiv = document.createElement('div');
            timeDiv.className = 'message-time';
            timeDiv.textContent = this.formatTime(message.timestamp);

            messageDiv.appendChild(contentDiv);
            messageDiv.appendChild(timeDiv);
            this.chatLog.appendChild(messageDiv);
        }

        formatTime(timestamp) {
            const date = new Date(timestamp);
            return date.toLocaleTimeString('de-DE', { 
                hour: '2-digit', 
                minute: '2-digit' 
            });
        }

        showTyping() {
            this.typingIndicator.classList.add('active');
            this.scrollToBottom();
        }

        hideTyping() {
            this.typingIndicator.classList.remove('active');
        }

        updateUnreadBadge() {
            if (this.unreadCount > 0) {
                this.unreadBadge.textContent = this.unreadCount > 99 ? '99+' : this.unreadCount;
                this.unreadBadge.style.display = 'flex';
            } else {
                this.unreadBadge.style.display = 'none';
            }
        }

        showError(message) {
            this.errorMessage.textContent = message;
            setTimeout(() => this.clearError(), 5000);
        }

        clearError() {
            this.errorMessage.textContent = '';
        }

        scrollToBottom() {
            setTimeout(() => {
                this.chatLog.scrollTop = this.chatLog.scrollHeight;
            }, 100);
        }
    }

    // Widget initialisieren, wenn DOM geladen ist
    function initWidget() {
        // HTML in Body einfügen
        document.body.insertAdjacentHTML('beforeend', widgetHTML);
        
        // Widget erstellen
        window.AgentFlowChatWidget = new ChatWidget(window.AgentFlowChatConfig || {});
    }

    // DOM Ready Check
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initWidget);
    } else {
        initWidget();
    }

})();
