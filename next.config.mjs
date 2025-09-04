/** @type {import('next').NextConfig} */
const nextConfig = {
  basePath: '/sigma',
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
