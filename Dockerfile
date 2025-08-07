# -----------------------------
# STAGE 1: Install dependencies
# -----------------------------
FROM node:20-alpine AS deps

WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN corepack enable && corepack prepare pnpm@latest --activate
RUN pnpm install --frozen-lockfile

# --------------------------
# STAGE 2: Build application
# --------------------------
FROM node:20-alpine AS builder

WORKDIR /app

# Enable pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# Copy dependencies and source code
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/pnpm-lock.yaml ./pnpm-lock.yaml
COPY . .

# Build Next.js app (standalone mode)
RUN pnpm run build

# Remove devDependencies
RUN pnpm prune --prod

# -------------------------------
# STAGE 3: Create minimal runtime
# -------------------------------
FROM gcr.io/distroless/nodejs20-debian12 AS runner

WORKDIR /app

# Copy only the necessary files for standalone app
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

EXPOSE 3000

# Start the app
CMD ["server.js"]
