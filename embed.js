(function () {
  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = "https://<AgentFlowAI25>.github.io/<AgentFlowAI-Widget>/widget.css";
  document.head.appendChild(link);

  fetch("https://<AgentFlowAI25>.github.io/<AgentFlowAI-Widget>/index.html")
    .then(res => res.text())
    .then(html => {
      const wrapper = document.createElement("div");
      wrapper.innerHTML = html;
      document.body.appendChild(wrapper);

      const script = document.createElement("script");
      script.src = "https://<AgentFlowAI25>.github.io/<AgentFlowAI-Widget>/widget.js";
      script.defer = true;
      document.body.appendChild(script);
    });
})();
