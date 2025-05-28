// widget.js
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
            if (e.key === 'Escape' && this.isOpen) this.closeChat();
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
        let sessionId = sessionStorage.getItem('chatSessionId');
        if (!sessionId) {
            sessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
            sessionStorage.setItem('chatSessionId', sessionId);
        }
        return sessionId;
    }

    loadMessages() {
        try {
            const stored = sessionStorage.getItem('chatMessages');
            return stored ? JSON.parse(stored) : [];
        } catch {
            return [];
        }
    }

    saveMessages() {
        try {
            const msgs = this.messages.slice(-this.config.maxMessages);
            sessionStorage.setItem('chatMessages', JSON.stringify(msgs));
        } catch {}
    }

    toggleChat() {
        this.isOpen ? this.closeChat() : this.openChat();
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
            this.showError('Bitte warten Sie einen Moment.');
            return;
        }

        if (message.length > 1000) {
            this.showError('Nachricht ist zu lang.');
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
                this.addMessage('system', 'Keine Antwort vom Server.');
            }
        } catch {
            this.hideTyping();
            this.addMessage('system', 'Fehler bei der Verbindung.');
        }
    }

    async callAPI(message) {
        this.isLoading = true;
        this.chatInput.disabled = true;
        this.chatButton.classList.add('loading');
        try {
            const controller = new AbortController();
            const timeout = setTimeout(() => controller.abort(), 10000);

            const response = await fetch(this.config.apiEndpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: this.sanitizeInput(message),
                    userId: this.sessionId,
                    timestamp: new Date().toISOString()
                }),
                signal: controller.signal
            });
            clearTimeout(timeout);
            if (!response.ok) throw new Error();
            return await response.json();
        } finally {
            this.isLoading = false;
            this.chatInput.disabled = false;
            this.chatButton.classList.remove('loading');
        }
    }

    sanitizeInput(input) {
        return input.replace(/<script[^>]*?>[\s\S]*?<\/script>/gi, '').replace(/[<>]/g, '').trim();
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
        this.messages.forEach(msg => this.renderMessage(msg));
        this.scrollToBottom();
    }

    renderMessage(msg) {
        const div = document.createElement('div');
        div.className = `message ${msg.type}`;
        div.innerHTML = `<div class="message-content">${msg.content}</div><div class="message-time">${this.formatTime(msg.timestamp)}</div>`;
        this.chatLog.appendChild(div);
    }

    formatTime(ts) {
        const d = new Date(ts);
        return d.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' });
    }

    showTyping() {
        this.typingIndicator.classList.add('active');
        this.scrollToBottom();
    }

    hideTyping() {
        this.typingIndicator.classList.remove('active');
    }

    updateUnreadBadge() {
        this.unreadBadge.style.display = this.unreadCount > 0 ? 'flex' : 'none';
        this.unreadBadge.textContent = this.unreadCount > 99 ? '99+' : this.unreadCount;
    }

    showError(msg) {
        this.errorMessage.textContent = msg;
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

document.addEventListener('DOMContentLoaded', () => {
    window.chatWidget = new ChatWidget({
        apiEndpoint: 'https://agentflowai.app.n8n.cloud/webhook/f5926bb4-7e51-41d1-8d87-3f2d336ac1ed',
        welcomeMessage: 'Hallo! Ich bin Ihr KI-Assistent. Wie kann ich Ihnen helfen?',
        maxMessages: 100,
        rateLimitDelay: 1500
    });
});
