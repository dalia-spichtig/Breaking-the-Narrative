/**
 * CHAPTER 2 — Logic
 *
 * init()    — called each time the user enters this chapter
 * destroy() — called when leaving this chapter (cleanup listeners, etc.)
 *
 * To add content dynamically, target #chapter2-content in index.html.
 */

/* ═══════════════════════════════════════════════════════════
   DONNÉES — modifier ici pour changer les posts du fil
   ═══════════════════════════════════════════════════════════ */

// Exactement 5 posts — chacun avec texte de surface + vérité cachée
const POSTS = [
  {
    lines: [
      "Franchement je comprends pas le hype.",
      "C'est vrmt de la merde.",
    ],
    hidden:
      "J'ai passé six heures dessus et j'ai pleuré. Je fais semblant de détester pour ne pas passer pour une groupie.",
  },
  {
    lines: [
      "Pourquoi tout le monde en parle ?",
      "C'est juste du bruit médiatique.",
    ],
    hidden:
      "Je l'ai reposté trois fois cette semaine. Mes potes pensent que je m'en fous complètement.",
  },
  {
    lines: [
      "Mouais… rien de spécial.",
      "On dirait du déjà-vu.",
    ],
    hidden:
      "Ça me rappelle mon enfance mot pour mot. Je n'ose pas le dire publiquement.",
  },
  {
    lines: [
      "C'est surestimé à mort.",
      "Je vois pas l'intérêt.",
    ],
    hidden:
      "J'ai acheté les billets. Deux fois. Ne le répétez à personne.",
  },
  {
    lines: [
      "Encore un truc surfait.",
      "Bof, passez votre chemin.",
    ],
    hidden:
      "C'est le seul truc qui m'a fait sentir vivant cette année. Point.",
  },
];

// Faux profils (nom, pseudo, couleur avatar, initiale)
const USERS = [
  { name: "Lucas M.", handle: "lucas_m", color: "#1d9bf0", initial: "L" },
  { name: "Camille R.", handle: "camille_r", color: "#7856ff", initial: "C" },
  { name: "Théo B.", handle: "theo_b", color: "#f91880", initial: "T" },
  { name: "Inès D.", handle: "ines_d", color: "#00ba7c", initial: "I" },
  { name: "Noah P.", handle: "noah_p", color: "#ff7a00", initial: "N" },
  { name: "Léa S.", handle: "lea_s", color: "#794bc4", initial: "L" },
  { name: "Hugo V.", handle: "hugo_v", color: "#e0245e", initial: "H" },
  { name: "Chloé A.", handle: "chloe_a", color: "#17bf63", initial: "C" },
];

// Petites icônes SVG (reply, repost, like)
const ICONS = {
  reply: '<svg viewBox="0 0 24 24"><path d="M1.751 10c0-4.42 3.584-8 8.005-8h4.366c4.49 0 8.129 3.64 8.129 8.13 0 2.96-1.607 5.68-4.196 7.11l-8.054 4.46v-3.69h-.067c-4.49.1-8.183-3.51-8.183-8.01z"/></svg>',
  repost: '<svg viewBox="0 0 24 24"><path d="M4.5 3.88l4.432 4.14-1.364 1.46L5.5 7.55V16c0 1.1.896 2 2 2H13v2H7.5c-2.209 0-4-1.79-4-4V7.55L1.432 9.48.068 8.02 4.5 3.88zM16.5 6H11V4h5.5c2.209 0 4 1.79 4 4v8.45l2.068-1.93 1.364 1.46-4.432 4.14-4.432-4.14 1.364-1.46 2.068 1.93V8c0-1.1-.896-2-2-2z"/></svg>',
  like: '<svg viewBox="0 0 24 24"><path d="M16.697 5.5c-1.222-.06-2.679.51-3.89 2.16l-.805 1.09-.806-1.09C9.984 6.01 8.526 5.44 7.304 5.5c-1.243.07-2.349.78-2.91 1.91-.552 1.12-.633 2.78.479 4.82 1.074 1.97 3.257 4.27 7.129 6.61 3.87-2.34 6.052-4.64 7.126-6.61 1.111-2.04 1.03-3.7.477-4.82-.561-1.13-1.666-1.84-2.908-1.91z"/></svg>',
};

