/** @type {import('next').NextConfig} */
const nextConfig = {
  basePath: '/sigma',
  assetPrefix: '/sigma',
  output: 'standalone', // Necesario para Docker
  async redirects() {
    return [
      {
        source: '/',          // raíz verdadera: http://localhost:3000
        destination: '/sigma',// a donde quieres ir
        permanent: false,
        basePath: false,      // ¡clave! que no aplique el basePath al redirect
      },
    ];
  },
};

export default nextConfig;
