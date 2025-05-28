(function () {
  const cssUrl = "https://deine-netlify-domain.netlify.app/widget.css";
  const jsUrl = "https://deine-netlify-domain.netlify.app/widget.js";
  const containerId = "agentflowai-chat-widget";

  // Verhindern, dass das Widget doppelt geladen wird
  if (document.getElementById(containerId)) return;

  // Widget-Container erstellen
  const container = document.createElement("div");
  container.id = containerId;
  document.body.appendChild(container);

  // CSS laden
  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = cssUrl;
  document.head.appendChild(link);

  // JS laden
  const script = document.createElement("script");
  script.src = jsUrl;
  script.defer = true;
  document.body.appendChild(script);
})();
