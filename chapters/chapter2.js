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

// Réponses bots — même structure surface + vérité cachée que les posts
const COMMENTS = [
  {
    lines: [
      "Totalement d'accord avec l'avis initial.",
      "Il faut arrêter de forcer avec ce truc.",
    ],
    hidden:
      "Je n'ai même pas lu le post, je commente juste pour gratter des impressions sur mon profil.",
  },
  {
    lines: [
      "Je trouve ça hyper surcoté aussi.",
      "Le design laisse vraiment à désirer.",
    ],
    hidden:
      "En vrai je trouve ça magnifique, mais c'est plus facile de récolter des likes en étant aigri.",
  },
  {
    lines: [
      "Merci pour ce retour honnête !",
      "Ça change des avis sponsorisés.",
    ],
    hidden:
      "Mon compte est géré par un script Python automatisé. Bip boup.",
  },
  {
    lines: [
      "C'est exactement ce que je me disais.",
      "Rien de révolutionnaire cette année.",
    ],
    hidden:
      "Je suis terrifié par le fait que tout le monde avance dans sa vie sauf moi.",
  },
  {
    lines: [
      "Passez votre chemin, circulez...",
      "Il n'y a absolument rien à voir.",
    ],
    hidden:
      "J'y pense jour et nuit. C'est la meilleure chose que j'ai vue de ma vie entière.",
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

// Petites icônes SVG (reply, like)
const ICONS = {
  reply: '<svg viewBox="0 0 24 24"><path d="M1.751 10c0-4.42 3.584-8 8.005-8h4.366c4.49 0 8.129 3.64 8.129 8.13 0 2.96-1.607 5.68-4.196 7.11l-8.054 4.46v-3.69h-.067c-4.49.1-8.183-3.51-8.183-8.01z"/></svg>',
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

function formatCountDisplay(n) {
  return n > 99 ? `${(n / 10).toFixed(1).replace(".", ",")} k` : String(n);
}

// 2 à 3 commentaires par post, tirés du pool COMMENTS
function pickCommentsForPost(postId) {
  const count = random(2, 3);
  const start = (postId * 2) % COMMENTS.length;
  const picked = [];

  for (let i = 0; i < count; i++) {
    picked.push(COMMENTS[(start + i) % COMMENTS.length]);
  }

  return picked;
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
  const isComment = article.classList.contains("post--comment");
  const body = article.querySelector(":scope > .post__body");
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

  function isRevealTarget(event) {
    if (!body.contains(event.target)) return false;
    if (event.target.closest(".post__actions")) return false;
    return true;
  }

  function isolateCommentEvent(event) {
    if (isComment) event.stopPropagation();
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
    isolateCommentEvent(event);
    if (!isRevealTarget(event)) return;
    if (isComplete) return;

    pressing = true;
    article.classList.add("is-pressing");
    body.setPointerCapture(event.pointerId);
    startReveal();
  });

  body.addEventListener("pointerup", (event) => {
    isolateCommentEvent(event);
    if (isComplete) return;
    if (!pressing) return;

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

  body.addEventListener("pointercancel", (event) => {
    isolateCommentEvent(event);

    pressing = false;
    article.classList.remove("is-pressing");
    if (!isComplete && progress < 1) startCollapse();
  });

  // Clic sur un post déjà ouvert → referme
  body.addEventListener("click", (event) => {
    isolateCommentEvent(event);
    if (!isRevealTarget(event)) return;
    if (suppressClick || !isComplete) return;
    closeReveal();
  });

  applyProgress(0);
}

/* ═══════════════════════════════════════════════════════════
   CRÉATION D’UN POST — injecté dans #feed-posts (index.html)
   ═══════════════════════════════════════════════════════════ */

function createComment(commentData, userIndex) {
  const user = USERS[userIndex % USERS.length];
  const contentHtml = buildBetweenLinesHTML(commentData.lines, commentData.hidden);
  const article = document.createElement("article");

  article.className = "post post--interactive post--comment";

  article.innerHTML = `
    <div class="post__avatar" style="background:${user.color}">${user.initial}</div>
    <div class="post__body">
      <div class="post__header">
        <span class="post__name">${user.name}</span>
        <span class="post__handle">@${user.handle}</span>
        <span class="post__time">· ${formatTime()}</span>
      </div>
      ${contentHtml}
    </div>
  `;

  return article;
}

function createPost(postData, id, commentsData) {
  const user = USERS[id % USERS.length];
  const contentHtml = getPostContent(postData);
  const likeCount = random(2, 999);
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
        <button type="button" class="post__action post__action--reply" aria-label="Voir les réponses" aria-expanded="false">
          ${ICONS.reply}<span class="post__action__count">${commentsData.length}</span>
        </button>
        <button type="button" class="post__action post__action--like" aria-label="Aimer" aria-pressed="false" data-count="${likeCount}">
          ${ICONS.like}<span class="post__action__count">${formatCountDisplay(likeCount)}</span>
        </button>
      </div>
    </div>
    <div class="post__thread" aria-hidden="true">
      <div class="post__thread-inner"></div>
    </div>
  `;
  article.dataset.id = String(id);

  return article;
}

function setupLikeToggle(article) {
  const likeBtn = article.querySelector(".post__action--like");
  const countEl = likeBtn?.querySelector(".post__action__count");
  if (!likeBtn || !countEl) return;

  let likeCount = Number(likeBtn.dataset.count);
  let isLiked = false;

  likeBtn.addEventListener("click", (event) => {
    event.preventDefault();
    event.stopPropagation();

    isLiked = !isLiked;
    likeCount += isLiked ? 1 : -1;
    likeBtn.dataset.count = String(likeCount);
    likeBtn.classList.toggle("is-liked", isLiked);
    likeBtn.setAttribute("aria-pressed", String(isLiked));
    countEl.textContent = formatCountDisplay(likeCount);
  });
}

function setupReplyToggle(article, commentsData) {
  const replyBtn = article.querySelector(".post__action--reply");
  const thread = article.querySelector(".post__thread");
  const threadInner = article.querySelector(".post__thread-inner");
  if (!replyBtn || !thread || !threadInner) return;

  let commentsBuilt = false;

  replyBtn.addEventListener("click", (event) => {
    event.preventDefault();
    event.stopPropagation();

    if (!commentsBuilt) {
      const postId = Number(article.dataset.id);
      const fragment = document.createDocumentFragment();

      commentsData.forEach((commentData, index) => {
        const commentEl = createComment(commentData, postId + index + 1);
        setupHoldReveal(commentEl);
        fragment.appendChild(commentEl);
      });

      threadInner.appendChild(fragment);
      commentsBuilt = true;
    }

    const isOpen = thread.classList.toggle("is-open");
    replyBtn.classList.toggle("is-active", isOpen);
    replyBtn.setAttribute("aria-expanded", String(isOpen));
    thread.setAttribute("aria-hidden", String(!isOpen));
  });
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
    const commentsData = pickCommentsForPost(index);
    const article = createPost(postData, index, commentsData);
    setupHoldReveal(article);
    setupReplyToggle(article, commentsData);
    setupLikeToggle(article);
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
