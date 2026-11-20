/* ============================================================
   خزانة الآثار — القارئ (reader.js): الفهرس، الحفظ التلقائي، الإعدادات
   ============================================================ */
(function () {
  'use strict';
  var M = window.Maktaba;
  if (!M) return;
  var doc = document, el = doc.documentElement;
  var SLUG = el.getAttribute('data-book') || '';
  var PAGE = el.getAttribute('data-page') || '';
  var prefs = M.store.get(M.keys.prefs, {});

  function savePref(k, v) { var p = M.store.get(M.keys.prefs, {}); p[k] = v; M.store.set(M.keys.prefs, p); }
  function toast(msg, actionLabel) {
    var t = doc.createElement('div');
    t.className = 'toast';
    t.innerHTML = '<span></span>' + (actionLabel ? '<button type="button"></button>' : '');
    t.firstChild.textContent = msg;
    var hide = function () { t.classList.remove('is-in'); setTimeout(function () { t.remove(); }, 350); };
    if (actionLabel) {
      var btn = t.querySelector('button');
      btn.textContent = actionLabel;
      btn.addEventListener('click', function () { window.scrollTo({ top: 0, behavior: 'smooth' }); hide(); });
    }
    doc.body.appendChild(t);
    requestAnimationFrame(function () { t.classList.add('is-in'); });
    setTimeout(hide, 6000);
  }

  /* ---------- 1) الفهرس الجانبي ---------- */
  var drawer = doc.getElementById('drawer');
  var backdrop = doc.getElementById('drawer-backdrop');
  var drawerOpenBtn = doc.getElementById('drawer-open');
  var drawerCloseBtn = doc.getElementById('drawer-close');
  var drawerBody = drawer ? drawer.querySelector('.drawer__body') : null;
  var toc = doc.getElementById('toc-nav');
  if (toc && drawerBody && toc.parentElement !== drawerBody) drawerBody.appendChild(toc);

  function setDrawer(open) {
    if (!drawer) return;
    drawer.classList.toggle('is-open', open);
    if (backdrop) backdrop.classList.toggle('is-shown', open);
    if (drawerOpenBtn) drawerOpenBtn.setAttribute('aria-expanded', String(open));
    doc.body.classList.toggle('no-scroll', open);
    if (open && drawerBody) {
      var here = drawerBody.querySelector('.is-here') || drawerBody.querySelector('.is-active');
      if (here) drawerBody.scrollTop = here.offsetTop - 130;
      if (drawerCloseBtn) drawerCloseBtn.focus();
    }
  }
  if (drawerOpenBtn) drawerOpenBtn.addEventListener('click', function () { setDrawer(true); });
  if (drawerCloseBtn) drawerCloseBtn.addEventListener('click', function () { setDrawer(false); if (drawerOpenBtn) drawerOpenBtn.focus(); });
  if (backdrop) backdrop.addEventListener('click', function () { setDrawer(false); });

  /* ---------- 2) لوحة الإعدادات ---------- */
  var settingsBtn = doc.getElementById('settings-open');
  var settingsPanel = doc.getElementById('settings');
  function setSettings(open) {
    if (!settingsPanel) return;
    settingsPanel.hidden = !open;
    if (settingsBtn) settingsBtn.setAttribute('aria-expanded', String(open));
  }
  if (settingsBtn && settingsPanel) {
    settingsBtn.addEventListener('click', function (e) { e.stopPropagation(); setSettings(settingsPanel.hidden); });
    doc.addEventListener('click', function (e) {
      if (!settingsPanel.hidden && !settingsPanel.contains(e.target) && !settingsBtn.contains(e.target)) setSettings(false);
    });
  }

  function syncSel(attr, val) {
    doc.querySelectorAll('[' + attr + ']').forEach(function (b) {
      b.classList.toggle('is-on', b.getAttribute(attr) === val);
    });
  }
  /* حجم الخط */
  var fsOut = doc.getElementById('fs-value');
  function fsLabel() {
    var v = parseFloat(el.style.getPropertyValue('--fs-scale')) || (prefs.fs || 1);
    if (fsOut) fsOut.textContent = Math.round(v * 100) + '%';
  }
  fsLabel();
  doc.querySelectorAll('[data-fs]').forEach(function (b) {
    b.addEventListener('click', function () {
      var cur = parseFloat(el.style.getPropertyValue('--fs-scale')) || (prefs.fs || 1);
      var v = Math.min(1.7, Math.max(0.8, cur + (b.getAttribute('data-fs') === '+' ? 0.08 : -0.08)));
      v = Math.round(v * 100) / 100;
      el.style.setProperty('--fs-scale', v);
      savePref('fs', v); fsLabel();
    });
  });
  /* نوع الخط */
  syncSel('data-family', prefs.family || 'amiri');
  doc.querySelectorAll('[data-family]').forEach(function (b) {
    b.addEventListener('click', function () {
      var v = b.getAttribute('data-family');
      el.setAttribute('data-family', v);
      savePref('family', v); syncSel('data-family', v);
    });
  });
  /* تباعد الأسطر */
  syncSel('data-lh', String(prefs.lh || 2));
  doc.querySelectorAll('[data-lh]').forEach(function (b) {
    b.addEventListener('click', function () {
      var v = b.getAttribute('data-lh');
      el.style.setProperty('--lh', v);
      savePref('lh', parseFloat(v)); syncSel('data-lh', v);
    });
  });
  /* ضبط النص */
  syncSel('data-justify', prefs.justify === false ? 'off' : 'on');
  doc.querySelectorAll('[data-justify]').forEach(function (b) {
    b.addEventListener('click', function () {
      var v = b.getAttribute('data-justify');
      if (v === 'off') el.setAttribute('data-justify', 'off'); else el.removeAttribute('data-justify');
      savePref('justify', v === 'on'); syncSel('data-justify', v);
    });
  });

  /* ---------- 3) التقدم والحفظ التلقائي (LocalStorage) ---------- */
  var bar = doc.getElementById('read-progress');
  var pageTitle = (function () {
    var a = doc.querySelector('[data-page-title]');
    return a ? a.getAttribute('data-page-title') : doc.title;
  })();
  var touched = false, ratio = 0, timer = null;
  doc.addEventListener('click', function () { touched = true; }, { once: true });

  function calcRatio() {
    var max = el.scrollHeight - window.innerHeight;
    return max > 40 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
  }
  function saveProgress() {
    if (!SLUG || !PAGE || !touched) return;
    var all = M.store.get(M.keys.prog, {});
    all[SLUG] = { page: PAGE, title: pageTitle, ratio: Math.round(ratio * 1000) / 1000, ts: Date.now() };
    M.store.set(M.keys.prog, all);
    M.store.set(M.keys.last, SLUG);
  }
  window.addEventListener('scroll', function () {
    touched = true;
    ratio = calcRatio();
    if (bar) bar.style.width = (ratio * 100).toFixed(1) + '%';
    if (timer) clearTimeout(timer);
    timer = setTimeout(saveProgress, 600);
  }, { passive: true });
  window.addEventListener('beforeunload', saveProgress);
  doc.addEventListener('visibilitychange', function () { if (doc.hidden) saveProgress(); });

  /* ---------- 4) استئناف القراءة تلقائياً ---------- */
  var saved = (SLUG && PAGE) ? (M.store.get(M.keys.prog, {})[SLUG] || null) : null;
  if (saved && saved.page === PAGE && saved.ratio > 0.04 && saved.ratio < 0.96) {
    var max = el.scrollHeight - window.innerHeight;
    window.scrollTo(0, Math.round(saved.ratio * max));
    ratio = saved.ratio;
    if (bar) bar.style.width = (saved.ratio * 100).toFixed(1) + '%';
    toast('استُؤنفت القراءة من آخر موضع توقفت عنده', 'العودة إلى البداية');
  }

  /* ---------- 5) تتبع الموضع في الفهرس (Scrollspy) ---------- */
  var sections = doc.querySelectorAll('[data-spy]');
  if ('IntersectionObserver' in window && sections.length && toc) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        toc.querySelectorAll('a.is-active').forEach(function (a) { a.classList.remove('is-active'); });
        var link = toc.querySelector('a[href="#' + en.target.id + '"]');
        if (link) link.classList.add('is-active');
      });
    }, { rootMargin: '-15% 0px -70% 0px', threshold: 0 });
    sections.forEach(function (s) { io.observe(s); });
  }

  /* ---------- 6) زر نسخ رابط كل موضع (للمشاركة والاقتباس) ---------- */
  sections.forEach(function (s) {
    var h = s.querySelector('h2, h3');
    if (!h || !s.id) return;
    var btn = doc.createElement('button');
    btn.type = 'button'; btn.className = 'h-link';
    btn.title = 'نسخ رابط هذا الموضع';
    btn.setAttribute('aria-label', 'نسخ رابط هذا الموضع');
    btn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 14a5 5 0 0 0 7 0l3-3a5 5 0 0 0-7-7l-1.5 1.5"/><path d="M14 10a5 5 0 0 0-7 0l-3 3a5 5 0 0 0 7 7l1.5-1.5"/></svg>';
    btn.addEventListener('click', function () {
      var url = location.href.split('#')[0].split('?')[0] + '#' + s.id;
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(url).then(function () { toast('نُسخ رابط الموضع — شاركه كما هو'); }, function () { toast('تعذر النسخ'); });
      } else toast('النسخ غير مدعوم في هذا المتصفح');
    });
    h.appendChild(btn);
  });

  /* ---------- 7) اختصارات لوحة المفاتيح ---------- */
  doc.addEventListener('keydown', function (e) {
    if (e.target && e.target.matches && e.target.matches('input, textarea, select')) return;
    if (e.key === 'Escape') { setDrawer(false); setSettings(false); return; }
    if (e.altKey || e.ctrlKey || e.metaKey) return;
    var rel = null;
    if (e.key === 'ArrowLeft') rel = 'next';   /* في العربية: التقدم جهة اليسار */
    if (e.key === 'ArrowRight') rel = 'prev';
    if (rel) {
      var l = doc.querySelector('link[rel="' + rel + '"]');
      if (l && l.getAttribute('href')) location.href = l.getAttribute('href');
    }
  });

  /* ---------- 8) زر العودة للأعلى ---------- */
  var topBtn = doc.getElementById('to-top');
  if (topBtn) {
    var ticking = false;
    window.addEventListener('scroll', function () {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(function () { topBtn.classList.toggle('is-shown', window.scrollY > 600); ticking = false; });
    }, { passive: true });
    topBtn.addEventListener('click', function () { window.scrollTo({ top: 0, behavior: 'smooth' }); });
  }

  /* ---------- 9) تمييز كلمات البحث القادمة من صفحة البحث ---------- */
  var q = new URLSearchParams(location.search).get('q');
  if (q) {
    try { highlightAll(doc.getElementById('content'), M.arabicRegex(q)); } catch (e) {}
  }
  function highlightAll(rootEl, re) {
    if (!rootEl || !re) return;
    var walker = doc.createTreeWalker(rootEl, NodeFilter.SHOW_TEXT, null, false);
    var nodes = [], n;
    while ((n = walker.nextNode())) {
      var p = n.parentNode;
      if (!p || /^(SCRIPT|STYLE|MARK|BUTTON)$/.test(p.nodeName)) continue;
      if (n.nodeValue.trim()) nodes.push(n);
    }
    nodes.forEach(function (node) {
      var text = node.nodeValue;
      re.lastIndex = 0;
      if (!re.test(text)) return;
      re.lastIndex = 0;
      var frag = doc.createDocumentFragment(), last = 0, m;
      while ((m = re.exec(text)) !== null) {
        if (m.index === re.lastIndex) re.lastIndex++;
        frag.appendChild(doc.createTextNode(text.slice(last, m.index)));
        var mk = doc.createElement('mark'); mk.className = 'hl';
        mk.appendChild(doc.createTextNode(m[0]));
        frag.appendChild(mk);
        last = m.index + m[0].length;
      }
      frag.appendChild(doc.createTextNode(text.slice(last)));
      node.parentNode.replaceChild(frag, node);
    });
    var first = rootEl.querySelector('mark.hl');
    if (first) setTimeout(function () { first.scrollIntoView({ block: 'center' }); }, 250);
  }
})();
