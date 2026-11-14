// lib/anamnese-schema.ts  (sem dependências de servidor — pode ser importado no navegador)
// Fonte única da anamnese: perguntas, tabelas e validação.
// O formulário do aluno, a validação da API e a tela do profissional
// leem TODOS daqui — para mudar/adicionar pergunta, edite só SECTIONS.

export type FieldType =
  | 'text' | 'textarea' | 'select' | 'radio'
  | 'date' | 'time' | 'timerange' | 'number' | 'tel' | 'email'

export type Field = {
  id: string
  label: string
  type: FieldType
  options?: string[]
  required?: boolean
  hint?: string
  placeholder?: string
  /** Só aparece (e só é exigido) quando outro campo tem este valor */
  showIf?: { field: string; equals: string }
  /** Marca perguntas acrescentadas à ficha original */
  isNew?: boolean
}

export type Section = { id: string; title: string; intro?: string; fields: Field[] }

const SIM_NAO = ['Sim', 'Não']

export const SECTIONS: Section[] = [
  {
    id: 'pessoais',
    title: 'Informações pessoais',
    fields: [
      { id: 'nome', label: 'Nome completo', type: 'text', required: true },
      { id: 'nascimento', label: 'Data de nascimento', type: 'date', required: true },
      { id: 'sexo', label: 'Sexo biológico', type: 'select', options: ['Masculino', 'Feminino'], required: true },
      { id: 'telefone', label: 'Telefone', type: 'tel', required: true },
      { id: 'email', label: 'E-mail', type: 'email', required: true },
      { id: 'contato_emergencia', label: 'Contato de emergência (nome, parentesco e telefone)', type: 'text' },
      { id: 'plano_saude', label: 'Possui plano de saúde? Se sim, qual?', type: 'text' },
    ],
  },
  {
    id: 'medidas',
    title: 'Medidas físicas',
    fields: [
      { id: 'peso', label: 'Peso atual (kg)', type: 'number', placeholder: 'Ex.: 82.5' },
      { id: 'altura', label: 'Altura (cm)', type: 'number', placeholder: 'Ex.: 178' },
      { id: 'composicao', label: 'Possui avaliação de composição corporal? Se sim, % gordura e massa magra', type: 'text' },
      { id: 'mudanca_peso', label: 'Houve mudanças significativas de peso nos últimos 6 meses? Descreva', type: 'textarea' },
    ],
  },
  {
    id: 'saude',
    title: 'Histórico de saúde',
    fields: [
      { id: 'condicao_medica', label: 'Possui condição médica diagnosticada? Qual(is)?', type: 'textarea' },
      { id: 'lesao', label: 'Já sofreu lesão muscular, óssea ou articular? Onde e quando?', type: 'textarea' },
      { id: 'cirurgia', label: 'Já realizou cirurgia? Qual, quando e há restrições?', type: 'textarea' },
      { id: 'medicamento', label: 'Faz uso de medicamento contínuo? Qual(is)?', type: 'textarea' },
      { id: 'restricao_medica', label: 'Já recebeu restrição médica para exercícios? Qual?', type: 'textarea' },
      { id: 'historico_familiar', label: 'Histórico familiar de doenças cardíacas, diabetes ou hipertensão?', type: 'textarea' },
      { id: 'tontura', label: 'Sente tonturas, desmaios ou falta de ar durante esforço físico?', type: 'textarea' },
      { id: 'exames', label: 'Realizou exames médicos nos últimos 12 meses? Possui os resultados?', type: 'textarea' },
      {
        id: 'gravidez', label: 'Está grávida ou há possibilidade?', type: 'select',
        options: ['Não', 'Sim', 'Possibilidade'], showIf: { field: 'sexo', equals: 'Feminino' },
      },
    ],
  },
  {
    id: 'dor',
    title: 'Avaliação de movimento e dor',
    fields: [
      { id: 'dor_atual', label: 'Sente dor em alguma região atualmente? Onde e intensidade (0-10)', type: 'textarea' },
      { id: 'dor_tipo', label: 'A dor é constante ou surge em movimentos específicos? Quais?', type: 'textarea' },
      { id: 'dificuldade_cotidiano', label: 'Dificuldade em movimentos do cotidiano (agachar, subir escadas, etc.)?', type: 'textarea' },
      { id: 'limitacao_amplitude', label: 'Limitação de amplitude em articulações (quadril, joelhos, ombros, coluna)?', type: 'textarea' },
      { id: 'fisioterapia', label: 'Já realizou fisioterapia? Para qual condição e quando?', type: 'textarea' },
      { id: 'diagnostico_coluna', label: 'Possui diagnóstico de hérnia, escoliose, lordose ou cifose?', type: 'textarea' },
      { id: 'exercicios_agravam', label: 'Exercícios que agravem sua dor ou desconforto? Quais?', type: 'textarea' },
    ],
  },
  {
    id: 'rotina',
    title: 'Estilo de vida e rotina',
    fields: [
      { id: 'ocupacao', label: 'Ocupação profissional', type: 'text' },
      { id: 'tipo_trabalho', label: 'Seu trabalho é sedentário, em pé ou com esforço físico intenso?', type: 'select', options: ['Sedentário', 'Em pé', 'Esforço físico intenso'] },
      { id: 'carga_horaria', label: 'Carga horária de trabalho semanal aproximada', type: 'text', placeholder: 'Ex.: 44h' },

      // ── NOVO: rotina diária ─────────────────────────────────────────────
      { id: 'hora_acorda', label: 'Que horas você acorda?', type: 'time', isNew: true },
      { id: 'horario_trabalho', label: 'Em que horário você trabalha?', type: 'timerange', isNew: true },
      { id: 'horario_treino', label: 'Que horas você treina (ou pretende treinar)?', type: 'time', isNew: true },
      { id: 'hora_dorme', label: 'Que horas você dorme?', type: 'time', isNew: true },

      { id: 'sono', label: 'Horas de sono por noite em média? Sono reparador?', type: 'text' },
      { id: 'estresse', label: 'Nível de estresse atual (0-10)', type: 'select', options: ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10'] },
      { id: 'alcool', label: 'Consome álcool? Com qual frequência e quantidade?', type: 'text' },
      { id: 'fumante', label: 'É fumante ou faz uso de substâncias que afetem o desempenho?', type: 'text' },
      { id: 'alimentacao', label: 'Como descreve sua alimentação atual?', type: 'textarea' },
      { id: 'refeicoes', label: 'Quantas refeições por dia e em quais horários?', type: 'textarea' },
      { id: 'suplementos', label: 'Faz uso de suplementos? Quais?', type: 'text' },

      // ── NOVO: hormônios ─────────────────────────────────────────────────
      {
        id: 'usa_hormonio', type: 'radio', options: SIM_NAO, required: true, isNew: true,
        label: 'Faz uso de algum hormônio?',
        hint: 'Inclui reposição hormonal (TRT), anabolizantes/esteroides, GH, hormônios da tireoide, anticoncepcional etc. Informação confidencial e essencial para a sua segurança e para o planejamento.',
      },
      { id: 'hormonio_qual', label: 'Qual(is)? (se souber, informe também a dose)', type: 'textarea', required: true, isNew: true, showIf: { field: 'usa_hormonio', equals: 'Sim' } },
      { id: 'hormonio_tempo', label: 'Há quanto tempo usa?', type: 'text', required: true, isNew: true, placeholder: 'Ex.: 8 meses', showIf: { field: 'usa_hormonio', equals: 'Sim' } },

      { id: 'tempo_treino_semana', label: 'Tempo disponível para treinamento por semana', type: 'text' },
    ],
  },
  {
    id: 'treino',
    title: 'Histórico e objetivos de treinamento',
    fields: [
      { id: 'praticou', label: 'Já praticou exercícios regularmente? Quais modalidades e por quanto tempo?', type: 'textarea' },
      { id: 'tempo_parado', label: 'Há quanto tempo sem praticar atividade regular (se aplicável)?', type: 'text' },
      { id: 'nivel', label: 'Nível de condicionamento físico atual', type: 'select', options: ['Iniciante', 'Intermediário', 'Avançado'] },
      { id: 'modalidades_preferidas', label: 'Modalidades que mais gosta ou prefere', type: 'text' },
      { id: 'objetivo_curto', label: 'Objetivo principal a curto prazo (até 3 meses)', type: 'textarea' },
      { id: 'objetivo_longo', label: 'Objetivo a longo prazo (acima de 6 meses)', type: 'textarea' },
      { id: 'evento', label: 'Existe evento ou data que motive esses objetivos?', type: 'text' },
      { id: 'dificuldade_aderencia', label: 'O que mais dificultou sua aderência ao treinamento no passado?', type: 'textarea' },
      { id: 'motivacao', label: 'O que mais o(a) motiva a continuar quando pensa em desistir?', type: 'textarea' },
      { id: 'preferencia_treino', label: 'Prefere treinos intensos/curtos ou longos/moderados?', type: 'select', options: ['Intensos / curtos', 'Longos / moderados', 'Tanto faz'] },
    ],
  },
  {
    id: 'adicionais',
    title: 'Informações adicionais',
    fields: [
      { id: 'alergias', label: 'Possui alguma alergia (alimentar, medicamentosa ou ambiental)?', type: 'textarea' },
      { id: 'psicologico', label: 'Há condição psicológica ou emocional relevante para o treinamento?', type: 'textarea' },
      { id: 'horario_disposto', label: 'Horário do dia em que se sente mais disposto(a) para treinar', type: 'text' },
      { id: 'algo_mais', label: 'Algo mais importante a compartilhar?', type: 'textarea' },
    ],
  },
]

export const FOTO_POSICOES = [
  { id: 'frente', label: 'Frente' },
  { id: 'lateral', label: 'Lateral direita' },
  { id: 'costas', label: 'Costas' },
] as const

export type Dados = Record<string, any>

/** Número estável de cada pergunta (1..N), na ordem da ficha. */
export const NUMERO: Record<string, number> = (() => {
  const m: Record<string, number> = {}
  let n = 0
  for (const s of SECTIONS) for (const f of s.fields) m[f.id] = ++n
  return m
})()

export function isVisible(f: Field, dados: Dados) {
  return !f.showIf || dados[f.showIf.field] === f.showIf.equals
}

export function isEmpty(f: Field, v: any) {
  if (f.type === 'timerange') return !v || !v.de || !v.ate
  return v === undefined || v === null || String(v).trim() === ''
}

/** Campos obrigatórios que faltam numa seção (usado no form e na API). */
export function missingRequired(section: Section, dados: Dados): Field[] {
  return section.fields.filter(f => f.required && isVisible(f, dados) && isEmpty(f, dados[f.id]))
}

/** Limpa o payload: só campos conhecidos, visíveis, com tamanho limitado. */
export function sanitize(raw: any): Dados {
  const out: Dados = {}
  const src = raw && typeof raw === 'object' ? raw : {}
  for (const s of SECTIONS) {
    for (const f of s.fields) {
      if (!isVisible(f, out)) continue
      const v = src[f.id]
      if (f.type === 'timerange') {
        const t = /^\d{2}:\d{2}$/
        if (v && t.test(v.de) && t.test(v.ate)) out[f.id] = { de: v.de, ate: v.ate }
        continue
      }
      if (v === undefined || v === null) continue
      let str = String(v).trim().slice(0, 2000)
      if (!str) continue
      if (f.type === 'select' || f.type === 'radio') {
        if (!f.options!.includes(str)) continue
      }
      out[f.id] = str
    }
  }
  return out
}

export const FOTO_REGEX = /^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/=]+$/
export const FOTO_MAX_CHARS = 2_500_000 // ~1,8 MB de imagem; o cliente já comprime antes

export function formatValue(f: Field, v: any): string {
  if (f.type === 'timerange') return v?.de ? `${v.de} às ${v.ate}` : '—'
  if (f.type === 'date' && v) { const [y, m, d] = String(v).split('-'); return `${d}/${m}/${y}` }
  return v === undefined || v === null || v === '' ? '—' : String(v)
}
