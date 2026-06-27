/** @type {import('next').NextConfig} */
const nextConfig = {
  // Permite ngrok / túneles en `npm run dev` (sin esto no carga JS → sin clicks ni alertas)
  allowedDevOrigins: [
    '*.ngrok-free.app',
    '*.ngrok-free.dev',
    '*.ngrok.io',
    '*.ngrok.app',
  ],
  devIndicators: false,
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
}

export default nextConfig
