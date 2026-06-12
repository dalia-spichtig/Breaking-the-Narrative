/**
 * CHAPTER 1 — Logic
 *
 * init()    — called each time the user enters this chapter
 * destroy() — called when leaving this chapter (cleanup listeners, etc.)
 *
 * To add content dynamically, target #chapter1-content in index.html.
 */

/**
 * ================================================================
 * MULTI-STAGE REVEAL SYSTEM
 * Experimental stacked layers with circular "reality scanner".
 *
 * HOW TO ADD A NEW STAGE:
 * 1. Add an <article class="stage" data-stage-id="N"> in index.html
 * 2. Add an entry to STAGE_REGISTRY below (order = bottom → top)
 * 3. Add styles for .stage__inner--N in style.css
 * ================================================================
 */


/* ================================================================
   CONFIGURATION
   Single place to tweak reveal behaviour.
   ================================================================ */
   const CONFIG = {
    /** Circle diameter as a fraction of min(viewport width, height) */
    revealDiameter: 0.40,
  
    /** Grow animation duration (ms) — mirrored in CSS --reveal-grow-duration */
    revealGrowDuration: 480,
  
    /** Root element that receives CSS variables */
    rootElement: document.documentElement,
  };
  
  
  /* ================================================================
     STAGE REGISTRY
     Define stage order here: first = bottom, last = top.
     The top stage gets the reveal mask when scanner is active.
     ================================================================ */
  const STAGE_REGISTRY = [
    { id: 3, selector: '#stage-3', label: 'Stage 3' },
    { id: 1, selector: '#stage-1', label: 'Stage 1' },
  ];
  
  
  /* ================================================================
     STAGE MANAGER
     Central hub: registration, z-index, visibility, reveal masks.
     ================================================================ */
  class StageManager {
    constructor(registry) {
      /** @type {Array<{ id: number, label: string, element: HTMLElement, stackIndex: number }>} */
      this.stages = [];
  
      /** @type {number | null} Solo debug: only this stage id is visible */
      this.debugSoloStageId = null;
  
      this._registerFromRegistry(registry);
      this._applyStackOrder();
    }
  
    /**
     * Read HTML elements from registry and store stage objects.
     */
    _registerFromRegistry(registry) {
      registry.forEach((entry, stackIndex) => {
        const element = document.querySelector(entry.selector);
  
        if (!element) {
          console.warn(`[StageManager] Stage not found: ${entry.selector}`);
          return;
        }
  
        this.stages.push({
          id: entry.id,
          label: entry.label,
          element,
          stackIndex,
        });
      });
  
      // Sort so stackIndex 0 = bottom layer
      this.stages.sort((a, b) => a.stackIndex - b.stackIndex);
    }
  
    /**
     * Assign z-index: bottom stage = base, each above +1.
     */
    _applyStackOrder() {
      const base = 10;
  
      this.stages.forEach((stage, index) => {
        stage.element.style.zIndex = String(base + index);
      });
    }
  
    /** Total number of registered stages */
    get count() {
      return this.stages.length;
    }
  
    /** The topmost stage (receives reveal mask) */
    get topStage() {
      if (this.stages.length === 0) return null;
      return this.stages[this.stages.length - 1];
    }
  
    /** All stages except the bottom one can be masked */
    get maskableStages() {
      if (this.stages.length <= 1) return [];
      return this.stages.slice(1);
    }
  
    /** Enable/disable reveal mask on maskable stages (Stage 1 → reveals Stage 3). */
    setRevealMaskActive(isActive) {
      this.maskableStages.forEach((stage) => {
        stage.element.classList.add('stage--reveal-mask');
        stage.element.classList.toggle('stage--reveal-inactive', !isActive);
      });
    }
  
    /**
     * Debug: show only one stage fullscreen.
     * @param {number | null} stageId — null clears debug mode
     */
    setDebugSolo(stageId) {
      this.debugSoloStageId = stageId;
  
      const debugZIndex = 200;
  
      this.stages.forEach((stage) => {
        const isSolo = stageId !== null && stage.id === stageId;
        const isHidden = stageId !== null && stage.id !== stageId;
  
        stage.element.classList.toggle('stage--debug-solo', isSolo);
        stage.element.classList.toggle('stage--debug-hidden', isHidden);
  
        /* Solo stage must sit above all others (Stage 1 is normally on top) */
        if (isSolo) {
          stage.element.style.zIndex = String(debugZIndex);
        } else {
          stage.element.style.zIndex = '';
        }
      });
  
      if (stageId !== null) {
        this.setRevealMaskActive(false);
        CONFIG.rootElement.style.setProperty('--reveal-active', '0');
        CONFIG.rootElement.classList.remove('reveal-portal--grown');
        document.getElementById('reveal-glow')?.classList.remove('reveal-glow--active');
      } else {
        this._applyStackOrder();
      }
    }
  
    /** True when user is editing a single stage in isolation */
    get isDebugSoloActive() {
      return this.debugSoloStageId !== null;
    }
  
    /**
     * Find stage by numeric id (matches data-stage-id).
     */
    getStageById(stageId) {
      return this.stages.find((s) => s.id === stageId) ?? null;
    }
  }
  
  
  /* ================================================================
     REVEAL SYSTEM
     Click toggles portal on/off; active portal follows the cursor.
     ================================================================ */
  class RevealSystem {
    constructor(stageManager) {
      this.stageManager = stageManager;
      this.isActive = false;
      this._isClosing = false;
  
      this.glowElement = document.getElementById('reveal-glow');
      this.root = CONFIG.rootElement;
  
      this.root.style.setProperty('--reveal-grow-duration', `${CONFIG.revealGrowDuration}ms`);
      this._bindPointer();
      this._bindResize();
    }
  
    /** Min viewport side × diameter ratio → circle radius in px */
    getRevealRadiusPx() {
      const minSide = Math.min(window.innerWidth, window.innerHeight);
      return (minSide * CONFIG.revealDiameter) / 2;
    }
  
    _setPosition(clientX, clientY) {
      this.root.style.setProperty('--reveal-x', `${clientX}px`);
      this.root.style.setProperty('--reveal-y', `${clientY}px`);
    }
  
    _bindResize() {
      window.addEventListener('resize', () => {
        if (!this.isActive || this._isClosing) return;
        this.root.style.setProperty('--reveal-radius', `${this.getRevealRadiusPx()}px`);
      });
    }
  
    _bindPointer() {
      window.addEventListener('pointermove', (event) => {
        if (!this.isActive || this._isClosing) return;
        this._setPosition(event.clientX, event.clientY);
      });
  
      window.addEventListener('pointerdown', (event) => {
        if (event.button !== 0) return;
        if (this.stageManager.isDebugSoloActive) return;
        if (this._isClosing) return;

        if (this.isActive) {
          this._deactivateWithShrink();
        } else {
          this._activateWithGrow(event.clientX, event.clientY);
        }
      });
    }
  
    /** Click on: appear at cursor, grow to full diameter */
    _activateWithGrow(clientX, clientY) {
      const targetRadius = this.getRevealRadiusPx();
  
      this._setPosition(clientX, clientY);
      this.root.style.setProperty('--reveal-radius', '0px');
      this.root.classList.remove('reveal-portal--grown');
      this.setActive(true);
  
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          this.root.classList.add('reveal-portal--grown');
          this.root.style.setProperty('--reveal-radius', `${targetRadius}px`);
        });
      });
    }
  
    /** Click off: shrink to 0, then hide */
    _deactivateWithShrink() {
      this._isClosing = true;
      this.root.classList.remove('reveal-portal--grown');
      this.root.style.setProperty('--reveal-radius', '0px');
  
      window.setTimeout(() => {
        if (!this._isClosing) return;
        this.deactivateImmediate();
      }, CONFIG.revealGrowDuration);
    }
  
    /** Instant off (debug / cleanup) */
    deactivateImmediate() {
      this._isClosing = false;
      this.root.style.setProperty('--reveal-radius', '0px');
      this.setActive(false);
    }
  
    setActive(active) {
      this.isActive = active;
  
      this.stageManager.setRevealMaskActive(active);
  
      if (this.glowElement) {
        this.glowElement.classList.toggle('reveal-glow--active', active);
      }
  
      this.root.style.setProperty('--reveal-active', active ? '1' : '0');
  
      if (!active) {
        this.root.classList.remove('reveal-portal--grown');
      }
    }
  }
  
  
  
  
  /* ================================================================
     DEBUG SYSTEM
     Keys 1–9 → solo stage for editing (no Shift required).
     Uses event.code (Digit1, Digit2…) so AZERTY/QWERTY layouts work.
     ================================================================ */
  class DebugSystem {
    constructor(stageManager, revealSystem) {
      this.stageManager = stageManager;
      this.revealSystem = revealSystem;
      this.statusElement = document.getElementById('debug-hud-status');
  
      this._bindKeyboard();
      this._updateStatusLabel();
    }
  
    /**
     * Map physical number keys to stage ids.
     * @returns {number | null}
     */
    _getStageIdFromKey(event) {
      const codeMap = {
        Digit1: 1,
        Digit2: 2,
        Digit3: 3,
        Digit4: 4,
        Digit5: 5,
        Digit6: 6,
        Digit7: 7,
        Digit8: 8,
        Digit9: 9,
      };
  
      if (codeMap[event.code] !== undefined) {
        return codeMap[event.code];
      }
  
      /* Fallback if event.code is unavailable */
      if (event.key >= '1' && event.key <= '9' && event.key.length === 1) {
        return Number(event.key);
      }
  
      return null;
    }
  
    _bindKeyboard() {
      window.addEventListener('keydown', (event) => {
        if (event.repeat) return;
        if (event.metaKey || event.ctrlKey || event.altKey) return;
  
        const stageId = this._getStageIdFromKey(event);
        if (stageId === null) return;
        if (!this.stageManager.getStageById(stageId)) return;
  
        event.preventDefault();
  
        /* Press same key again → back to normal layered mode */
        if (this.stageManager.debugSoloStageId === stageId) {
          this.clearSolo();
        } else {
          this.setSoloStage(stageId);
        }
      });
  
      /* Escape leaves debug solo mode */
      window.addEventListener('keydown', (event) => {
        if (event.code !== 'Escape') return;
  
        this.clearSolo();
      });
    }
  
    setSoloStage(stageId) {
      this.revealSystem?.deactivateImmediate();
      this.stageManager.setDebugSolo(stageId);
      this._updateStatusLabel();
    }
  
    clearSolo() {
      this.stageManager.setDebugSolo(null);
      this._updateStatusLabel();
    }
  
    _updateStatusLabel() {
      if (!this.statusElement) return;
  
      const soloId = this.stageManager.debugSoloStageId;
  
      if (soloId === null) {
        this.statusElement.textContent = 'Mode : normal';
        return;
      }
  
      const stage = this.stageManager.getStageById(soloId);
      const name = stage ? stage.label : `Stage ${soloId}`;
      this.statusElement.textContent = `Mode : ${name} seul (Échap pour quitter)`;
    }
  }
  
  
  /* ================================================================
     APPLICATION LOOP
     requestAnimationFrame drives smooth updates every frame.
     ================================================================ */
  class App {
    constructor() {
      this.stageManager = new StageManager(STAGE_REGISTRY);
      this.revealSystem = new RevealSystem(this.stageManager);
      this.debugSystem = new DebugSystem(this.stageManager, this.revealSystem);
    }
  }
  
  
  /* ================================================================
     VIDEO SYNC SYSTEM
     Stage 1 = master (video + audio from videoStage1.mov only).
     Stage 3 = slave (permanently muted, locked to master timing).
     ================================================================ */
  class VideoSyncSystem {
    constructor(masterSelector, ...slaveSelectors) {
      this.master = document.querySelector(masterSelector);
      this.slaves = slaveSelectors
        .map((selector) => document.querySelector(selector))
        .filter(Boolean);
  
      /** Max drift (seconds) before slave is corrected — ~1 frame at 30fps */
      this.driftThreshold = 0.034;
  
      this._isCorrecting = false;
      this._audioUnlocked = false;
      this._isMuted = true;
  
      if (!this.master || this.slaves.length === 0) {
        console.warn('[VideoSyncSystem] Master or slave video not found.');
        return;
      }
  
      this._configureElements();
      this._bindMasterEvents();
      this._bindSlaveGuards();
      this._bindVisibilitySync();
      this._startSyncLoop();
      this._waitAndStart();
      this._bindAudioUnlock();
      this._bindMuteToggle();
      this._applyMasterAudio();
    }
  
    /**
     * Master carries audio; slaves are permanently silent.
     */
    _configureElements() {
      this.master.loop = true;
  
      /* Start muted so autoplay is allowed; audio enabled on first user gesture */
      this.master.muted = true;
      this.master.volume = 1;
  
      this.slaves.forEach((slave) => {
        slave.loop = true;
      });
  
      this._forceSlavesSilent();
    }
  
    _forceSlavesSilent() {
      this.slaves.forEach((slave) => {
        slave.muted = true;
        slave.volume = 0;
        slave.setAttribute('muted', '');
      });
    }
  
    /** Master audio: on only after unlock and when user has not muted (M) */
    _applyMasterAudio() {
      if (!this.master) return;
  
      this.master.muted = !this._audioUnlocked || this._isMuted;
      this.master.volume = 1;
      document.body.classList.toggle('master-audio-muted', this._isMuted || !this._audioUnlocked);
    }
  
    _toggleMute() {
      if (!this._audioUnlocked) {
        this._audioUnlocked = true;
        this._isMuted = false;
      } else {
        this._isMuted = !this._isMuted;
      }
  
      this._applyMasterAudio();
      this._forceSlavesSilent();
      this._playAll();
    }
  
    _alignSlavesToMaster() {
      this.slaves.forEach((slave) => {
        slave.currentTime = this.master.currentTime;
        slave.playbackRate = this.master.playbackRate;
      });
    }
  
    /**
     * Wait until all videos can play, align time, then start together.
     */
    _waitAndStart() {
      Promise.all([
        this._whenCanPlay(this.master),
        ...this.slaves.map((slave) => this._whenCanPlay(slave)),
      ]).then(() => {
        this._alignSlavesToMaster();
        this._playAll();
      });
    }
  
    _whenCanPlay(video) {
      return new Promise((resolve) => {
        if (video.readyState >= HTMLMediaElement.HAVE_FUTURE_DATA) {
          resolve();
          return;
        }
        video.addEventListener('canplay', resolve, { once: true });
      });
    }
  
    /**
     * Start / resume all videos at the same instant.
     */
    _playAll() {
      this._alignSlavesToMaster();
  
      const plays = [this.master.play(), ...this.slaves.map((slave) => slave.play())];
  
      Promise.all(plays).catch(() => {
        /* Autoplay blocked — retry after user interacts */
      });
    }
  
    /**
     * Pause all videos together.
     */
    _pauseAll() {
      this.master.pause();
      this.slaves.forEach((slave) => {
        slave.pause();
        slave.currentTime = this.master.currentTime;
      });
    }
  
    /**
     * Mirror master play state to slaves immediately.
     */
    _mirrorPlaybackState() {
      if (this._isCorrecting) return;
  
      this.slaves.forEach((slave) => {
        slave.playbackRate = this.master.playbackRate;
  
        if (this.master.paused) {
          if (!slave.paused) {
            slave.pause();
          }
          slave.currentTime = this.master.currentTime;
          return;
        }
  
        const drift = Math.abs(slave.currentTime - this.master.currentTime);
        if (drift > this.driftThreshold) {
          this._isCorrecting = true;
          slave.currentTime = this.master.currentTime;
          this._isCorrecting = false;
        }
  
        if (slave.paused) {
          slave.play().catch(() => {});
        }
      });
    }
  
    /**
     * Per-frame drift correction for frame-accurate sync.
     */
    _startSyncLoop() {
      const tick = () => {
        if (this.master && !this.master.paused) {
          this.slaves.forEach((slave) => {
            const drift = Math.abs(slave.currentTime - this.master.currentTime);
  
            if (drift > this.driftThreshold) {
              this._isCorrecting = true;
              slave.currentTime = this.master.currentTime;
              this._isCorrecting = false;
            }
          });
        }
  
        requestAnimationFrame(tick);
      };
  
      requestAnimationFrame(tick);
    }
  
    _bindMasterEvents() {
      const master = this.master;
  
      master.addEventListener('play', () => this._mirrorPlaybackState());
      master.addEventListener('pause', () => this._pauseAll());
      master.addEventListener('seeking', () => {
        this.slaves.forEach((slave) => {
          slave.currentTime = master.currentTime;
        });
      });
      master.addEventListener('seeked', () => {
        this.slaves.forEach((slave) => {
          slave.currentTime = master.currentTime;
        });
      });
      master.addEventListener('ratechange', () => {
        this.slaves.forEach((slave) => {
          slave.playbackRate = master.playbackRate;
        });
      });
      master.addEventListener('ended', () => {
        /* loop=true; re-align at loop boundary */
        this.slaves.forEach((slave) => {
          slave.currentTime = master.currentTime;
        });
      });
      master.addEventListener('timeupdate', () => {
        if (!master.paused) {
          this._mirrorPlaybackState();
        }
      });
    }
  
    /**
     * Ensure slaves never output audio (even if attributes are changed).
     */
    _bindSlaveGuards() {
      this.slaves.forEach((slave) => {
        const enforce = () => this._forceSlavesSilent();
  
        slave.addEventListener('volumechange', enforce);
        slave.addEventListener('play', enforce);
      });
    }
  
    /**
     * Re-align videos when the tab becomes visible again.
     */
    _bindVisibilitySync() {
      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState !== 'visible') return;
  
        this._alignSlavesToMaster();
        this._forceSlavesSilent();
  
        if (!this.master.paused) {
          this._playAll();
        } else {
          this.slaves.forEach((slave) => slave.pause());
        }
      });
    }
  
    /**
     * Enable audio from videoStage1.mov (master only) after user gesture.
     */
    _bindAudioUnlock() {
      const unlockAudio = () => {
        if (this._audioUnlocked) return;
  
        this._audioUnlocked = true;
        this._isMuted = false;
        this._applyMasterAudio();
        this._forceSlavesSilent();
        this._playAll();
      };
  
      document.addEventListener('pointerdown', unlockAudio, { once: true });
    }
  
    /** M — toggle master video sound on/off */
    _bindMuteToggle() {
      window.addEventListener('keydown', (event) => {
        if (event.code !== 'KeyM' || event.repeat) return;
        if (event.metaKey || event.ctrlKey || event.altKey) return;
  
        event.preventDefault();
        this._toggleMute();
      });
    }
  }
  
  
  /* ================================================================
     CHAPTER LIFECYCLE — wired to menu.js view switching
     ================================================================ */
  let appInstance = null;
  let videoSyncInstance = null;

  function init() {
    if (appInstance) return;

    videoSyncInstance = new VideoSyncSystem('#video-stage-1', '#video-stage-3');
    appInstance = new App();
  }

  function destroy() {
    document.querySelector('#video-stage-1')?.pause();
    document.querySelector('#video-stage-3')?.pause();

    appInstance?.revealSystem?.deactivateImmediate();
    appInstance?.stageManager?.setDebugSolo(null);

    appInstance = null;
    videoSyncInstance = null;
  }

  window.Chapter1 = { init: init, destroy: destroy };
