/**
 * MENU.JS — Core navigation & view switching
 *
 * This file controls which "page" (view) is visible at any time.
 * Views are identified by data-view attributes on <section> elements.
 *
 * HOW TO ADD A NEW CHAPTER:
 * 1. Add a new <section class="view" data-view="chapter4"> in index.html
 * 2. Create chapters/chapter4.css and chapters/chapter4.js
 * 3. Register the chapter below in the `chapters` object
 * 4. Add a nav link and selection card in index.html
 */

(function () {
  "use strict";

  /** All navigable view names */
  const VIEWS = ["intro", "selection", "chapter1", "chapter2", "chapter3"];

  /** Titles shown during the chapter interstitial */
  const CHAPTER_TITLES = {
    chapter1: { name: "Video" },
    chapter2: { name: "Twitter" },
    chapter3: { name: "Podcast" },
  };

  const CHAPTER_TRANSITION_MS = 2500;

  /** Resolve chapter module at call time (scripts load after menu.js). */
  function getChapterModule(viewName) {
    switch (viewName) {
      case "chapter1": return window.Chapter1;
      case "chapter2": return window.Chapter2;
      case "chapter3": return window.Chapter3;
      default: return null;
    }
  }

  let currentView = "intro";
  let activeChapter = null;

  /** Intro sequence — 1: title · 2: text · 3: selection menu */
  let introPhase = 1;
  let introTransitioning = false;

  /** Chapter interstitial */
  let chapterTransitionActive = false;
  let chapterTransitionTimer = null;
  let pendingChapter = null;

  const nav = document.getElementById("global-nav");
  const introView = document.getElementById("view-intro");
  const introSequence = document.getElementById("intro-sequence");
  const introTitle = introView?.querySelector(".intro__title");
  const introText = introView?.querySelector(".intro__text");
  const chapterInterstitial = document.getElementById("chapter-interstitial");
  const chapterInterstitialName = chapterInterstitial?.querySelector(
    ".chapter-interstitial__name"
  );
  const viewElements = {};

  /** Cache view DOM nodes on load */
  VIEWS.forEach(function (name) {
    viewElements[name] = document.querySelector('[data-view="' + name + '"]');
  });

  function setIntroPhase(phase) {
    introPhase = phase;
    if (introView) introView.dataset.introPhase = String(phase);
  }

  function resetIntroSequence() {
    introTransitioning = false;
    setIntroPhase(1);

    introTitle?.classList.remove("intro__step--exiting", "intro__step--gone");
    introTitle?.classList.add("intro__step--visible");

    introText?.classList.remove(
      "intro__step--visible",
      "intro__step--exiting",
      "intro__step--gone"
    );

    introSequence?.classList.add("intro--clickable");
    introSequence?.classList.remove("intro--complete");

    nav.hidden = true;
    nav.classList.remove("nav--intro-reveal", "is-visible");
  }

  function waitForOpacityTransition(element, callback) {
    function onEnd(event) {
      if (event.target !== element || event.propertyName !== "opacity") return;
      element.removeEventListener("transitionend", onEnd);
      callback();
    }
    element.addEventListener("transitionend", onEnd);
  }

  function advanceIntroSequence() {
    if (introTransitioning || introPhase > 2 || currentView !== "intro") return;

    introTransitioning = true;

    if (introPhase === 1 && introTitle && introText) {
      introTitle.classList.remove("intro__step--visible");
      introTitle.classList.add("intro__step--exiting");

      waitForOpacityTransition(introTitle, function () {
        introTitle.classList.remove("intro__step--exiting");
        introTitle.classList.add("intro__step--gone");

        introText.classList.remove("intro__step--gone");
        requestAnimationFrame(function () {
          introText.classList.add("intro__step--visible");

          waitForOpacityTransition(introText, function () {
            setIntroPhase(2);
            introTransitioning = false;
          });
        });
      });
      return;
    }

    if (introPhase === 2 && introText) {
      introText.classList.remove("intro__step--visible");
      introText.classList.add("intro__step--exiting");

      waitForOpacityTransition(introText, function () {
        introText.classList.remove("intro__step--exiting");
        introText.classList.add("intro__step--gone");

        introSequence?.classList.remove("intro--clickable");
        introSequence?.classList.add("intro--complete");
        setIntroPhase(3);
        introTransitioning = false;
        requestNavigate("selection");
      });
    }
  }

  function isIntroSequenceActive() {
    return currentView === "intro" && introPhase < 3 && !introTransitioning;
  }

  function isChapterView(viewName) {
    return viewName.startsWith("chapter");
  }

  function cancelChapterTransition() {
    clearTimeout(chapterTransitionTimer);
    chapterTransitionTimer = null;
    pendingChapter = null;
    chapterTransitionActive = false;

    if (!chapterInterstitial) return;

    chapterInterstitial.classList.remove("is-visible", "is-exiting");
    chapterInterstitial.hidden = true;
    chapterInterstitial.setAttribute("aria-hidden", "true");
  }

  function finishChapterTransition() {
    const viewName = pendingChapter;
    if (!viewName || !chapterInterstitial) {
      cancelChapterTransition();
      return;
    }

    chapterInterstitial.classList.remove("is-visible");
    chapterInterstitial.classList.add("is-exiting");
    navigateToDirect(viewName);

    waitForOpacityTransition(chapterInterstitial, function () {
      chapterInterstitial.classList.remove("is-exiting");
      chapterInterstitial.hidden = true;
      chapterInterstitial.setAttribute("aria-hidden", "true");
      chapterTransitionActive = false;
      pendingChapter = null;
      chapterTransitionTimer = null;
    });
  }

  function navigateToChapter(viewName) {
    if (
      !isChapterView(viewName) ||
      viewName === currentView ||
      chapterTransitionActive ||
      !CHAPTER_TITLES[viewName] ||
      !chapterInterstitial
    ) {
      return;
    }

    cancelChapterTransition();
    chapterTransitionActive = true;
    pendingChapter = viewName;

    const meta = CHAPTER_TITLES[viewName];
    if (chapterInterstitialName) chapterInterstitialName.textContent = meta.name;

    viewElements[currentView]?.classList.remove("view--active");

    chapterInterstitial.hidden = false;
    chapterInterstitial.setAttribute("aria-hidden", "false");
    chapterInterstitial.classList.remove("is-exiting");

    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        chapterInterstitial.classList.add("is-visible");
      });
    });

    chapterTransitionTimer = setTimeout(finishChapterTransition, CHAPTER_TRANSITION_MS);
  }

  function requestNavigate(viewName) {
    if (isChapterView(viewName)) {
      navigateToChapter(viewName);
      return;
    }
    cancelChapterTransition();
    navigateToDirect(viewName);
  }

  /**
   * Switch to a given view with a smooth CSS transition.
   * @param {string} viewName — one of VIEWS
   */
  function navigateToDirect(viewName) {
    if (!VIEWS.includes(viewName) || viewName === currentView) return;

    /* Tear down previous chapter if leaving one */
    getChapterModule(activeChapter)?.destroy?.();
    activeChapter = null;

    /* Update view visibility */
    viewElements[currentView]?.classList.remove("view--active");
    viewElements[viewName]?.classList.add("view--active");

    /* Toggle global nav (hidden on intro only) */
    if (viewName === "intro") {
      resetIntroSequence();
    } else {
      nav.hidden = false;
      nav.classList.remove("nav--intro-reveal");
      nav.classList.add("is-visible");
      requestAnimationFrame(syncNavHeight);
    }

    updateNavHighlight(viewName);
    currentView = viewName;

    /* Initialize chapter module when entering a chapter view */
    if (viewName.startsWith("chapter")) {
      const chapterModule = getChapterModule(viewName);
      if (chapterModule?.init) {
        activeChapter = viewName;
        chapterModule.init();
      }
    }

    /* Scroll active view back to top */
    viewElements[viewName]?.scrollTo(0, 0);
  }

  /** Highlight the active link in the global nav */
  function updateNavHighlight(viewName) {
    document.querySelectorAll(".nav__link").forEach(function (link) {
      const target = link.getAttribute("data-nav");
      const isActive =
        target === viewName ||
        (viewName.startsWith("chapter") && target === viewName);
      link.classList.toggle("nav__link--active", isActive);
    });
  }

  /**
   * Delegated click handler for all navigation triggers.
   * Elements use data-nav="viewName".
   */

  let TITLE_PAGE = true;

  function handleClick(event) {
    if (TITLE_PAGE) {
      document.getElementById("title-screen").style.display = "none";
      TITLE_PAGE = false;
      return;
    }

    if (isIntroSequenceActive()) {
      if (event.target.closest("#view-intro")) {
        event.preventDefault();
        advanceIntroSequence();
        return;
      }
    }

    if (chapterTransitionActive) {
      event.preventDefault();
      return;
    }

    const navTarget = event.target.closest("[data-nav]");

    if (navTarget) {
      event.preventDefault();

      if (navTarget.classList.contains("card--visual")) {
        navTarget.classList.add("is-pressed");
        setTimeout(function () {
          navTarget.classList.remove("is-pressed");
        }, 280);
      }

      requestNavigate(navTarget.getAttribute("data-nav"));
    }
  }

  function handleIntroKeydown(event) {
    if (!isIntroSequenceActive()) return;
    if (event.key !== "Enter" && event.key !== " ") return;
    if (!event.target.closest("#view-intro")) return;
    event.preventDefault();
    advanceIntroSequence();
  }

  document.addEventListener("click", handleClick);
  document.addEventListener("keydown", handleIntroKeydown);

  /** Keep --nav-height in sync when the nav wraps on small screens */
  function syncNavHeight() {
    if (!nav.hidden) {
      document.documentElement.style.setProperty(
        "--nav-height",
        nav.offsetHeight + "px"
      );
    }
  }

  window.addEventListener("resize", syncNavHeight);

  /* Expose navigation globally so chapter scripts can use it if needed */
  window.AppNavigation = {
    navigateTo: requestNavigate,
    navigateToDirect: navigateToDirect,
    syncNavHeight: syncNavHeight,
  };

  const urlParams = new URLSearchParams(window.location.search);
  const page = urlParams.get("page");
  if (page && page === "right") {
    document.getElementById("title-screen-image").src = "media/wallpaper2.png";
  } 
})();