/* ═══════════════════════════════════════════════════════════
   OUTILS — nombres aléatoires pour likes, heures, etc.
   ═══════════════════════════════════════════════════════════ */

const random = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

function formatTime() {
  const hours = random(1, 23);
  return `${hours}h`;
}

function formatCount() {
  const n = random(2, 999);
  return n > 99 ? `${(n / 10).toFixed(1).replace(".", ",")} k` : String(n);
}

/* ═══════════════════════════════════════════════════════════
   LIRE ENTRE LES LIGNES — logique du texte caché
   Style lié : style.css → section « LIRE ENTRE LES LIGNES »
   ═══════════════════════════════════════════════════════════ */

// Où placer le texte caché entre les lignes du milieu
// Nombre pair → après la ligne (milieu - 1)
// Nombre impair → après la ligne du milieu
function getHiddenInsertIndex(lineCount) {
  if (lineCount % 2 === 0) {
    return lineCount / 2 - 1;
  }
  return Math.floor(lineCount / 2);
}

// Génère le HTML : lignes visibles + zone .post__gap avec texte caché
function buildBetweenLinesHTML(lines, hiddenText) {
  const insertAfter = getHiddenInsertIndex(lines.length);
  const html = [];

  lines.forEach((line, index) => {
    html.push(`<span class="post__line">${line}</span>`);
    if (index === insertAfter) {
      html.push(`<span class="post__gap"><span class="post__hidden">${hiddenText}</span></span>`);
    }
  });

  // <p> = un seul paragraphe visuel (interligne naturel entre les lignes)
  return `<p class="post__between-lines">${html.join("")}</p>`;
}

function getPostContent(postData) {
  return buildBetweenLinesHTML(postData.lines, postData.hidden);
}

/* ═══════════════════════════════════════════════════════════
   MAINTENIR POUR RÉVÉLER — press-and-hold (~0,95 s)
   Clic quand ouvert → referme l’animation
   Style lié : style.css → --reveal-progress
   ═══════════════════════════════════════════════════════════ */

const REVEAL_DURATION = 950;   // ms pour révéler entièrement
const COLLAPSE_DURATION = 650; // ms pour revenir à l’état caché

function easeOutQuart(t) {
  return 1 - (1 - t) ** 4;
}

function easeInOutQuart(t) {
  return t < 0.5 ? 8 * t ** 4 : 1 - (-2 * t + 2) ** 4 / 2;
}

