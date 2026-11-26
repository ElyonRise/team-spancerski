(function () {
  'use strict';
  var DIAS = ['segunda','terca','quarta','quinta','sexta','sabado','domingo'];
  function idx(t) { return DIAS.indexOf(t.trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/-feira$/,'')); }
  function rotulos() {
    var out = [];
    document.querySelectorAll('body *').forEach(function (el) {
      if (el.children.length || el.closest('#trBar') || el.closest('.dp-wrap')) return;
      var t = el.textContent || '';
      if (t.length < 20 && idx(t) >= 0) out.push(el);
    });
    return out;
  }
  function ordenar() {
    var L = rotulos(); if (L.length < 2) return;
    var pai = L[0].parentElement;
    while (pai && !L.every(function (e) { return pai.contains(e); })) pai = pai.parentElement;
    if (!pai) return;
    var topo = function (e) { while (e.parentElement !== pai) e = e.parentElement; return e; };
    var tops = L.map(topo);
    if (tops.some(function (x, i) { return tops.indexOf(x) !== i; })) return;
    var kids = [].slice.call(pai.children), pos = tops.map(function (x) { return kids.indexOf(x); });
    var gr = tops.map(function (x, i) { return { d: idx(L[i].textContent), nos: kids.slice(pos[i], i + 1 < tops.length ? pos[i + 1] : kids.length) }; });
    var ord = gr.slice().sort(function (a, b) { return a.d - b.d; });
    if (ord.every(function (g, i) { return g === gr[i]; })) return;
    var ref = gr[gr.length - 1].nos.slice(-1)[0].nextSibling;
    ord.forEach(function (g) { g.nos.forEach(function (n) { pai.insertBefore(n, ref); }); });
  }
  function iniciar() { ordenar(); var t; new MutationObserver(function () { clearTimeout(t); t = setTimeout(ordenar, 300); }).observe(document.body, { childList: true, subtree: true }); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', iniciar); else iniciar();
})();