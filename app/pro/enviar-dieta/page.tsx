'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'

function EnviarDietaForm() {
  const params = useSearchParams()
  const preClientId = params.get('client')

  const [clientes, setClientes] = useState<any[]>([])
  const [clientId, setClientId] = useState(preClientId || '')
  const [nome, setNome] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [enviado, setEnviado] = useState(false)
  const [loading, setLoading] = useState(false)
  const [alert, setAlert] = useState<{ type: string; msg: string } | null>(null)

  useEffect(() => {
    fetch('/api/clientes').then(r => r.json()).then(setClientes)
  }, [])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0])
    }
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!clientId) { setAlert({ type: 'error', msg: 'Selecione um cliente.' }); return }
    if (!file) { setAlert({ type: 'error', msg: 'Selecione um arquivo.' }); return }

    setLoading(true)
    setAlert(null)

    const formData = new FormData()
    formData.append('file', file)
    formData.append('client_id', clientId)
    formData.append('nome', nome || 'Protocolo Nutricional')

    const res = await fetch('/api/dieta', {
      method: 'POST',
      body: formData,
    })

    const data = await res.json()

    if (res.ok) {
      setEnviado(true)
      setAlert({ type: 'success', msg: 'Protocolo enviado e salvo com sucesso!' })
    } else {
      setAlert({ type: 'error', msg: data.error || 'Erro ao enviar arquivo.' })
    }
    setLoading(false)
  }

  return (
    <>
      <div className="dash-header">
        <h1>ENVIAR DIETA</h1>
        <p>Faca upload do arquivo para enviar ao cliente</p>
      </div>

      {!enviado ? (
        <div className="card" style={{ maxWidth: 700 }}>
          {alert && <div className={`alert alert-${alert.type}`}>{alert.msg}</div>}

          <form onSubmit={submit}>
            <div className="form-group">
              <label>Cliente *</label>
              <select value={clientId} onChange={e => setClientId(e.target.value)} required>
                <option value="">Selecione um cliente</option>
                {clientes.map(c => (
                  <option key={c.id} value={c.id}>{c.name} ({c.email})</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Nome do Protocolo</label>
              <input
                value={nome}
                onChange={e => setNome(e.target.value)}
                placeholder="Ex: Hipertrofia - Semana 1"
              />
            </div>

            <div className="form-group">
              <label>Upload do Arquivo da Dieta</label>
              <input
                type="file"
                accept=".txt,.pdf,.doc,.docx,.jpg,.jpeg,.png"
                onChange={handleFileChange}
                required
                style={{
                  width: '100%',
                  padding: '12px',
                  background: 'var(--dark3)',
                  borderRadius: '10px',
                  border: '1px solid var(--border)'
                }}
              />
              <p className="text-muted text-sm" style={{ marginTop: 8 }}>
                Aceito: TXT, PDF, Word ou imagem da dieta
              </p>
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-full"
              disabled={loading || !file}
              style={{ fontSize: '1.1rem', padding: '16px' }}
            >
              {loading ? 'Enviando...' : 'ENVIAR DIETA'}
            </button>
          </form>
        </div>
      ) : (
        <div>
          <div className="alert alert-success">Protocolo salvo com sucesso!</div>
          <button
            className="btn btn-primary"
            style={{ marginTop: 16 }}
            onClick={() => {
              setEnviado(false)
              setFile(null)
              setNome('')
              setAlert(null)
            }}
          >
            Enviar Nova Dieta
          </button>
        </div>
      )}
    </>
  )
}

export default function EnviarDietaPage() {
  return <Suspense><EnviarDietaForm /></Suspense>
}
