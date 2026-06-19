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
//
// comments — tu choisis combien et lesquels apparaissent sous chaque post :
//   • nombre seul              → index dans COMMENTS (0 = premier commentaire)
//   • { index, user? }         → commentaire du pool + auteur optionnel (index USERS)
//   • { lines, hidden, user? } → commentaire écrit directement sur le post
//   • []                       → aucune réponse
const POSTS = [
  {
    lines: [
      "Si les viols sont majoritairement commis par des hommes, ce n’est pas parce que l’homme est “éduqué à violer”.",
      "C’est parce qu’il est biologiquement plus fort. Point.",
    ],
    hidden:
      "1. Le viol n'est pas une fatalité biologique, mais le produit d'un système. Le sexisme, et les violences qui en découlent comme le viol, n'est pas une fatalité liée à la biologie : c'est une construction sociale. Les sources expliquent que la violence masculine prend racine dans trois « incubateurs » : la famille, l'école et le numérique",
    comments: [0, 1, 2],
  },
  {
    lines: [
      "Arrêtez d'être gentil, la réalité du terrain est totalement différente. Les femmes ne veulent pas d'un mec doux qui demande la permission pour tout.",
      "Elles veulent de l'intensité, de la domination, de l'agressivité. C'est leur nature biologique profonde, peu importe ce que le féminisme essaie de vous faire croire.",
    ],
    hidden:
      "Ce discours utilise une fausse logique biologique pour transformer la solitude des hommes en argent. On leur vend la domination comme une vérité naturelle pour exploiter leur anxiété. Cette apologie de l'agressivité alimente directement la culture du viol.",
    comments: [2, 3, 4],
  },
  {
    lines: [
      "Pendant que l'État et le système te préparent à être un salarié précaire payé au SMIC, certains encaissent 10k/mois depuis une plage à Dubaï.",
      "La société moderne veut des hommes faibles et dociles. Brise tes chaînes, rejoins ma formation et reprends le contrôle de ta vie. Le lien est en bio.",
    ],
    hidden:
      "L'influenceur fait miroiter une fausse promesse d'indépendance financière pour vendre des formations de développement personnel souvent vides et hors de prix.",
    comments: [5, 6],
  },
  {
    lines: [
      "Pourquoi c’est devenu impossible de s'en sortir pour un jeune mec aujourd'hui ? Regardez autour de vous : le féminisme grapille toutes les places en entreprise avec les quotas, et l'immigration sature les aides sociales.",
      "On vous vole votre avenir pendant que vous galérez. Réveillez-vous.",
    ],
    hidden:
      "Pour masquer les véritables causes économiques de la précarité des jeunes (crise du logement, inflation, précarisation de l'emploi), l'influenceur fabrique des coupables idéaux : les féministes, la justice ou l'immigration.",
    comments: [7, 8],
  },
  {
    lines: [
      "Regardez la vérité en face : les hommes blancs hétéros sont les nouveaux parias de cette société. Entre la discrimination positive,",
      "la haine anti-hommes dans les médias et la destruction de la famille, on assiste au declin de la société.",
    ],
    hidden:
      "Ce post exploite un sentiment de dépossession pour créer une fausse communauté de défense. La manosphère s'appuie sur des perceptions alarmantes : 52 % des 25-34 ans estiment qu'on s'acharne sur les hommes aujourd'hui, et 32 % des hommes pensent perdre leur pouvoir. En canalisant cette anxiété, ces espaces masculinistes ne protègent pas les hommes : ils agissent comme des passerelles numériques vers le suprémacisme et l'extrême droite. (Le taux d'utilisateurs communs entre manosphère et extrême droite sur YouTube atteint d'ailleurs 31,7 %).",
    comments: [9, 10],
  },
  {
    lines: [
      "La matrice tremble parce que des mecs comme Andrew Tate apprennent aux jeunes hommes à s'émanciper, à faire du cash et à manager des femmes au lieu de se soumettre.",
      "Les accusations contre lui sont un complot pur et simple pour éteindre un homme libre. Devenez des leaders, apprenez le business, et reprenez le contrôle du marché.",
    ],
    hidden:
      "Sous couvert de libérer les hommes, les leaders du mouvement cachent des pratiques prédatrices et criminelles. Andrew Tate, idole de cette fraternité, est poursuivi pour viol et trafic d'êtres humains en Roumanie et au Royaume-Uni. Derrière les promesses de réussite, ces discours ne défendent pas les hommes : ils banalisent l'exploitation violente d'autrui pour générer du profit.",
    comments: [11, 12],
  },
];

