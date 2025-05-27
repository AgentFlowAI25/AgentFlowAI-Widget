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
        const key = 'chatSessionId';
        let id = sessionStorage.getItem(key);
        if (!id) {
            id = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
            sessionStorage.setItem(key, id);
        }
        return id;
    }

    loadMessages() {
        try {
            const stored = sessionStorage.getItem('chatMessages');
            return stored ? JSON.parse(stored) : [];
        } catch (e) {
            console.warn('Chat message loading failed:', e);
            return [];
        }
    }

    saveMessages() {
        try {
            const recent = this.messages.slice(-this.config.maxMessages);
            sessionStorage.setItem('chatMessages', JSON.stringify(recent));
        } catch (e) {
            console.warn('Chat message saving failed:', e);
        }
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

    async handleInputKeydown(e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            await this.sendMessage();
        }
    }

    adjustInputHeight() {
        const input = this.chatInput;
        input.style.height = 'auto';
        input.style.height = Math.min(input.scrollHeight, 100) + 'px';
    }

    async sendMessage() {
        const msg = this.chatInput.value.trim();
        if (!msg || this.isLoading) return;

        const now = Date.now();
        if (now - this.lastMessageTime < this.config.rateLimitDelay) {
            this.showError('Bitte warten Sie einen Moment.');
            return;
        }

        if (msg.length > 1000) {
            this.showError('Maximal 1000 Zeichen erlaubt.');
            return;
        }

        this.lastMessageTime = now;
        this.clearError();
        this.addMessage('user', msg);
        this.chatInput.value = '';
        this.adjustInputHeight();
        this.showTyping();

        try {
            const res = await this.callAPI(msg);
            this.hideTyping();
            this.addMessage('bot', res?.message || 'Keine Antwort erhalten.');
        } catch (err) {
            console.error('API Fehler:', err);
            this.hideTyping();
            this.addMessage('system', 'Fehler beim Abrufen der Antwort.');
        }
    }

    async callAPI(message) {
        this.isLoading = true;
        this.chatInput.disabled = true;
        this.chatButton.classList.add('loading');

        try {
            const controller = new AbortController();
            const timeout = setTimeout(() => controller.abort(), 10000);

            const res = await fetch(this.config.apiEndpoint, {
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
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            return await res.json();
        } finally {
            this.isLoading = false;
            this.chatInput.disabled = false;
            this.chatButton.classList.remove('loading');
        }
    }

    sanitizeInput(str) {
        return str.replace(/<script.*?>.*?<\/script>/gi, '').replace(/[<>]/g, '').trim();
    }

    addMessage(type, content) {
        const msg = { type, content, timestamp: new Date().toISOString(), id: Date.now() + Math.random() };
        this.messages.push(msg);
        this.renderMessage(msg);
        this.saveMessages();
        this.scrollToBottom();

        if (!this.isOpen && type === 'bot') {
            this.unreadCount++;
            this.updateUnreadBadge();
        }
    }

    renderMessages() {
        this.chatLog.innerHTML = '';
        this.messages.forEach(m => this.renderMessage(m));
        this.scrollToBottom();
    }

    renderMessage(m) {
        const div = document.createElement('div');
        div.className = `message ${m.type}`;
        div.setAttribute('data-id', m.id);

        const content = document.createElement('div');
        content.className = 'message-content';
        content.textContent = m.content;

        const time = document.createElement('div');
        time.className = 'message-time';
        time.textContent = this.formatTime(m.timestamp);

        div.appendChild(content);
        div.appendChild(time);
        this.chatLog.appendChild(div);
    }

    formatTime(ts) {
        return new Date(ts).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' });
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
