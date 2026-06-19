/**
 * INFOS-MODAL.JS — Resource hub modal
 *
 * Opens from the global nav "Infos" button. Displays supplementary
 * sources and external links grouped by section.
 *
 * To add a source: append an entry to the relevant section in INFO_SECTIONS,
 * or call window.InfosModal.setSections([...]) before the modal opens.
 */

(function () {
  "use strict";

  /** Grouped resources — edit or extend each section below */
  const INFO_SECTIONS = [
    {
      title: "Rapport",
      sources: [
        {
          title: "Ensemble contre la violence envers les femmes",
          url: "https://www.brava-ngo.ch/assets/brava_jb_24_fr_digi.pdf",
        },
        {
          title: "Baromètre national de l'égalité",
          url: "https://www.equality.ch/pdf_f/Gleichstellungsbarometer_2024_Kurzversion_f.pdf",
        },
        {
          title: "Rapport annuel 2024 sur l’état des lieux du sexisme en France",
          url: "https://www.haut-conseil-egalite.gouv.fr/sites/hce/files/files-spip/pdf/hce_-_rapport_annuel_2024_sur_l_etat_du_sexisme_en_france.pdf",
        },
        {
          title: "Are Anti-Feminist Communities Gateways to the Far Right? Evidence from Reddit and YouTube - EPFL",
          url: "https://dlab.epfl.ch/people/west/pub/Mamie-HortaRibeiro-West_WebSci-21.pdf",
        },
      ],
    },
    {
      title: "Article",
      sources: [
        {
          title: "Derrière une attaque à la voiture-bélier, le premier attentat Incel en Suisse",
          url: "https://www.rts.ch/info/suisse/2025/article/derriere-une-attaque-a-la-voiture-belier-le-premier-attentat-incel-en-suisse-29086341.html",
        },
        {
          title: "Stop Femizid Suisse",
          url: "https://www.stopfemizid.ch/francais#anchor1",
        },
      ],
    },
    {
      title: "Association",
      sources: [
        {
          title: "MasculinitéS",
          url: "https://surgir.ch/programmes/masculinites",
        },
        {
          title: "Attention à la manosphère !",
          url: "https://manosphere.ch/fr/",
        },
      ],
    },
  ];

  const modal = document.getElementById("infos-modal");
  const trigger = document.getElementById("infos-trigger");
  const body = document.getElementById("infos-modal-body");
  const panel = modal?.querySelector(".infos-modal__panel");

  if (!modal || !trigger || !body) return;

  let sections = INFO_SECTIONS.map(function (section) {
    return {
      title: section.title,
      sources: section.sources.slice(),
    };
  });
  let isOpen = false;
  let lastFocusedElement = null;

  /** Build card markup for a single source */
  function createSourceCard(source, index) {
    const item = document.createElement("li");
    item.className = "infos-card";

    const card = document.createElement("article");
    card.className = "infos-card__inner";

    const title = document.createElement("h4");
    title.className = "infos-card__title";
    title.textContent = source.title;

    const link = document.createElement("a");
    link.className = "infos-card__link";
    link.href = source.url;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.textContent = source.url;

    card.appendChild(title);
    card.appendChild(link);
    item.appendChild(card);
    item.style.transitionDelay = index * 60 + "ms";

    return item;
  }

  /** Build a titled section with its card grid */
  function createSection(section, startIndex) {
    const sectionEl = document.createElement("section");
    sectionEl.className = "infos-section";

    const heading = document.createElement("h3");
    heading.className = "infos-section__title";
    heading.textContent = section.title;

    const grid = document.createElement("ul");
    grid.className = "infos-modal__grid";
    grid.setAttribute("aria-label", section.title);

    section.sources.forEach(function (source, index) {
      grid.appendChild(createSourceCard(source, startIndex + index));
    });

    sectionEl.appendChild(heading);
    sectionEl.appendChild(grid);

    return sectionEl;
  }

  /** Render all sections into the modal body */
  function renderSections() {
    body.replaceChildren();

    let cardIndex = 0;
    sections.forEach(function (section) {
      if (!section.sources.length) return;
      body.appendChild(createSection(section, cardIndex));
      cardIndex += section.sources.length;
    });
  }

  /** Trap focus inside the modal while open */
  function handleTabKey(event) {
    if (!isOpen || event.key !== "Tab") return;

    const focusable = modal.querySelectorAll(
      'button:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])'
    );
    if (!focusable.length) return;

    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  function openModal() {
    if (isOpen) return;

    renderSections();
    lastFocusedElement = document.activeElement;

    modal.hidden = false;
    modal.setAttribute("aria-hidden", "false");
    trigger.setAttribute("aria-expanded", "true");
    trigger.classList.add("nav__link--infos-open");

    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        modal.classList.add("is-visible");
      });
    });

    isOpen = true;
    modal.querySelector(".infos-modal__close")?.focus();
  }

  function closeModal() {
    if (!isOpen) return;

    modal.classList.remove("is-visible");
    modal.setAttribute("aria-hidden", "true");
    trigger.setAttribute("aria-expanded", "false");
    trigger.classList.remove("nav__link--infos-open");

    let finalized = false;

    function finalizeClose() {
      if (finalized) return;
      finalized = true;
      panel.removeEventListener("transitionend", onEnd);
      modal.hidden = true;
    }

    function onEnd(event) {
      if (event.target !== panel || event.propertyName !== "opacity") return;
      finalizeClose();
    }

    panel.addEventListener("transitionend", onEnd);
    setTimeout(finalizeClose, 500);

    isOpen = false;

    if (lastFocusedElement && typeof lastFocusedElement.focus === "function") {
      lastFocusedElement.focus();
    }
  }

  function handleDocumentClick(event) {
    if (event.target.closest("[data-infos-open]")) {
      event.preventDefault();
      openModal();
      return;
    }

    if (event.target.closest("[data-infos-close]")) {
      event.preventDefault();
      closeModal();
    }
  }

  function handleDocumentKeydown(event) {
    if (!isOpen) return;

    if (event.key === "Escape") {
      event.preventDefault();
      closeModal();
      return;
    }

    handleTabKey(event);
  }

  document.addEventListener("click", handleDocumentClick);
  document.addEventListener("keydown", handleDocumentKeydown);

  window.InfosModal = {
    open: openModal,
    close: closeModal,
    setSections: function (nextSections) {
      sections = nextSections.map(function (section) {
        return {
          title: section.title,
          sources: section.sources.slice(),
        };
      });
      if (isOpen) renderSections();
    },
    getSections: function () {
      return sections.map(function (section) {
        return {
          title: section.title,
          sources: section.sources.slice(),
        };
      });
    },
  };
})();
