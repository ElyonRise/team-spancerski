(function () {
  'use strict';
  const q = new URLSearchParams(location.search);
  const id = q.get('aluno') || q.get('id') || q.get('a');
  if (!id) return;

  async function buscar() {
    for (let i = 0; i < 50; i++) {
      if (window.firebase && firebase.apps && firebase.apps.length && firebase.database) {
        try { return (await firebase.database().ref('dietas/' + id + '/estruturada').once('value')).val(); } catch (e) { return null; }
      }
      await new Promise(r => setTimeout(r, 200));
    }
    return null;
  }

  async function iniciar() {
    const est = await buscar();
    if (!est || !window.DietaEstruturada || !DietaEstruturada.valida(est)) return;
    const wrap = document.createElement('div');
    wrap.className = 'dp-wrap';
    wrap.innerHTML = '<div class="dp-tabs"><button class="dp-tab on" data-t="plano">🍽️ Plano</button><button class="dp-tab" data-t="lista">🛒 Lista de compras</button></div><div id="dpPlano"></div><div id="dpLista" style="display:none"></div>';
    const alvo = document.querySelector('main') || document.body;
    alvo.insertBefore(wrap, alvo.firstChild);
    wrap.querySelector('#dpPlano').innerHTML = DietaEstruturada.html(est);
    DietaEstruturada.renderLista(wrap.querySelector('#dpLista'), est, id);
    wrap.querySelectorAll('.dp-tab').forEach(b => b.onclick = () => {
      wrap.querySelectorAll('.dp-tab').forEach(x => x.classList.toggle('on', x === b));
      wrap.querySelector('#dpPlano').style.display = b.dataset.t === 'plano' ? '' : 'none';
      wrap.querySelector('#dpLista').style.display = b.dataset.t === 'lista' ? '' : 'none';
    });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', iniciar); else iniciar();
})();