// Pool de commentaires réutilisables — référencés par index dans POSTS[].comments
const COMMENTS = [
  {
    lines: [
      "Un homme doit savoir qu’en franchissant cette ligne, il met sa vie en jeu.",
      "Ils doivent apprendre a controler leur pulsions, si non c'est eux qui payent le prix",
    ],
    hidden:
      "Dès l'enfance on valorise chez les garçons la force, la compétition et le mépris de la faiblesse, tandis qu'on enseigne aux filles la douceur et la docilité. ",
  },
  {
    lines: [
      "Mais tlmt faut faire régner l’ordre à la manniere de Batman sur gotham.",
      "De force et en punissant ceux qui enfreignent les règles.",
    ],
    hidden:
      "À l'école les garçons sont « spécialisés » très tôt dans l'expression de la violence et de l'incivilité (ils représentent 96,7 % des sanctions pour violence sur autrui au collège). Ce n'est pas leurs muscles qui dictent ce comportement, mais une éducation qui associe la masculinité à la domination",
  },
  {
    lines: [
      "C'est comme ça depuis les hommes des cavernes,",
      "On vit dans une epoque ou les hommes ne sont plus vraiment des hommes !",
    ],
    hidden:
      "Le déni du consentement : Les techniques de séduction vendues dans la manosphère (PUA) apprennent explicitement aux hommes à contourner la résistance des femmes et à ignorer les signes de non-consentement.",
  },
  {
    lines: [
      "Exactement. Le porno ment pas, c'est ce qu'elles cherchent en secret. ",
      "Si tu les bouscules pas, elles s'ennuient direct et te lâchent pour un des ces 10 mecs en reserve.",
    ],
    hidden:
      "Ce discours s'appuie sur la pornographie de masse pour saturer l'imaginaire des ados. Les conséquences sont graves : 47 % des garçons croient que les filles s'attendent à une agression physique pendant le sexe, et 42 % pensent qu’elles y prennent du plaisir. Le porno industriel remplace l'éducation sexuelle.",
  },
  {
    lines: [
      "En plus maintenant tout est une agression sexuelle, le consentement veut plus rien dire. On t'accuse pour un oui ou pour un non.",
      "tu peux plus rien faire aujourd'hui sans finir au tribunal.",
    ],
    hidden:
      "Les communautés masculinistes exploitent la détresse et l'insécurité des jeunes hommes face à leurs premiers rapports. Au lieu de les aider, elles les radicalisent en inventant une crise de la masculinité causée par le féminisme. L'insécurité sexuelle est alors transformée en paranoïa et en haine des femmes.",
  },
  {
    lines: [
      "Une meuf, faut lui parler mal, ou l'ignorer si tu veux qu'elle s'interesse à toi, c'est ça qui les excite.",
      "C'est de la psychologie de base, elles aiment être soumises et humiliées.",
    ],
    hidden:
      "La banalisation de la violence : Confondre les scénarios pornos et le désir réel valide des comportements criminels. Cette déformation touche de plein fouet les jeunes : 36 % des 18-24 ans pensent qu'une femme peut aimer être humiliée ou injuriée au lit. Ce que la manosphère vend comme de la psychologie est un conditionnement à la violence",
  },
  {
    lines: [
      "Tellement vrai, l'avenir fait peur, on sait même pas si on aura une retraite.",
      "Il y a que les formations de mecs comme toi qui redonnent de l'espoir aux jeunes.",
    ],
    hidden:
      "Ces influenceurs ciblent une jeunesse coincée dans une précarité et une incertitude économique permanente. Ils convertissent cette peur de l'avenir en argent. En vendant des solutions simplistes et des formations miracles, ils s'enrichissent sur le dos d'hommes brisés par le système",
  },
  {
    lines: [
      "L'homme se doit de ramener l'argent à la maison et mettre sa famille à l'abri,",
      "C'est notre rôle naturel. On n'a pas le choix que de charbonner.",
    ],
    hidden:
      "Cette rhétorique s'appuie sur une pression sociale immense : aujourd'hui, 70 % des hommes pensent qu'ils doivent assumer seuls la sécurité financière de leur famille. Ce marketing genré commence dès l'enfance avec des jouets qui enferment les garçons dans l'obligation de performance, de force et de compétition.",
  },
  {
    lines: [
      "Exact, on bosse comme des fous et ce sont les femmes ou les étrangers qui raflent les bonus et les postes de direction.",
      "Le système nous a abandonnés pour les privilégier.",
    ],
    hidden:
      "Il s'agit d'un détournement de la frustration. C'est un mécanisme clé de la manosphère. Au lieu de laisser les jeunes analyser les failles réelles du système économique (le capitalisme de connivence, l'inflation) qui les précarise, les influenceurs redirigent leur colère vers des boucs émissaires faciles : les femmes ou le féminisme.",
  },
  {
    lines: [
      "Du coup je passe mes soirées à regarder tes vidéos pour comprendre comment être une meilleure version de moi.",
      "Force à nous, on va pas se laisser faire par cette époque de fous.",
    ],
    hidden:
      "Ce transfert de culpabilité a un double avantage pour l'influenceur. Il protège le système capitaliste qui fait sa propre fortune, tout en enfermant son audience dans un cycle infini de ressentiment. Les jeunes hommes s'isolent dans la haine en ligne et consomment toujours plus de contenus antiféministes payants.",
  },
  {
    lines: [
      "Exactement, ils veulent nous couper de nos racines et nous affaiblir. Si on ne se serre pas les coudes entre vrais suisses",
      "on va se faire grand-remplacer dans nos propres pays.",
    ],
    hidden:
      "La solidarité vendue par ces groupes est un piège politique. Les données montrent que la manosphère sert de porte d'entrée à l'Alt-right (extrême droite américaine) et aux idéologies suprémacistes. La frustration identitaire y est méthodiquement convertie en haine raciale et politique.",
  },
  {
    lines: [
      "Les meufs passent leur vie à nous insulter et critiquer,",
      "et après elles s'étonnent qu'on ne veulent plus d'elles.",
    ],
    hidden:
      "Ce cyberharcèlement organisé détruit des vies. En raison de ce climat d'hostilité, 60 % des jeunes filles exposées à la misogynie en ligne déclarent une profonde tristesse, et un quart d'entre elles a déjà envisagé ou planifié un suicide. Hors ligne, la violence s'aggrave : la Suisse a par exemple enregistré 22 féminicides et 8 tentatives au cours de l'année 2025.",
  },
  {
    lines: [
      "Le business d'agence OnlyFans (OFM) c’est le cheat code.",
      "Tu gères les comptes de filles, tu prends ta com.",
    ],
    hidden:
      "C'est le Proxénétisme numérique (OFM). Les formations de Manager OnlyFans sont une nouvelle forme de proxénétisme. Des rapports officiels dénoncent des méthodes criminelles : les managers imposent des commissions abusives de plus de 50 % aux créatrices, exercent un harcèlement moral permanent et font pression pour produire des contenus extrêmes non consentis.",
  },
  {
    lines: [
      "Pour gérer une meuf, faut connaître ses points faibles.",
      "Quand elle dit non, c’est juste une résistance psychologique. Il suffit juste de forcer un peu pour la convaincre.",
    ],
    hidden:
      "Ce discours s'enracine dans les méthodes des Pick Up Artists (PUA), des coachs en séduction qui théorisent le contournement de la résistance des femmes. En apprenant explicitement aux jeunes hommes à ignorer le non d'une partenaire, ces techniques banalisent directement les agressions sexuelles et le viol.",
  },

];

