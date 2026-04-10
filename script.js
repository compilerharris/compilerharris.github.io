/* eslint-disable no-undef */
(() => {
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  const EMAIL = "compilerharris@gmail.com";

  function setRipplePosition(e) {
    const el = e.currentTarget;
    const r = el.getBoundingClientRect();
    el.style.setProperty("--x", `${e.clientX - r.left}px`);
    el.style.setProperty("--y", `${e.clientY - r.top}px`);
  }

  function initRipple() {
    $$(".ripple").forEach((el) => {
      el.addEventListener("pointermove", setRipplePosition);
    });
  }

  function initIcons() {
    if (window.lucide?.createIcons) window.lucide.createIcons();
  }

  function prefersReducedMotion() {
    return window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches ?? false;
  }

  function initYear() {
    const y = $("#year");
    if (y) y.textContent = String(new Date().getFullYear());
  }

  function initTheme() {
    const root = document.documentElement;
    const btn = $("#themeToggle");
    const btnMobile = $("#themeToggleMobile");

    const saved = localStorage.getItem("theme");
    if (saved === "light") root.classList.remove("dark");
    if (saved === "dark") root.classList.add("dark");

    const applyIcon = () => {
      const isDark = root.classList.contains("dark");
      const icon = btn?.querySelector("[data-lucide]");
      if (icon) icon.setAttribute("data-lucide", isDark ? "moon" : "sun");
      initIcons();
    };

    const toggle = () => {
      root.classList.toggle("dark");
      localStorage.setItem("theme", root.classList.contains("dark") ? "dark" : "light");
      applyIcon();
    };

    btn?.addEventListener("click", toggle);
    btnMobile?.addEventListener("click", toggle);
    applyIcon();
  }

  function initMobileMenu() {
    const btn = $("#mobileMenuBtn");
    const menu = $("#mobileMenu");
    if (!btn || !menu) return;

    const setOpen = (open) => {
      btn.setAttribute("aria-expanded", open ? "true" : "false");
      menu.classList.toggle("hidden", !open);
      btn.setAttribute("aria-label", open ? "Close menu" : "Open menu");
      const i = btn.querySelector("[data-lucide]");
      if (i) i.setAttribute("data-lucide", open ? "x" : "menu");
      initIcons();
    };

    btn.addEventListener("click", () => setOpen(btn.getAttribute("aria-expanded") !== "true"));
    $$(".nav-link--mobile", menu).forEach((a) =>
      a.addEventListener("click", () => {
        setOpen(false);
      }),
    );
  }

  function initScrollProgress() {
    const bar = $("#scrollProgress");
    if (!bar) return;

    const update = () => {
      const scrollTop = window.scrollY || document.documentElement.scrollTop || 0;
      const docH = document.documentElement.scrollHeight - window.innerHeight;
      const p = docH > 0 ? Math.min(1, Math.max(0, scrollTop / docH)) : 0;
      bar.style.width = `${p * 100}%`;
    };

    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
  }

  function initActiveNav() {
    const links = $$(".nav-link").filter((a) => a.getAttribute("href")?.startsWith("#"));
    const ids = ["about", "skills", "experience", "projects", "contact", "home"];
    const sections = ids.map((id) => document.getElementById(id)).filter(Boolean);
    if (!links.length || !sections.length) return;

    const setActive = (id) => {
      links.forEach((a) => {
        const match = a.getAttribute("href") === `#${id}`;
        a.classList.toggle("is-active", match);
      });
    };

    const header = $("#siteHeader");
    const headerOffset = () => (header ? header.getBoundingClientRect().height : 72);

    const obs = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => (b.intersectionRatio || 0) - (a.intersectionRatio || 0))[0];
        if (visible?.target?.id) setActive(visible.target.id);
      },
      {
        root: null,
        threshold: [0.2, 0.35, 0.5, 0.65],
        rootMargin: `-${headerOffset()}px 0px -55% 0px`,
      },
    );

    sections.forEach((s) => obs.observe(s));
    setActive("home");
  }

  function initTyping() {
    const el = $("#typingRole");
    if (!el) return;

    const roles = ["Technical Lead", "Full Stack Developer", "AI Automation Builder"];
    const reduced = prefersReducedMotion();
    if (reduced) {
      el.textContent = roles[0];
      return;
    }

    let idx = 0;
    let char = 0;
    let deleting = false;
    let last = performance.now();

    const speed = () => (deleting ? 28 : 42);
    const pause = () => (deleting ? 380 : 700);

    function tick(now) {
      const dt = now - last;
      const role = roles[idx];

      if (dt >= speed()) {
        last = now;
        if (!deleting) {
          char = Math.min(role.length, char + 1);
          el.textContent = role.slice(0, char);
          if (char === role.length) {
            deleting = true;
            last = now + pause();
          }
        } else {
          char = Math.max(0, char - 1);
          el.textContent = role.slice(0, char);
          if (char === 0) {
            deleting = false;
            idx = (idx + 1) % roles.length;
            last = now + 120;
          }
        }
      }
      requestAnimationFrame(tick);
    }

    requestAnimationFrame(tick);
  }

  function initExperienceToggles() {
    $$(".exp-toggle").forEach((btn) => {
      btn.addEventListener("click", () => {
        const card = btn.closest(".timeline-card");
        const body = card?.querySelector(".exp-body");
        if (!body) return;
        const open = btn.getAttribute("aria-expanded") === "true";
        btn.setAttribute("aria-expanded", open ? "false" : "true");
        body.classList.toggle("hidden", open);

        const icon = btn.querySelector("[data-lucide]");
        if (icon) icon.setAttribute("data-lucide", open ? "chevron-down" : "chevron-up");
        initIcons();

        if (!prefersReducedMotion() && window.gsap) {
          gsap.fromTo(
            body,
            { opacity: 0, y: -6 },
            { opacity: 1, y: 0, duration: 0.22, ease: "power2.out" },
          );
        }
      });
    });
  }

  function initContactForm() {
    const form = $("#contactForm");
    if (!form) return;

    const toast = $("#contactToast");
    const copyBtn = $("#copyEmailBtn");

    const showToast = (text) => {
      if (!toast) return;
      toast.textContent = text;
      toast.classList.remove("hidden");
      window.clearTimeout(showToast._t);
      showToast._t = window.setTimeout(() => toast.classList.add("hidden"), 1400);
    };

    copyBtn?.addEventListener("click", async () => {
      try {
        await navigator.clipboard.writeText(EMAIL);
        showToast("Email copied.");
      } catch {
        showToast("Copy failed.");
      }
    });

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const fd = new FormData(form);
      const name = String(fd.get("name") || "").trim();
      const email = String(fd.get("email") || "").trim();
      const subject = String(fd.get("subject") || "").trim();
      const message = String(fd.get("message") || "").trim();

      const body = [`Name: ${name}`, `Email: ${email}`, "", message].join("\n");
      const mailto = `mailto:${encodeURIComponent(EMAIL)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      window.location.href = mailto;
    });
  }

  function initGsap() {
    if (!window.gsap || prefersReducedMotion()) return;
    gsap.registerPlugin(ScrollTrigger);

    // Subtle ambient blob drift
    gsap.to(".blob-a", { x: 40, y: 20, duration: 8, ease: "sine.inOut", yoyo: true, repeat: -1 });
    gsap.to(".blob-b", { x: -35, y: -10, duration: 9, ease: "sine.inOut", yoyo: true, repeat: -1 });

    // Reveal animations (Framer-ish)
    gsap.set(".reveal", { opacity: 0, y: 18 });
    $$(".reveal").forEach((el) => {
      gsap.to(el, {
        opacity: 1,
        y: 0,
        duration: 0.7,
        ease: "power3.out",
        scrollTrigger: { trigger: el, start: "top 84%" },
      });
    });

    // Stagger projects
    const projectCards = $$(".project-card");
    if (projectCards.length) {
      gsap.fromTo(
        projectCards,
        { opacity: 0, y: 16 },
        {
          opacity: 1,
          y: 0,
          duration: 0.7,
          ease: "power3.out",
          stagger: 0.08,
          scrollTrigger: { trigger: "#projects", start: "top 70%" },
        },
      );
    }

    // Skills bars
    const skills = $$(".skill");
    if (skills.length) {
      skills.forEach((s) => {
        const v = Number(s.dataset.skill || 0);
        const bar = $(".skill-bar", s);
        if (!bar) return;
        ScrollTrigger.create({
          trigger: s,
          start: "top 85%",
          once: true,
          onEnter: () => {
            gsap.to(bar, { width: `${v}%`, duration: 0.9, ease: "power3.out" });
          },
        });
      });
    }
  }

  function initFallbackRevealsIfNoGsap() {
    if (window.gsap || prefersReducedMotion()) return;
    const els = $$(".reveal");
    els.forEach((el) => {
      el.style.opacity = "0";
      el.style.transform = "translateY(18px)";
      el.style.transition = "opacity 700ms ease, transform 700ms ease";
    });

    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (!e.isIntersecting) return;
          e.target.style.opacity = "1";
          e.target.style.transform = "translateY(0)";
          obs.unobserve(e.target);
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -10% 0px" },
    );
    els.forEach((el) => obs.observe(el));
  }

  // Init
  function boot() {
    initIcons();
    initRipple();
    initYear();
    initTheme();
    initMobileMenu();
    initScrollProgress();
    initActiveNav();
    initTyping();
    initExperienceToggles();
    initContactForm();
    initGsap();
    initFallbackRevealsIfNoGsap();
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();

