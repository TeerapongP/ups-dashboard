# --- Dependencies Stage ---
FROM node:20-alpine AS deps

WORKDIR /app

# copy เฉพาะไฟล์ lockfile และ package.json เพื่อ install dependencies
COPY package.json pnpm-lock.yaml ./

# เปิดใช้ corepack และติดตั้ง pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# ติดตั้ง dependencies โดยใช้ frozen-lockfile
RUN pnpm install --frozen-lockfile

# --- Builder Stage ---
FROM node:20-alpine AS builder

WORKDIR /app

# เปิดใช้ corepack และ pnpm อีกครั้ง
RUN corepack enable && corepack prepare pnpm@latest --activate

# copy node_modules จาก deps stage มาใช้
COPY --from=deps /app/node_modules ./node_modules

# copy source code ทั้งหมด
COPY . .

# build next app
RUN pnpm run build

# ลบ dev dependencies ที่ไม่จำเป็นสำหรับ production
RUN pnpm prune --prod

# --- Production Stage ---
FROM gcr.io/distroless/nodejs20-debian12 AS runner

WORKDIR /app

# copy ไฟล์สำคัญจาก builder stage มา
COPY --from=builder /app/package.json ./
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/node_modules ./node_modules

EXPOSE 3000

# ใช้ node รันไฟล์ JavaScript ของ next เอง (ไม่ใช่ shell script)
CMD ["node", "./node_modules/next/dist/bin/next", "start"]
