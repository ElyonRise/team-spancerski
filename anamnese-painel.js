/* Team Spancerski — Anamneses recebidas (painel do treinador) */
(function () {
  'use strict';
  const $ = id => document.getElementById(id);
  const esc = v => String(v ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }[c]));
  const dt = v => v ? new Date(v).toLocaleString('pt-BR') : '-';
  const db = () => firebase.database();
  const linkForm = () => location.origin + location.pathname.replace(/[^/]*$/, '') + 'anamnese.html';
  const wa = t => 'https://wa.me/' + (String(t || '').replace(/\D/g, '').replace(/^(?!55)/, '55'));
  const POS = { frente: 'Frente', costas: 'Costas', lateralEsquerda: 'Lateral esquerda', lateralDireita: 'Lateral direita' };
  let lista = [];

  function modal(html) {
    document.querySelectorAll('#modalAnamnese').forEach(m => m.remove());
    const m = document.createElement('div');
    m.className = 'overlay-modal'; m.id = 'modalAnamnese';
    m.innerHTML = `<div class="modal sp-modal-wide" style="max-height:90vh;overflow:auto">${html}</div>`;
    m.addEventListener('click', e => { if (e.target === m) m.remove(); });
    document.body.appendChild(m);
  }
  const fechar = () => $('modalAnamnese')?.remove();

  function atualizarBadge() {
    const n = lista.filter(a => !a.visto).length, b = $('anBadge');
    if (b) b.textContent = n ? ` (${n} nova${n > 1 ? 's' : ''})` : '';
  }

  window.copiarLinkAnamnese = async () => {
    try { await navigator.clipboard.writeText(linkForm()); alert('Link copiado:\n' + linkForm()); } catch (_) { prompt('Copie o link:', linkForm()); }
  };
  window.enviarAnamneseWhats = () => {
    const tel = prompt('WhatsApp do aluno (com DDD) — deixe vazio para escolher o contato no WhatsApp:', '');
    if (tel === null) return;
    const msg = encodeURIComponent('Olá! Antes de começarmos, preencha sua anamnese completa neste link: ' + linkForm());
    window.open((tel.trim() ? wa(tel) : 'https://wa.me/') + '?text=' + msg, '_blank', 'noopener');
  };

  window.abrirAnamneses = function () {
    const ord = [...lista].sort((a, b) => new Date(b.criadoEm) - new Date(a.criadoEm));
    modal(`<h2>Anamneses recebidas</h2>
      <p class="sp-muted">Envie o link abaixo para o aluno. Quando ele enviar, a anamnese aparece aqui.</p>
      <div class="sp-toolbar-actions" style="margin:10px 0 18px"><button class="btn-acao primario" onclick="copiarLinkAnamnese()">🔗 Copiar link do formulário</button><button class="btn-acao" onclick="enviarAnamneseWhats()">💬 Enviar por WhatsApp</button></div>
      ${ord.map(a => `<div class="item-recente" onclick="verAnamnese('${esc(a.id)}')"><div class="avatar-inicial">${esc((a.nome || '?')[0].toUpperCase())}</div><div class="info-recente"><div class="nome">${esc(a.nome)} ${a.visto ? '' : '<span class="pill-status pago">NOVA</span>'} ${a.menor ? '<span class="pill-status pendente">MENOR</span>' : ''}</div><div class="sub">${dt(a.criadoEm)} · ${esc(a.objetivo || '—')} · ${esc(a.planoOnline && a.planoOnline !== 'Não se aplica' ? 'Online ' + a.planoOnline : 'Presencial ' + (a.planoPresencial || '—'))}</div></div><span>→</span></div>`).join('') || '<div class="sem-treino">Nenhuma anamnese recebida ainda.</div>'}
      <div class="modal-acoes"><button class="btn-cancelar" onclick="document.getElementById('modalAnamnese').remove()">Fechar</button></div>`);
  };

  window.verAnamnese = async function (id) {
    const a = lista.find(x => x.id === id); if (!a) return;
    if (!a.visto) db().ref('anamneses/' + id).update({ visto: true });
    let fotos = {};
    if (a.temFotos) { try { fotos = (await db().ref('anamnesesFotos/' + id).once('value')).val() || {}; } catch (e) { /* sem fotos */ } }
    const grupos = [];
    (a.respostas || []).forEach(r => { let g = grupos.find(x => x.t === r.secao); if (!g) grupos.push(g = { t: r.secao, r: [] }); g.r.push(r); });
    modal(`<h2>${esc(a.nome)}</h2><p class="sp-muted">${esc(a.idade)} anos · ${esc(a.telefone)} · ${esc(a.email)} · enviada em ${dt(a.criadoEm)}</p>
      ${a.menor ? '<div class="sp-import-note">Aluna(o) MENOR DE 18 ANOS — fotos bloqueadas; consentimento do responsável legal registrado abaixo.</div>' : ''}
      <div class="sp-toolbar-actions" style="margin:10px 0"><button class="btn-acao primario" onclick="anamneseCriarAluno('${esc(id)}')">${a.alunoId ? '✔ Já é aluno — abrir' : '+ Cadastrar como aluno'}</button><a class="btn-acao" href="${wa(a.telefone)}" target="_blank" rel="noopener">WhatsApp</a><button class="btn-acao" onclick="window.print()">Imprimir / PDF</button><button class="btn-acao perigo" onclick="anamneseExcluir('${esc(id)}')">Excluir</button></div>
      ${Object.keys(fotos).length ? `<section class="sp-panel"><h3>Fotos</h3><div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(140px,1fr));gap:10px">${Object.entries(fotos).map(([k, u]) => `<figure style="margin:0"><img src="${u}" alt="${esc(POS[k] || k)}" style="width:100%;border-radius:8px"><figcaption class="sp-muted">${esc(POS[k] || k)}</figcaption></figure>`).join('')}</div></section>` : ''}
      ${grupos.map(g => `<section class="sp-panel"><h3>${esc(g.t)}</h3>${g.r.map(r => `<p style="margin:8px 0"><span class="sp-muted">${esc(r.pergunta)}</span><br><strong>${esc(r.resposta) || '—'}</strong></p>`).join('')}</section>`).join('')}
      <div class="modal-acoes"><button class="btn-cancelar" onclick="abrirAnamneses()">← Voltar à lista</button></div>`);
  };

  window.anamneseCriarAluno = async function (id) {
    const a = lista.find(x => x.id === id); if (!a) return;
    try {
      let novo = false;
      if (!a.alunoId) {
        const n = await trainer.adicionarAluno({ nome: a.nome, idade: a.idade, objetivo: a.objetivo, peso: Number(String(a.peso).replace(',', '.')) || null, altura: Number(String(a.altura).replace(',', '.')) || null, telefone: a.telefone });
        await db().ref('anamneses/' + id).update({ alunoId: n.id }); a.alunoId = n.id; novo = true;
      }
      fechar();
      if (novo) { alert('Aluno cadastrado! A página vai recarregar; procure o nome na lista à esquerda.'); location.reload(); } else await window.selecionarAluno(a.alunoId);
    } catch (e) { alert('Erro: ' + e.message); }
  };

  window.anamneseExcluir = async function (id) {
    if (!confirm('Excluir esta anamnese (e as fotos) definitivamente?')) return;
    try { await db().ref('anamnesesFotos/' + id).remove(); await db().ref('anamneses/' + id).remove(); abrirAnamneses(); } catch (e) { alert('Erro: ' + e.message); }
  };

  function iniciar() {
    const ref = $('btnBancoVideosNav'); if (!ref) return;
    const b1 = document.createElement('button'); b1.className = 'btn-novo-aluno secundario'; b1.innerHTML = '📋 Anamneses<span id="anBadge"></span>'; b1.onclick = () => abrirAnamneses();
    const b2 = document.createElement('button'); b2.className = 'btn-novo-aluno secundario'; b2.textContent = 'Sair'; b2.onclick = () => window.sairDoPainel && window.sairDoPainel();
    ref.after(b1); b1.after(b2);
    (window.__authPronto || Promise.resolve()).then(() => {
      db().ref('anamneses').on('value', s => { lista = []; s.forEach(c => lista.push(c.val())); atualizarBadge(); }, e => console.warn('Anamneses:', e.code));
    });
  }
  document.addEventListener('DOMContentLoaded', iniciar);
})();
