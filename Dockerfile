# Dockerfile para Next.js 15.5.0 - Optimizado para Dockploy
FROM node:20-slim AS builder

# LOG: Verificar que estamos usando el Dockerfile correcto
RUN echo "🚀 DOCKERFILE CORRECTO - Versión: $(date)" && \
    echo "📦 Imagen base: node:20-slim (Debian)" && \
    echo "🏗️ Etapa: BUILDER" && \
    node --version && \
    npm --version

# Instalar dependencias del sistema necesarias para lightningcss
RUN echo "📥 Instalando dependencias del sistema..." && \
    apt-get update && apt-get install -y \
    python3 \
    make \
    g++ \
    && rm -rf /var/lib/apt/lists/* && \
    echo "✅ Dependencias del sistema instaladas"

WORKDIR /app

# Copiar archivos de dependencias
COPY package*.json ./

# Limpiar cache de npm y reinstalar desde cero
RUN echo "🧹 Limpiando cache de npm..." && \
    npm cache clean --force && \
    echo "✅ Cache limpiado"

# Instalar todas las dependencias (incluyendo devDependencies para el build)
RUN echo "📦 Instalando dependencias con npm ci..." && \
    npm ci && \
    echo "✅ Dependencias instaladas"

# Forzar reinstalación completa de lightningcss para la arquitectura correcta
RUN echo "🔧 Reinstalando paquetes CSS problemáticos..." && \
    echo "🗑️ Desinstalando lightningcss, tailwindcss..." && \
    npm uninstall lightningcss @tailwindcss/postcss tailwindcss && \
    echo "📥 Reinstalando con --force --no-cache..." && \
    npm install lightningcss @tailwindcss/postcss tailwindcss --force --no-cache && \
    echo "✅ Paquetes CSS reinstalados"

# Verificar que lightningcss se instaló correctamente
RUN echo "🧪 Verificando lightningcss..." && \
    node -e "console.log('Testing lightningcss...'); require('lightningcss'); console.log('✓ lightningcss OK');" && \
    echo "✅ lightningcss verificado correctamente"

# Copiar código fuente
COPY . .

# Variables de entorno para el build
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

# Construir la aplicación
RUN echo "🏗️ Iniciando build de Next.js..." && \
    echo "📊 Variables de entorno:" && \
    echo "   NODE_ENV=$NODE_ENV" && \
    echo "   NEXT_TELEMETRY_DISABLED=$NEXT_TELEMETRY_DISABLED" && \
    npm run build && \
    echo "✅ Build completado exitosamente"

# Imagen de producción
FROM node:20-slim AS runner

# LOG: Verificar etapa de runtime
RUN echo "🚀 ETAPA DE RUNTIME" && \
    echo "📦 Imagen base: node:20-slim (Debian)" && \
    echo "🏗️ Etapa: RUNNER" && \
    node --version

WORKDIR /app

# Crear usuario no-root
RUN echo "👤 Creando usuario no-root..." && \
    groupadd --gid 1001 nodejs && \
    useradd --uid 1001 --gid nodejs --shell /bin/bash --create-home nextjs && \
    echo "✅ Usuario nextjs creado"

# Copiar archivos necesarios desde builder
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Variables de entorno
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

USER nextjs

EXPOSE 3000

# LOG: Inicio de la aplicación
RUN echo "🚀 Configuración completada. La aplicación se iniciará con 'node server.js'"

CMD ["node", "server.js"]
