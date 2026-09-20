# NutriPlus — imagen de produccion. Node completo (no standalone) para que
# el CLI de Prisma siga disponible en runtime y pueda correr las migraciones
# antes de arrancar el server.

FROM node:22-alpine AS base
WORKDIR /app

FROM base AS deps
COPY package.json package-lock.json ./
RUN npm ci --legacy-peer-deps

FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npx prisma generate
RUN npm run build

FROM base AS runner
ENV NODE_ENV=production
# python3/ffmpeg/yt-dlp: para descargar y extraer el audio de reels de
# Instagram/TikTok antes de transcribirlos (ver src/lib/video-transcription.ts)
RUN apk add --no-cache python3 ffmpeg yt-dlp
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/prisma7.config.ts ./prisma7.config.ts
COPY --from=builder /app/next.config.ts ./next.config.ts
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/src/generated ./src/generated

EXPOSE 3000
CMD ["sh", "-c", "npx prisma migrate deploy && npx next start -H 0.0.0.0 -p 3000"]
