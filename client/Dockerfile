# client/Dockerfile

# 1. Installer Stage: Install dependencies
FROM node:18-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci

# 2. Builder Stage: Build the Next.js application
FROM node:18-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Copy build args from docker-compose
ARG NEXT_PUBLIC_CLIENT_URL
ARG NEXT_PUBLIC_USER_SERVICE_URL
ARG NEXT_PUBLIC_TASK_SERVICE_URL

# Inject build-time envs into Next.js build
ENV NEXT_PUBLIC_CLIENT_URL=$NEXT_PUBLIC_CLIENT_URL
ENV NEXT_PUBLIC_USER_SERVICE_URL=$NEXT_PUBLIC_USER_SERVICE_URL
ENV NEXT_PUBLIC_TASK_SERVICE_URL=$NEXT_PUBLIC_TASK_SERVICE_URL

RUN npm run build

# 3. Runner Stage: Run the production server
FROM node:18-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy the standalone output, static assets, and public assets
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/public ./public

USER nextjs

EXPOSE 3000

CMD ["node", "server.js"]