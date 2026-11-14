'use client'

import { useEffect, useMemo, useState } from 'react'
import {
  SECTIONS, FOTO_POSICOES, NUMERO, isVisible, missingRequired,
  type Field, type Dados,
} from '@/lib/anamnese-schema'

type Estado = 'carregando' | 'pendente' | 'enviada' | 'expirada' | 'invalido' | 'concluida'

// Comprime no navegador: foto de celular (5–10 MB) vira ~300 KB e cabe no limite da Vercel.
async function comprimir(file: File, max = 1280, qualidade = 0.82): Promise<string> {
  let src: CanvasImageSource, w: number, h: number
  try {
    const bmp = await createImageBitmap(file)
    src = bmp; w = bmp.width; h = bmp.height
  } catch {
    const url = URL.createObjectURL(file)
    const img = await new Promise<HTMLImageElement>((res, rej) => {
      const i = new Image(); i.onload = () => res(i); i.onerror = rej; i.src = url
    })
    src = img; w = img.naturalWidth; h = img.naturalHeight
  }
  const escala = Math.min(1, max / Math.max(w, h))
  const canvas = document.createElement('canvas')
  canvas.width = Math.round(w * escala); canvas.height = Math.round(h * escala)
  canvas.getContext('2d')!.drawImage(src, 0, 0, canvas.width, canvas.height)
  return canvas.toDataURL('image/jpeg', qualidade)
}

function Campo({ f, dados, set }: { f: Field; dados: Dados; set: (id: string, v: any) => void }) {
  const v = dados[f.id] ?? ''
  const id = `f_${f.id}`
  return (
    <div className="form-group">
      <label htmlFor={id}>
        <span style={{ color: 'var(--text2)', marginRight: 6 }}>{NUMERO[f.id]}.</span>
        {f.label}{f.required && <span style={{ color: '#f87171' }}> *</span>}
        {f.isNew && <span className="badge badge-purple" style={{ marginLeft: 8 }}>rotina</span>}
      </label>

      {f.type === 'textarea' && (
        <textarea id={id} value={v} rows={3} style={{ minHeight: 80 }} onChange={e => set(f.id, e.target.value)} />
      )}

      {f.type === 'select' && (
        <select id={id} value={v} onChange={e => set(f.id, e.target.value)}>
          <option value="">Selecione</option>
          {f.options!.map(o => <option key={o} value={o}>{o}</option>)}
        </select>
      )}

      {f.type === 'radio' && (
        <div style={{ display: 'flex', gap: 10 }}>
          {f.options!.map(o => (
            <button key={o} type="button" onClick={() => set(f.id, o)}
              className={`btn ${v === o ? 'btn-primary' : 'btn-outline'}`} style={{ flex: 1, justifyContent: 'center' }}>
              {o}
            </button>
          ))}
        </div>
      )}

      {f.type === 'timerange' && (
        <div className="form-row" style={{ alignItems: 'center' }}>
          <div><span className="form-hint">Das</span>
            <input id={id} type="time" value={v?.de || ''} onChange={e => set(f.id, { ...(v || {}), de: e.target.value })} /></div>
          <div><span className="form-hint">Às</span>
            <input type="time" value={v?.ate || ''} onChange={e => set(f.id, { ...(v || {}), ate: e.target.value })} /></div>
        </div>
      )}

      {['text', 'date', 'time', 'tel', 'email', 'number'].includes(f.type) && (
        <input id={id} type={f.type} value={v} placeholder={f.placeholder}
          inputMode={f.type === 'number' ? 'decimal' : undefined}
          step={f.type === 'number' ? 'any' : undefined}
          onChange={e => set(f.id, e.target.value)} />
      )}

      {f.hint && <p className="form-hint">{f.hint}</p>}
    </div>
  )
}

