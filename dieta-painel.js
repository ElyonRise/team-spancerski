(function () {
  'use strict';
  const load = src => new Promise((ok, err) => { const s = document.createElement('script'); s.src = src; s.onload = ok; s.onerror = () => err(new Error('Falha ao carregar ' + src)); document.head.appendChild(s); });
  async function libs(ext) {
    if (ext === 'pdf' && !window.pdfjsLib) {
      await load('https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js');
      window.pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
    }
    if (ext !== 'pdf' && !window.mammoth) await load('https://cdnjs.cloudflare.com/ajax/libs/mammoth/1.6.0/mammoth.browser.min.js');
  }
  const db = () => {
    if (window.firebase && firebase.apps && firebase.apps.length && firebase.database) return firebase.database();
    throw new Error('Firebase nao encontrado nesta pagina (versao compat).');
  };
  let est = null;

  function montar() {
    const fab = document.createElement('button');
    fab.id = 'dpFab'; fab.className = 'btn-acao'; fab.textContent = '📄 Dieta estruturada';
    const modal = document.createElement('div');
    modal.id = 'dpModal';
    modal.innerHTML = '<div class="dp-box"><h3>Dieta estruturada</h3>' +
      '<label>Aluno<select id="dpAluno"><option value="">Carregando...</option></select></label>' +
      '<label>Arquivo da dieta (PDF ou Word)<input type="file" id="dpArq" accept=".pdf,.docx"></label>' +
      '<p class="sp-muted" id="dpStatus"></p><div id="dpPrev"></div>' +
      '<div class="dp-linha"><button class="btn-acao" id="dpSalvar" disabled>Salvar para o aluno</button><button class="btn-acao" id="dpFechar" style="background:#333">Fechar</button></div></div>';
    document.body.appendChild(fab); document.body.appendChild(modal);
    const $ = s => modal.querySelector(s), st = t => $('#dpStatus').textContent = t;

    fab.onclick = async () => {
      modal.style.display = 'block'; $('#dpArq').value = ''; est = null; $('#dpPrev').innerHTML = ''; $('#dpSalvar').disabled = true; st('');
      try {
        const v = (await db().ref('alunos').once('value')).val() || {};
        const ops = Object.keys(v).map(id => ({ id, nome: (v[id] && (v[id].nome || v[id].name)) || id }))
          .sort((a, b) => String(a.nome).localeCompare(String(b.nome), 'pt-BR'));
        $('#dpAluno').innerHTML = '<option value="">Escolha o aluno...</option>' + ops.map(o => '<option value="' + o.id + '">' + String(o.nome).replace(/</g, '&lt;') + '</option>').join('');
      } catch (e) { st('Erro ao listar alunos: ' + e.message); }
    };
    $('#dpFechar').onclick = () => modal.style.display = 'none';
    $('#dpArq').onclick = e => { e.target.value = ''; };

    $('#dpArq').onchange = async e => {
      const f = e.target.files[0]; if (!f) return;
      est = null; $('#dpSalvar').disabled = true; $('#dpPrev').innerHTML = '';
      try {
        st('Lendo arquivo...');
        const ext = f.name.toLowerCase().endsWith('.pdf') ? 'pdf' : 'docx';
        await libs(ext);
        const buf = await f.arrayBuffer();
        const linhas = ext === 'pdf' ? await DietaEstruturada.linhasDePdf(buf) : await DietaEstruturada.linhasDeDocx(buf);
        const r = DietaEstruturada.parse(linhas);
        if (!DietaEstruturada.valida(r)) { st('Nao consegui estruturar esta dieta. Confira se as refeicoes estao como "08:15 — Pre-treino" e as opcoes como "Opcao 1".'); return; }
        est = r;
        $('#dpPrev').innerHTML = DietaEstruturada.html(r);
        st('Prévia pronta. Confira e clique em Salvar.');
        $('#dpSalvar').disabled = false;
      } catch (err) { st('Erro: ' + err.message); }
    };

    $('#dpSalvar').onclick = async () => {
      const id = $('#dpAluno').value;
      if (!id) { st('Escolha o aluno.'); return; }
      if (!est) { st('Escolha o arquivo da dieta e aguarde a prévia antes de salvar.'); return; }
      try {
        await db().ref('dietas/' + id + '/estruturada').set(est);
        const base = location.href.replace(/[^\/]*$/, '');
        const chk = (await db().ref('dietas/' + id + '/estruturada/titulo').once('value')).val();
        const link = base + 'aluno.html?aluno=' + id;
        st('Salvo! Link do aluno: ' + link);
        alert(chk ? 'SALVO! Link do aluno:\n' + link : 'Gravou, mas nao consegui confirmar a leitura. Abra o link e confira.');
      } catch (err) { st('Erro ao salvar: ' + err.message); alert('ERRO ao salvar: ' + (err.code || '') + ' ' + err.message); }
    };
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', montar); else montar();
})();