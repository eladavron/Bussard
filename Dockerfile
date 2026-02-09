# Install dependencies only when needed
FROM node:current-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json* next.config.ts ./
RUN \
  npm install && \
  if [ -f package-lock.json ]; then npm ci; \
  else echo "No lockfile found." && exit 1; fi

# Build the app
FROM node:current-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# Production image, copy only necessary files
FROM node:current-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

# If you use a custom Next.js server, expose the correct port
EXPOSE 3000

# Copy built assets and node_modules
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/next.config.ts ./next.config.ts

CMD ["npx", "next", "start"]