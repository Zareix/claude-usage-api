FROM oven/bun:1.3.14 AS base
WORKDIR /app

COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

COPY . .

RUN bun run build


FROM gcr.io/distroless/cc-debian13

WORKDIR /app

COPY --from=base /app/server /app/server

EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=5s --start-period=2s --retries=3 \
  CMD ["/app/server", "health"]

CMD ["/app/server"]
