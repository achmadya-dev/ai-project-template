FROM oven/bun:1.4.2 AS build

WORKDIR /app

RUN apt-get update \
    && DEBIAN_FRONTEND=noninteractive apt-get install --no-install-recommends --yes g++ make python3 \
    && rm -rf /var/lib/apt/lists/*

COPY package.json bun.lock ./
RUN HUSKY=0 bun install --frozen-lockfile

COPY . .
RUN bun run build

FROM oven/bun:1.4.2 AS runtime

ENV NODE_ENV=production \
    HOST=0.0.0.0 \
    PORT=3000 \
    NITRO_HOST=0.0.0.0 \
    NITRO_PORT=3000

WORKDIR /app

COPY --from=build --chown=bun:bun /app/.output ./.output
RUN mkdir -p /app/.data && chown bun:bun /app/.data

USER bun

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD ["bun", "-e", "fetch('http://127.0.0.1:3000/').then((response) => process.exit(response.ok ? 0 : 1)).catch(() => process.exit(1))"]

CMD ["bun", ".output/server/index.mjs"]
