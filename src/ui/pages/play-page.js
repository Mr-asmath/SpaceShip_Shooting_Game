(function registerPlayPage() {
  window.GalaxyPageTemplates = window.GalaxyPageTemplates || {};

  window.GalaxyPageTemplates.play = `
    <div id="hud" class="hud hidden" aria-live="polite">
      <div class="hud-left-cluster">
        <div class="integrity-panel">
          <div class="integrity-badge">INT</div>
          <div class="integrity-copy">
            <span>Integrity</span>
            <div class="health-track sci-fi"><div id="healthFill"></div></div>
            <div class="lives-inline">
              <span>Lives</span>
              <strong id="hudLives">3</strong>
            </div>
          </div>
        </div>
      </div>
      <div class="hud-right-cluster">
        <div class="score-panel">
          <div><span>Round</span><strong id="hudRound">1</strong></div>
          <div><span>Score</span><strong id="hudScore">0</strong></div>
          <div><span>High Score</span><strong id="hudHigh">0</strong></div>
          <div class="coin-line"><span class="coin-badge">G</span><strong id="hudCoins">0</strong></div>
        </div>
      </div>
    </div>

    <div id="hudBottom" class="hud-bottom hidden" aria-live="polite">
      <button id="mobileFirePrimary" class="shoot-button" aria-label="Shoot">
        <img src="./design/images/buttons/bult_button.png" alt="" draggable="false">
      </button>
      <div class="power-dock-wrap">
        <div id="powerDock" class="power-dock"></div>
        <div class="power-caption"><span id="powerSummary">Power: Active (None)</span></div>
      </div>
    </div>

    <div id="levelNotice" class="notice hidden">Round 1</div>
    <div id="bossWarning" class="boss-warning hidden">Main Enemy Incoming</div>
    <video id="playerShipVideo" class="player-ship-video hidden" muted autoplay loop playsinline preload="auto"></video>

    <div id="mobileControls" class="mobile-controls hidden" aria-label="Mobile controls">
      <div id="dragPad" class="drag-pad hidden" aria-hidden="true"></div>

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

      <button id="movementHandle" class="movement-handle" aria-label="Move spaceship">
        <img src="./design/images/buttons/handle_bar.png" alt="" draggable="false">
      </button>

      <button id="mobilePause" class="mobile-action pause" aria-label="Pause or resume">
        <span class="pause-icon-bars"><i></i><i></i></span>
      </button>
    </div>
  `;
})();
