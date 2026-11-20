/* ============================================================
   خزانة الآثار — النواة (main.js): السمة، الرئيسية، البحث
   ============================================================ */
(function () {
  'use strict';
  var doc = document;
  var ROOT = doc.documentElement.getAttribute('data-root') || '';

  /* ---------- تخزين ---------- */
  var store = {
    get: function (k, d) { try { var v = localStorage.getItem(k); return v === null ? d : JSON.parse(v); } catch (e) { return d; } },
    set: function (k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
  };
  var KEYS = { prefs: 'khizana:prefs', prog: 'khizana:progress', last: 'khizana:last' };

  /* ---------- أدوات ---------- */
  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  /* تطبيع عربي: حذف التشكيل وتوحيد الهمزات والألف والهاء */
  function normAr(s) {
    return String(s || '')
      .replace(/[\u064B-\u065F\u0670\u06D6-\u06ED]/g, '')
      .replace(/[\u0622\u0623\u0625\u0671]/g, '\u0627')
      .replace(/\u0649/g, '\u064A').replace(/\u0629/g, '\u0647')
      .replace(/\u0624/g, '\u0648').replace(/\u0626/g, '\u064A')
      .replace(/\s+/g, ' ').toLowerCase().trim();
  }
  var AR_CLASS = {
    '\u0627': '[\u0627\u0622\u0623\u0625\u0671]',
    '\u0647': '[\u0647\u0629]',
    '\u064A': '[\u064A\u0649\u0626]',
    '\u0648': '[\u0648\u0624]'
  };
  function escRe(c) { return c.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }
  /* يبني تعبيراً نمطياً يطابق النص الأصلي (بما فيه تشكيله) مهما اختلف شكل الاستعلام */
  function arabicRegex(q) {
    var HARAKAT = '[\\u064B-\\u065F\\u0670\\u06D6-\\u06ED]*', src = '';
    String(q).split('').forEach(function (ch) {
      if (/[\u064B-\u065F\u0670\u06D6-\u06ED]/.test(ch)) return;
      if (/\s/.test(ch)) { src += '\\s+'; return; }
      var n = normAr(ch);
      src += (AR_CLASS[n] || escRe(ch)) + HARAKAT;
    });
    return new RegExp(src, 'g');
  }

  /* ---------- السمة ---------- */
  var THEMES = ['light', 'sepia', 'dark'];
  var THEME_LABEL = { light: 'نهاري', sepia: 'ورقي', dark: 'ليلي' };
  function currentTheme() {
    var t = doc.documentElement.getAttribute('data-theme');
    return THEMES.indexOf(t) > -1 ? t : 'light';
  }
  function applyTheme(t) {
    doc.documentElement.setAttribute('data-theme', t);
    doc.querySelectorAll('[data-action="theme"]').forEach(function (b) {
      b.setAttribute('title', 'وضع القراءة: ' + THEME_LABEL[t] + ' — اضغط للتبديل');
      b.setAttribute('aria-label', 'وضع القراءة: ' + THEME_LABEL[t]);
    });
    var meta = doc.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', t === 'dark' ? '#0d1411' : (t === 'sepia' ? '#ece0c4' : '#f6f1e3'));
  }
  function cycleTheme() {
    var next = THEMES[(THEMES.indexOf(currentTheme()) + 1) % THEMES.length];
    var p = store.get(KEYS.prefs, {}); p.theme = next; store.set(KEYS.prefs, p);
    applyTheme(next);
  }

  /* ---------- واجهة عامة ---------- */
  window.Maktaba = {
    root: ROOT, store: store, keys: KEYS,
    esc: esc, normAr: normAr, arabicRegex: arabicRegex,
    applyTheme: applyTheme,
    manifest: null,
    loadManifest: function () {
      var self = this;
      if (self.manifest) return Promise.resolve(self.manifest);
      return fetch(ROOT + 'data/manifest.json').then(function (r) {
        if (!r.ok) throw new Error('HTTP ' + r.status);
        return r.json();
      }).then(function (m) { self.manifest = m; return m; });
    },
    getProgress: function (slug) {
      var all = store.get(KEYS.prog, {});
      return slug ? (all[slug] || null) : all;
    }
  };

  /* ---------- إقلاع عام ---------- */
  function onReady(fn) { if (doc.readyState !== 'loading') fn(); else doc.addEventListener('DOMContentLoaded', fn); }

  onReady(function () {
    applyTheme(currentTheme());
    doc.querySelectorAll('[data-action="theme"]').forEach(function (b) { b.addEventListener('click', cycleTheme); });
    initMobileNav();
    hookPdf();
    var page = doc.body.getAttribute('data-page');
    if (page === 'home') initHome();
    if (page === 'search') initSearch();
  });

  function initMobileNav() {
    var btn = doc.getElementById('nav-toggle'), nav = doc.getElementById('site-nav');
    if (!btn || !nav) return;
    btn.addEventListener('click', function (e) {
      e.stopPropagation();
      var open = nav.classList.toggle('is-open');
      btn.setAttribute('aria-expanded', String(open));
    });
    doc.addEventListener('click', function (e) {
      if (nav.classList.contains('is-open') && !nav.contains(e.target) && !btn.contains(e.target)) {
        nav.classList.remove('is-open'); btn.setAttribute('aria-expanded', 'false');
      }
    });
  }

  /* ---------- زر PDF (طباعة بديلة عند غياب الملف) ---------- */
  function hookPdf() {
    doc.querySelectorAll('[data-pdf]').forEach(function (b) {
      var href = (b.getAttribute('data-pdf') || '').trim();
      if (href && href !== '#') { b.setAttribute('href', href); b.setAttribute('download', ''); return; }
      if (doc.body.getAttribute('data-page') === 'chapter') {
        b.setAttribute('href', '#');
        var sp = b.querySelector('span'); if (sp) sp.textContent = 'طباعة / PDF';
        b.addEventListener('click', function (e) { e.preventDefault(); window.print(); });
      } else { b.hidden = true; }
    });
  }

  /* ============ الصفحة الرئيسية ============ */
  function initHome() {
    renderContinue();
    var grid = doc.getElementById('books-grid');
    if (!grid) return;
    window.Maktaba.loadManifest().then(function (m) {
      var n = doc.getElementById('books-count');
      if (n) n.textContent = m.books.length ? (m.books.length + (m.books.length === 1 ? ' كتاب بين يديك' : ' كتب بين يديك')) : '';
      if (!m.books.length) {
        grid.innerHTML = '<div class="empty"><p>لم تُضف كتب إلى الخزانة بعد.</p><p class="mini">تُضاف الكتب بتوليد صفحاتها ثم تسجيلها في <code>data/manifest.json</code>.</p></div>';
        return;
      }
      grid.innerHTML = m.books.map(cardHTML).join('');
    }).catch(function () {
      grid.innerHTML = '<div class="empty"><p>تعذر تحميل فهرس الكتب — جرّب تحديث الصفحة.</p></div>';
    });
  }

  var coverSeq = 0;
  function wrapAr(text, max) {
    var words = String(text || '').split(/\s+/).filter(Boolean), lines = [], cur = '';
    words.forEach(function (w) {
      if ((cur + ' ' + w).trim().length > max && cur) { lines.push(cur); cur = w; }
      else cur = (cur ? cur + ' ' : '') + w;
    });
    if (cur) lines.push(cur);
    return lines.length ? lines : [''];
  }
  /* غلاف مولّد برمجياً لكل كتاب (لا يحتاج صوراً) */
  function coverSVG(b) {
    var id = 'cov' + (++coverSeq);
    var lines = wrapAr(b.title, 15);
    var fs = lines.length > 3 ? 23 : 30;
    var step = fs + 9;
    var top = 212 - ((lines.length - 1) * step) / 2;
    return '<svg class="cover" viewBox="0 0 300 430" role="img" aria-label="غلاف: ' + esc(b.title) + '">' +
      '<defs><linearGradient id="' + id + '" x1="0" y1="0" x2="1" y2="1">' +
      '<stop offset="0" stop-color="#205e46"/><stop offset="1" stop-color="#0d3125"/></linearGradient></defs>' +
      '<rect width="300" height="430" rx="12" fill="url(#' + id + ')"/>' +
      '<g fill="none" stroke="#c9a962" stroke-opacity=".20">' +
      '<path d="M44 62l6 18 18 6-18 6-6 18-6-18-18-6 18-6z"/>' +
      '<path d="M252 326l5 15 15 5-15 5-5 15-5-15-15-5 15-5z"/>' +
      '<path d="M254 86l4 12 12 4-12 4-4 12-4-12-12-4 12-4z"/></g>' +
      '<rect x="14" y="14" width="272" height="402" rx="8" fill="none" stroke="#c9a962" stroke-width="1.4" opacity=".85"/>' +
      '<rect x="21" y="21" width="258" height="388" rx="6" fill="none" stroke="#c9a962" stroke-width=".6" opacity=".5"/>' +
      '<g stroke="#c9a962" fill="none" opacity=".9"><path d="M150 66l10 10-10 10-10-10z"/><path d="M96 76h34M170 76h34"/></g>' +
      lines.map(function (l, i) {
        return '<text x="150" y="' + Math.round(top + i * step) + '" text-anchor="middle" font-family="Amiri, \'Traditional Arabic\', serif" font-size="' + fs + '" fill="#f4ead0">' + esc(l) + '</text>';
      }).join('') +
      '<line x1="72" y1="366" x2="228" y2="366" stroke="#c9a962" stroke-width=".8" opacity=".6"/>' +
      '<text x="150" y="393" text-anchor="middle" font-family="Amiri, serif" font-size="16" fill="#c9a962">' + esc(b.author || '') + '</text>' +
      '</svg>';
  }

  function cardHTML(b) {
    var prog = window.Maktaba.getProgress(b.slug), pct = 0, contLabel = '';
    if (prog && prog.page && b.pageCount) {
      var idx = parseInt(prog.page, 10) || 1;
      pct = Math.min(100, Math.round((idx / b.pageCount) * 100));
      contLabel = 'متابعة: ' + (prog.title || ('القسم ' + idx));
    }
    var openUrl = 'books/' + b.slug + '/' + (pct && prog.page ? 'pages/' + prog.page + '.html' : '');
    return '<article class="book-card">' +
      '<a class="book-card__cover" href="books/' + b.slug + '/" aria-label="' + esc(b.title) + '">' + coverSVG(b) + '</a>' +
      '<div class="book-card__body">' +
      '<h3 class="book-card__title"><a href="books/' + b.slug + '/">' + esc(b.title) + '</a></h3>' +
      '<p class="book-card__author">' + esc(b.author || '') + '</p>' +
      '<p class="book-card__desc">' + esc(b.description || '') + '</p>' +
      '<div class="chips"><span class="chip">' + (b.pageCount || '؟') + ' أقسام</span>' +
      (b.tags || []).slice(0, 3).map(function (t) { return '<span class="chip chip--soft">' + esc(t) + '</span>'; }).join('') +
      '</div>' +
      (pct ? '<div class="pbar"><i style="width:' + pct + '%"></i></div><p class="mini muted" style="margin:0">' + esc(contLabel) + ' — ' + pct + '%</p>' : '') +
      '<div class="book-card__actions">' +
      '<a class="btn btn--primary btn--sm" href="' + openUrl + '">' + (pct ? 'متابعة القراءة' : 'افتح الكتاب') + '</a>' +
      (b.pdf ? '<a class="btn btn--ghost btn--sm" href="books/' + b.slug + '/' + esc(b.pdf) + '" download>PDF</a>' : '') +
      '</div></div></article>';
  }

  function renderContinue() {
    var sec = doc.getElementById('continue-section');
    if (!sec) return;
    var slug = store.get(KEYS.last, null);
    if (!slug) return;
    var prog = window.Maktaba.getProgress(slug);
    if (!prog || !prog.page) return;
    window.Maktaba.loadManifest().then(function (m) {
      var b = m.books.filter(function (x) { return x.slug === slug; })[0];
      if (!b) return;
      var pct = b.pageCount ? Math.min(100, Math.round(((parseInt(prog.page, 10) || 1) / b.pageCount) * 100)) : 0;
      sec.innerHTML =
        '<div class="continue">' +
        '<div class="continue__icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><path d="M6 3h12v18l-6-4-6 4z"/></svg></div>' +
        '<div class="continue__txt"><p class="continue__k">أكمل من حيث توقفت</p>' +
        '<h3>' + esc(b.title) + ' <span class="muted mini">· ' + esc(prog.title || '') + '</span></h3>' +
        '<div class="pbar"><i style="width:' + pct + '%"></i></div></div>' +
        '<a class="btn btn--gold" href="books/' + b.slug + '/pages/' + esc(prog.page) + '.html">استئناف القراءة</a>' +
        '</div>';
      sec.hidden = false;
    }).catch(function () {});
  }

  /* ============ صفحة البحث ============ */
  function initSearch() {
    var form = doc.getElementById('search-form');
    var input = doc.getElementById('search-input');
    var out = doc.getElementById('search-results');
    var info = doc.getElementById('search-info');
    var q = (new URLSearchParams(location.search).get('q') || '').trim();
    if (input && q) input.value = q;
    if (form) form.addEventListener('submit', function (e) {
      e.preventDefault();
      var v = (input.value || '').trim();
      if (v) location.href = 'search.html?q=' + encodeURIComponent(v);
    });
    if (!q || !out) return;
    out.innerHTML = '<p class="muted">جارٍ تهيئة فهرس البحث…</p>';
    window.Maktaba.loadManifest().then(function (m) {
      if (!m.books.length) { out.innerHTML = '<div class="empty">لا توجد كتب مفهرسة بعد.</div>'; return; }
      var indexes = [], done = 0, total = m.books.length;
      m.books.forEach(function (b, i) {
        fetch(ROOT + 'books/' + b.slug + '/search-index.json')
          .then(function (r) { return r.ok ? r.json() : null; })
          .catch(function () { return null; })
          .then(function (idx) {
            indexes[i] = idx; done++;
            if (info) info.textContent = 'تهيئة الفهرس: ' + done + '/' + total;
            if (done === total) runSearch(q, m.books, indexes, out);
          });
      });
    });
  }

  function runSearch(q, books, indexes, out) {
    var re;
    try { re = arabicRegex(q); } catch (e) { out.innerHTML = '<div class="empty">استعلام غير صالح.</div>'; return; }
    var nq = normAr(q), html = '', hits = 0;
    books.forEach(function (b, i) {
      var idx = indexes[i];
      if (!idx || !idx.entries) return;
      var items = [];
      idx.entries.forEach(function (e) {
        var hay = normAr((e.t || '') + ' ' + (e.x || ''));
        if (hay.indexOf(nq) === -1) return;
        items.push('<li class="result">' +
          '<a class="result__link" href="' + ROOT + 'books/' + b.slug + '/' + esc(e.u) + '?q=' + encodeURIComponent(q) + '">' + esc(e.t || b.title) + '</a>' +
          '<p class="result__book">من كتاب: ' + esc(b.title) + ' — ' + esc(b.author || '') + '</p>' +
          '<p class="result__snippet">' + makeSnippet(e.x || '', re) + '</p></li>');
      });
      if (items.length) { hits += items.length; html += '<ul class="results">' + items.join('') + '</ul>'; }
    });
    out.innerHTML = hits
      ? '<p class="search-summary">عدد النتائج: ' + hits + '</p>' + html
      : '<div class="empty">لا توجد نتائج مطابقة لـ «' + esc(q) + '».<br>جرّب كلمات أقل، فالبحث يتجاهل التشكيل والهمزات تلقائياً.</div>';
  }

  function makeSnippet(text, re) {
    re.lastIndex = 0;
    var m = re.exec(text);
    var start = m ? Math.max(0, m.index - 70) : 0;
    var end = m ? Math.min(text.length, m.index + m[0].length + 100) : Math.min(text.length, 150);
    var s = (start > 0 ? '…' : '') + text.slice(start, end) + (end < text.length ? '…' : '');
    var out = '', last = 0, mm;
    var re2 = new RegExp(re.source, 'g');
    while ((mm = re2.exec(s)) !== null) {
      out += esc(s.slice(last, mm.index)) + '<mark>' + esc(mm[0]) + '</mark>';
      last = mm.index + mm[0].length;
      if (re2.lastIndex === mm.index) re2.lastIndex++;
    }
    return out + esc(s.slice(last));
  }
})();
