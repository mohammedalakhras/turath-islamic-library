/* ================================================================
   مكتبة التراث — main.js
   - التبديل بين الوضع الليلي/النهاري (محفوظ في localStorage)
   - فتح/إغلاق القائمة الجانبية (Off-canvas) على الجوال
   - حفظ واستعادة "مكان الوصول" في كل كتاب
   - شريط تقدم القراءة
   - تهيئة مخططات Mermaid
   ================================================================ */
(function () {
  "use strict";

  /* ---------------- 1) الوضع الليلي/النهاري ---------------- */
  var THEME_KEY = "heritage-theme";
  var root = document.documentElement;

  function applyTheme(theme) {
    if (theme === "dark" || theme === "light") {
      root.setAttribute("data-theme", theme);
    } else {
      root.removeAttribute("data-theme"); // اتبع تفضيل النظام
    }
    var btn = document.getElementById("theme-toggle");
    if (btn) {
      var isDark =
        theme === "dark" ||
        (!theme && window.matchMedia("(prefers-color-scheme: dark)").matches);
      btn.setAttribute("aria-pressed", String(isDark));
      btn.textContent = isDark ? "☀️" : "🌙";
      btn.setAttribute("aria-label", isDark ? "تفعيل الوضع النهاري" : "تفعيل الوضع الليلي");
    }
  }

  function initTheme() {
    var saved = null;
    try { saved = localStorage.getItem(THEME_KEY); } catch (e) {}
    applyTheme(saved);

    var btn = document.getElementById("theme-toggle");
    if (btn) {
      btn.addEventListener("click", function () {
        var current = root.getAttribute("data-theme");
        var isDarkNow =
          current === "dark" ||
          (!current && window.matchMedia("(prefers-color-scheme: dark)").matches);
        var next = isDarkNow ? "light" : "dark";
        applyTheme(next);
        try { localStorage.setItem(THEME_KEY, next); } catch (e) {}
      });
    }
  }

  /* ---------------- 2) القائمة الجانبية (Off-canvas) ---------------- */
  function initSidebar() {
    var openBtn = document.getElementById("sidebar-toggle");
    var overlay = document.querySelector(".sidebar-overlay");
    var body = document.body;

    function close() { body.classList.remove("sidebar-open"); }
    function open() { body.classList.add("sidebar-open"); }

    if (openBtn) {
      openBtn.addEventListener("click", function () {
        body.classList.contains("sidebar-open") ? close() : open();
      });
    }
    if (overlay) overlay.addEventListener("click", close);
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") close();
    });
    // أغلق تلقائياً عند اختيار فصل من القائمة على الجوال
    document.querySelectorAll(".toc-list a").forEach(function (a) {
      a.addEventListener("click", close);
    });
  }

  /* ---------------- 3) حفظ واستعادة مكان القراءة ----------------
     المفتاح: heritage-progress:<book-slug>  →  { chapterUrl, scrollRatio, updatedAt }
  */
  function progressKey(bookSlug) { return "heritage-progress:" + bookSlug; }

  function saveProgress(bookSlug, chapterUrl) {
    var scrollable = document.documentElement.scrollHeight - window.innerHeight;
    var ratio = scrollable > 0 ? window.scrollY / scrollable : 0;
    var data = { chapterUrl: chapterUrl, scrollRatio: ratio, updatedAt: Date.now() };
    try { localStorage.setItem(progressKey(bookSlug), JSON.stringify(data)); } catch (e) {}
  }

  function getProgress(bookSlug) {
    try {
      var raw = localStorage.getItem(progressKey(bookSlug));
      return raw ? JSON.parse(raw) : null;
    } catch (e) { return null; }
  }

  function initReadingProgress() {
    var body = document.body;
    var bookSlug = body.getAttribute("data-book-slug");
    if (!bookSlug) return;

    var isChapterPage = body.getAttribute("data-page-type") === "chapter";
    var currentUrl = window.location.pathname;

    // على صفحة الفصل: استعد موضع التمرير إن كنا نعود لنفس الفصل
    if (isChapterPage) {
      var saved = getProgress(bookSlug);
      if (saved && saved.chapterUrl === currentUrl) {
        window.requestAnimationFrame(function () {
          var scrollable = document.documentElement.scrollHeight - window.innerHeight;
          window.scrollTo(0, scrollable * saved.scrollRatio);
        });
      }

      var ticking = false;
      window.addEventListener("scroll", function () {
        if (ticking) return;
        ticking = true;
        window.requestAnimationFrame(function () {
          saveProgress(bookSlug, currentUrl);
          updateProgressBar();
          ticking = false;
        });
      });
      window.addEventListener("beforeunload", function () {
        saveProgress(bookSlug, currentUrl);
      });
    }

    // على صفحة الكتاب الرئيسية: أظهر زر "متابعة القراءة" إن وُجد تقدم محفوظ
    var continueBtn = document.getElementById("continue-reading");
    if (continueBtn) {
      var progress = getProgress(bookSlug);
      if (progress && progress.chapterUrl) {
        continueBtn.href = progress.chapterUrl;
        continueBtn.hidden = false;
      }
    }
  }

  /* ---------------- 4) شريط تقدم القراءة أعلى الصفحة ---------------- */
  function updateProgressBar() {
    var bar = document.getElementById("progress-bar");
    if (!bar) return;
    var scrollable = document.documentElement.scrollHeight - window.innerHeight;
    var pct = scrollable > 0 ? (window.scrollY / scrollable) * 100 : 0;
    bar.style.width = pct + "%";
  }

  /* ---------------- 5) تهيئة مخططات Mermaid ---------------- */
  function initMermaid() {
    if (typeof mermaid === "undefined") return;
    var isDark =
      root.getAttribute("data-theme") === "dark" ||
      (!root.getAttribute("data-theme") &&
        window.matchMedia("(prefers-color-scheme: dark)").matches);
    mermaid.initialize({
      startOnLoad: true,
      theme: isDark ? "dark" : "base",
      themeVariables: {
        fontFamily: "Tajawal, sans-serif",
        primaryColor: isDark ? "#22312C" : "#E4ECE9",
        primaryTextColor: isDark ? "#EFE6D2" : "#1E2A28",
        primaryBorderColor: isDark ? "#D8B567" : "#A9802D",
        lineColor: isDark ? "#D8B567" : "#A9802D",
        tertiaryColor: isDark ? "#1D1812" : "#FBF6E9"
      },
      securityLevel: "strict",
      rtl: true
    });
  }

  /* ---------------- 6) تصفية الكتب في الصفحة الرئيسية حسب التصنيف ---------------- */
  function initBookFilters() {
    var buttons = document.querySelectorAll(".filters button");
    var cards = document.querySelectorAll(".book-card");
    if (!buttons.length || !cards.length) return;

    buttons.forEach(function (btn) {
      btn.addEventListener("click", function () {
        buttons.forEach(function (b) { b.classList.remove("active"); });
        btn.classList.add("active");
        var filter = btn.getAttribute("data-filter");
        cards.forEach(function (card) {
          var show = filter === "all" || card.getAttribute("data-category") === filter;
          card.style.display = show ? "" : "none";
        });
      });
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    initTheme();
    initSidebar();
    initReadingProgress();
    initMermaid();
    initBookFilters();
    updateProgressBar();
  });
})();
