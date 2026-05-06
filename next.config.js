/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Removido output: 'export' para permitir Server Components e rotas dinâmicas
  images: {
    unoptimized: true, // Necessário se estiver usando output export antes
  },
}

module.exports = nextConfig
