/* ============================================================
   خزانة الأثر — القارئ (reader.js) — النسخة 3
   الفهرس المصفّى، الحفظ، الإشارات المرجعية، زمن القراءة
   ============================================================ */
(function () {
  'use strict';
  var M = window.Maktaba;
  if (!M) return;
  var doc = document, el = doc.documentElement;
  var SLUG = el.getAttribute('data-book') || '';
  var PAGE = el.getAttribute('data-page') || '';
  var BOOK_TITLE = el.getAttribute('data-book-title') || SLUG;
  var prefs = M.store.get(M.keys.prefs, {});
  var MARK_SVG = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><path d="M6 3h12v18l-6-4.5L6 21z"/></svg>';

  function savePref(k, v) { var p = M.store.get(M.keys.prefs, {}); p[k] = v; M.store.set(M.keys.prefs, p); }
  function toast(msg, actionLabel, actionUrl) {
    var t = doc.createElement('div');
    t.className = 'toast';
    t.innerHTML = '<span></span>' + (actionLabel ? '<button type="button"></button>' : '');
    t.firstChild.textContent = msg;
    var hide = function () { t.classList.remove('is-in'); setTimeout(function () { t.remove(); }, 350); };
    if (actionLabel) {
      var btn = t.querySelector('button');
      btn.textContent = actionLabel;
      btn.addEventListener('click', function () {
        if (actionUrl) location.href = actionUrl;
        else window.scrollTo({ top: 0, behavior: 'smooth' });
        hide();
      });
    }
    doc.body.appendChild(t);
    requestAnimationFrame(function () { t.classList.add('is-in'); });
    setTimeout(hide, 6000);
  }

  /* ---------- 1) الفهرس الجانبي + التصفية ---------- */
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

  var tocFilter = doc.getElementById('toc-filter');
  if (tocFilter && toc) {
    tocFilter.addEventListener('input', function () {
      var q = M.normAr(tocFilter.value.trim());
      toc.querySelectorAll('a').forEach(function (a) {
        a.classList.toggle('is-hidden', !!q && M.normAr(a.textContent).indexOf(q) === -1);
      });
      var lis = toc.querySelectorAll('li');
      for (var i = lis.length - 1; i >= 0; i--) {
        var li = lis[i];
        var a = li.querySelector(':scope > a');
        var visChild = li.querySelector(':scope > ul > li:not(.is-filtered)');
        li.classList.toggle('is-filtered', !!(a && a.classList.contains('is-hidden') && !visChild));
      }
    });
  }

  /* ---------- 2) الإعدادات ---------- */
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
  var fsOut = doc.getElementById('fs-value');
  function fsLabel() {
    var v = parseFloat(el.style.getPropertyValue('--fs-scale')) || (prefs.fs || 1);
    if (fsOut) fsOut.textContent = M.arNum(Math.round(v * 100)) + '%';
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
  syncSel('data-family', prefs.family || 'amiri');
  doc.querySelectorAll('[data-family]').forEach(function (b) {
    b.addEventListener('click', function () {
      var v = b.getAttribute('data-family');
      el.setAttribute('data-family', v);
      savePref('family', v); syncSel('data-family', v);
    });
  });
  syncSel('data-lh', String(prefs.lh || 2));
  doc.querySelectorAll('[data-lh]').forEach(function (b) {
    b.addEventListener('click', function () {
      var v = b.getAttribute('data-lh');
      el.style.setProperty('--lh', v);
      savePref('lh', parseFloat(v)); syncSel('data-lh', v);
    });
  });
  syncSel('data-justify', prefs.justify === false ? 'off' : 'on');
  doc.querySelectorAll('[data-justify]').forEach(function (b) {
    b.addEventListener('click', function () {
      var v = b.getAttribute('data-justify');
      if (v === 'off') el.setAttribute('data-justify', 'off'); else el.removeAttribute('data-justify');
      savePref('justify', v === 'on'); syncSel('data-justify', v);
    });
  });

  /* ---------- 3) زمن القراءة ---------- */
  var content = doc.getElementById('content');
  var readTime = doc.getElementById('read-time');
  if (content && readTime) {
    var words = parseInt(content.getAttribute('data-words'), 10);
    if (words > 0) {
      readTime.textContent = '≈ ' + M.arNum(Math.max(1, Math.round(words / 160))) + ' دقيقة قراءة';
      readTime.hidden = false;
    }
  }

  /* ---------- 4) التقدم + تسجيل المقروء ---------- */
  var bar = doc.getElementById('read-progress');
  var pageTitle = (function () {
    var a = doc.querySelector('[data-page-title]');
    return a ? a.getAttribute('data-page-title') : doc.title;
  })();
  var touched = false, ratio = 0, timer = null;
  doc.addEventListener('click', function () { touched = true; }, { once: true });

  var savedEntry = (SLUG && PAGE) ? (M.store.get(M.keys.prog, {})[SLUG] || null) : null;
  if (SLUG && PAGE) {
    var all = M.store.get(M.keys.prog, {});
    var pr = all[SLUG] || {};
    pr.visited = pr.visited || [];
    if (pr.visited.indexOf(PAGE) === -1) pr.visited.push(PAGE);
    pr.page = PAGE; pr.title = pageTitle; pr.ts = Date.now();
    if (typeof pr.ratio !== 'number') pr.ratio = 0;
    all[SLUG] = pr;
    M.store.set(M.keys.prog, all);
    M.store.set(M.keys.last, SLUG);
    if (toc) pr.visited.forEach(function (pg) {
      var a = toc.querySelector('a[href="' + pg + '.html"]');
      if (a) a.classList.add('is-read');
    });
  }

  function calcRatio() {
    var max = el.scrollHeight - window.innerHeight;
    return max > 40 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
  }
  function saveProgress() {
    if (!SLUG || !PAGE || !touched) return;
    var all = M.store.get(M.keys.prog, {});
    var pr2 = all[SLUG] || {};
    pr2.page = PAGE; pr2.title = pageTitle;
    pr2.ratio = Math.round(ratio * 1000) / 1000; pr2.ts = Date.now();
    all[SLUG] = pr2;
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

  /* ---------- 5) استئناف القراءة ---------- */
  if (savedEntry && savedEntry.page === PAGE && savedEntry.ratio > 0.04 && savedEntry.ratio < 0.96) {
    var max = el.scrollHeight - window.innerHeight;
    window.scrollTo(0, Math.round(savedEntry.ratio * max));
    ratio = savedEntry.ratio;
    if (bar) bar.style.width = (savedEntry.ratio * 100).toFixed(1) + '%';
    toast('استُؤنفت القراءة من آخر موضع توقفت عنده', 'العودة إلى البداية');
  }

  /* ---------- 6) Scrollspy ---------- */
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

  /* ---------- 7) نسخ الرابط + الإشارة المرجعية (على الأقسام) ---------- */
  function refreshMark(btn, id) { btn.classList.toggle('is-on', M.isMarked(SLUG, PAGE, id)); }
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

    var mb = doc.createElement('button');
    mb.type = 'button'; mb.className = 'm-btn';
    mb.title = 'حفظ إشارة مرجعية لهذا القسم';
    mb.setAttribute('aria-label', 'حفظ إشارة مرجعية لهذا القسم');
    mb.innerHTML = MARK_SVG;
    refreshMark(mb, s.id);
    mb.addEventListener('click', function () {
      var label = h.textContent.trim() || pageTitle;
      var added = M.toggleMark(SLUG, PAGE, s.id, label, BOOK_TITLE);
      refreshMark(mb, s.id);
      toast(added ? 'حُفظت إشارة القسم' : 'أُزيلت إشارة القسم', added ? 'عرض إشارتي' : null, added ? M.root + 'bookmarks.html' : null);
    });
    h.appendChild(mb);
  });

  /* ---------- 8) الإشارة المرجعية على كل فقرة ---------- */
  doc.querySelectorAll('.reader-text p[id]').forEach(function (p) {
    var b = doc.createElement('button');
    b.type = 'button'; b.className = 'p-mark';
    b.title = 'إشارة مرجعية لهذه الفقرة';
    b.setAttribute('aria-label', 'إشارة مرجعية لهذه الفقرة');
    b.innerHTML = MARK_SVG;
    refreshMark(b, p.id);
    b.addEventListener('click', function (e) {
      e.stopPropagation();
      var txt = p.textContent.trim();
      var label = txt.slice(0, 60) + (txt.length > 60 ? '…' : '');
      var added = M.toggleMark(SLUG, PAGE, p.id, label, BOOK_TITLE);
      refreshMark(b, p.id);
      toast(added ? 'حُفظت إشارة الفقرة' : 'أُزيلت إشارة الفقرة', added ? 'عرض إشارتي' : null, added ? M.root + 'bookmarks.html' : null);
    });
    p.appendChild(b);
  });

  /* ---------- 9) اختصارات ---------- */
  doc.addEventListener('keydown', function (e) {
    if (e.target && e.target.matches && e.target.matches('input, textarea, select')) return;
    if (e.key === 'Escape') { setDrawer(false); setSettings(false); return; }
    if (e.altKey || e.ctrlKey || e.metaKey) return;
    var rel = null;
    if (e.key === 'ArrowLeft') rel = 'next';
    if (e.key === 'ArrowRight') rel = 'prev';
    if (rel) {
      var l = doc.querySelector('link[rel="' + rel + '"]');
      if (l && l.getAttribute('href')) location.href = l.getAttribute('href');
    }
  });

  /* ---------- 10) العودة للأعلى ---------- */
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

  /* ---------- 11) تمييز كلمات البحث ---------- */
  var q = new URLSearchParams(location.search).get('q');
  if (q) {
    try { highlightAll(content, M.arabicRegex(q)); } catch (e) {}
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
