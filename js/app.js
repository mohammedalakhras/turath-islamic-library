/* ==========================================================================
   منصة المكتبة الأثرية والتراثية - المحرك البرمجي (LocalStorage, UI, Search, Diagrams)
   ========================================================================== */
(function() {
  const STORAGE_KEYS = {
    THEME: 'turath_theme_pref',
    FONT_SIZE: 'turath_font_size_pref',
    PROGRESS: 'turath_reading_progress_v1',
    BOOKMARK: 'turath_manual_bookmark_v1'
  };

  let currentFontSize = 1.32;

  function showToast(message) {
    const toast = document.getElementById('toastNotification');
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add('show');
    if (window._toastTimer) clearTimeout(window._toastTimer);
    window._toastTimer = setTimeout(function() {
      toast.classList.remove('show');
    }, 3200);
  }

  function safeSetStorage(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      // Fallback in restricted environments
    }
  }

  function safeGetStorage(key) {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch (e) {
      return null;
    }
  }

  // 1. إدارة الوضع الليلي / النهاري / الورقي (Dark / Light / Sepia)
  window.cycleTheme = function() {
    const html = document.documentElement;
    const current = html.getAttribute('data-theme') || 'light';
    const next = current === 'light' ? 'dark' : (current === 'dark' ? 'sepia' : 'light');
    html.setAttribute('data-theme', next);
    safeSetStorage(STORAGE_KEYS.THEME, next);
    updateThemeButtonLabel(next);
    const names = { light: 'الوضع النهاري (ورق كريمي)', dark: 'الوضع الليلي المريح', sepia: 'وضع ورق البردي التراثي' };
    showToast('تم التبديل إلى ' + names[next]);
  };

  function updateThemeButtonLabel(theme) {
    const btn = document.getElementById('themeToggleBtn');
    if (!btn) return;
    if (theme === 'dark') {
      btn.innerHTML = '<span>☀️</span><span>الوضع النهاري</span>';
    } else if (theme === 'sepia') {
      btn.innerHTML = '<span>🌙</span><span>الوضع الليلي</span>';
    } else {
      btn.innerHTML = '<span>📜</span><span>وضع البردي / الليلي</span>';
    }
  }

  // 2. تكبير وتصغير حجم خط القراءة
  window.adjustFontSize = function(delta) {
    currentFontSize = Math.min(1.85, Math.max(1.05, +(currentFontSize + delta).toFixed(2)));
    document.documentElement.style.setProperty('--reading-font-size', currentFontSize + 'rem');
    safeSetStorage(STORAGE_KEYS.FONT_SIZE, currentFontSize);
    showToast('حجم خط القراءة: ' + Math.round((currentFontSize / 1.32) * 100) + '%');
  };

  // 3. التحكم بالقائمة الجانبية القابلة للطي (Off-canvas Sidebar)
  window.toggleSidebar = function(forceState) {
    const sidebar = document.getElementById('offcanvasSidebar');
    const backdrop = document.getElementById('sidebarBackdrop');
    if (!sidebar || !backdrop) return;
    const isOpen = typeof forceState === 'boolean' ? forceState : !sidebar.classList.contains('open');
    sidebar.classList.toggle('open', isOpen);
    backdrop.classList.toggle('open', isOpen);
  };

  // 4. طي وإظهار الشريط العلوي لتوسيع مساحة القراءة
  window.toggleHeaderBar = function(collapse) {
    const header = document.getElementById('siteHeader');
    const restoreBtn = document.getElementById('restoreHeaderFab');
    if (!header || !restoreBtn) return;
    header.classList.toggle('header-collapsed', collapse);
    restoreBtn.classList.toggle('visible', collapse);
  };

  // 5. حفظ مكان الوصول التلقائي واليدوي (LocalStorage Reading Progress)
  window.saveManualBookmark = function(elementId, label) {
    document.querySelectorAll('.bookmarked-para').forEach(function(el) {
      el.classList.remove('bookmarked-para');
    });
    const target = document.getElementById(elementId);
    if (target) {
      target.classList.add('bookmarked-para');
    }
    const payload = {
      id: elementId,
      label: label,
      scrollY: window.scrollY,
      timestamp: new Date().toLocaleTimeString('ar-SY', { hour: '2-digit', minute: '2-digit' })
    };
    safeSetStorage(STORAGE_KEYS.BOOKMARK, payload);
    updateResumeBanner(payload);
    showToast('تم حفظ علامة الوصول عند: ' + label);
  };

  function updateResumeBanner(saved) {
    const banner = document.getElementById('resumeBanner');
    const textEl = document.getElementById('resumeBannerText');
    if (!banner || !textEl || !saved) return;
    textEl.textContent = 'توقفت سابقاً عند: «' + saved.label + '»';
    banner.classList.add('active');
    banner.dataset.targetId = saved.id || '';
    banner.dataset.scrollY = saved.scrollY || 0;
  }

  window.resumeSavedReading = function() {
    const banner = document.getElementById('resumeBanner');
    if (!banner) return;
    const targetId = banner.dataset.targetId;
    const targetEl = targetId ? document.getElementById(targetId) : null;
    if (targetEl) {
      targetEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
      targetEl.classList.add('bookmarked-para');
      showToast('تم الانتقال إلى موضع القراءة المحفوظ');
    } else if (banner.dataset.scrollY) {
      window.scrollTo({ top: Number(banner.dataset.scrollY), behavior: 'smooth' });
    }
  };

  window.dismissResumeBanner = function() {
    const banner = document.getElementById('resumeBanner');
    if (banner) banner.classList.remove('active');
  };

  // 6. نسخ رابط الفقرة المباشر لمحركات البحث (SEO Deep Link)
  window.copySectionLink = function(sectionId, title) {
    const url = window.location.origin + window.location.pathname + '#' + sectionId;
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(url);
      } else {
        const temp = document.createElement('textarea');
        temp.value = url;
        document.body.appendChild(temp);
        temp.select();
        document.execCommand('copy');
        document.body.removeChild(temp);
      }
    } catch (e) {}
    showToast('تم نسخ الرابط المباشر للفقرة: ' + title);
  };

  // 7. الانتقال السلس من المشجرات والفهرس
  window.jumpToSection = function(sectionId) {
    const el = document.getElementById(sectionId);
    if (el) {
      window.toggleSidebar(false);
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // 8. البحث الفوري داخل نصوص الكتاب والفهرس
  window.filterBookContent = function(query) {
    const q = (query || '').trim();
    const paragraphs = document.querySelectorAll('.book-paragraph');
    const countBadge = document.getElementById('searchMatchCount');
    let matches = 0;

    paragraphs.forEach(function(p) {
      if (!q) {
        p.style.display = '';
        p.style.backgroundColor = '';
        return;
      }
      if (p.textContent.indexOf(q) !== -1) {
        p.style.display = '';
        p.style.backgroundColor = 'var(--highlight-bg)';
        matches++;
      } else {
        p.style.backgroundColor = '';
      }
    });

    if (countBadge) {
      countBadge.textContent = q ? ('النتائج المطابقة: ' + matches + ' فقرة') : '';
    }
  };

  // 9. التبديل بين تبويبات لوحة الهندسة البرمجية وخطة المعالجة
  window.switchPipelineTab = function(tabId) {
    document.querySelectorAll('.pipeline-tab').forEach(function(btn) {
      btn.classList.toggle('active', btn.dataset.tab === tabId);
    });
    document.querySelectorAll('.pipeline-content').forEach(function(panel) {
      panel.classList.toggle('active', panel.id === tabId);
    });
  };

  // 10. تحميل الكتاب بصيغة PDF
  window.handlePdfDownload = function() {
    const modal = document.getElementById('pdfDownloadModal');
    if (modal) {
      modal.style.display = modal.style.display === 'flex' ? 'none' : 'flex';
    }
  };

  // تهيئة الصفحة واسترجاع الإعدادات من LocalStorage
  window.addEventListener('DOMContentLoaded', function() {
    const savedTheme = safeGetStorage(STORAGE_KEYS.THEME);
    if (savedTheme) {
      document.documentElement.setAttribute('data-theme', savedTheme);
      updateThemeButtonLabel(savedTheme);
    }

    const savedFont = safeGetStorage(STORAGE_KEYS.FONT_SIZE);
    if (savedFont) {
      currentFontSize = Number(savedFont);
      document.documentElement.style.setProperty('--reading-font-size', currentFontSize + 'rem');
    }

    const savedBookmark = safeGetStorage(STORAGE_KEYS.BOOKMARK) || safeGetStorage(STORAGE_KEYS.PROGRESS);
    if (savedBookmark && savedBookmark.label) {
      updateResumeBanner(savedBookmark);
      if (savedBookmark.id) {
        const el = document.getElementById(savedBookmark.id);
        if (el) el.classList.add('bookmarked-para');
      }
    }

    // مراقبة التمرير لتحديث شريط التقدم وحفظ آخر فقرة مقروءة تلقائياً
    window.addEventListener('scroll', function() {
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const pct = docHeight > 0 ? Math.min(100, Math.round((window.scrollY / docHeight) * 100)) : 0;
      const fill = document.getElementById('readingProgressFill');
      if (fill) fill.style.width = pct + '%';

      // تحديد الفصل/الفقرة الحالية أثناء القراءة
      const tracked = document.querySelectorAll('[data-track-title]');
      let currentSection = null;
      tracked.forEach(function(sec) {
        const rect = sec.getBoundingClientRect();
        if (rect.top <= 180) {
          currentSection = sec;
        }
      });

      if (currentSection && window.scrollY > 250) {
        safeSetStorage(STORAGE_KEYS.PROGRESS, {
          id: currentSection.id,
          label: currentSection.getAttribute('data-track-title'),
          scrollY: window.scrollY
        });
      }
    }, { passive: true });
  });
})();
