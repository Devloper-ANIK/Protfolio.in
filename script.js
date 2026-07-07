/* ==========================================================================
   ANIK PAL — PREMIUM PORTFOLIO script.js 
   ========================================================================== */

(function () {
  "use strict";

  /* Respect user's reduced-motion preference globally */
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* Register GSAP plugins once, guarding against load failure */
  if (window.gsap && window.ScrollTrigger) {
    gsap.registerPlugin(ScrollTrigger);
  }

  /* ------------------------------------------------------------------
     1. LENIS SMOOTH SCROLL
  ------------------------------------------------------------------ */
  let lenis = null;

  function initLenis() {
    if (prefersReducedMotion || typeof Lenis === "undefined") return;

    lenis = new Lenis({
      duration: 1.1,
      easing: (t) => Math.min(1, 1 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 1.2,
    });

    lenis.on("scroll", () => {
      if (window.ScrollTrigger) ScrollTrigger.update();
    });

    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    // Let in-page anchor links (nav, scroll indicator) use Lenis scrollTo
    document.querySelectorAll('a[href^="#"]').forEach((link) => {
      link.addEventListener("click", (e) => {
        const id = link.getAttribute("href");
        if (id.length > 1 && document.querySelector(id)) {
          e.preventDefault();
          lenis.scrollTo(id, { offset: -80 });
        }
      });
    });
  }

  /* ------------------------------------------------------------------
     2. LUXURY LOADER
  ------------------------------------------------------------------ */
  function initLoader() {
    const loader = document.getElementById("loader");
    const fill = loader ? loader.querySelector(".loader-bar-fill") : null;
    if (!loader) return Promise.resolve();

    return new Promise((resolve) => {
      if (prefersReducedMotion || !window.gsap) {
        loader.style.display = "none";
        resolve();
        return;
      }

      const tl = gsap.timeline({
        onComplete: () => {
          loader.style.pointerEvents = "none";
          resolve();
        },
      });

      tl.to(fill, { width: "100%", duration: 1.1, ease: "power2.inOut" })
        .to(loader, { opacity: 0, duration: 0.6, ease: "power1.out" }, "+=0.15")
        .set(loader, { display: "none" });
    });
  }

  /* ------------------------------------------------------------------
     3. NAVBAR: hide on scroll down, show on scroll up, glass on scroll
  ------------------------------------------------------------------ */
  function initNavbar() {
    const navbar = document.getElementById("navbar");
    if (!navbar) return;

    let lastY = window.scrollY;
    let ticking = false;

    function onScroll() {
      const y = window.scrollY;

      navbar.classList.toggle("is-scrolled", y > 24);

      if (y > lastY && y > getNavbarHeight()) {
        navbar.classList.add("is-hidden");
      } else {
        navbar.classList.remove("is-hidden");
      }

      lastY = y;
      ticking = false;
    }

    function getNavbarHeight() {
      const raw = getComputedStyle(document.documentElement).getPropertyValue("--navbar-height");
      return parseInt(raw, 10) || 84;
    }

    window.addEventListener("scroll", () => {
      if (!ticking) {
        requestAnimationFrame(onScroll);
        ticking = true;
      }
    });

    /* Mobile menu toggle: open/close the slide-in drawer, keep aria-expanded
       in sync, and cover every way a user expects the menu to close. */
    const toggle = document.getElementById("navToggle");
    const menu = document.getElementById("mobileMenu");
    const backdrop = document.getElementById("mobileMenuBackdrop");
    const desktopBreakpoint = window.matchMedia("(min-width: 900px)");

    function setMenuOpen(open) {
      if (!toggle) return;
      toggle.setAttribute("aria-expanded", String(open));
      document.body.classList.toggle("nav-open", open);
    }

    function isMenuOpen() {
      return document.body.classList.contains("nav-open");
    }

    if (toggle && menu) {
      toggle.addEventListener("click", () => {
        setMenuOpen(!isMenuOpen());
      });

      // Close after choosing a link, so the drawer doesn't linger over the
      // section the user just navigated to.
      menu.querySelectorAll("a").forEach((link) => {
        link.addEventListener("click", () => setMenuOpen(false));
      });

      // Close on backdrop click (tapping outside the drawer).
      if (backdrop) {
        backdrop.addEventListener("click", () => setMenuOpen(false));
      }

      // Close on Escape for keyboard users.
      document.addEventListener("keydown", (e) => {
        if (e.key === "Escape" && isMenuOpen()) setMenuOpen(false);
      });

      // Safety net: if the viewport crosses into the desktop layout while
      // the drawer is open (e.g. rotating a tablet, resizing a window),
      // force it closed so it never sits open-but-hidden behind the
      // desktop nav links.
      const handleBreakpointChange = (e) => {
        if (e.matches && isMenuOpen()) setMenuOpen(false);
      };
      if (typeof desktopBreakpoint.addEventListener === "function") {
        desktopBreakpoint.addEventListener("change", handleBreakpointChange);
      } else if (typeof desktopBreakpoint.addListener === "function") {
        // Safari < 14 fallback
        desktopBreakpoint.addListener(handleBreakpointChange);
      }
    }
  }

  /* ------------------------------------------------------------------
     4. SCROLL PROGRESS BAR
  ------------------------------------------------------------------ */
  function initScrollProgress() {
    const bar = document.getElementById("scrollProgress");
    if (!bar) return;

    function update() {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const pct = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
      bar.style.width = pct + "%";
    }

    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    update();
  }

  /* ------------------------------------------------------------------
     5. CUSTOM CURSOR + CURSOR GLOW ON INTERACTIVE ELEMENTS
  ------------------------------------------------------------------ */
  function initCustomCursor() {
    const supportsFinePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    if (!supportsFinePointer || prefersReducedMotion) return;

    const dot = document.querySelector(".cursor-dot");
    const ring = document.querySelector(".cursor-ring");
    if (!dot || !ring) return;

    document.body.classList.add("has-custom-cursor");

    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let ringX = mouseX;
    let ringY = mouseY;

    window.addEventListener("mousemove", (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      dot.style.transform = `translate(${mouseX}px, ${mouseY}px) translate(-50%, -50%)`;
    });

    function animateRing() {
      ringX += (mouseX - ringX) * 0.18;
      ringY += (mouseY - ringY) * 0.18;
      ring.style.transform = `translate(${ringX}px, ${ringY}px) translate(-50%, -50%)`;
      requestAnimationFrame(animateRing);
    }
    animateRing();

    document.querySelectorAll("a, button, .magnetic").forEach((el) => {
      el.addEventListener("mouseenter", () => ring.classList.add("is-active"));
      el.addEventListener("mouseleave", () => ring.classList.remove("is-active"));
    });
  }

  /* ------------------------------------------------------------------
     6. MAGNETIC BUTTONS
  ------------------------------------------------------------------ */
  function initMagneticButtons() {
    const supportsFinePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    if (!supportsFinePointer || prefersReducedMotion || !window.gsap) return;

    document.querySelectorAll(".magnetic").forEach((el) => {
      const strength = 0.35;

      el.addEventListener("mousemove", (e) => {
        const rect = el.getBoundingClientRect();
        const relX = e.clientX - rect.left - rect.width / 2;
        const relY = e.clientY - rect.top - rect.height / 2;

        gsap.to(el, {
          x: relX * strength,
          y: relY * strength,
          duration: 0.4,
          ease: "power2.out",
        });
      });

      el.addEventListener("mouseleave", () => {
        gsap.to(el, { x: 0, y: 0, duration: 0.5, ease: "elastic.out(1, 0.4)" });
      });
    });
  }

  /* ------------------------------------------------------------------
     7. HERO SPOTLIGHT (follows mouse within hero)
  ------------------------------------------------------------------ */
  function initHeroSpotlight() {
    const hero = document.getElementById("hero");
    const spotlight = document.getElementById("heroSpotlight");
    const supportsFinePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    if (!hero || !spotlight || !supportsFinePointer || prefersReducedMotion) return;

    hero.addEventListener("mousemove", (e) => {
      const rect = hero.getBoundingClientRect();
      spotlight.style.left = e.clientX - rect.left + "px";
      spotlight.style.top = e.clientY - rect.top + "px";
    });
  }

  /* ------------------------------------------------------------------
     8. TYPING ANIMATION (hero headline)
  ------------------------------------------------------------------ */
  function initTypingAnimation() {
    const target = document.getElementById("typingTarget");
    if (!target) return;

    let strings = [];
    try {
      strings = JSON.parse(target.getAttribute("data-strings") || "[]");
    } catch (err) {
      strings = [];
    }
    if (!strings.length) return;

    if (prefersReducedMotion) {
      target.textContent = strings[0];
      return;
    }

    let stringIndex = 0;
    let charIndex = 0;
    let deleting = false;
    const typeSpeed = 42;
    const deleteSpeed = 26;
    const holdTime = 1900;

    function tick() {
      const current = strings[stringIndex];

      if (!deleting) {
        charIndex++;
        target.textContent = current.slice(0, charIndex);

        if (charIndex === current.length) {
          deleting = true;
          setTimeout(tick, holdTime);
          return;
        }
        setTimeout(tick, typeSpeed);
      } else {
        charIndex--;
        target.textContent = current.slice(0, charIndex);

        if (charIndex === 0) {
          deleting = false;
          stringIndex = (stringIndex + 1) % strings.length;
          setTimeout(tick, 400);
          return;
        }
        setTimeout(tick, deleteSpeed);
      }
    }

    setTimeout(tick, 300);
  }

  /* ------------------------------------------------------------------
     9. COUNTER ANIMATION (hero metric card)
  ------------------------------------------------------------------ */
  function initCounters(scopeEl) {
    const root = scopeEl || document;
    const counters = root.querySelectorAll("[data-count-to]");
    if (!counters.length) return;

    counters.forEach((el) => {
      const target = parseFloat(el.getAttribute("data-count-to"));
      const obj = { val: 0 };

      if (prefersReducedMotion || !window.gsap) {
        el.textContent = target;
        return;
      }

      gsap.to(obj, {
        val: target,
        duration: 1.6,
        delay: 1.4,
        ease: "power2.out",
        onUpdate: () => {
          el.textContent = Math.round(obj.val);
        },
      });
    });
  }

  /* ------------------------------------------------------------------
     10. HERO ENTRANCE SEQUENCE (runs once loader completes)
  ------------------------------------------------------------------ */
  function playHeroEntrance() {
    const reveals = document.querySelectorAll("#hero [data-reveal]");

    if (prefersReducedMotion || !window.gsap) {
      reveals.forEach((el) => (el.style.opacity = 1));
      initCounters(document.getElementById("hero"));
      return;
    }

    gsap.set(reveals, { opacity: 0, y: 22 });

    const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

    tl.to("#hero .hero-eyebrow", { opacity: 1, y: 0, duration: 0.7 }, 0.05)
      .to("#hero .hero-title .title-line", { opacity: 1, y: 0, duration: 0.85, stagger: 0.12 }, 0.15)
      .to("#hero .hero-desc", { opacity: 1, y: 0, duration: 0.7 }, 0.5)
      .to("#hero .hero-actions", { opacity: 1, y: 0, duration: 0.7 }, 0.62)
      .to("#hero .hero-socials", { opacity: 1, y: 0, duration: 0.6 }, 0.72)
      .to(
        "#hero .glass-card",
        { opacity: 1, y: 0, duration: 0.8, stagger: 0.12, clearProps: "transform" },
        0.4
      )
      .call(() => initCounters(document.getElementById("hero")), null, 0.9);
  }

  /* ------------------------------------------------------------------
     11. SCROLL REVEALS (for all sections except hero, which is handled separately)
  ------------------------------------------------------------------ */
  function initScrollReveals() {
    const allReveals = Array.from(document.querySelectorAll("[data-reveal]")).filter(
      (el) => !el.closest("#hero")
    );
    if (!allReveals.length) return;

    if (prefersReducedMotion || !window.gsap || !window.ScrollTrigger) {
      allReveals.forEach((el) => (el.style.opacity = 1));
      return;
    }

    const fromVarsByType = {
      "fade-up": { x: 0, y: 30, scale: 1 },
      "fade-right": { x: -36, y: 0, scale: 1 },
      "fade-left": { x: 36, y: 0, scale: 1 },
      "scale-reveal": { x: 0, y: 18, scale: 0.92 },
    };

    const grouped = {};
    allReveals.forEach((el) => {
      const type = el.getAttribute("data-reveal");
      const key = fromVarsByType[type] ? type : "fade-up"; // safe default for any unlisted value
      (grouped[key] = grouped[key] || []).push(el);
    });

    Object.keys(grouped).forEach((type) => {
      const els = grouped[type];
      const from = fromVarsByType[type];

      gsap.set(els, { opacity: 0, x: from.x, y: from.y, scale: from.scale });

      ScrollTrigger.batch(els, {
        start: "top 88%",
        once: true,
        onEnter: (batch) =>
          gsap.to(batch, {
            opacity: 1,
            x: 0,
            y: 0,
            scale: 1,
            duration: 0.8,
            ease: "power3.out",
            stagger: 0.1,
            clearProps: "transform",
          }),
      });
    });
  }

  /* ------------------------------------------------------------------
     12. STATISTICS COUNTERS — fire when the stats band scrolls into view
     (kept separate from the hero's counter, which fires on load as
     part of the hero entrance timeline).
  ------------------------------------------------------------------ */
  function initStatCounters() {
    const statsSection = document.querySelector(".statistics");
    if (!statsSection) return;

    if (prefersReducedMotion || !window.gsap || !window.ScrollTrigger) {
      initCounters(statsSection);
      return;
    }

    ScrollTrigger.create({
      trigger: statsSection,
      start: "top 80%",
      once: true,
      onEnter: () => initCounters(statsSection),
    });
  }

  /* ------------------------------------------------------------------
     13. CERTIFICATE LIGHTBOX
     Reads each card's own image/name straight from the DOM (single
     source of truth — no duplicated data array to keep in sync), and
     wires open, close, prev/next, Escape, and backdrop-click.
  ------------------------------------------------------------------ */
  function initCertificateLightbox() {
    const cards = Array.from(document.querySelectorAll(".certificate-card"));
    const lightbox = document.getElementById("certLightbox");
    if (!cards.length || !lightbox) return;

    const img = document.getElementById("lightboxImg");
    const indexLabel = document.getElementById("lightboxIndex");
    const nameLabel = document.getElementById("lightboxName");
    const prevBtn = document.getElementById("lightboxPrev");
    const nextBtn = document.getElementById("lightboxNext");
    const closeEls = lightbox.querySelectorAll("[data-close-lightbox]");

    // Build the certificate list once from the cards already in the DOM.
    const certs = cards.map((card) => {
      const thumbImg = card.querySelector(".certificate-thumb img");
      return {
        src: thumbImg ? thumbImg.getAttribute("src") : "",
        alt: thumbImg ? thumbImg.getAttribute("alt") : "",
        name: card.querySelector(".certificate-name")?.textContent.trim() || "",
      };
    });

    let currentIndex = 0;

    function render(index) {
      const cert = certs[index];
      if (!cert) return;
      currentIndex = index;

      if (img) {
        img.src = cert.src || "";
        img.alt = cert.alt || cert.name;
      }
      if (indexLabel) indexLabel.textContent = String(index + 1).padStart(2, "0");
      if (nameLabel) nameLabel.textContent = cert.name;
    }

    function open(index) {
      render(index);
      lightbox.classList.add("is-open");
      lightbox.setAttribute("aria-hidden", "false");
      document.body.classList.add("lightbox-open");
    }

    function close() {
      lightbox.classList.remove("is-open");
      lightbox.setAttribute("aria-hidden", "true");
      document.body.classList.remove("lightbox-open");
    }

    function step(delta) {
      const next = (currentIndex + delta + certs.length) % certs.length;
      render(next);
    }

    cards.forEach((card, i) => {
      card.addEventListener("click", () => open(i));
    });

    closeEls.forEach((el) => el.addEventListener("click", close));

    if (prevBtn) prevBtn.addEventListener("click", () => step(-1));
    if (nextBtn) nextBtn.addEventListener("click", () => step(1));

    document.addEventListener("keydown", (e) => {
      if (!lightbox.classList.contains("is-open")) return;
      if (e.key === "Escape") close();
      if (e.key === "ArrowLeft") step(-1);
      if (e.key === "ArrowRight") step(1);
    });
  }

  /* ------------------------------------------------------------------
     INIT
  ------------------------------------------------------------------ */
  function init() {
    initLenis();
    initNavbar();
    initScrollProgress();
    initCustomCursor();
    initMagneticButtons();
    initHeroSpotlight();
    initTypingAnimation();
    initScrollReveals();
    initStatCounters();
    initCertificateLightbox();

    initLoader().then(() => {
      playHeroEntrance();
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();

  /* ------------------------------------------------------------------
     14. PROJECT PROGRESS BARS — animate the thin bottom-edge fills
         when each dev card scrolls into view.
  ------------------------------------------------------------------ */
  function initProjectProgress() {
    const fills = document.querySelectorAll(".project-dev-progress-fill");
    if (!fills.length) return;

    if (prefersReducedMotion || !window.gsap || !window.ScrollTrigger) {
      fills.forEach((f) => {
        f.style.width = f.dataset.progress + "%";
      });
      return;
    }

    ScrollTrigger.batch(fills, {
      start: "top 90%",
      once: true,
      onEnter: (batch) => {
        batch.forEach((fill) => {
          const target = fill.dataset.progress || 0;
          gsap.to(fill, {
            width: target + "%",
            duration: 1.4,
            ease: "power3.out",
          });
        });
      },
    });
  }

  /* ------------------------------------------------------------------
     15. PROJECT MODAL — reads project data straight from each card's
         DOM (single source of truth), wires open/close/escape/backdrop.
  ------------------------------------------------------------------ */
  function initProjectModal() {
    const modal = document.getElementById("projectModal");
    if (!modal) return;

    const mediaSlot = document.getElementById("modalMedia");
    const badgeSlot = document.getElementById("modalBadge");
    const titleSlot = document.getElementById("modalTitle");
    const descSlot = document.getElementById("modalDesc");
    const stackSlot = document.getElementById("modalStack");
    const metaSlot = document.getElementById("modalMeta");
    const actionsSlot = document.getElementById("modalActions");
    const closeBtns = modal.querySelectorAll("[data-close-project-modal]");

    /* Project metadata not visible in the card — stored in a small
       lookup so the modal can show richer detail without cluttering
       the card UI. */
    const extraData = {
      cloudsync: {
        role: "Full Stack Developer",
        duration: "Jan 2024 — Apr 2024",
        type: "SaaS Platform",
        features: ["Real-time sync", "E2E encryption", "Team workspaces", "Version history", "API access"],
      },
      fintrack: {
        role: "Full Stack Developer",
        duration: "Feb 2025 — Present",
        type: "Analytics Dashboard",
        features: ["Live charts", "Auto-reports", "Multi-currency", "Expense AI categorization"],
      },
      shopverse: {
        role: "Backend Lead",
        duration: "Nov 2024 — Present",
        type: "E-Commerce",
        features: ["Stripe integration", "Inventory CRUD", "Admin panel", "Order tracking"],
      },
      taskflow: {
        role: "Frontend Developer",
        duration: "Jan 2025 — Present",
        type: "Project Management",
        features: ["Kanban boards", "Gantt charts", "Time tracking", "Webhook triggers"],
      },
      medconnect: {
        role: "Full Stack Developer",
        duration: "Mar 2025 — Present",
        type: "Healthcare SaaS",
        features: ["Video calls", "EHR system", "Prescriptions", "Secure messaging"],
      },
      dataviz: {
        role: "Solo Developer",
        duration: "May 2025 — Present",
        type: "Data Visualization",
        features: ["Drag-and-drop builder", "Real-time streaming", "Custom themes", "PDF/CSV export"],
      },
    };

    function openModal(key) {
      const card = document.querySelector(`[data-project="${key}"]`);
      if (!card) return;

      const isFeatured = card.classList.contains("project-card--featured");
      const img = card.querySelector("img");
      const extra = extraData[key] || {};
      const statusBadge = isFeatured
        ? card.querySelector(".project-featured-badge")
        : card.querySelector(".project-dev-status");
      const statusText = statusBadge ? statusBadge.textContent.trim() : "";
      const isCompleted = statusText.includes("Completed");

      /* Media */
      mediaSlot.innerHTML = "";
      if (img && img.src && !img.style.display) {
        const modalImg = document.createElement("img");
        modalImg.src = img.src;
        modalImg.alt = img.alt || "";
        mediaSlot.appendChild(modalImg);
      } else {
        mediaSlot.innerHTML =
          '<div class="project-modal-media-placeholder"><svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1"><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8"/><path d="M12 17v4"/></svg></div>';
      }

      /* Badge */
      badgeSlot.innerHTML = isCompleted
        ? '<span class="project-modal-badge project-modal-badge--completed">● Completed</span>'
        : '<span class="project-modal-badge project-modal-badge--dev">● In Development</span>';

      /* Title */
      const titleEl = isFeatured
        ? card.querySelector(".project-featured-title")
        : card.querySelector(".project-dev-title");
      titleSlot.textContent = titleEl ? titleEl.textContent.trim() : "";

      /* Description */
      const descEl = isFeatured
        ? card.querySelector(".project-featured-desc")
        : card.querySelector(".project-dev-desc");
      descSlot.textContent = descEl ? descEl.textContent.trim() : "";

      /* Stack */
      const stackContainer = isFeatured
        ? card.querySelector(".project-featured-stack")
        : card.querySelector(".project-dev-stack");
      stackSlot.innerHTML = "";
      if (stackContainer) {
        stackContainer.querySelectorAll(".stack-tag").forEach((tag) => {
          const span = document.createElement("span");
          span.className = "stack-tag";
          span.textContent = tag.textContent.trim();
          stackSlot.appendChild(span);
        });
      }

      /* Meta grid */
      let metaHTML = "";
      if (extra.role) {
        metaHTML += `<div><div class="project-modal-meta-label">Role</div><div class="project-modal-meta-value">${extra.role}</div></div>`;
      }
      if (extra.duration) {
        metaHTML += `<div><div class="project-modal-meta-label">Timeline</div><div class="project-modal-meta-value">${extra.duration}</div></div>`;
      }
      if (extra.type) {
        metaHTML += `<div><div class="project-modal-meta-label">Category</div><div class="project-modal-meta-value">${extra.type}</div></div>`;
      }
      if (extra.features) {
        metaHTML += `<div><div class="project-modal-meta-label">Key Features</div><div class="project-modal-meta-value">${extra.features.join(" · ")}</div></div>`;
      }
      metaSlot.innerHTML = metaHTML;

      /* Actions */
      if (isCompleted) {
        actionsSlot.innerHTML = `
          <a href="#" class="btn btn-primary magnetic">
            <svg class="btn-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
            Live Demo
          </a>
          <a href="https://github.com/Devloper-ANIK" class="btn btn-ghost magnetic">
            <svg class="btn-icon" width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/></svg>
            GitHub
          </a>`;
      } else {
        actionsSlot.innerHTML = `
          <a href="#" class="btn btn-ghost magnetic">
            <svg class="btn-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
            Preview Build
          </a>
          <span class="btn btn-ghost" style="opacity:0.4; cursor:not-allowed; pointer-events:none;">
            <svg class="btn-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
            Coming Soon
          </span>`;
      }

      /* Show modal */
      modal.classList.add("is-open");
      modal.setAttribute("aria-hidden", "false");
      document.body.style.overflow = "hidden";

      /* Re-init magnetic for buttons that just appeared in the modal */
      if (typeof initMagneticButtons === "function") initMagneticButtons();
    }

    function closeModal() {
      modal.classList.remove("is-open");
      modal.setAttribute("aria-hidden", "true");
      document.body.style.overflow = "";
    }

    /* Wire open buttons */
    document.querySelectorAll("[data-open-project-modal]").forEach((btn) => {
      btn.addEventListener("click", () => {
        openModal(btn.dataset.openProjectModal);
      });
    });

    /* Wire close */
    closeBtns.forEach((el) => el.addEventListener("click", closeModal));

    /* Escape key */
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && modal.classList.contains("is-open")) closeModal();
    });
  }

/* Contact Form Handling */

// ===============================
// EMAILJS INITIALIZE
// ===============================
emailjs.init({
    publicKey: "k8-ESZ2cGaa8Gjpzz"
});

// ===============================
// DOM ELEMENTS
// ===============================
const contactForm = document.getElementById("contactForm");
const submitBtn = document.querySelector(".form-submit");
const submitLabel = document.getElementById("formSubmitLabel");
const formNote = document.getElementById("formNote");

// ===============================
// FORM SUBMIT
// ===============================
contactForm.addEventListener("submit", async function (e) {
    e.preventDefault();

    if (!contactForm.checkValidity()) {
        contactForm.reportValidity();
        return;
    }

    submitBtn.disabled = true;
    submitLabel.textContent = "Sending...";
    formNote.textContent = "";

    const templateParams = {
        name: document.getElementById("formName").value.trim(),
        subject: document.getElementById("formPhone").value.trim(),
        email: document.getElementById("formEmail").value.trim(),
        message: document.getElementById("formMessage").value.trim()
    };

    try {

        await emailjs.send(
            "service_5jrgwpr",
            "template_ajdit7w",
            templateParams
        );

        showPopup(
            "✅ Message Sent Successfully!",
            "#22c55e"
        );

        formNote.textContent = "Thank you! Your message has been sent successfully.";
        formNote.style.color = "#22c55e";

        contactForm.reset();

    } catch (error) {

        console.error(error);

        showPopup(
            "❌ Failed to Send Message!",
            "#ef4444"
        );

        formNote.textContent = "Something went wrong. Please try again.";
        formNote.style.color = "#ef4444";

    } finally {

        submitBtn.disabled = false;
        submitLabel.textContent = "Send Message";

    }
});

// ===============================
// POPUP FUNCTION
// ===============================
function showPopup(message, color) {

    const popup = document.createElement("div");

    popup.innerHTML = `
        <div style="
            display:flex;
            align-items:center;
            gap:12px;
        ">
            <span style="font-size:22px;">${message.split(" ")[0]}</span>
            <span>${message.substring(2)}</span>
        </div>
    `;

    popup.style.position = "fixed";
    popup.style.top = "30px";
    popup.style.right = "30px";
    popup.style.minWidth = "320px";
    popup.style.maxWidth = "400px";
    popup.style.padding = "18px 22px";
    popup.style.background = "rgba(18,18,18,.85)";
    popup.style.backdropFilter = "blur(16px)";
    popup.style.border = `1px solid ${color}`;
    popup.style.color = "#ffffff";
    popup.style.borderRadius = "14px";
    popup.style.boxShadow = "0 20px 50px rgba(0,0,0,.35)";
    popup.style.fontFamily = "Poppins, sans-serif";
    popup.style.fontWeight = "600";
    popup.style.fontSize = "15px";
    popup.style.zIndex = "999999";
    popup.style.opacity = "0";
    popup.style.transform = "translateX(120%)";
    popup.style.transition = ".4s ease";

    document.body.appendChild(popup);

    requestAnimationFrame(() => {
        popup.style.opacity = "1";
        popup.style.transform = "translateX(0)";
    });

    setTimeout(() => {

        popup.style.opacity = "0";
        popup.style.transform = "translateX(120%)";

        setTimeout(() => {
            popup.remove();
        }, 400);

    }, 3500);
}