// Attache l’interaction maintien → révélation progressive
function setupHoldReveal(article) {
  const body = article.querySelector(".post__body");
  if (!body) return;

  let progress = 0;
  let isComplete = false;
  let pressing = false;
  let suppressClick = false;
  let rafId = null;
  let animStart = 0;
  let animFrom = 0;
  let animTo = 0;
  let animDuration = 0;

  function applyProgress(value) {
    progress = Math.max(0, Math.min(1, value));
    article.style.setProperty("--reveal-progress", progress.toFixed(4));
  }

  function stopAnimation() {
    if (rafId !== null) {
      cancelAnimationFrame(rafId);
      rafId = null;
    }
  }

  function runAnimation(from, to, duration, onComplete) {
    stopAnimation();
    animFrom = from;
    animTo = to;
    animDuration = duration;
    animStart = performance.now();

    const ease = to > from ? easeOutQuart : easeInOutQuart;

    function step(now) {
      const elapsed = now - animStart;
      const t = animDuration > 0 ? Math.min(1, elapsed / animDuration) : 1;
      applyProgress(animFrom + (animTo - animFrom) * ease(t));

      if (t < 1) {
        rafId = requestAnimationFrame(step);
        return;
      }

      rafId = null;
      onComplete?.();
    }

    rafId = requestAnimationFrame(step);
  }

  function markComplete() {
    isComplete = true;
    applyProgress(1);
    article.classList.add("is-complete");
    article.classList.remove("is-pressing");

    // Évite que le clic de fin de maintien referme aussitôt le post
    suppressClick = true;
    setTimeout(() => {
      suppressClick = false;
    }, 350);
  }

  function startReveal() {
    if (isComplete) return;
    runAnimation(progress, 1, REVEAL_DURATION * (1 - progress), () => {
      if (progress >= 1) markComplete();
    });
  }

  function startCollapse() {
    if (isComplete) return;
    stopAnimation();
    runAnimation(progress, 0, COLLAPSE_DURATION * Math.max(progress, 0.01));
  }

  // Referme le post avec la même animation (inversée)
  function closeReveal() {
    if (!isComplete) return;
    isComplete = false;
    article.classList.remove("is-complete");
    stopAnimation();
    runAnimation(progress, 0, COLLAPSE_DURATION, () => {
      applyProgress(0);
    });
  }

  body.addEventListener("pointerdown", (event) => {
    if (event.target.closest(".post__actions")) return;
    if (isComplete) return;

    pressing = true;
    article.classList.add("is-pressing");
    body.setPointerCapture(event.pointerId);
    startReveal();
  });

  body.addEventListener("pointerup", (event) => {
    if (isComplete) return;

    pressing = false;
    article.classList.remove("is-pressing");

    if (body.hasPointerCapture(event.pointerId)) {
      body.releasePointerCapture(event.pointerId);
    }

    if (progress >= 1) {
      markComplete();
    } else {
      startCollapse();
    }
  });

  body.addEventListener("pointercancel", () => {
    pressing = false;
    article.classList.remove("is-pressing");
    if (!isComplete && progress < 1) startCollapse();
  });

  // Clic sur un post déjà ouvert → referme
  body.addEventListener("click", (event) => {
    if (event.target.closest(".post__actions")) return;
    if (suppressClick || !isComplete) return;
    closeReveal();
  });

  applyProgress(0);
}

/* ═══════════════════════════════════════════════════════════
   CRÉATION D’UN POST — injecté dans #feed-posts (index.html)
   ═══════════════════════════════════════════════════════════ */

function createPost(postData, id) {
  const user = USERS[id % USERS.length];
  const contentHtml = getPostContent(postData);
  const article = document.createElement("article");

  article.className = "post post--interactive";

  article.innerHTML = `
    <div class="post__avatar" style="background:${user.color}">${user.initial}</div>
    <div class="post__body">
      <div class="post__header">
        <span class="post__name">${user.name}</span>
        <span class="post__handle">@${user.handle}</span>
        <span class="post__time">· ${formatTime()}</span>
      </div>
      ${contentHtml}
      <div class="post__actions">
        <span class="post__action">${ICONS.reply} ${formatCount()}</span>
        <span class="post__action">${ICONS.repost} ${formatCount()}</span>
        <span class="post__action">${ICONS.like} ${formatCount()}</span>
      </div>
    </div>
  `;
  article.dataset.id = String(id);

  return article;
}

/* ═══════════════════════════════════════════════════════════
   FIL — 5 posts interactifs
   ═══════════════════════════════════════════════════════════ */

let feedInitialized = false;

function initFeed() {
  const feedPosts = document.getElementById("feed-posts");
  if (!feedPosts) return;

  feedPosts.innerHTML = "";

  const fragment = document.createDocumentFragment();

  POSTS.forEach((postData, index) => {
    const article = createPost(postData, index);
    setupHoldReveal(article);
    fragment.appendChild(article);
  });

  feedPosts.appendChild(fragment);
}

/* ================================================================
   CHAPTER LIFECYCLE — wired to menu.js view switching
   ================================================================ */

function init() {
  if (feedInitialized) return;
  initFeed();
  feedInitialized = true;
}

function destroy() {
  const feedPosts = document.getElementById("feed-posts");
  if (feedPosts) feedPosts.innerHTML = "";
  feedInitialized = false;
}

window.Chapter2 = { init: init, destroy: destroy };