export default function AnamnesePublica({ params }: { params: { token: string } }) {
  const { token } = params
  const draftKey = `anamnese_draft_${token}`

  const [estado, setEstado] = useState<Estado>('carregando')
  const [nome, setNome] = useState('')
  const [dados, setDados] = useState<Dados>({})
  const [fotos, setFotos] = useState<Record<string, string>>({})
  const [passo, setPasso] = useState(0)
  const [consent, setConsent] = useState(false)
  const [assinatura, setAssinatura] = useState('')
  const [erro, setErro] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [processandoFoto, setProcessandoFoto] = useState('')

  // passos: 1 por seção + fotos + revisão/assinatura
  const total = SECTIONS.length + 2
  const iFotos = SECTIONS.length
  const iFinal = SECTIONS.length + 1

  useEffect(() => {
    fetch(`/api/anamnese/public/${token}`)
      .then(async r => {
        const d = await r.json().catch(() => ({}))
        if (r.status === 404) return setEstado('invalido')
        if (r.status === 410) return setEstado('expirada')
        if (d.status === 'enviada') return setEstado('enviada')
        setNome(d.nome || '')
        let rascunho: any = null
        try { rascunho = JSON.parse(localStorage.getItem(draftKey) || 'null') } catch {}
        setDados({ ...(d.prefill || {}), ...(rascunho?.dados || {}) })
        if (rascunho?.passo) setPasso(Math.min(rascunho.passo, iFotos))
        setEstado('pendente')
      })
      .catch(() => setEstado('invalido'))
  }, [token])

  // Rascunho automático (só texto; as fotos não ficam salvas por causa do tamanho)
  useEffect(() => {
    if (estado !== 'pendente') return
    try { localStorage.setItem(draftKey, JSON.stringify({ dados, passo })) } catch {}
  }, [dados, passo, estado])

  const set = (id: string, v: any) => setDados(d => ({ ...d, [id]: v }))

  const secao = passo < SECTIONS.length ? SECTIONS[passo] : null
  const progresso = Math.round((passo / (total - 1)) * 100)

  function avancar() {
    setErro('')
    if (secao) {
      const falta = missingRequired(secao, dados)
      if (falta.length) return setErro(`Preencha: ${falta.map(f => f.label.replace(/\?$/, '')).join('; ')}`)
    }
    setPasso(p => p + 1)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
  function voltar() { setErro(''); setPasso(p => Math.max(0, p - 1)); window.scrollTo({ top: 0, behavior: 'smooth' }) }

  async function escolherFoto(pos: string, file?: File | null) {
    if (!file) return
    if (!file.type.startsWith('image/')) return setErro('Envie um arquivo de imagem.')
    setErro(''); setProcessandoFoto(pos)
    try { const url = await comprimir(file); setFotos(f => ({ ...f, [pos]: url })) }
    catch { setErro('Não consegui ler essa imagem. Tente outra foto.') }
    setProcessandoFoto('')
  }

  async function enviar() {
    setErro('')
    for (const s of SECTIONS) {
      const falta = missingRequired(s, dados)
      if (falta.length) { setPasso(SECTIONS.indexOf(s)); return setErro(`Preencha: ${falta.map(f => f.label).join('; ')}`) }
    }
    if (!consent || assinatura.trim().length < 3) return setErro('Marque o consentimento e digite seu nome completo como assinatura.')
    setEnviando(true)
    try {
      const r = await fetch(`/api/anamnese/public/${token}`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dados, fotos, consentimento: true, assinatura_nome: assinatura }),
      })
      const d = await r.json().catch(() => ({}))
      if (!r.ok) setErro(d.error || 'Erro ao enviar.')
      else { try { localStorage.removeItem(draftKey) } catch {}; setEstado('concluida') }
    } catch { setErro('Sem conexão. Verifique a internet e tente de novo.') }
    setEnviando(false)
  }

  const resumoFotos = useMemo(() => FOTO_POSICOES.filter(p => fotos[p.id]).length, [fotos])

  const Casca = ({ children }: { children: React.ReactNode }) => (
    <div style={{ minHeight: '100vh', padding: '24px 16px 64px' }}>
      <div style={{ maxWidth: 680, margin: '0 auto' }}>
        <div className="text-center mb-24">
          <div style={{ color: 'var(--green)', fontWeight: 900, letterSpacing: 4, fontSize: '1.1rem' }}>TEAM SPANCERSKI</div>
          <div style={{ color: 'var(--purple)', letterSpacing: 4, fontSize: '0.65rem' }}>FICHA DE ANAMNESE</div>
        </div>
        {children}
      </div>
    </div>
  )

  if (estado === 'carregando') return <Casca><div className="text-center" style={{ padding: 40 }}><span className="loader" /></div></Casca>

  if (estado !== 'pendente') {
    const msg: Record<string, [string, string]> = {
      invalido: ['Link inválido', 'Confira se copiou o link completo ou peça um novo ao seu treinador.'],
      expirada: ['Link expirado', 'Peça um novo link ao seu treinador.'],
      enviada: ['Ficha já enviada ✅', 'Suas respostas já foram recebidas. Se precisar corrigir algo, fale com seu treinador.'],
      concluida: ['Ficha enviada com sucesso! 🎉', 'Recebi tudo. Vou analisar suas informações e entro em contato em breve.'],
    }
    const [t, p] = msg[estado]
    return <Casca><div className="card text-center"><h3 style={{ fontSize: '1.1rem' }}>{t}</h3><p className="text-muted">{p}</p></div></Casca>
  }

  return (
    <Casca>
      <p className="text-muted text-sm mb-16 text-center">
        Olá{nome ? `, ${nome.split(' ')[0]}` : ''}! Todas as informações são confidenciais e destinadas exclusivamente ao planejamento do seu treinamento.
        Suas respostas ficam salvas neste aparelho caso você precise continuar depois.
      </p>

      <div style={{ height: 6, background: 'var(--card2)', borderRadius: 3, marginBottom: 6 }}>
        <div style={{ height: 6, width: `${progresso}%`, background: 'var(--green)', borderRadius: 3, transition: 'width .3s' }} />
      </div>
      <p className="form-hint mb-16" style={{ textAlign: 'right' }}>Etapa {passo + 1} de {total}</p>

      <div className="card">
        {secao && (
          <>
            <h3>{String(passo + 1).padStart(2, '0')} │ {secao.title}</h3>
            {secao.fields.filter(f => isVisible(f, dados)).map(f => <Campo key={f.id} f={f} dados={dados} set={set} />)}
          </>
        )}

        {passo === iFotos && (
          <>
            <h3>Registro fotográfico</h3>
            <p className="text-muted text-sm mb-16">
              Fotos de corpo inteiro, com roupas justas, fundo neutro e boa iluminação. Usadas exclusivamente para acompanhar sua evolução.
            </p>
            <div className="grid-3">
              {FOTO_POSICOES.map(p => (
                <div key={p.id}>
                  <div className="font-bold text-sm mb-8" style={{ color: 'var(--green)' }}>{p.label.toUpperCase()}</div>
                  <label className="upload-zone" style={{ display: 'block', padding: fotos[p.id] ? 0 : 36, overflow: 'hidden' }}>
                    <input type="file" accept="image/*" style={{ display: 'none' }}
                      onChange={e => { escolherFoto(p.id, e.target.files?.[0]); e.target.value = '' }} />
                    {fotos[p.id]
                      ? <img src={fotos[p.id]} alt={p.label} style={{ width: '100%', height: 220, objectFit: 'cover', display: 'block' }} />
                      : <span className="text-muted text-sm">{processandoFoto === p.id ? 'Processando…' : '📎 Anexar foto'}</span>}
                  </label>
                  {fotos[p.id] && (
                    <button type="button" className="btn btn-outline btn-sm mt-8 btn-full"
                      onClick={() => setFotos(f => { const n = { ...f }; delete n[p.id]; return n })}>Trocar</button>
                  )}
                </div>
              ))}
            </div>
            <p className="form-hint mt-16">{resumoFotos}/3 fotos anexadas. Você pode enviar sem elas, mas seu treinador vai pedir depois.</p>
          </>
        )}

        {passo === iFinal && (
          <>
            <h3>Confirmação</h3>
            <div className="alert alert-info">
              Fotos anexadas: {resumoFotos}/3.{resumoFotos < 3 && ' Volte uma etapa se quiser completar.'}
            </div>
            <label style={{ display: 'flex', gap: 10, alignItems: 'flex-start', fontSize: '0.88rem', margin: '16px 0', cursor: 'pointer' }}>
              <input type="checkbox" checked={consent} onChange={e => setConsent(e.target.checked)}
                style={{ accentColor: 'var(--green)', width: 18, height: 18, marginTop: 2, flexShrink: 0 }} />
              <span>
                Declaro que as informações são verdadeiras e autorizo o Team Spancerski a tratar meus dados de saúde e minhas
                fotos <b>exclusivamente</b> para planejamento e acompanhamento do meu treinamento (LGPD, art. 11).
              </span>
            </label>
            <div className="form-group">
              <label htmlFor="assinatura">Assinatura — digite seu nome completo</label>
              <input id="assinatura" value={assinatura} onChange={e => setAssinatura(e.target.value)} />
              <p className="form-hint">Data: {new Date().toLocaleDateString('pt-BR')}</p>
            </div>
          </>
        )}

        {erro && <div className="alert alert-error mt-16">{erro}</div>}

        <div className="flex gap-12 mt-16">
          {passo > 0 && <button type="button" className="btn btn-outline" onClick={voltar}>← Voltar</button>}
          {passo < iFinal
            ? <button type="button" className="btn btn-primary" style={{ flex: 1, justifyContent: 'center' }} onClick={avancar}>Continuar →</button>
            : <button type="button" className="btn btn-primary" style={{ flex: 1, justifyContent: 'center' }} onClick={enviar} disabled={enviando}>
                {enviando ? 'Enviando…' : 'ENVIAR FICHA'}
              </button>}
        </div>
      </div>
    </Casca>
  )
}
