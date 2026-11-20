/* ============================================================
   خزانة الآثار — المشجرات التوضيحية (diagrams.js)
   محرك CSS/SVG أصيل (RTL دقيق، يعمل بلا إنترنت وينطبع جيداً)
   + دعم اختياري لـ Mermaid.js بضبط USE_MERMAID = true
   ============================================================ */
(function () {
  'use strict';
  var USE_MERMAID = false; /* اجعلها true لتوليد المشجرة عبر Mermaid.js من CDN */

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function caretSVG() {
    return '<svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9l6 6 6-6"/></svg>';
  }
  function nodeHTML(n) {
    var inner = n.href
      ? '<a href="' + esc(n.href) + '">' + esc(n.label) + '</a>'
      : '<span>' + esc(n.label) + '</span>';
    var caret = (n.children && n.children.length)
      ? '<button type="button" class="tree__caret" aria-expanded="' + (n.collapsed ? 'false' : 'true') + '" aria-label="طي أو توسيع الفرع">' + caretSVG() + '</button>'
      : '';
    return '<div class="tree__node ' + (n.cls ? esc(n.cls) : '') + '">' + inner + caret + '</div>';
  }
  function listHTML(nodes) {
    return '<ul>' + nodes.map(function (n) {
      var kids = (n.children && n.children.length) ? listHTML(n.children) : '';
      return '<li' + (n.collapsed ? ' class="is-collapsed"' : '') + '>' + nodeHTML(n) + kids + '</li>';
    }).join('') + '</ul>';
  }
  function renderTree(data, host) {
    host.classList.add('tree');
    host.innerHTML = '<ul><li>' + nodeHTML(data) +
      ((data.children && data.children.length) ? listHTML(data.children) : '') +
      '</li></ul>';
  }

  /* --- محرك Mermaid الاختياري (مع تراجع تلقائي للمحرك الأصيل) --- */
  function mermaidSyntax(data) {
    var out = ['flowchart TD'], seq = 0;
    (function walk(n, parent) {
      var id = 'N' + (++seq);
      var safe = String(n.label).replace(/"/g, "'");
      out.push('  ' + id + (n.href ? '["' + safe + '"]' : '("' + safe + '")'));
      if (parent) out.push('  ' + parent + ' --> ' + id);
      if (n.href) out.push('  click ' + id + ' "' + n.href + '" "انتقال"');
      (n.children || []).forEach(function (c) { walk(c, id); });
    })(data, null);
    return out.join('\n');
  }
  function renderMermaid(data, host) {
    var ok = false;
    import('https://cdn.jsdelivr.net/npm/mermaid@11/dist/mermaid.esm.min.mjs')
      .then(function (mod) {
        var mermaid = mod.default || mod;
        mermaid.initialize({
          startOnLoad: false, securityLevel: 'loose', theme: 'base',
          themeVariables: { fontFamily: 'Amiri, serif', fontSize: '16px' }
        });
        var div = document.createElement('div');
        div.className = 'mermaid';
        div.textContent = mermaidSyntax(data);
        host.innerHTML = ''; host.appendChild(div);
        return mermaid.run({ nodes: [div] });
      })
      .then(function () { ok = true; })
      .catch(function () { if (!ok) { ok = true; renderTree(data, host); } });
    setTimeout(function () { if (!ok) { ok = true; renderTree(data, host); } }, 5000);
  }

  /* --- بناء كل المشجرات الموجودة في الصفحة --- */
  document.querySelectorAll('script[type="application/json"][data-tree]').forEach(function (s) {
    var data;
    try { data = JSON.parse(s.textContent); } catch (e) { return; }
    var host = document.getElementById(s.getAttribute('data-tree'));
    if (!host || !data || !data.label) return;
    if (USE_MERMAID) { renderMermaid(data, host); return; }
    renderTree(data, host);
  });

  /* --- تفاعلات: طي/توسيع فرع، توسيع/طي الكل --- */
  document.addEventListener('click', function (e) {
    if (!e.target.closest) return;
    var caret = e.target.closest('.tree__caret');
    if (caret) {
      e.preventDefault();
      var li = caret.closest('li');
      var collapsed = li.classList.toggle('is-collapsed');
      caret.setAttribute('aria-expanded', String(!collapsed));
      return;
    }
    var act = e.target.closest('[data-tree-action]');
    if (act) {
      var fig = act.closest('.tree-figure');
      if (!fig) return;
      var collapse = act.getAttribute('data-tree-action') === 'collapse';
      fig.querySelectorAll('.tree li').forEach(function (li) {
        if (li.querySelector(':scope > .tree__node.t-root')) return;
        li.classList.toggle('is-collapsed', collapse);
        var c = li.querySelector(':scope > .tree__node > .tree__caret');
        if (c) c.setAttribute('aria-expanded', String(!collapse));
      });
    }
  });
})();
