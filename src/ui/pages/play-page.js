(function registerPlayPage() {
  window.GalaxyPageTemplates = window.GalaxyPageTemplates || {};

  window.GalaxyPageTemplates.play = `
    <div id="hud" class="hud hidden" aria-live="polite">
      <div class="hud-left-cluster">
        <div class="integrity-panel">
          <div class="integrity-badge">A</div>
          <div class="integrity-copy">
            <span>Integrity</span>
            <div class="health-track sci-fi"><div id="healthFill"></div></div>
          </div>
        </div>
        <div class="lives-panel">
          <span>Lives</span>
          <strong id="hudLives">3</strong>
        </div>
      </div>
      <div class="hud-right-cluster">
        <div class="score-panel">
          <div><span>Round No</span><strong id="hudRound">1</strong></div>
          <div><span>High Score</span><strong id="hudHigh">0</strong></div>
          <div><span>Current Score</span><strong id="hudScore">0</strong></div>
        </div>
      </div>
    </div>

    <div id="hudBottom" class="hud-bottom hidden" aria-live="polite">
      <div class="power-dock-wrap">
        <div id="powerDock" class="power-dock"></div>
        <div class="power-caption">Power: <span id="powerSummary">Active (None)</span></div>
      </div>
    </div>

    <div id="levelNotice" class="notice hidden">Round 1</div>
    <div id="bossWarning" class="boss-warning hidden">Main Enemy Incoming</div>
    <video id="playerShipVideo" class="player-ship-video hidden" muted autoplay loop playsinline preload="auto"></video>

    <div id="mobileControls" class="mobile-controls hidden" aria-label="Mobile controls">
      <div id="dragPad" class="drag-pad hidden"><span>Drag / Tilt</span></div>

      <div id="buttonsModeControls" class="buttons-mode hidden">
        <button id="mobileMoveLeft" class="mobile-action secondary" aria-label="Move left">Left</button>
        <button id="mobileMoveRight" class="mobile-action secondary" aria-label="Move right">Right</button>
        <button id="mobileFireLeft" class="mobile-action fire" aria-label="Shoot left">Fire</button>
        <button id="mobileFireRight" class="mobile-action fire" aria-label="Shoot right">Fire</button>
      </div>

      <div id="tiltModeControls" class="tilt-mode hidden">
        <button id="mobileFireCornerLeft" class="mobile-action fire" aria-label="Shoot left corner">Fire</button>
        <button id="mobileFireCornerRight" class="mobile-action fire" aria-label="Shoot right corner">Fire</button>
      </div>

      <button id="mobilePause" class="mobile-action pause" aria-label="Pause or resume">
        <span class="pause-icon-bars"><i></i><i></i></span>
      </button>
    </div>
  `;
})();
