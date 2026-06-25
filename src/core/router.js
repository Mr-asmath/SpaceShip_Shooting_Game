(function mountGalaxyPages() {
  const templates = window.GalaxyPageTemplates || {};
  const root = document.getElementById("pageRoot");
  if (!root) return;

  const order = ["play", "welcome", "start", "pause", "video"];
  root.innerHTML = order.map((name) => templates[name] || "").join("");

  window.GalaxyRouter = {
    routes: {
      welcome: "#welcome",
      start: "#start",
      play: "#play",
      pause: "#pause",
      gameover: "#gameover",
    },
    set(route, replace = false) {
      const hash = this.routes[route] || route;
      if (!hash || window.location.hash === hash) return;
      if (replace) {
        window.history.replaceState(null, "", hash);
      } else {
        window.history.pushState(null, "", hash);
      }
    },
  };
})();
