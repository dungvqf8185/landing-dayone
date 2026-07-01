(function () {
  /* ── Theme toggle ── */
  var KEY = "dayone-landing-theme";
  var html = document.documentElement;
  var btnSun = document.getElementById("btn-sun");
  var btnMoon = document.getElementById("btn-moon");
  var btnMonitor = document.getElementById("btn-monitor");
  var ACTIVE = "theme-btn-active";

  function applyTheme(theme) {
    localStorage.setItem(KEY, theme);
    if (theme === "dark") {
      html.classList.add("dark");
    } else if (theme === "light") {
      html.classList.remove("dark");
    } else {
      if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
        html.classList.add("dark");
      } else {
        html.classList.remove("dark");
      }
    }
    btnSun.classList.toggle(ACTIVE, theme === "light");
    btnMoon.classList.toggle(ACTIVE, theme === "dark");
    btnMonitor.classList.toggle(ACTIVE, theme === "system");
  }

  var saved = localStorage.getItem(KEY) || "system";
  applyTheme(saved);

  function onThemeClick(theme) {
    return function () {
      if (localStorage.getItem(KEY) === theme) return;
      applyTheme(theme);
    };
  }

  btnSun.addEventListener("click", onThemeClick("light"));
  btnMoon.addEventListener("click", onThemeClick("dark"));
  btnMonitor.addEventListener("click", onThemeClick("system"));

  window
    .matchMedia("(prefers-color-scheme: dark)")
    .addEventListener("change", function () {
      if (
        !localStorage.getItem(KEY) ||
        localStorage.getItem(KEY) === "system"
      ) {
        applyTheme("system");
      }
    });

  /* ── Scroll reveal via IntersectionObserver ── */
  var revealObserver = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          revealObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12 },
  );

  document.querySelectorAll(".reveal, .reveal-scale").forEach(function (el) {
    revealObserver.observe(el);
  });

  /* ── Staggered reveal for bento cells ── */
  var staggerObserver = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          var children = entry.target.querySelectorAll(".stagger-item");
          children.forEach(function (child, i) {
            setTimeout(function () {
              child.classList.add("is-visible");
            }, i * 100);
          });
          staggerObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.1 },
  );

  document.querySelectorAll(".stagger-group").forEach(function (el) {
    staggerObserver.observe(el);
  });

  /* ── Magnetic tilt on character cards ── */
  document.querySelectorAll(".char-card").forEach(function (card) {
    var inner = card.querySelector(".char-card-inner") || card;

    card.addEventListener("mousemove", function (e) {
      var rect = card.getBoundingClientRect();
      var x = (e.clientX - rect.left) / rect.width - 0.5;
      var y = (e.clientY - rect.top) / rect.height - 0.5;
      inner.style.transform =
        "perspective(600px) rotateY(" +
        x * 8 +
        "deg) rotateX(" +
        -y * 8 +
        "deg) translateZ(10px)";
    });

    card.addEventListener("mouseleave", function () {
      inner.style.transform =
        "perspective(600px) rotateY(0deg) rotateX(0deg) translateZ(0)";
    });
  });

  /* ── Glow card cursor tracking ── */
  document.querySelectorAll(".glow-card").forEach(function (card) {
    card.addEventListener("mousemove", function (e) {
      var rect = card.getBoundingClientRect();
      var x = e.clientX - rect.left;
      var y = e.clientY - rect.top;
      card.style.setProperty("--mx", x + "px");
      card.style.setProperty("--my", y + "px");
    });
  });

  /* ── prefers-reduced-motion check ── */
  var reduceMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;

  /* ── GSAP / ScrollTrigger ── */
  function initStickyStack(gsap, ScrollTrigger) {
    var cards = gsap.utils.toArray(".stack-card");
    if (cards.length < 2) return;

    cards.forEach(function (card, i) {
      if (i === cards.length - 1) return;
      ScrollTrigger.create({
        trigger: card,
        start: "top top",
        endTrigger: cards[cards.length - 1],
        end: "top top",
        pin: true,
        pinSpacing: false,
      });
    });

    cards.forEach(function (card, i) {
      if (i === cards.length - 1) return;
      gsap.to(card, {
        scale: 0.78,
        opacity: 0.2,
        filter: "blur(4px)",
        ease: "none",
        scrollTrigger: {
          trigger: cards[i + 1],
          start: "top bottom",
          end: "top top",
          scrub: true,
        },
      });
    });
  }

  function initParallax(gsap) {
    var heroChars = document.querySelectorAll(".hero-character");
    if (!heroChars.length) return;

    heroChars.forEach(function (el, i) {
      gsap.to(el, {
        y: i === 0 ? 30 : -20,
        ease: "none",
        scrollTrigger: {
          trigger: ".hero-split",
          start: "top top",
          end: "bottom top",
          scrub: 1.5,
        },
      });
    });
  }

  function initGSAP() {
    if (reduceMotion) return;
    if (
      typeof window.gsap === "undefined" ||
      typeof window.ScrollTrigger === "undefined"
    )
      return;

    var gsap = window.gsap;
    var ScrollTrigger = window.ScrollTrigger;

    // Register một lần duy nhất, trước khi gọi bất kỳ hàm nào dùng ScrollTrigger
    gsap.registerPlugin(ScrollTrigger);

    initStickyStack(gsap, ScrollTrigger);
    initParallax(gsap);
  }

  if (document.readyState === "complete") {
    initGSAP();
  } else {
    window.addEventListener("load", initGSAP);
  }

  /* ── Count-up for stats (simple CSS-based reveal) ── */
  var statsObserver = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          statsObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.5 },
  );

  document.querySelectorAll(".stats-grid").forEach(function (el) {
    statsObserver.observe(el);
  });

  /* ── Drawer menu toggle ── */
  var drawerOpen = false;
  var menuToggle = document.getElementById("menu-toggle");
  var drawerClose = document.getElementById("drawer-close");
  var drawerOverlay = document.getElementById("drawer-overlay");
  var drawerMenu = document.getElementById("drawer-menu");
  var body = document.body;

  function openDrawer() {
    if (drawerOpen) return;
    drawerOpen = true;
    body.classList.add("drawer-open");
  }

  function closeDrawer() {
    if (!drawerOpen) return;
    drawerOpen = false;
    body.classList.remove("drawer-open");
  }

  if (menuToggle && drawerClose && drawerOverlay && drawerMenu) {
    menuToggle.addEventListener("click", openDrawer);
    drawerClose.addEventListener("click", closeDrawer);
    drawerOverlay.addEventListener("click", closeDrawer);
    drawerMenu.querySelectorAll("nav a").forEach(function (link) {
      link.addEventListener("click", closeDrawer);
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && drawerOpen) closeDrawer();
    });
  }

  /* ── Scroll to top ── */
  var scrollBtn = document.getElementById("scroll-top");
  if (scrollBtn) {
    window.addEventListener("scroll", function () {
      if (window.scrollY > 300) {
        scrollBtn.classList.remove("opacity-0", "translate-y-4", "pointer-events-none");
      } else {
        scrollBtn.classList.add("opacity-0", "translate-y-4", "pointer-events-none");
      }
    });
    scrollBtn.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  /* ── Live2D Hiyori ── */
  (function initLive2D() {
    var canvas = document.getElementById("live2d-canvas");
    if (!canvas) return;
    var host = canvas.parentElement;
    if (!host) return;

    Promise.all([
      import("pixi.js"),
      import("pixi-live2d-display/cubism4"),
    ]).then(function (modules) {
      var PIXI = modules[0].default || modules[0];
      var Live2DModel = modules[1].Live2DModel;

      var dpr = Math.min(window.devicePixelRatio || 1, 2);
      var rect = host.getBoundingClientRect();

      var app;
      try {
        app = new PIXI.Application({
          view: canvas,
          backgroundAlpha: 0,
          autoDensity: true,
          resolution: dpr,
          width: Math.max(1, Math.round(rect.width)),
          height: Math.max(1, Math.round(rect.height)),
        });
      } catch (err) {
        console.warn("WebGL unavailable, falling back to Canvas:", err);
        app = new PIXI.Application({
          view: canvas,
          backgroundAlpha: 0,
          forceCanvas: true,
          autoDensity: true,
          resolution: dpr,
          width: Math.max(1, Math.round(rect.width)),
          height: Math.max(1, Math.round(rect.height)),
        });
      }

      Live2DModel.registerTicker(PIXI.Ticker);

      /* ── Throttle 30fps thay vì 60fps ── */
      app.ticker.speed = 0.5;

      /* ── Pause ticker khi canvas ra khỏi viewport ── */
      var visibilityObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          app.ticker.speed = entry.isIntersecting ? 0.5 : 0;
        });
      });
      visibilityObserver.observe(canvas);

      Live2DModel.from("./assets/Hiyori/Hiyori.model3.json", {
        autoInteract: false,
      }).then(function (model) {
        var modelBaseSize = (function resolve(model) {
          var w = model.internalModel && model.internalModel.width;
          var h = model.internalModel && model.internalModel.height;
          if (w && h) return { width: w, height: h };
          var bounds = model.getLocalBounds && model.getLocalBounds();
          if (bounds && bounds.width && bounds.height)
            return { width: bounds.width, height: bounds.height };
          return { width: model.width || 1, height: model.height || 1 };
        })(model);

        function fitModel() {
          var w = app.screen.width;
          var h = app.screen.height;
          if (!w || !h || !modelBaseSize) return;
          model.anchor.set(0.5, 0.5);
          model.position.set(w / 2, h / 2 - 40);
          var scaleX = w / modelBaseSize.width;
          var scaleY = h / modelBaseSize.height;
          model.scale.set(Math.min(scaleX, scaleY) * 0.95);
        }

        /* ── Resize thủ công qua ResizeObserver (giống desktop) ── */
        var resizeRaf;
        var prevW = -1;
        var prevH = -1;
        function queueResize() {
          if (resizeRaf) return;
          resizeRaf = window.requestAnimationFrame(function () {
            resizeRaf = null;
            var r = host.getBoundingClientRect();
            var w = Math.round(r.width);
            var h = Math.round(r.height);
            if (w <= 0 || h <= 0) return;
            if (w === prevW && h === prevH) return;
            prevW = w;
            prevH = h;
            app.renderer.resize(w, h);
            fitModel();
          });
        }

        var resizeObserver = new ResizeObserver(queueResize);
        resizeObserver.observe(host);

        fitModel();
        app.stage.addChild(model);

        /* ── Idle motion chain ── */
        var idleTimer;

        function scheduleIdle() {
          clearTimeout(idleTimer);
          idleTimer = setTimeout(function () {
            model.motion("Idle", Math.floor(Math.random() * 9));
          }, 3000 + Math.random() * 4000);
        }

        model.on("motionFinish", scheduleIdle);
        model.motion("Idle", Math.floor(Math.random() * 9));

        canvas.addEventListener("mouseenter", function () {
          clearTimeout(idleTimer);
          model.motion("Idle", Math.floor(Math.random() * 9));
        });

        model.on("hit", function (hitAreas) {
          if (hitAreas.indexOf("Body") !== -1) {
            model.motion("TapBody", 0);
          }
        });

        /* ── Disable mouseenter for idle reset ── */
        canvas.style.cursor = "pointer";
      });
    });
  })();
})();
