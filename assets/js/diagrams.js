/* ============================================================
   خزانة الأثر — المشجرات (diagrams.js) — النسخة ٥
   + وراثة الروابط: كل عقدة بلا href ترث رابط أبيها،
     فينقل النقرُ على أي عقدة إلى الفقرة التي تكافئها.
   + ضبط الجوال: طي تلقائي متدرج حسب عرض الشاشة.
   ============================================================ */
(function () {
  'use strict';
  var USE_MERMAID = false;
  var BRANCHES = 6;
  var seq = 0;

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function arNum(n) { return String(n).replace(/[0-9]/g, function (d) { return '٠١٢٣٤٥٦٧٨٩'[+d]; }); }
  function caretSVG() {
    return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9l6 6 6-6"/></svg>';
  }
  function goSVG() {
    return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M15 6l-6 6 6 6"/></svg>';
  }
  function countNodes(n) {
    var c = 1;
    (n.children || []).forEach(function (k) { c += countNodes(k); });
    return c;
  }

  /* العقدة: ترث رابط أقرب أب — فتصبح كلها قابلة للنقر */
  function nodeHTML(n, depth, inheritedHref) {
    var href = n.href || inheritedHref || null;
    var hasKids = !!(n.children && n.children.length);
    var inner = href
      ? '<a href="' + esc(href) + '">' + esc(n.label) + '</a><span class="tree__go" aria-hidden="true">' + goSVG() + '</span>'
      : '<span>' + esc(n.label) + '</span>';
    var side = hasKids
      ? '<button type="button" class="tree__caret" aria-expanded="' + (n.collapsed ? 'false' : 'true') + '" aria-label="طي أو توسيع الفرع">' + caretSVG() + '</button>'
      : '<span class="tree__leaf" aria-hidden="true"></span>';
    var delay = ' style="animation-delay:' + Math.min(seq++ * 26, 420) + 'ms"';
    return '<div class="tree__node d' + depth + (n.cls ? ' ' + esc(n.cls) : '') + (hasKids ? ' has-children' : '') + '"' + delay + '>' + side + inner + '</div>';
  }

  function listHTML(nodes, depth, inheritedHref) {
    if (!nodes || !nodes.length) return '';
    return '<ul class="tbranch">' + nodes.map(function (n, i) {
      var cls = 'titem d' + depth;
      if (depth === 1) cls += ' c' + (i % BRANCHES);
      if (n.collapsed) cls += ' is-collapsed';
      var eff = n.href || inheritedHref || null;
      return '<li class="' + cls + '">' + nodeHTML(n, depth, inheritedHref) + listHTML(n.children, depth + 1, eff) + '</li>';
    }).join('') + '</ul>';
  }

  function renderTree(data, host) {
    seq = 0;
    host.classList.add('tree');
    host.innerHTML = '<ul class="tree__root"><li class="titem titem--root">' +
      nodeHTML(data, 0, null) + listHTML(data.children, 1, null) + '</li></ul>';

    var total = countNodes(data) - 1;
    var rootNode = host.querySelector(':scope > ul > li > .tree__node');
    if (rootNode && total > 0) {
      var chip = document.createElement('span');
      chip.className = 'tree__count';
      chip.title = 'عدد الأفكار في الخريطة';
      chip.textContent = arNum(total) + ' فكرة';
      rootNode.appendChild(chip);
    }
    autoCollapse(host);
  }

  /* الجوال: كلما صغرت الشاشة طوينا أعمق — تبقى خريطة مضغوطة تنطبق */
  function autoCollapse(host) {
    if (!window.matchMedia) return;
    var tiny = matchMedia('(max-width: 480px)').matches;
    var small = matchMedia('(max-width: 700px)').matches;
    if (!tiny && !small) return;
    var sel = tiny ? 'li.d1, li.d2, li.d3, li.d4, li.d5' : 'li.d2, li.d3, li.d4, li.d5';
    host.querySelectorAll(sel).forEach(function (li) {
      if (!li.querySelector(':scope > .tree__node.has-children')) return;
      li.classList.add('is-collapsed');
      var c = li.querySelector(':scope > .tree__node > .tree__caret');
      if (c) c.setAttribute('aria-expanded', 'false');
    });
  }

  /* --- محرك Mermaid الاختياري (تراجع تلقائي) --- */
  function mermaidSyntax(data) {
    var out = ['flowchart TD'], s = 0;
    (function walk(n, parent) {
      var id = 'N' + (++s);
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
          themeVariables: { fontFamily: 'Amiri', serif: 'Amiri', fontSize: '16px' }
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
        li.classList.toggle('is-collapsed', collapse);
        var c = li.querySelector(':scope > .tree__node > .tree__caret');
        if (c) c.setAttribute('aria-expanded', String(!collapse));
      });
    }
  });
})();