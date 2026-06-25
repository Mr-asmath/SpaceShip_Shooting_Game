(function registerPausePage() {
  window.GalaxyPageTemplates = window.GalaxyPageTemplates || {};

  window.GalaxyPageTemplates.pause = `
    <section id="pauseScreen" class="screen hidden">
      <div class="summary-panel pause-panel">
        <div class="summary-left">
          <h2 class="screen-title">Mission Paused</h2>
          <div class="summary-stat blue">
            <span>High Score</span>
            <strong id="pauseHigh">0</strong>
          </div>
          <div class="summary-stat amber">
            <span>Current Score</span>
            <strong id="pauseScore">0</strong>
          </div>
          <div class="summary-actions">
            <button id="resumeButton" class="neon-button cyan">Resume Mission</button>
            <button id="pauseRestartButton" class="neon-button blue">Restart Mission</button>
            <button id="pauseQuitButton" class="neon-button red">Quit Game</button>
          </div>
        </div>
        <div class="summary-right">
          <canvas id="pauseHeroModel" class="summary-model" aria-label="Paused hero ship model"></canvas>
        </div>
      </div>
    </section>

    <section id="gameOverScreen" class="screen hidden">
      <div class="summary-panel gameover-panel">
        <div class="summary-left">
          <h2 class="screen-title">Game Over - Mission Summary</h2>
          <div class="summary-stat blue">
            <span>High Score</span>
            <strong id="finalHigh">0</strong>
          </div>
          <div class="summary-stat amber">
            <span>Current Score</span>
            <strong id="finalScore">0</strong>
          </div>
          <div class="summary-stat blue">
            <span>Completed Rounds</span>
            <strong id="finalRounds">0</strong>
          </div>
          <div class="leaderboard-panel summary-leaderboard">
            <p class="control-heading">Local Leaderboard</p>
            <ol id="finalLeaderboardList" class="leaderboard-list"></ol>
          </div>
          <div class="summary-actions">
            <button id="restartButton" class="neon-button cyan">Restart Mission</button>
            <button id="gameOverMenuButton" class="neon-button red">Quit Game</button>
          </div>
        </div>
        <div class="summary-right">
          <canvas id="gameOverHeroModel" class="summary-model" aria-label="Game over hero ship model"></canvas>
        </div>
      </div>
    </section>
  `;
})();