// Faux profils (nom, pseudo, couleur avatar, initiale)
const USERS = [
  { name: "Alex H.", handle: "le_roi_du_nord", color: "#ffffff", initial: "L" },
  { name: "Hugo.", handle: "hugo_posay", color: "#ffffff", initial: "C" },
  { name: "Wlke.", handle: "Elke", color: "#ffffff", initial: "T" },
  { name: "VengeanceWW2.", handle: "luc", color: "#ffffff", initial: "I" },
  { name: "Noah P.", handle: "noah_p", color: "#ffffff", initial: "N" },
  { name: "Beerus Sama.", handle: "Beerusama", color: "#ffffff", initial: "L" },
  { name: "TrashTalkeur.", handle: "TT", color: "#ffffff", initial: "H" },
  { name: "Smeshreag6.", handle: "james", color: "#ffffff", initial: "C" },
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

// Transforme la config `comments` d'un post en données prêtes à afficher
function resolvePostComments(post, postIndex) {
  const refs = post.comments ?? [];

  return refs.map((ref, commentIndex) => {
    const defaultUser = postIndex + commentIndex + 1;

    if (typeof ref === "number") {
      return { ...COMMENTS[ref], userIndex: defaultUser };
    }

    if (typeof ref.index === "number") {
      return {
        ...COMMENTS[ref.index],
        userIndex: ref.user ?? defaultUser,
      };
    }

    return {
      lines: ref.lines,
      hidden: ref.hidden,
      userIndex: ref.user ?? defaultUser,
    };
  });
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

function createComment(commentData) {
  const user = USERS[commentData.userIndex % USERS.length];
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
      const fragment = document.createDocumentFragment();

      commentsData.forEach((commentData) => {
        const commentEl = createComment(commentData);
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
    const commentsData = resolvePostComments(postData, index);
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
