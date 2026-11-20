/*! boot — يضبط السمة والخط قبل أول رسم */
(function () {
  try {
    var d = document.documentElement;
    var p = JSON.parse(localStorage.getItem('khizana:prefs') || '{}');
    var t = p.theme || 'auto';
    if (t === 'auto') t = matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    if (t !== 'light' && t !== 'sepia' && t !== 'dark') t = 'light';
    d.setAttribute('data-theme', t);
    if (p.family) d.setAttribute('data-family', p.family);
    if (p.fs) d.style.setProperty('--fs-scale', p.fs);
    if (p.lh) d.style.setProperty('--lh', p.lh);
    if (p.justify === false) d.setAttribute('data-justify', 'off');
  } catch (e) {}
})();
