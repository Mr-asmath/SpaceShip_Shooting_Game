(function registerStartPage() {
  window.GalaxyPageTemplates = window.GalaxyPageTemplates || {};

  window.GalaxyPageTemplates.start = `
    <section id="hangarScreen" class="screen hidden hangar-screen">
      <div class="hangar-panel">
        <aside class="setup-aside" aria-label="Mission setup controls">
          <img class="mission-title-image" src="./design/images/status/mission_setup.png" alt="Mission Setup" />

          <div class="setup-grid">
            <div class="field difficulty-field">
              <span class="difficulty-heading">Difficulty Levels</span>
              <input id="difficultyValue" type="hidden" value="normal" />
              <div id="difficultyButtons" class="difficulty-buttons" role="group" aria-label="Difficulty">
                <button type="button" class="difficulty-button easy" data-difficulty="easy">
                  <img class="selected-gun" src="./design/images/status/select_gun.png" alt="" aria-hidden="true" />
                  <span>Easy</span>
                </button>
                <button type="button" class="difficulty-button normal is-active" data-difficulty="normal">
                  <img class="selected-gun" src="./design/images/status/select_gun.png" alt="" aria-hidden="true" />
                  <span>Normal</span>
                </button>
                <button type="button" class="difficulty-button hard" data-difficulty="hard">
                  <img class="selected-gun" src="./design/images/status/select_gun.png" alt="" aria-hidden="true" />
                  <span>Hard</span>
                </button>
              </div>
            </div>

            <div class="field sound-field">
              <button id="soundToggle" type="button" class="sound-image-button is-on" aria-label="Sound on">
                <img class="sound-on-image" src="./design/images/buttons/sound_on.png" alt="Sound on" />
                <img class="sound-off-image" src="./design/images/buttons/sound_off.png" alt="Sound off" />
              </button>
            </div>
          </div>

          <div class="control-mode-panel">
            <p class="control-heading">Choose Mobile Control Mode Before Start</p>
            <div class="control-mode-grid">
              <label class="mode-card">
                <input type="radio" name="mobileControlMode" value="buttons" checked />
                <img class="mode-status-image" src="./design/images/buttons/control_mode_button_status.png" alt="Buttons control mode" />
                <span class="mode-dot" aria-hidden="true"></span>
              </label>
              <label class="mode-card">
                <input type="radio" name="mobileControlMode" value="tilt" />
                <img class="mode-status-image" src="./design/images/buttons/control_mode_tilt_status.png" alt="Tilt control mode" />
                <span class="mode-dot" aria-hidden="true"></span>
              </label>
            </div>
          </div>
        </aside>

        <aside class="ship-aside" aria-label="Hero ship launch preview">
          <div class="hangar-name">
            <img class="name-pencil" src="./design/images/status/pencil_logo.png" alt="" aria-hidden="true" />
            <input id="playerName" maxlength="18" autocomplete="nickname" placeholder="Pilot" />
          </div>

          <div id="hangarStage" class="hangar-stage">
            <canvas id="hangarHeroModel" class="hangar-model-canvas" aria-label="Interactive hero ship 3D model"></canvas>
            <p class="hangar-stage-note">Drag to rotate the hero ship in 3D.</p>
            <button id="showRulesButton" class="stage-start-button neon-start-button" type="button" aria-label="Start mission">
              <span class="play-glyph"></span>
            </button>
          </div>
        </aside>

        <div class="leaderboard-panel">
          <p class="control-heading">Local Leaderboard</p>
          <ol id="leaderboardList" class="leaderboard-list"></ol>
        </div>

        <div class="hangar-actions">
          <button id="backToWelcomeButton" class="secondary">Back</button>
        </div>
      </div>
    </section>

    <section id="rulesModal" class="screen hidden modal-screen">
      <div class="panel rules-panel">
        <h2>Playing Rules</h2>
        <ul class="copy-list">
          <li>Move with Arrow keys or WASD on desktop.</li>
          <li>Shoot with Space or the on-screen Fire buttons.</li>
          <li>Pause with P and restart with R.</li>
          <li>Destroy sub enemies, then defeat the main enemy to clear the round.</li>
          <li>Each new round changes the battle background and enemy pressure.</li>
        </ul>
        <div class="hangar-actions">
          <button id="confirmRulesButton">OK, Start</button>
          <button id="cancelRulesButton" class="secondary">Cancel</button>
        </div>
      </div>
    </section>
  `;
})();
