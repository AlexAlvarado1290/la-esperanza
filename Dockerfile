# syntax=docker/dockerfile:1.7

# Frontend de producción: Vite build → nginx alpine sirviendo los estáticos.
# La URL de la API se inyecta como build arg porque Vite la "hornea" en el bundle.

# ---- builder ----
FROM node:20-bookworm-slim AS builder

RUN corepack enable && corepack prepare pnpm@9.15.9 --activate
WORKDIR /app

COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

# VITE_API_URL llega como build arg desde docker-compose.prod.yml.
# Por default usa el dominio público del despliegue de v1.0.0.
ARG VITE_API_URL=https://comunidad-esperanza.duckdns.org
ENV VITE_API_URL=${VITE_API_URL}

COPY . .
RUN pnpm build

# ---- runtime ----
FROM nginx:1.27-alpine AS runtime

# Config con fallback a index.html para que las rutas del SPA funcionen al refrescar.
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Build estático del paso anterior.
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD wget -qO- http://localhost/ > /dev/null 2>&1 || exit 1
