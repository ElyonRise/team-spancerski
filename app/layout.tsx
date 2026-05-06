import type { Metadata } from 'next'

import './globals.css'



export const metadata: Metadata = {

  title: 'Team Spancerski — Personal Training & Nutrição',

  description: 'Plataforma completa de acompanhamento nutricional personalizado.',

  icons: { icon: '/favicon.ico' },

}



export default function RootLayout({ children }: { children: React.ReactNode }) {

  return (

    <html lang="pt-BR">

      <body>{children}</body>

    </html>

  )

}
