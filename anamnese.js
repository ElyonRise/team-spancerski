/* Team Spancerski — Formulário de anamnese (aluno preenche, treinador recebe no painel) */
(function () {
  'use strict';

  const FOTOS_OBRIGATORIAS = false; // mude para true se quiser exigir as 4 fotos dos adultos
  const POS = [['frente', 'Frente'], ['costas', 'Costas'], ['lateralEsquerda', 'Lateral esquerda'], ['lateralDireita', 'Lateral direita']];
  const FREQ = ['Diariamente', 'Algumas vezes por semana', 'Raramente'];
  const SNV = ['Sim', 'Não', 'Às vezes'];

  // [id, pergunta, tipo, opções, opcional]
  // tipos: t texto · a texto longo · n número · d data · p telefone · e e-mail · h hora · r escolha única · c múltipla · s escala 0-10 · k caixa de aceite
  const S = [
    ['1. Informações comerciais', [
      ['planoOnline', 'Plano escolhido — ONLINE', 'r', ['Mensal', 'Trimestral', 'Anual', 'Não se aplica']],
      ['planoPresencial', 'Plano escolhido — PRESENCIAL', 'r', ['Mensal', 'Trimestral', 'Anual', 'Não se aplica']],
      ['pagamento', 'Forma de pagamento', 'r', ['PIX', 'Cartão de crédito', 'Parcelamento (solicitar link)']]]],
    ['2. Dados pessoais', [
      ['nome', 'Nome completo', 't'],
      ['nascimento', 'Data de nascimento', 'd'],
      ['idade', 'Idade (calculada automaticamente)', 'n'],
      ['sexo', 'Sexo (para fins de avaliação e planejamento)', 'r', ['Feminino', 'Masculino']],
      ['profissao', 'Profissão', 't'],
      ['estadoCivil', 'Estado civil', 't', , 1],
      ['whatsapp', 'WhatsApp (com DDD)', 'p'],
      ['email', 'E-mail', 'e'],
      ['cidade', 'Cidade/Estado', 't'],
      ['altura', 'Altura (cm)', 'n'],
      ['peso', 'Peso atual (kg)', 'n']]],
    ['3. Objetivos e expectativas', [
      ['objetivo', 'Qual é seu principal objetivo?', 'r', ['Emagrecimento', 'Hipertrofia / ganho de massa muscular', 'Definição muscular', 'Condicionamento físico', 'Performance esportiva', 'Saúde e bem-estar', 'Melhora da composição corporal', 'Outro']],
      ['meta', 'Existe uma meta específica ou evento com data definida? Qual e quando?', 'a'],
      ['regioes', 'Quais regiões do corpo gostaria de desenvolver ou melhorar?', 'a'],
      ['mudar', 'O que mais gostaria de mudar ou melhorar atualmente?', 'a'],
      ['expectativas', 'Quais são suas expectativas em relação ao acompanhamento?', 'a'],
      ['comprometimento', 'De 0 a 10, qual seu nível de comprometimento neste momento?', 's'],
      ['prazo', 'Em quanto tempo gostaria de perceber os primeiros resultados?', 't']]],
    ['4. Rotina diária, sono e estilo de vida', [
      ['acorda', 'Que horas costuma acordar?', 'h'],
      ['dorme', 'Que horas costuma dormir?', 'h'],
      ['horasSono', 'Quantas horas dorme por noite, em média?', 'n'],
      ['qualSono', 'Como avalia a qualidade do sono?', 'r', ['Excelente', 'Boa', 'Regular', 'Ruim']],
      ['dificSono', 'Tem dificuldade para adormecer ou costuma acordar durante a noite? Explique.', 'a'],
      ['horarioTrab', 'Qual é seu horário de trabalho ou estudo?', 't'],
      ['rotinaTipo', 'Sua rotina é predominantemente:', 'r', ['Sentado(a)', 'Em pé', 'Esforço físico', 'Alternada']],
      ['rotinaFora', 'Como é sua rotina fora do trabalho ou estudo?', 'a'],
      ['horasSentado', 'Quantas horas por dia passa sentado(a), aproximadamente?', 'n'],
      ['estresse', 'Como avalia seu nível de estresse? (0 a 10)', 's'],
      ['alimAval', 'Como avalia sua alimentação atualmente?', 'r', ['Muito boa', 'Boa', 'Regular', 'Ruim']],
      ['agua', 'Quantos litros de água costuma beber por dia?', 'n'],
      ['acompProf', 'Faz acompanhamento com nutricionista, médico ou outro profissional?', 't']]],
    ['5. Rotina alimentar e hábitos', [
      ['nRefeicoes', 'Quantas refeições costuma fazer por dia?', 'n'],
      ['horRefeicoes', 'Quais são, normalmente, os horários das suas refeições?', 'a'],
      ['cafe', 'Costuma tomar café da manhã?', 'r', SNV],
      ['maisFome', 'Em qual período sente mais fome?', 'a'],
      ['belisca', 'Costuma beliscar entre as refeições?', 'r', SNV],
      ['alergia', 'Possui alergia, intolerância ou restrição alimentar? Qual?', 'a'],
      ['naoConsome', 'Existem alimentos que não consome por preferência? Quais?', 'a'],
      ['frutas', 'Costuma consumir frutas e verduras?', 'r', FREQ],
      ['doces', 'Com que frequência consome doces, refrigerantes ou ultraprocessados?', 'r', FREQ],
      ['dificAlim', 'Qual é sua maior dificuldade para manter uma rotina alimentar?', 'a']]],
    ['6. Histórico de atividade física', [
      ['jaPraticou', 'Já praticou musculação ou outras atividades físicas? Quais?', 'a'],
      ['tempoMusc', 'Há quanto tempo pratica ou praticou musculação?', 't'],
      ['treinando', 'Atualmente está treinando?', 'r', ['Sim', 'Não']],
      ['freqTreino', 'Se sim, há quanto tempo e quantas vezes por semana?', 'a'],
      ['duracao', 'Quanto tempo costuma durar cada sessão?', 't'],
      ['prefDuracao', 'Prefere treinos curtos e intensos / mais longos e moderados?', 'r', ['Curtos e intensos', 'Mais longos e moderados', 'Não tenho preferência']],
      ['prefTipo', 'Tem preferência por algum tipo de treinamento?', 'c', ['Máquinas', 'Pesos livres', 'Funcional', 'Cardiorrespiratório', 'Outro', 'Sem preferência']],
      ['naoGosta', 'Existe algum exercício que não gosta ou não se sente confortável realizando?', 'a'],
      ['dificMov', 'Tem dificuldade técnica, desconforto ou dor em algum movimento? Qual?', 'a'],
      ['paradas', 'Já ficou longos períodos sem treinar? Por qual motivo?', 'a']]],
    ['7. Histórico de saúde e segurança', [
      ['condicoes', 'Algum profissional de saúde já diagnosticou alguma condição relevante?', 'c', ['Diabetes', 'Hipertensão', 'Alteração da tireoide', 'Condição cardíaca', 'Condição respiratória', 'Doença autoimune', 'Outra', 'Nenhuma']],
      ['cirurgia', 'Já realizou cirurgia? Qual e quando?', 'a'],
      ['medicamentos', 'Utiliza medicamentos atualmente?', 'a'],
      ['lesao', 'Possui lesão, limitação física ou dor recorrente?', 'c', ['Coluna', 'Joelho', 'Ombro', 'Quadril', 'Tornozelo', 'Outra', 'Nenhuma']],
      ['dorExerc', 'Sente dor durante exercícios ou atividades do dia a dia? Onde e em quais situações?', 'a'],
      ['sintomas', 'Já teve dor no peito, desmaio, tontura importante ou falta de ar incomum?', 'a'],
      ['limitar', 'Algum profissional de saúde já orientou limitar ou evitar exercícios? Explique.', 'a'],
      ['exames', 'Fez exames recentes que considera relevantes para a prática de exercícios?', 'a'],
      ['histFam', 'Há histórico familiar de condição de saúde que considere importante informar?', 'a']]],
    ['8. Hormônios, suplementos e outros hábitos', [
      ['hormonios', 'Faz ou já fez uso de hormônios, anabolizantes ou TRH?', 'r', ['Sim', 'Não', 'Prefiro não responder']],
      ['hormQuais', 'Se sim, deseja informar quais substâncias, período de uso e se há acompanhamento médico?', 'a', , 1],
      ['hormEfeito', 'Já apresentou algum efeito adverso ou complicação?', 'a', , 1],
      ['suplementos', 'Utiliza suplementos atualmente?', 'c', ['Whey protein', 'Creatina', 'Cafeína ou pré-treino', 'Vitaminas ou minerais', 'Outros', 'Nenhum']],
      ['suplDetalhe', 'Informe os suplementos, doses e frequência de uso, se souber.', 'a', , 1],
      ['alcool', 'Consome bebidas alcoólicas?', 'r', ['Não', 'Raramente', 'Socialmente', 'Frequentemente']],
      ['nicotina', 'Fuma ou utiliza produtos com nicotina?', 'r', ['Não', 'Ocasionalmente', 'Frequentemente', 'Prefiro não responder']]]],
    ['9. Aspectos comportamentais e motivacionais', [
      ['dificMudar', 'Qual foi sua maior dificuldade ao tentar mudar seu corpo ou sua rotina anteriormente?', 'a'],
      ['dificConsist', 'O que costuma dificultar sua consistência?', 'a'],
      ['motivacao', 'O que mais motiva você a alcançar seus objetivos?', 'a'],
      ['naoAbrir', 'O que não gostaria de abrir mão na sua rotina?', 'a'],
      ['imagem', 'Há alguma questão relacionada à alimentação, autoestima ou imagem corporal que gostaria de compartilhar?', 'r', ['Sim', 'Não', 'Prefiro conversar em particular']],
      ['notaAutoestima', 'Como avalia sua autoestima? (0 a 10)', 's'],
      ['notaImagem', 'Qual sua satisfação com a imagem corporal? (0 a 10)', 's'],
      ['notaEstresse', 'Como avalia seu estresse atual? (0 a 10)', 's'],
      ['notaMotivacao', 'Como avalia sua motivação atual? (0 a 10)', 's']]],
    ['10. Disponibilidade e logística do treinamento', [
      ['vezesSemana', 'Quantas vezes por semana consegue treinar de forma realista?', 'n'],
      ['dias', 'Quais dias da semana estão disponíveis?', 'c', ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo']],
      ['horPref', 'Que horário prefere treinar?', 'h'],
      ['horReal', 'Que horário consegue treinar de fato?', 'h'],
      ['tempoSessao', 'Quanto tempo tem disponível por sessão?', 'r', ['Até 30 min', '30–45 min', '45–60 min', '60–90 min', 'Mais de 90 min']]]],
    ['11. Avaliação física', [
      ['medidas', 'Medidas, se disponíveis (peso, cintura, braço, coxa)', 'a', , 1]]],
    ['12. Considerações finais', [
      ['infoExtra', 'Existe alguma informação importante que ainda não foi perguntada?', 'a'],
      ['limitPessoal', 'Há alguma limitação pessoal, profissional ou de rotina que eu deva considerar?', 'a'],
      ['alemFisico', 'O que você espera conquistar com o Team Spancerski além da mudança física?', 'a'],
      ['conversar', 'Existe algo que gostaria de conversar diretamente comigo antes de iniciar?', 'a']]],
    ['13. Declarações e consentimentos', [
      ['c_verdade', 'Declaro que respondi de forma verdadeira e que comunicarei mudanças relevantes nas minhas condições de saúde.', 'k'],
      ['c_info', 'Confirmo que tive acesso às informações sobre como meus dados pessoais serão utilizados.', 'k'],
      ['c_saude', 'Autorizo, de forma específica e destacada, o tratamento dos dados de saúde.', 'k']]]
  ];

  const RESP = ['Responsável legal (menor de 18 anos)', [
    ['respNome', 'Nome completo do responsável legal', 't'],
    ['respParentesco', 'Parentesco', 't'],
    ['respWhats', 'WhatsApp do responsável', 'p'],
    ['c_resp', 'Sou o responsável legal e autorizo a participação e o tratamento dos dados de saúde do(a) menor.', 'k']]];

  const esc = v => String(v ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }[c]));
  const TIPO = { t: 'text', n: 'number', d: 'date', p: 'tel', e: 'email', h: 'time' };
  const $ = id => document.getElementById(id);

  function campo([id, label, t, o, opt]) {
    const req = opt ? '' : 'required';
    if (t === 'k') return `<label class="k"><input type="checkbox" name="${id}" ${req}><span>${esc(label)}</span></label>`;
    let h;
    if (t === 'a') h = `<textarea name="${id}" rows="3" ${req}></textarea>`;
    else if (t === 'r') h = `<div class="op">${o.map((x, i) => `<label><input type="radio" name="${id}" value="${esc(x)}" ${i ? '' : req}><span>${esc(x)}</span></label>`).join('')}</div>`;
    else if (t === 'c') h = `<div class="op" data-grupo="${id}">${o.map(x => `<label><input type="checkbox" name="${id}" value="${esc(x)}"><span>${esc(x)}</span></label>`).join('')}</div>`;
    else if (t === 's') h = `<div class="op esc">${[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((x, i) => `<label><input type="radio" name="${id}" value="${x}" ${i ? '' : req}><span>${x}</span></label>`).join('')}</div>`;
    else h = `<input type="${TIPO[t]}" name="${id}" ${req} ${t === 'n' ? 'step="any" min="0"' : ''} ${id === 'idade' ? 'readonly tabindex="-1"' : ''} ${t === 'd' ? 'max="' + new Date().toISOString().slice(0, 10) + '"' : ''}>`;
    return `<div class="campo"><label>${esc(label)}${opt ? ' <em>(opcional)</em>' : ''}</label>${h}</div>`;
  }

  function montar() {
    const sec = (titulo, qs, extra = '', attrs = '') => `<fieldset ${attrs}><legend>${esc(titulo)}</legend>${qs.map(campo).join('')}${extra}</fieldset>`;
    const fotos = `<div class="campo"><label>Fotos (frente, costas e laterais) <em>${FOTOS_OBRIGATORIAS ? '' : '(opcional, mas ajuda muito na avaliação)'}</em></label><div class="fotos">${POS.map(([k, n]) => `<label class="foto" data-pos="${k}"><input type="file" accept="image/*" data-pos="${k}"><b>＋</b><span>${n}</span></label>`).join('')}</div></div>
      <label class="k"><input type="checkbox" name="c_fotos"><span>Autorizo, de forma facultativa, o uso das fotografias para avaliação e comparação da evolução.</span></label>`;
    let html = S.map(([t, qs]) => {
      if (t.startsWith('11.')) return sec(t, qs, `<div id="blocoFotos">${fotos}</div><div class="aviso" id="avisoMenor" hidden>Por segurança, o envio de fotos corporais não é permitido para menores de 18 anos.</div>`);
      return sec(t, qs);
    }).join('');
    html = html.replace(/(<fieldset[^>]*><legend>13\.)/, `${sec(RESP[0], RESP[1], '', 'id="blocoResp" disabled')}$1`);
    $('form').innerHTML = html + `<input class="hp" type="text" name="site" tabindex="-1" autocomplete="off"><div class="erro" id="erro" hidden></div><button class="enviar" id="enviar">Enviar anamnese</button>`;
  }

  const idade = n => { if (!n) return ''; const d = new Date(n), h = new Date(); let i = h.getFullYear() - d.getFullYear(); if (h < new Date(h.getFullYear(), d.getMonth(), d.getDate())) i--; return i; };
  let menor = false;

  function aoMudarNascimento() {
    const i = idade($('form').nascimento.value);
    $('form').idade.value = i;
    menor = i !== '' && i < 18;
    $('blocoResp').disabled = !menor;
    $('blocoFotos').hidden = menor;
    $('avisoMenor').hidden = !menor;
    document.querySelectorAll('#blocoFotos input').forEach(x => x.disabled = menor);
  }

  function redimensionar(arq, max = 900, q = 0.7) {
    return new Promise((ok, falha) => {
      const img = new Image(), url = URL.createObjectURL(arq);
      img.onload = () => {
        const e = Math.min(1, max / img.width), c = document.createElement('canvas');
        c.width = Math.round(img.width * e); c.height = Math.round(img.height * e);
        c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
        URL.revokeObjectURL(url); ok(c.toDataURL('image/jpeg', q));
      };
      img.onerror = () => falha(new Error('Não consegui ler uma das fotos.'));
      img.src = url;
    });
  }

  function erro(msg) { const e = $('erro'); e.textContent = msg; e.hidden = !msg; if (msg) e.scrollIntoView({ block: 'center', behavior: 'smooth' }); }

  async function enviar(ev) {
    ev.preventDefault();
    const f = $('form');
    if (f.site.value) return; // robô
    erro('');
    if (!f.reportValidity()) return;
    for (const g of document.querySelectorAll('[data-grupo]')) {
      if (!g.querySelector('input:checked')) { g.scrollIntoView({ block: 'center' }); return erro('Marque ao menos uma opção em: ' + g.closest('.campo').querySelector('label').textContent.trim()); }
    }
    const arqs = menor ? [] : [...document.querySelectorAll('#blocoFotos input[type=file]')].filter(i => i.files[0]);
    if (!menor && FOTOS_OBRIGATORIAS && arqs.length < 4) return erro('Envie as 4 fotos (frente, costas e duas laterais).');

    const val = n => { const els = f.querySelectorAll(`[name="${n}"]`); if (!els.length) return ''; const t = els[0].type;
      if (t === 'checkbox' && els.length === 1) return els[0].checked ? 'Sim' : 'Não';
      if (t === 'checkbox') return [...els].filter(x => x.checked).map(x => x.value).join(', ');
      if (t === 'radio') return (f.querySelector(`[name="${n}"]:checked`) || {}).value || '';
      return els[0].value.trim(); };
    const respostas = [];
    const todas = menor ? [...S, [RESP[0], RESP[1]]] : S;
    todas.forEach(([t, qs]) => qs.forEach(q => { if (q[0].startsWith('c_fotos')) return; respostas.push({ secao: t, pergunta: q[1], resposta: val(q[0]) }); }));
    if (!menor) respostas.push({ secao: '11. Avaliação física', pergunta: 'Autoriza uso das fotografias para avaliação e comparação da evolução', resposta: val('c_fotos') });

    const btn = $('enviar'); btn.disabled = true; btn.textContent = 'Enviando...';
    try {
      const id = 'an_' + Date.now() + '_' + Math.random().toString(36).slice(2, 10);
      if (arqs.length) {
        const fotos = {};
        for (const i of arqs) fotos[i.dataset.pos] = await redimensionar(i.files[0]);
        await firebase.database().ref('anamnesesFotos/' + id).set(fotos);
      }
      await firebase.database().ref('anamneses/' + id).set({
        id, criadoEm: new Date().toISOString(), visto: false, menor, temFotos: arqs.length > 0,
        nome: val('nome'), idade: Number(val('idade')) || null, nascimento: val('nascimento'), sexo: val('sexo'),
        telefone: val('whatsapp'), email: val('email'), objetivo: val('objetivo'), altura: val('altura'), peso: val('peso'),
        planoOnline: val('planoOnline'), planoPresencial: val('planoPresencial'), pagamento: val('pagamento'),
        respostas
      });
      const wa = window.APP_CONFIG && window.APP_CONFIG.PERSONAL_WHATSAPP;
      $('an').innerHTML = `<div class="ok-tela"><h1>Anamnese enviada!</h1><p>Obrigado, ${esc(val('nome').split(' ')[0])}. Recebi suas respostas e vou entrar em contato em breve.</p>${wa ? `<p><a href="https://wa.me/${wa}" style="color:var(--accent)">Falar comigo no WhatsApp</a></p>` : ''}</div>`;
      window.scrollTo(0, 0);
    } catch (e) {
      btn.disabled = false; btn.textContent = 'Enviar anamnese';
      erro('Não foi possível enviar agora (' + (e.code || e.message) + '). Tente novamente ou chame o Personal no WhatsApp.');
    }
  }

  montar();
  const form = $('form');
  form.nascimento.addEventListener('change', aoMudarNascimento);
  form.addEventListener('submit', enviar);
  document.querySelectorAll('.foto input').forEach(i => i.addEventListener('change', () => {
    const l = i.closest('.foto'), a = i.files[0];
    l.classList.toggle('ok', !!a);
    l.style.backgroundImage = a ? `url(${URL.createObjectURL(a)})` : '';
  }));
})();
