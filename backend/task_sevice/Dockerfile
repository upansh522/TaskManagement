# Task Service Dockerfile
FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Install dependencies
COPY package.json package-lock.json* ./
RUN npm ci --only=production

# Production image
FROM base AS runner
WORKDIR /app

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nodejs

# Copy dependencies and source code
COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN chown -R nodejs:nodejs /app
USER nodejs

EXPOSE 8002

CMD ["npm", "start"]