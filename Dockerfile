# --- Dependencies Stage (Install all deps) ---
FROM node:20-alpine AS deps

WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

# --- Builder Stage (Build App) ---
FROM node:20-alpine AS builder

WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN pnpm run build

# Prune devDependencies to make node_modules lean
RUN pnpm prune --prod

# --- Production Runner Stage (Minimal Image) ---
FROM gcr.io/distroless/nodejs20-debian12 AS runner

WORKDIR /app

# Copy only what is needed for runtime
COPY --from=builder /app/package.json ./
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/node_modules ./node_modules

EXPOSE 3000

# Use next binary from node_modules to run
CMD ["./node_modules/.bin/next", "start"]
