/* ============================================================
   خزانة الأثر — المشجرات (diagrams.js) — النسخة 3
   خريطة أفكار عمودية متعددة المستويات (تلوين حسب العمق)
   + دعم اختياري لـ Mermaid.js (USE_MERMAID = true)
   ============================================================ */
(function () {
  'use strict';
  var USE_MERMAID = false;

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function caretSVG() {
    return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9l6 6 6-6"/></svg>';
  }
  function nodeHTML(n) {
    var hasKids = !!(n.children && n.children.length);
    var inner = n.href
      ? '<a href="' + esc(n.href) + '">' + esc(n.label) + '</a>'
      : '<span>' + esc(n.label) + '</span>';
    var side = hasKids
      ? '<button type="button" class="tree__caret" aria-expanded="' + (n.collapsed ? 'false' : 'true') + '" aria-label="طي أو توسيع الفرع">' + caretSVG() + '</button>'
      : '<span class="tree__leaf" aria-hidden="true"></span>';
    return '<div class="tree__node ' + (n.cls ? esc(n.cls) : '') + (hasKids ? ' has-children' : '') + '">' + side + inner + '</div>';
  }
  /* depth = مستوى العقدة (1 للأبناء المباشرين) — يُستخدم للتلوين الهرمي */
  function listHTML(nodes, depth) {
    if (!nodes || !nodes.length) return '';
    var d = depth || 1;
    return '<ul class="tbranch">' + nodes.map(function (n) {
      return '<li class="titem d' + d + (n.collapsed ? ' is-collapsed' : '') + '">' +
        nodeHTML(n) + listHTML(n.children, d + 1) + '</li>';
    }).join('') + '</ul>';
  }
  function renderTree(data, host) {
    host.classList.add('tree');
    host.innerHTML =
      '<ul><li class="titem titem--root d0">' +
        nodeHTML(data) + listHTML(data.children, 1) +
      '</li></ul>';
  }

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

  document.querySelectorAll('script[type="application/json"][data-tree]').forEach(function (s) {
    var data;
    try { data = JSON.parse(s.textContent); } catch (e) { return; }
    var host = document.getElementById(s.getAttribute('data-tree'));
    if (!host || !data || !data.label) return;
    if (USE_MERMAID) { renderMermaid(data, host); return; }
    renderTree(data, host);
  });

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
