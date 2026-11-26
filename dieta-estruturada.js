/* Team Spancerski — dieta estruturada: lê PDF/Word, monta o plano visual e a lista de compras */
(function () {
  'use strict';
  const esc = v => String(v ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }[c]));
  const arr = v => Array.isArray(v) ? v : (v && typeof v === 'object' ? Object.values(v) : []);
  const norm = s => String(s || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();

  // ---------- leitura dos arquivos (mantém as quebras de linha) ----------
  async function linhasDePdf(buffer) {
    if (!window.pdfjsLib) throw new Error('Leitor PDF não carregado.');
    const pdf = await window.pdfjsLib.getDocument({ data: new Uint8Array(buffer) }).promise;
    const out = [];
    for (let p = 1; p <= pdf.numPages; p++) {
      const { items } = await (await pdf.getPage(p)).getTextContent();
      const lns = [];
      items.filter(i => i.str && i.str.trim()).sort((a, b) => b.transform[5] - a.transform[5] || a.transform[4] - b.transform[4]).forEach(i => {
        const y = i.transform[5], ult = lns[lns.length - 1];
        if (ult && Math.abs(ult.y - y) < 3) ult.t.push(i); else lns.push({ y, t: [i] });
      });
      lns.forEach(l => out.push(l.t.sort((a, b) => a.transform[4] - b.transform[4]).map(i => i.str).join(' ')));
    }
    return out;
  }

  async function linhasDeDocx(buffer) {
    if (!window.mammoth) throw new Error('Leitor Word não carregado.');
    const html = (await window.mammoth.convertToHtml({ arrayBuffer: buffer })).value;
    const doc = new DOMParser().parseFromString(html, 'text/html'), out = [];
    doc.body.querySelectorAll('p,h1,h2,h3,h4,h5,h6,li').forEach(el => {
      const t = el.textContent.trim();
      if (t) out.push((el.tagName === 'LI' ? '• ' : '') + t);
    });
    return out;
  }

  // ---------- interpretação ----------
  const RE_MEAL = /^(\d{1,2})\s*[:h]\s*(\d{2})\s*[—–-]\s*(.+)$/;
  const RE_OPC = /^op[çc][ãa]o\s*(\d+)\s*(?:[—–:-]\s*(.+))?$/i;
  const RE_BUL = /^(?:[•·●▪*]\s*|-\s+)(.+)$/;

  function parseItem(t) {
    t = t.trim();
    let nome = t, qtd = '';
    const i = t.indexOf(':');
    if (i > 0 && i < 60 && !/^\d{1,2}$/.test(t.slice(0, i).trim())) { nome = t.slice(0, i).trim(); qtd = t.slice(i + 1).trim(); }
    else {
      const m = t.match(/^(\d+(?:[.,]\d+)?)\s*(kg|gr|g|ml|l|un|unid\w*)?\s+(.+)$/i);
      if (m) { qtd = m[1] + (m[2] ? ' ' + m[2] : ''); nome = m[3]; }
    }
    const livre = /\bvontade\b/i.test(t);
    if (livre) nome = nome.replace(/\s*[àa]\s*vontade/i, '').trim() || nome;
    let n = null, u = '';
    const q = qtd.match(/(\d+(?:[.,]\d+)?)(?:\s*[–-]\s*(\d+(?:[.,]\d+)?))?\s*(kg|gr|g|ml|l|un|unid\w*)?/i);
    if (q && !livre) {
      const a = parseFloat(q[1].replace(',', '.')), b = q[2] ? parseFloat(q[2].replace(',', '.')) : a;
      n = (a + b) / 2;
      const un = (q[3] || '').toLowerCase();
      if (un === 'kg') { n *= 1000; u = 'g'; } else if (un === 'l') { n *= 1000; u = 'ml'; }
      else if (un === 'g' || un === 'gr') u = 'g'; else if (un === 'ml') u = 'ml'; else u = 'un';
    }
    return { nome, qtd, n, u, livre };
  }

  function parse(linhas) {
    const r = { titulo: '', info: [], refeicoes: [], extras: [] };
    let meal = null, opc = null, grupo = null, extra = null;
    const novoGrupo = nome => { grupo = { nome, itens: [] }; opc.grupos.push(grupo); };
    for (const raw of linhas) {
      const l = String(raw).replace(/\s+/g, ' ').trim();
      if (!l || /p[áa]gina\s*\d+/i.test(l)) continue;
      let m = l.match(RE_MEAL);
      if (m) {
        meal = { hora: String(m[1]).padStart(2, '0') + ':' + m[2], nome: m[3].trim(), opcoes: [], notas: [] };
        r.refeicoes.push(meal); opc = grupo = extra = null; continue;
      }
      m = l.match(RE_OPC);
      if (m && meal) { opc = { n: m[1], titulo: (m[2] || '').trim(), grupos: [], notas: [] }; meal.opcoes.push(opc); grupo = null; continue; }
      const b = l.match(RE_BUL);
      if (!b && l === l.toUpperCase() && /[A-ZÀ-Ú]{3}/.test(l) && l.length < 90) {
        if (!r.refeicoes.length) { if (!r.titulo) r.titulo = l; else r.info.push(l); }
        else { extra = { titulo: l, blocos: [] }; r.extras.push(extra); meal = opc = grupo = null; }
        continue;
      }
      if (b) {
        if (extra) extra.blocos.push({ t: 'li', v: b[1].trim() });
        else if (meal) {
          if (!opc) { opc = { n: '', titulo: '', grupos: [], notas: [] }; meal.opcoes.push(opc); }
          if (!grupo) novoGrupo('');
          grupo.itens.push(parseItem(b[1]));
        } else r.info.push(b[1].trim());
        continue;
      }
      if (extra) {
        const u = extra.blocos[extra.blocos.length - 1];
        if (u && u.t === 'p' && !/[.:!?]$/.test(u.v)) u.v += ' ' + l; else extra.blocos.push({ t: 'p', v: l });
        continue;
      }
      if (meal) {
        const un = meal.notas[meal.notas.length - 1];
        if (un && !/[.!?]$/.test(un)) meal.notas[meal.notas.length - 1] += ' ' + l;
        else if (/^(objetivo|obs)/i.test(l)) meal.notas.push(l);
        else if (opc && l.length <= 40 && !/[:\d]/.test(l)) novoGrupo(l);
        else if (opc) opc.notas.push(l);
        else meal.notas.push(l);
        continue;
      }
      r.info.push(l);
    }
    return JSON.parse(JSON.stringify(r)); // remove undefined (Firebase não aceita)
  }

  const valida = est => !!est && arr(est.refeicoes).length >= 2 && arr(est.refeicoes).some(m => arr(m.opcoes).length);

  // ---------- plano alimentar (visual) ----------
  const itemHtml = it => `<li><span>${esc(it.nome)}${it.livre ? ' <em>à vontade</em>' : ''}</span>${it.qtd && !it.livre ? `<b>${esc(it.qtd)}</b>` : ''}</li>`;
  const nota = n => `<p class="dp-nota">${esc(n)}</p>`;

  function html(est) {
    const refs = arr(est.refeicoes).map(m => `<section class="dp-meal"><div class="dp-meal-head"><span class="dp-hora">${esc(m.hora)}</span><h4>${esc(m.nome)}</h4></div><div class="dp-opcoes">${arr(m.opcoes).map(o => `<div class="dp-opcao">${o.n || o.titulo ? `<h5>${o.n ? 'Opção ' + esc(o.n) : ''}${o.titulo ? ' <small>' + esc(o.titulo) + '</small>' : ''}</h5>` : ''}${arr(o.grupos).map(g => `${g.nome ? `<div class="dp-grupo">${esc(g.nome)}</div>` : ''}<ul>${arr(g.itens).map(itemHtml).join('')}</ul>`).join('')}${arr(o.notas).map(nota).join('')}</div>`).join('')}</div>${arr(m.notas).map(nota).join('')}</section>`).join('');
    const exs = arr(est.extras).map(x => {
      let h = '', ul = [];
      const fl = () => { if (ul.length) { h += '<ul class="dp-simples">' + ul.map(v => `<li>${esc(v)}</li>`).join('') + '</ul>'; ul = []; } };
      arr(x.blocos).forEach(b => { if (b.t === 'li') ul.push(b.v); else { fl(); h += `<p>${esc(b.v)}</p>`; } });
      fl();
      return `<section class="dp-extra"><h4>${esc(x.titulo)}</h4>${h}</section>`;
    }).join('');
    return `<div class="dieta-plano"><header class="dp-head"><h3>${esc(est.titulo || 'Plano alimentar')}</h3>${arr(est.info).length ? `<div class="dp-info">${arr(est.info).map(i => `<span>${esc(i)}</span>`).join('')}</div>` : ''}</header>${refs}${exs}</div>`;
  }

  // ---------- lista de compras ----------
  const CATS = [
    ['Proteínas', 'frango|carne|ovo|atum|patinho|peixe|tilapia|salmao|file|peru|camarao|bife|coxa|sobrecoxa|linguica|presunto'],
    ['Laticínios', 'leite|iogurte|queijo|requeijao|ricota|coalhada|cottage'],
    ['Suplementos', 'whey|creatina|albumina|pre.?treino|bcaa|colageno'],
    ['Carboidratos e grãos', 'arroz|batata|aveia|mucilon|pao|macarrao|tapioca|feijao|mandioca|aipim|torrada|cuscuz|granola|lentilha|grao|milho|inhame|massa|biscoito|bolacha|cereal|farinha'],
    ['Frutas', 'fruta|banana|maca|mamao|melancia|laranja|melao|morango|abacaxi|uva|pera|ameixa|manga|kiwi|limao|tangerina|mexerica|abacate|goiaba'],
    ['Hortifruti', 'salada|legume|verdura|brocolis|cenoura|alface|tomate|couve|abobrinha|pepino|cebola|espinafre|rucula|repolho|beterraba|vagem|chuchu|abobora|folha'],
    ['Gorduras, temperos e extras', 'azeite|oleo|castanha|amendoa|nozes|pasta|manteiga|canela|fermento|mel\\b|chia|linhaca|cafe|cacau|achocolatado|sal\\b|adocante|tempero|gergelim']
  ].map(([n, k]) => [n, new RegExp('\\b(' + k + ')')]);
  const categoria = nome => { const s = norm(nome); const c = CATS.find(([, re]) => re.test(s)); return c ? c[0] : 'Outros'; };
  const ORDEM = CATS.map(c => c[0]).concat('Outros');
  const cap = s => s.charAt(0).toUpperCase() + s.slice(1);

  function lista(est, dias) {
    const mapa = {};
    const add = (nomeOrig, n, u, livre, vezes) => {
      let nome = String(nomeOrig).replace(/\([^)]*\)/g, '').replace(/\b(pequena|pequeno|grande|media|médio|branco|inglesa|inteiro|inteira|magra|grelhad[oa]s?|cozid[oa]s?|assad[oa]s?|desfiad[oa]s?)\b/gi, '').replace(/^peito de /i, '').replace(/\s+/g, ' ').trim();
      if (!nome || /^[aá]gua\b/i.test(nome)) return;
      const k = norm(nome);
      const e = mapa[k] || (mapa[k] = { k, nome: cap(nome), cat: categoria(nome), g: 0, ml: 0, un: 0, livre: false, cozido: false });
      if (n) e[u || 'un'] += n * vezes;
      if (livre) e.livre = true;
      if (/cozid|grelhad|assad|desfiad/i.test(nomeOrig)) e.cozido = true;
    };
    arr(est.refeicoes).forEach(m => {
      const ops = arr(m.opcoes); if (!ops.length) return;
      ops.forEach(o => arr(o.grupos).forEach(g => arr(g.itens).forEach(it => add(it.nome, it.n, it.u, it.livre, dias / ops.length))));
    });
    arr(est.extras).filter(x => /fruta/i.test(x.titulo)).forEach(x => arr(x.blocos).filter(b => b.t === 'li').forEach(b => add(b.v, 0, '', false, 0)));
    const porCat = {};
    Object.values(mapa).forEach(e => (porCat[e.cat] = porCat[e.cat] || []).push(e));
    return ORDEM.filter(c => porCat[c]).map(c => ({ cat: c, itens: porCat[c].sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR')) }));
  }

  function fmt(e) {
    const p = [];
    if (e.g) { const g = Math.ceil(e.g / 10) * 10; p.push(g >= 1000 ? (g / 1000).toFixed(g % 1000 ? 1 : 0).replace('.', ',') + ' kg' : g + ' g'); }
    if (e.ml) { const m = Math.ceil(e.ml / 10) * 10; p.push(m >= 1000 ? (m / 1000).toFixed(1).replace('.', ',') + ' L' : m + ' ml'); }
    if (e.un) p.push(Math.ceil(e.un - 0.001) + ' un');
    return p.join(' + ') || (e.livre ? 'à vontade' : '');
  }

  function renderLista(el, est, alunoId) {
    const KD = 'spListaDias', KC = 'spLista:' + alunoId;
    const ler = (k, d) => { try { return JSON.parse(localStorage.getItem(k)) ?? d; } catch (_) { return d; } };
    const gravar = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (_) { /* sem armazenamento */ } };
    let dias = ler(KD, 7);
    const marc = new Set(ler(KC, []));
    const desenhar = () => {
      const L = lista(est, dias);
      const texto = 'Lista de compras (' + dias + ' dias)\n' + L.map(c => '\n' + c.cat.toUpperCase() + '\n' + c.itens.map(i => '▫ ' + i.nome + (fmt(i) ? ' — ' + fmt(i) : '')).join('\n')).join('\n');
      el.innerHTML = `<div class="dl-top"><label>Lista para <select id="dlDias">${[7, 14, 30].map(d => `<option value="${d}" ${d === dias ? 'selected' : ''}>${d} dias</option>`).join('')}</select></label><button class="btn-acao" id="dlCopiar">Copiar</button><a class="btn-acao" id="dlZap" target="_blank" rel="noopener">WhatsApp</a><button class="btn-acao" id="dlLimpar">Desmarcar tudo</button></div>
        <p class="sp-muted">Estimativa feita a partir da sua dieta, considerando que você alterna as opções de cada refeição ao longo dos dias. Marque o que já tem em casa.</p>
        ${L.map(c => `<section class="dl-cat"><h4>${esc(c.cat)}</h4><ul>${c.itens.map(i => `<li class="${marc.has(i.k) ? 'feito' : ''}"><label><input type="checkbox" data-k="${esc(i.k)}" ${marc.has(i.k) ? 'checked' : ''}><span class="dl-nome">${esc(i.nome)}${i.cozido ? ' <small>(peso cozido)</small>' : ''}</span><span class="dl-qtd">${esc(fmt(i))}</span></label></li>`).join('')}</ul></section>`).join('') || '<div class="sem-treino">Não encontrei alimentos nesta dieta.</div>'}
        <p class="sp-muted">Itens marcados como “peso cozido” rendem menos quando crus: compre com uma folga.</p>`;
      el.querySelector('#dlDias').onchange = e => { dias = Number(e.target.value); gravar(KD, dias); desenhar(); };
      el.querySelectorAll('.dl-cat input').forEach(i => i.onchange = () => { i.checked ? marc.add(i.dataset.k) : marc.delete(i.dataset.k); gravar(KC, [...marc]); i.closest('li').classList.toggle('feito', i.checked); });
      el.querySelector('#dlLimpar').onclick = () => { marc.clear(); gravar(KC, []); desenhar(); };
      el.querySelector('#dlZap').href = 'https://wa.me/?text=' + encodeURIComponent(texto);
      el.querySelector('#dlCopiar').onclick = async e => {
        try { await navigator.clipboard.writeText(texto); e.target.textContent = '✔ Copiado'; } catch (_) { prompt('Copie a lista:', texto); }
      };
    };
    desenhar();
  }

  window.DietaEstruturada = { linhasDePdf, linhasDeDocx, parse, valida, html, lista, renderLista, fmt };
})();
