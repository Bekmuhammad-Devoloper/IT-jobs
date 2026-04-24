FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
ARG NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_PAYMENT_CARD
ARG NEXT_PUBLIC_PAYMENT_OWNER
ARG NEXT_PUBLIC_SUPPORT_TG
ARG NEXT_PUBLIC_CONTACT_TG
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}
ENV NEXT_PUBLIC_PAYMENT_CARD=${NEXT_PUBLIC_PAYMENT_CARD}
ENV NEXT_PUBLIC_PAYMENT_OWNER=${NEXT_PUBLIC_PAYMENT_OWNER}
ENV NEXT_PUBLIC_SUPPORT_TG=${NEXT_PUBLIC_SUPPORT_TG}
ENV NEXT_PUBLIC_CONTACT_TG=${NEXT_PUBLIC_CONTACT_TG}
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
RUN addgroup --system --gid 1001 nodejs && adduser --system --uid 1001 nextjs
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
USER nextjs
EXPOSE 3000
ENV PORT=3000
CMD ["node", "server.js"]
