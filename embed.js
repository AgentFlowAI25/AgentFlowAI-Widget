// embed.js
const scriptCss = document.createElement('link');
scriptCss.rel = 'stylesheet';
scriptCss.href = 'https://agentflowai25.github.io/AgentFlowAI-Widget/widget.css';
document.head.appendChild(scriptCss);

const scriptHtml = document.createElement('div');
scriptHtml.innerHTML = '<div class="chat-widget-container"><div id="chatButton"></div><div id="chatWidget"></div></div>';
document.body.appendChild(scriptHtml);

const scriptJs = document.createElement('script');
scriptJs.src = 'https://agentflowai25.github.io/AgentFlowAI-Widget/widget.js';
document.body.appendChild(scriptJs);
