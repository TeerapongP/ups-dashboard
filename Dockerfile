FROM node:20-alpine

WORKDIR /app

RUN apk add --no-cache libc6-compat curl && \
    npm install -g pnpm@10.11.0

ENV PATH="/root/.local/share/pnpm:$PATH"

COPY package.json pnpm-lock.yaml ./

RUN pnpm install --frozen-lockfile

COPY . .

RUN pnpm build

CMD ["pnpm", "start"]

EXPOSE 3000