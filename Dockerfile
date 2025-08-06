# --- Dependencies Stage ---
FROM node:20-alpine AS deps

WORKDIR /app
COPY package.json pnpm-lock.yaml ./

# Install pnpm globally (เบาๆ ไม่ติด dev tools)
RUN corepack enable && corepack prepare pnpm@latest --activate

RUN pnpm install --frozen-lockfile

# --- Builder Stage ---
FROM node:20-alpine AS builder

WORKDIR /app

# Enable pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN pnpm run build

RUN pnpm prune --prod

# --- Production Stage ---
FROM gcr.io/distroless/nodejs20-debian12 AS runner

WORKDIR /app

COPY --from=builder /app/package.json ./
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/node_modules ./node_modules

EXPOSE 3000

CMD ["./node_modules/.bin/next", "start"]
