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

  const nav = document.getElementById("global-nav");
  const viewElements = {};

  /** Cache view DOM nodes on load */
  VIEWS.forEach(function (name) {
    viewElements[name] = document.querySelector('[data-view="' + name + '"]');
  });

  /**
   * Switch to a given view with a smooth CSS transition.
   * @param {string} viewName — one of VIEWS
   */
  function navigateTo(viewName) {
    if (!VIEWS.includes(viewName) || viewName === currentView) return;

    /* Tear down previous chapter if leaving one */
    getChapterModule(activeChapter)?.destroy?.();
    activeChapter = null;

    /* Update view visibility */
    viewElements[currentView]?.classList.remove("view--active");
    viewElements[viewName]?.classList.add("view--active");

    /* Toggle global nav (hidden on intro only) */
    if (viewName === "intro") {
      nav.hidden = true;
    } else {
      nav.hidden = false;
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
   * Elements use data-nav="viewName" or data-action="enter".
   */

  let TITLE_PAGE = true;

  function handleClick(event) {

    if (TITLE_PAGE) {
      document.getElementById("title-screen").style.display = "none";
      TITLE_PAGE = false;
      return;
    }

    const navTarget = event.target.closest("[data-nav]");
    const action = event.target.closest("[data-action]");

    if (navTarget) {
      event.preventDefault();
      navigateTo(navTarget.getAttribute("data-nav"));
      return;
    }

    if (action?.getAttribute("data-action") === "enter") {
      navigateTo("selection");
    }
  }

  document.addEventListener("click", handleClick);

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

  /* Expose navigateTo globally so chapter scripts can use it if needed */
  window.AppNavigation = { navigateTo: navigateTo, syncNavHeight: syncNavHeight };

  const urlParams = new URLSearchParams(window.location.search);
  const page = urlParams.get("page");
  if (page && page === "right") {
    document.getElementById("title-screen-image").src = "media/wallpaper2.png";
  } 
})();
