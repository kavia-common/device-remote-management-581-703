# Node 20 Alpine for lightweight image
FROM node:20-alpine AS base

WORKDIR /app
ENV NODE_ENV=production

# Install dependencies separately for better caching
COPY package.json package-lock.json* pnpm-lock.yaml* yarn.lock* ./ 2>/dev/null || true
RUN if [ -f package-lock.json ]; then npm ci --omit=dev; \
    elif [ -f yarn.lock ]; then yarn install --production --frozen-lockfile; \
    elif [ -f pnpm-lock.yaml ]; then corepack enable && pnpm i --prod --frozen-lockfile; \
    else npm i --omit=dev; fi

# Build stage for TypeScript
FROM node:20-alpine AS build
WORKDIR /app
COPY . .
RUN npm ci && npm run build

# Runtime stage
FROM node:20-alpine
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=8080

# Copy only required runtime files
COPY --from=base /app/node_modules ./node_modules
COPY package.json ./
COPY dist ./dist

EXPOSE 8080

CMD ["node", "dist/server.js"]
