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
