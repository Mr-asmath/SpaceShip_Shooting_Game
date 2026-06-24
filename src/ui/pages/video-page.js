(function registerVideoPage() {
  window.GalaxyPageTemplates = window.GalaxyPageTemplates || {};

  window.GalaxyPageTemplates.video = `
    <section id="transitionOverlay" class="screen hidden transition-screen">
      <video
        id="transitionVideo"
        class="transition-video"
        muted
        playsinline
        preload="auto"
      ></video>
      <div id="transitionLabel" class="transition-label hidden">Round 2</div>
      <div id="transitionActions" class="transition-actions hidden">
        <button id="retryAfterVideoButton">Replay</button>
        <button id="quitAfterVideoButton" class="secondary">Quit</button>
      </div>
    </section>
  `;
})();
