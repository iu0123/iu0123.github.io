(function () {
  "use strict";

  var $ = function (sel, root) { return (root || document).querySelector(sel); };
  var $$ = function (sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); };

  /* ---------------- Mobile menu ---------------- */
  var menuBtn = $("#menuBtn");
  var nav = $("#nav");

  function setMenu(open) {
    if (!menuBtn || !nav) return;
    nav.classList.toggle("open", open);
    menuBtn.setAttribute("aria-expanded", String(open));
  }

  if (menuBtn && nav) {
    menuBtn.addEventListener("click", function () {
      setMenu(menuBtn.getAttribute("aria-expanded") !== "true");
    });

    $$("a", nav).forEach(function (link) {
      link.addEventListener("click", function () { setMenu(false); });
    });

    document.addEventListener("click", function (e) {
      if (!nav.classList.contains("open")) return;
      if (nav.contains(e.target) || menuBtn.contains(e.target)) return;
      setMenu(false);
    });

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") setMenu(false);
    });
  }

  /* ---------------- Interview mode ---------------- */
  var interviewToggle = $("#interviewToggle");
  var interviewBanner = $("#interviewBanner");
  var bannerClose = $("#bannerClose");
  var storageKey = "zy-interview-mode";

  function readInterviewMode() {
    try { return localStorage.getItem(storageKey) === "1"; } catch (e) { return false; }
  }

  function writeInterviewMode(on) {
    try { localStorage.setItem(storageKey, on ? "1" : "0"); } catch (e) { /* file:// may block */ }
  }

  function setInterviewMode(on) {
    document.body.classList.toggle("interview-mode", on);
    if (interviewToggle) {
      interviewToggle.setAttribute("aria-pressed", String(on));
      var label = $(".toggle-label", interviewToggle);
      if (label) label.textContent = on ? "面试模式：开" : "面试模式";
    }
    if (interviewBanner) interviewBanner.hidden = !on;
    writeInterviewMode(on);
  }

  if (interviewToggle) {
    var initialInterview = readInterviewMode();
    try {
      if (new URLSearchParams(window.location.search).get("interview") === "1") initialInterview = true;
    } catch (e) { /* ignore */ }
    setInterviewMode(initialInterview);
    interviewToggle.addEventListener("click", function () {
      setInterviewMode(!document.body.classList.contains("interview-mode"));
    });
  }

  if (bannerClose && interviewBanner) {
    bannerClose.addEventListener("click", function () { interviewBanner.hidden = true; });
  }

  /* ---------------- Scroll progress / header / back top ---------------- */
  var progress = $("#scrollProgress");
  var header = $(".site-header");
  var backTop = $("#backTop");

  function onScroll() {
    var doc = document.documentElement;
    var max = Math.max(1, doc.scrollHeight - window.innerHeight);
    var pct = Math.min(100, Math.max(0, (window.scrollY / max) * 100));
    if (progress) progress.style.width = pct + "%";
    if (header) header.classList.toggle("scrolled", window.scrollY > 10);
    if (backTop) backTop.classList.toggle("show", window.scrollY > 520);
  }

  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  if (backTop) {
    backTop.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  /* ---------------- Active nav ---------------- */
  var navLinks = $$("#nav a");
  var sectionIds = navLinks.map(function (a) { return a.getAttribute("href").slice(1); });
  var sections = sectionIds.map(function (id) { return document.getElementById(id); }).filter(Boolean);

  if ("IntersectionObserver" in window && sections.length) {
    var navObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        navLinks.forEach(function (link) {
          link.classList.toggle("is-active", link.getAttribute("href") === "#" + entry.target.id);
        });
      });
    }, { rootMargin: "-18% 0px -68% 0px", threshold: 0 });
    sections.forEach(function (section) { navObserver.observe(section); });
  }

  /* ---------------- Reveal on scroll ---------------- */
  var revealItems = $$(".reveal");
  if ("IntersectionObserver" in window && revealItems.length) {
    var revealObserver = new IntersectionObserver(function (entries, observer) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.08 });
    revealItems.forEach(function (item) { revealObserver.observe(item); });
  } else {
    revealItems.forEach(function (item) { item.classList.add("is-visible"); });
  }

  /* ---------------- Project details ---------------- */
  $$("[data-toggle-details]").forEach(function (btn) {
    var target = document.getElementById(btn.getAttribute("data-toggle-details"));
    if (!target) return;
    btn.addEventListener("click", function () {
      var willOpen = target.hasAttribute("hidden");
      if (willOpen) target.removeAttribute("hidden");
      else target.setAttribute("hidden", "");
      btn.setAttribute("aria-expanded", String(willOpen));
      btn.textContent = willOpen ? "收起项目详情" : "展开项目详情";
    });
  });

  /* ---------------- Lightbox ---------------- */
  var lightbox = $("#lightbox");
  var lightboxImage = $("#lightboxImage");
  var lightboxClose = $("#lightboxClose");

  function openLightbox(src) {
    if (!lightbox || !lightboxImage) return;
    lightboxImage.src = src;
    lightboxImage.alt = "项目架构图放大预览";
    lightbox.hidden = false;
    document.body.style.overflow = "hidden";
  }

  function closeLightbox() {
    if (!lightbox) return;
    lightbox.hidden = true;
    if (lightboxImage) lightboxImage.src = "";
    document.body.style.overflow = "";
  }

  $$("[data-zoom]").forEach(function (el) {
    el.addEventListener("click", function () { openLightbox(el.getAttribute("data-zoom")); });
  });

  if (lightboxClose) lightboxClose.addEventListener("click", closeLightbox);
  if (lightbox) {
    lightbox.addEventListener("click", function (e) {
      if (e.target === lightbox) closeLightbox();
    });
  }
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && lightbox && !lightbox.hidden) closeLightbox();
  });

  /* ---------------- Toast ---------------- */
  var toast = $("#toast");
  var toastTimer = null;

  function showToast(message) {
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add("show");
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(function () { toast.classList.remove("show"); }, 2200);
  }

  /* ---------------- Copy email ---------------- */
  var copyEmail = $("#copyEmail");
  var email = "792854726@qq.com";

  function fallbackCopy(text) {
    var ta = document.createElement("textarea");
    ta.value = text;
    ta.setAttribute("readonly", "");
    ta.style.position = "fixed";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.select();
    try { document.execCommand("copy"); } catch (e) { /* ignore */ }
    document.body.removeChild(ta);
  }

  if (copyEmail) {
    copyEmail.addEventListener("click", function () {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(email).then(function () {
          showToast("邮箱已复制：" + email);
        }).catch(function () {
          fallbackCopy(email);
          showToast("邮箱已复制：" + email);
        });
      } else {
        fallbackCopy(email);
        showToast("邮箱已复制：" + email);
      }
    });
  }

  /* ---------------- LCD simulator ---------------- */
  var lcdTitle = $("#lcdTitle");
  var lcdMode = $("#lcdMode");
  var lcdRows = $("#lcdRows");
  var lcdIndex = 0;

  var lcdScreens = [
    {
      title: "状态",
      mode: "FIX",
      rows: [
        ["定位状态", "FIX"],
        ["卫星数", "28"],
        ["数据链", "4G / Ntrip"],
        ["电量", "86%"]
      ]
    },
    {
      title: "卫星",
      mode: "28 SAT",
      rows: [
        ["GPS", "12"],
        ["BeiDou", "10"],
        ["GLONASS", "4"],
        ["Galileo", "2"]
      ]
    },
    {
      title: "设置",
      mode: "CONFIG",
      rows: [
        ["差分模式", "Ntrip"],
        ["蓝牙", "开"],
        ["语言", "中文"],
        ["版本", "v1.0.0"]
      ]
    },
    {
      title: "激光",
      mode: "LASER",
      rows: [
        ["距离", "12.480 m"],
        ["测点", "已记录"],
        ["倾斜", "1.8°"],
        ["状态", "就绪"]
      ]
    }
  ];

  function renderLcd() {
    if (!lcdTitle || !lcdRows || !lcdMode) return;
    var screen = lcdScreens[lcdIndex];
    lcdTitle.textContent = screen.title;
    lcdMode.textContent = screen.mode;
    lcdRows.innerHTML = screen.rows.map(function (row) {
      return '<div class="lcd-row"><span class="label">' + row[0] + '</span><span class="value">' + row[1] + "</span></div>";
    }).join("");
  }

  $$("[data-lcd]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var action = btn.getAttribute("data-lcd");
      if (action === "up") {
        lcdIndex = (lcdIndex - 1 + lcdScreens.length) % lcdScreens.length;
        renderLcd();
      } else if (action === "down") {
        lcdIndex = (lcdIndex + 1) % lcdScreens.length;
        renderLcd();
      } else if (action === "ok") {
        showToast("LCD 菜单确认：" + lcdScreens[lcdIndex].title);
      } else if (action === "back") {
        lcdIndex = 0;
        renderLcd();
        showToast("已返回状态页");
      }
    });
  });

  renderLcd();

  /* ---------------- Footer year (optional) ---------------- */
  var yearEls = $$("[data-year]");
  yearEls.forEach(function (el) { el.textContent = String(new Date().getFullYear()); });
})();
