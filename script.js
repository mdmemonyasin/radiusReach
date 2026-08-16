/* ============================================================
   radiusReach — script.js
   ============================================================ */

/* ------------------------------------------------------------
   CONFIG — EDIT THESE VALUES
   These sample values make the site look complete out of the box.
   Replace with the real ones before going live.
   ------------------------------------------------------------ */
const CONFIG = {
  // WhatsApp number in international format, digits only (no +, spaces or dashes)
  WHATSAPP_NUMBER: "916264357763",
  // Phone number for tel: links (human-readable, may include + and spaces)
  PHONE: "+91 62643 57763",
  // Contact email
  EMAIL: "admin@radiusreach.in",
  // Form endpoint (e.g. Formspree / Netlify / Google Form). Leave "" to use the
  // built-in demo success state (no real network submit).
  FORM_ENDPOINT: "",
  // "From" price anchors for Online Presence (clearly a starting point)
  WEBSITE_FROM: "₹14,999",
  SEO_FROM: "₹4,999/mo",
  // WhatsApp prefilled message (warm)
  WHATSAPP_PREFILL: "Hi radiusReach 👋 I'd like to know more about getting more leads.",
};

(function () {
  "use strict";

  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

  /* ---------- Wire CONFIG into the DOM ---------- */
  function wireConfig() {
    const waHref = `https://wa.me/${CONFIG.WHATSAPP_NUMBER}?text=${encodeURIComponent(CONFIG.WHATSAPP_PREFILL)}`;
    const telHref = `tel:${CONFIG.PHONE.replace(/[^\d+]/g, "")}`;
    const mailHref = `mailto:${CONFIG.EMAIL}`;

    $$("[data-whatsapp]").forEach((el) => {
      el.setAttribute("href", waHref);
      el.setAttribute("target", "_blank");
      el.setAttribute("rel", "noopener");
    });
    $$("[data-call]").forEach((el) => el.setAttribute("href", telHref));
    $$("[data-email]").forEach((el) => {
      el.setAttribute("href", mailHref);
      // Only overwrite text for pure email links (not icon buttons with aria-label)
      if (el.textContent.includes("@") || el.dataset.emailText === "true") {
        el.textContent = CONFIG.EMAIL;
      }
    });
    $$("[data-website-from]").forEach((el) => (el.textContent = CONFIG.WEBSITE_FROM));
    $$("[data-seo-from]").forEach((el) => (el.textContent = CONFIG.SEO_FROM));
  }

  /* ---------- Sticky nav: transparent -> blur ---------- */
  function initNavScroll() {
    const nav = $("[data-nav]");
    if (!nav) return;
    const sentinel = document.createElement("div");
    sentinel.style.cssText = "position:absolute;top:16px;height:1px;width:1px;pointer-events:none;";
    document.body.prepend(sentinel);
    const io = new IntersectionObserver(
      ([entry]) => nav.classList.toggle("is-scrolled", !entry.isIntersecting),
      { threshold: 0 }
    );
    io.observe(sentinel);
  }

  /* ---------- Active link highlight ---------- */
  function initActiveLinks() {
    const links = $$("[data-navlink]");
    if (!links.length) return;
    const map = {};
    links.forEach((l) => {
      const id = l.getAttribute("href").slice(1);
      map[id] = l;
    });
    const sections = Object.keys(map)
      .map((id) => document.getElementById(id))
      .filter(Boolean);
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            links.forEach((l) => l.classList.remove("is-active"));
            const active = map[e.target.id];
            if (active) active.classList.add("is-active");
          }
        });
      },
      { rootMargin: "-45% 0px -50% 0px", threshold: 0 }
    );
    sections.forEach((s) => io.observe(s));
  }

  /* ---------- Mobile menu ---------- */
  function initMobileMenu() {
    const toggle = $("#navToggle");
    const menu = $("#mobileMenu");
    if (!toggle || !menu) return;

    let lastFocus = null;
    const focusable = () =>
      $$('a[href], button:not([disabled])', menu);

    function open() {
      menu.classList.add("is-open");
      menu.setAttribute("aria-hidden", "false");
      toggle.setAttribute("aria-expanded", "true");
      toggle.setAttribute("aria-label", "Close menu");
      document.body.style.overflow = "hidden";
      lastFocus = document.activeElement;
      const f = focusable();
      if (f.length) f[0].focus();
    }
    function close() {
      menu.classList.remove("is-open");
      menu.setAttribute("aria-hidden", "true");
      toggle.setAttribute("aria-expanded", "false");
      toggle.setAttribute("aria-label", "Open menu");
      document.body.style.overflow = "";
      if (lastFocus) lastFocus.focus();
    }
    toggle.addEventListener("click", () =>
      menu.classList.contains("is-open") ? close() : open()
    );
    $$("[data-mobilelink]", menu).forEach((l) => l.addEventListener("click", close));

    document.addEventListener("keydown", (e) => {
      if (!menu.classList.contains("is-open")) return;
      if (e.key === "Escape") { close(); return; }
      if (e.key === "Tab") {
        const f = focusable();
        if (!f.length) return;
        const first = f[0], last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    });
  }

  /* ---------- Smooth anchor scroll ---------- */
  function initSmoothScroll() {
    $$('a[href^="#"]').forEach((a) => {
      a.addEventListener("click", (e) => {
        const id = a.getAttribute("href");
        if (id === "#" || id.length < 2) return;
        const target = document.querySelector(id);
        if (!target) return;
        e.preventDefault();
        target.scrollIntoView({ behavior: prefersReducedMotion ? "auto" : "smooth", block: "start" });
        // move focus for a11y
        target.setAttribute("tabindex", "-1");
        target.focus({ preventScroll: true });
      });
    });
  }

  /* ---------- Scroll reveal ---------- */
  function initReveal() {
    const els = $$(".reveal");
    if (prefersReducedMotion || !("IntersectionObserver" in window)) {
      els.forEach((el) => el.classList.add("is-visible"));
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e, i) => {
          if (e.isIntersecting) {
            const siblings = Array.from(e.target.parentElement ? e.target.parentElement.children : [])
              .filter((c) => c.classList.contains("reveal"));
            const idx = siblings.indexOf(e.target);
            e.target.style.transitionDelay = (idx > 0 ? Math.min(idx, 6) * 70 : 0) + "ms";
            e.target.classList.add("is-visible");
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.15 }
    );
    els.forEach((el) => io.observe(el));
  }

  /* ---------- Count-up ---------- */
  function initCountUp() {
    const nums = $$("[data-countup]");
    if (!nums.length) return;
    if (prefersReducedMotion || !("IntersectionObserver" in window)) return; // keep final text

    function animate(el) {
      const target = parseFloat(el.dataset.target || "0");
      const dur = 900;
      const start = performance.now();
      const format = (n) => Math.round(n).toLocaleString("en-IN");
      function frame(now) {
        const p = Math.min((now - start) / dur, 1);
        const eased = 1 - Math.pow(1 - p, 3);
        el.textContent = format(target * eased);
        if (p < 1) requestAnimationFrame(frame);
        else el.textContent = format(target);
      }
      requestAnimationFrame(frame);
    }

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) { animate(e.target); io.unobserve(e.target); }
        });
      },
      { threshold: 0.5 }
    );
    nums.forEach((n) => io.observe(n));
  }

  /* ---------- Process thread draw ---------- */
  function initProcess() {
    const steps = $("[data-steps]");
    if (!steps) return;
    if (prefersReducedMotion || !("IntersectionObserver" in window)) { steps.classList.add("is-drawn"); return; }
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) { steps.classList.add("is-drawn"); io.unobserve(steps); }
        });
      },
      { threshold: 0.3 }
    );
    io.observe(steps);
  }

  /* ---------- FAQ accordion ---------- */
  function initAccordion() {
    const acc = $("[data-accordion]");
    if (!acc) return;
    const btns = $$(".acc-item__btn", acc);
    btns.forEach((btn) => {
      const panel = document.getElementById(btn.getAttribute("aria-controls"));
      // init open state
      if (btn.getAttribute("aria-expanded") === "true" && panel) {
        panel.style.maxHeight = panel.scrollHeight + "px";
      }
      btn.addEventListener("click", () => {
        const isOpen = btn.getAttribute("aria-expanded") === "true";
        // close all (one at a time)
        btns.forEach((b) => {
          const p = document.getElementById(b.getAttribute("aria-controls"));
          b.setAttribute("aria-expanded", "false");
          if (p) p.style.maxHeight = "0px";
        });
        if (!isOpen) {
          btn.setAttribute("aria-expanded", "true");
          if (panel) panel.style.maxHeight = panel.scrollHeight + "px";
        }
      });
    });
    // recalc open panel height on resize
    window.addEventListener("resize", () => {
      btns.forEach((b) => {
        if (b.getAttribute("aria-expanded") === "true") {
          const p = document.getElementById(b.getAttribute("aria-controls"));
          if (p) p.style.maxHeight = p.scrollHeight + "px";
        }
      });
    });
  }

  /* ---------- Lead form ---------- */
  function initForm() {
    const form = $("#leadForm");
    const success = $("#formSuccess");
    if (!form) return;

    const validators = {
      name: (v) => (v.trim().length >= 2 ? "" : "Please enter your name."),
      phone: (v) => (/^[0-9+ ()\-]{7,}$/.test(v.trim()) ? "" : "Please enter a valid phone number."),
      need: (v) => (v ? "" : "Please choose an option."),
      consent: (v, el) => (el.checked ? "" : "Please agree to be contacted."),
    };

    function validateField(el) {
      const name = el.name;
      if (!validators[name]) return true;
      const msg = validators[name](el.value, el);
      const field = el.closest(".field");
      const err = field ? field.querySelector(".field__error") : null;
      if (msg) {
        field && field.classList.add("has-error");
        if (err) err.textContent = msg;
        el.setAttribute("aria-invalid", "true");
        return false;
      }
      field && field.classList.remove("has-error");
      if (err) err.textContent = "";
      el.removeAttribute("aria-invalid");
      return true;
    }

    // validate on blur / change
    ["name", "phone", "need", "consent"].forEach((n) => {
      const el = form.elements[n];
      if (!el) return;
      const evt = el.type === "checkbox" || el.tagName === "SELECT" ? "change" : "blur";
      el.addEventListener(evt, () => validateField(el));
    });

    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      let ok = true;
      let firstBad = null;
      ["name", "phone", "need", "consent"].forEach((n) => {
        const el = form.elements[n];
        if (el && !validateField(el)) { ok = false; if (!firstBad) firstBad = el; }
      });
      if (!ok) { if (firstBad) firstBad.focus(); return; }

      const submitBtn = form.querySelector('button[type="submit"]');
      const originalLabel = submitBtn.textContent;
      submitBtn.disabled = true;
      submitBtn.textContent = "Sending…";

      const showSuccess = () => {
        form.hidden = true;
        if (success) {
          success.hidden = false;
          success.focus && success.setAttribute("tabindex", "-1");
          success.scrollIntoView({ behavior: prefersReducedMotion ? "auto" : "smooth", block: "center" });
        }
      };

      if (CONFIG.FORM_ENDPOINT) {
        try {
          const data = new FormData(form);
          const res = await fetch(CONFIG.FORM_ENDPOINT, {
            method: "POST",
            body: data,
            headers: { Accept: "application/json" },
          });
          if (res.ok) { showSuccess(); }
          else { throw new Error("Bad response"); }
        } catch (err) {
          submitBtn.disabled = false;
          submitBtn.textContent = originalLabel;
          alert("Sorry, something went wrong. Please WhatsApp us instead.");
        }
      } else {
        // Demo mode: no backend wired
        setTimeout(showSuccess, prefersReducedMotion ? 0 : 500);
      }
    });
  }

  /* ---------- Init ---------- */
  function init() {
    wireConfig();
    initNavScroll();
    initActiveLinks();
    initMobileMenu();
    initSmoothScroll();
    initReveal();
    initCountUp();
    initProcess();
    initAccordion();
    initForm();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
