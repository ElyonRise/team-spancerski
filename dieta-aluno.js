(function () {
  'use strict';
  var q = new URLSearchParams(location.search);
  var id = q.get('aluno') || q.get('id') || q.get('a');
  if (!id) return;
  var d = new Date();
  var HOJE = d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate();
  var KEY = 'dp_ok_' + id + '_' + HOJE;
  var est = null;

  function lerOk() { try { return JSON.parse(localStorage.getItem(KEY) || '[]'); } catch (e) { return []; } }
  function gravarOk(a) { try { localStorage.setItem(KEY, JSON.stringify(a)); } catch (e) {} }

  async function buscar() {
    for (var i = 0; i < 50; i++) {
      if (window.firebase && firebase.apps && firebase.apps.length && firebase.database) {
        try { return (await firebase.database().ref('dietas/' + id + '/estruturada').once('value')).val(); } catch (e) { return null; }
      }
      await new Promise(function (r) { setTimeout(r, 200); });
    }
    return null;
  }

  /* fator cozido -> cru */
  var CRU = [
    [/arroz/i, 0.40], [/feij[aã]o|lentilha|gr[aã]o.de.bico/i, 0.42], [/macarr[aã]o|massa/i, 0.45],
    [/cuscuz/i, 0.40], [/frango|peito|sobrecoxa|coxa|peru/i, 1.40],
    [/carne|patinho|ac[eé]m|m[oó]ida|bovin/i, 1.35], [/til[aá]pia|peixe|sardinha|atum/i, 1.25],
    [/batata/i, 1.10], [/mandioca|aipim|macaxeira/i, 1.20]
  ];
  function num(s) { return parseFloat(s.indexOf(',') >= 0 ? s.replace(/\./g, '').replace(',', '.') : s); }
  function fmt(g) {
    if (g >= 1000) return (Math.round(g / 100) / 10).toString().replace('.', ',') + ' kg';
    return (Math.round(g / 10) * 10) + ' g';
  }

  function transformaLista(root) {
    root.querySelectorAll('.dl-cat li').forEach(function (li) {
      if (li.dataset.cru) return;
      li.dataset.cru = '1';
      var nomeEl = li.querySelector('.dl-nome'), qEl = li.querySelector('.dl-qtd');
      if (!nomeEl || !qEl) return;
      var qt = qEl.textContent.trim();
      if (!qt) { li.style.display = 'none'; return; }
      var nome = nomeEl.textContent;
      if (!/cozid|refogad|grelhad|assad/i.test(nome)) return;
      var m = qt.match(/^([\d.,]+)\s*(kg|g)\b/i);
      if (!m) return;
      var fator = 0;
      for (var i = 0; i < CRU.length; i++) { if (CRU[i][0].test(nome)) { fator = CRU[i][1]; break; } }
      if (!fator) return;
      var g = num(m[1]) * (m[2].toLowerCase() === 'kg' ? 1000 : 1);
      qEl.textContent = fmt(g * fator);
      var limpo = nome.replace(/,?\s*\(?\s*peso cozid[oa]\s*\)?/gi, '')
        .replace(/\s+(cozid[oa]s?|refogad[oa]s?|grelhad[oa]s?|assad[oa]s?)\b/gi, '')
        .replace(/[\s,]+$/, '').trim();
      nomeEl.textContent = limpo + ' (cru)';
    });
    root.querySelectorAll('*').forEach(function (el) {
      if (el.children.length === 0 && /rendem menos/i.test(el.textContent)) {
        el.textContent = 'Quantidades em peso cru, como voc\u00ea compra no mercado (convers\u00e3o estimada).';
      }
    });
  }

  function observaLista(root) {
    var t, mo = new MutationObserver(function () {
      clearTimeout(t);
      t = setTimeout(function () { mo.disconnect(); transformaLista(root); ligar(); }, 120);
    });
    function ligar() { mo.observe(root, { childList: true, subtree: true, characterData: true }); }
    transformaLista(root);
    ligar();
  }

  function marcarRefeicoes(wrap) {
    var plano = wrap.querySelector('#dpPlano');
    var ok = lerOk();
    var meals = plano.querySelectorAll('.dp-meal');
    var prog = document.createElement('div');
    prog.className = 'dp-prog';
    plano.insertBefore(prog, plano.firstChild);
    function atualiza() {
      var n = plano.querySelectorAll('.dp-meal.feito').length, t = meals.length;
      prog.innerHTML = '<div class="dp-prog-txt">Hoje: ' + n + ' de ' + t + ' refei\u00e7\u00f5es conclu\u00eddas</div><div class="dp-prog-bar"><i style="width:' + (t ? Math.round(n * 100 / t) : 0) + '%"></i></div>';
    }
    meals.forEach(function (m, i) {
      var btn = document.createElement('button');
      btn.type = 'button'; btn.className = 'dp-ok';
      (m.querySelector('.dp-meal-head') || m).appendChild(btn);
      function pinta() {
        var f = ok.indexOf(i) >= 0;
        m.classList.toggle('feito', f);
        btn.textContent = f ? '\u2705 Conclu\u00edda' : 'Marcar como conclu\u00edda';
      }
      btn.onclick = function () {
        var k = ok.indexOf(i);
        if (k >= 0) ok.splice(k, 1); else ok.push(i);
        gravarOk(ok); pinta(); atualiza();
      };
      pinta();
    });
    atualiza();
  }

  function montar() {
    if (!est) return;
    var h = [].slice.call(document.querySelectorAll('h1,h2,h3,h4')).filter(function (x) { return /^\s*sua dieta\s*$/i.test(x.textContent); })[0];
    if (!h) return;
    var atual = document.getElementById('dpWrap');
    if (!atual) {
      atual = document.createElement('div');
      atual.id = 'dpWrap'; atual.className = 'dp-wrap';
      atual.innerHTML = '<div class="dp-tabs"><button class="dp-tab on" data-t="plano">\uD83C\uDF7D\uFE0F Plano</button><button class="dp-tab" data-t="lista">\uD83D\uDED2 Lista de compras</button></div><div id="dpPlano"></div><div id="dpLista" style="display:none"></div>';
      h.insertAdjacentElement('afterend', atual);
      atual.querySelector('#dpPlano').innerHTML = DietaEstruturada.html(est);
      marcarRefeicoes(atual);
      DietaEstruturada.renderLista(atual.querySelector('#dpLista'), est, id);
      observaLista(atual.querySelector('#dpLista'));
      atual.querySelectorAll('.dp-tab').forEach(function (b) {
        b.onclick = function () {
          atual.querySelectorAll('.dp-tab').forEach(function (x) { x.classList.toggle('on', x === b); });
          atual.querySelector('#dpPlano').style.display = b.dataset.t === 'plano' ? '' : 'none';
          atual.querySelector('#dpLista').style.display = b.dataset.t === 'lista' ? '' : 'none';
        };
      });
    }
    for (var s = atual.nextElementSibling; s; s = s.nextElementSibling) s.style.display = 'none';
  }

  async function iniciar() {
    est = await buscar();
    if (!est || !window.DietaEstruturada || !DietaEstruturada.valida(est)) return;
    montar();
    var t;
    new MutationObserver(function () { clearTimeout(t); t = setTimeout(montar, 250); }).observe(document.body, { childList: true, subtree: true });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', iniciar); else iniciar();
})();