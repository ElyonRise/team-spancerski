import { getSession } from '@/lib/auth'
import { db } from '@/lib/db'
import Link from 'next/link'

export default async function ClientDashboard() {
  const session = await getSession()
  const [imcRes, dietaRes, streakRes] = await Promise.all([
    db.query('SELECT imc, categoria FROM registros_imc WHERE client_id=$1 ORDER BY recorded_at DESC LIMIT 1', [session!.id]),
    db.query('SELECT nome, created_at FROM dietas WHERE client_id=$1 ORDER BY created_at DESC LIMIT 1', [session!.id]),
    db.query('SELECT COUNT(*) as total FROM motivacao_streak WHERE client_id=$1', [session!.id]),
  ])

  const imc = imcRes.rows[0]
  const dieta = dietaRes.rows[0]
  const streak = streakRes.rows[0]?.total || 0

  return (
    <>
      <div className="dash-header">
        <h1>OLA, {session?.name?.toUpperCase().split(' ')[0]}!</h1>
        <p>Bem-vindo(a) de volta. Aqui esta seu resumo.</p>
      </div>
      <div className="stats-grid">
        <div className="stat-card"><div className="num">{streak}</div><div className="lbl">dias de streak</div></div>
        <div className="stat-card"><div className="num">{imc ? imc.imc : '—'}</div><div className="lbl">IMC atual</div></div>
        <div className="stat-card"><div className="num">{dieta ? 'Ativo' : '—'}</div><div className="lbl">{dieta ? 'dieta ativa' : 'sem dieta'}</div></div>
      </div>
      <div className="grid-2">
        <div className="card">
          <h3>PROTOCOLO ATIVO</h3>
          {dieta ? (
            <>
              <p style={{ color: 'var(--text)', marginBottom: 8 }}>{dieta.nome}</p>
              <p className="text-muted text-sm">Enviado em {new Date(dieta.created_at).toLocaleDateString('pt-BR')}</p>
              <Link href="/dashboard/dieta" className="btn btn-outline btn-sm" style={{ marginTop: 14, display: 'inline-block' }}>Ver Dieta Completa</Link>
            </>
          ) : (
            <p className="text-muted">Nenhuma dieta enviada ainda. Aguarde seu personal trainer.</p>
          )}
        </div>
        <div className="card">
          <h3>SEU IMC</h3>
          {imc ? (
            <>
              <div style={{ fontSize: '2.5rem', fontWeight: 900, color: 'var(--green)' }}>{imc.imc}</div>
              <div style={{ color: 'var(--text2)', marginBottom: 12 }}>{imc.categoria}</div>
              <Link href="/dashboard/imc" className="btn btn-outline btn-sm" style={{ display: 'inline-block' }}>Atualizar</Link>
            </>
          ) : (
            <>
              <p className="text-muted mb-16">Calcule seu IMC agora!</p>
              <Link href="/dashboard/imc" className="btn btn-primary btn-sm" style={{ display: 'inline-block' }}>Calcular IMC</Link>
            </>
          )}
        </div>
      </div>
      <div className="card mt-24">
        <h3>ACOES RAPIDAS</h3>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 4 }}>
          <Link href="/dashboard/ia" className="btn btn-primary btn-sm">Assistente IA</Link>
          <Link href="/dashboard/compras" className="btn btn-outline btn-sm">Lista de Compras</Link>
          <Link href="/dashboard/progresso" className="btn btn-outline btn-sm">Registrar Foto</Link>
          <Link href="/dashboard/motivacao" className="btn btn-purple btn-sm">Motivacao</Link>
        </div>
      </div>
    </>
  )
}
