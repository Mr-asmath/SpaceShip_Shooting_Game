(function registerWelcomePage() {
  window.GalaxyPageTemplates = window.GalaxyPageTemplates || {};

  window.GalaxyPageTemplates.welcome = `
    <section id="logoIntroScreen" class="screen logo-intro-screen hidden">
      <video
        id="logoIntroVideo"
        class="logo-intro-video"
        src="./design/images/video/logo.mp4"
        autoplay
        muted
        playsinline
        preload="auto"
      ></video>
    </section>

    <section id="welcomeScreen" class="screen welcome-screen">
      <video
        id="startBackgroundVideo"
        class="welcome-video"
        src="./design/images/video/game_start.mp4"
        autoplay
        muted
        loop
        playsinline
        preload="auto"
      ></video>
      <div class="welcome-overlay">
        <aside class="model-pedestal left">
          <canvas id="welcomeHeroModel" class="model-canvas" aria-label="Hero ship 3D model"></canvas>
        </aside>

        <div class="welcome-center">
          <p class="eyebrow">Galaxy Defender</p>
          <img id="welcomeLogo" class="welcome-logo" src="./design/images/logo.png" alt="Galaxy Defender" />
          <button id="enterHangarButton" class="icon-launch" aria-label="Open mission setup">
            <span class="play-glyph"></span>
            <span class="pause-glyphs"><i></i><i></i></span>
          </button>
        </div>

        <aside class="model-pedestal right">
          <canvas id="welcomeEnemyModel" class="model-canvas enemy-model" aria-label="Enemy ship 3D model"></canvas>
        </aside>
      </div>
    </section>
  `;
})();
