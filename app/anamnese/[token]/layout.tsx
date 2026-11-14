import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Ficha de Anamnese — Team Spancerski',
  robots: { index: false, follow: false },
}

export default function AnamneseLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
