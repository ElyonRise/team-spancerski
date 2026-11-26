(function () {
  'use strict';
  var q = new URLSearchParams(location.search);
  var id = q.get('aluno') || q.get('id') || q.get('a') || 'x';
  var d = new Date();
  var KEY = 'tr_ser_' + id + '_' + d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate();
  function ler() { try { return JSON.parse(localStorage.getItem(KEY) || '{}'); } catch (e) { return {}; } }
  function gravar(o) { try { localStorage.setItem(KEY, JSON.stringify(o)); } catch (e) {} }

  var ac, fim = 0, iv = null;
  function desbloqueia() {
    try { ac = ac || new (window.AudioContext || window.webkitAudioContext)(); if (ac.resume) ac.resume(); } catch (e) {}
  }
  function beep() {
    try {
      [0, 0.25, 0.5].forEach(function (t) {
        var o = ac.createOscillator(), g = ac.createGain();
        o.frequency.value = 880; g.gain.value = 0.2;
        o.connect(g); g.connect(ac.destination);
        o.start(ac.currentTime + t); o.stop(ac.currentTime + t + 0.15);
      });
    } catch (e) {}
    if (navigator.vibrate) navigator.vibrate([300, 100, 300]);
  }

  function barra() {
    var b = document.getElementById('trBar');
    if (b) return b;
    b = document.createElement('div');
    b.id = 'trBar';
    b.innerHTML = '<div class="tr-t"><span>\u23F1\uFE0F</span><div><div class="tr-n" id="trN">Descanso</div><div class="tr-c" id="trC">00:00</div></div></div><div class="tr-b"><button type="button" id="trMais">+15s</button><button type="button" id="trPula">Pular</button></div>';
    document.body.appendChild(b);
    b.querySelector('#trMais').onclick = function () { fim += 15000; tick(); };
    b.querySelector('#trPula').onclick = parar;
    return b;
  }
  function parar() { clearInterval(iv); iv = null; barra().style.display = 'none'; }
  function tick() {
    var r = Math.ceil((fim - Date.now()) / 1000);
    var c = document.getElementById('trC');
    if (r <= 0) {
      clearInterval(iv); iv = null;
      c.textContent = '00:00';
      document.getElementById('trN').textContent = 'Descanso encerrado! Pr\u00f3xima s\u00e9rie';
      beep();
      setTimeout(function () { if (!iv) barra().style.display = 'none'; }, 4000);
      return;
    }
    c.textContent = ('0' + Math.floor(r / 60)).slice(-2) + ':' + ('0' + (r % 60)).slice(-2);
  }
  function iniciaTimer(seg) {
    var b = barra();
    b.style.display = 'flex';
    document.getElementById('trN').textContent = 'Descanso';
    fim = Date.now() + seg * 1000;
    clearInterval(iv);
    tick();
    iv = setInterval(tick, 250);
  }

  function achar(re) {
    var out = [];
    document.querySelectorAll('body *').forEach(function (el) {
      if (el.children.length > 2 || el.closest('#trBar') || el.closest('.tr-series')) return;
      var t = (el.textContent || '').replace(/\s+/g, '');
      if (t.length <= 24 && re.test(t)) out.push(el);
    });
    return out.filter(function (el) { return !out.some(function (o) { return o !== el && el.contains(o); }); });
  }

  function decorar() {
    var des = achar(/^(\d+)(?::(\d{2}))?(s|seg|min)?descanso$/i);
    var ser = achar(/^(\d+)s[\u00e9e]ries?$/i);
    des.forEach(function (dEl, idx) {
      var t = dEl.textContent.replace(/\s+/g, '');
      var m = t.match(/^(\d+)(?::(\d{2}))?(s|seg|min)?descanso$/i);
      var seg = m[2] ? (+m[1]) * 60 + (+m[2]) : (/min/i.test(m[3] || '') ? (+m[1]) * 60 : +m[1]);
      var a = dEl.parentElement;
      while (a && !ser.some(function (s) { return a.contains(s); })) a = a.parentElement;
      if (!a || a.dataset.trOk) return;
      var dentro = ser.filter(function (s) { return a.contains(s); });
      if (dentro.length !== 1) return;
      var n = parseInt(dentro[0].textContent.replace(/\s+/g, ''), 10);
      if (!n || n > 20) return;
      a.dataset.trOk = '1';
      var box = document.createElement('div');
      box.className = 'tr-series';
      box.innerHTML = '<span class="tr-lbl">Marque cada s\u00e9rie conclu\u00edda (descanso de ' + seg + 's)</span>';
      var estado = ler();
      var feitas = estado[idx] || [];
      for (var i = 1; i <= n; i++) {
        (function (i) {
          var b = document.createElement('button');
          b.type = 'button'; b.className = 'tr-s' + (feitas.indexOf(i) >= 0 ? ' on' : '');
          b.textContent = i;
          b.onclick = function () {
            desbloqueia();
            var st = ler(), f = st[idx] || [], k = f.indexOf(i);
            if (k >= 0) { f.splice(k, 1); b.classList.remove('on'); }
            else {
              f.push(i); b.classList.add('on');
              if (f.length < n) iniciaTimer(seg); else parar();
            }
            st[idx] = f; gravar(st);
          };
          box.appendChild(b);
        })(i);
      }
      a.insertAdjacentElement('afterend', box);
    });
  }

  function iniciar() {
    decorar();
    var t;
    new MutationObserver(function () { clearTimeout(t); t = setTimeout(decorar, 300); }).observe(document.body, { childList: true, subtree: true });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', iniciar); else iniciar();
})();