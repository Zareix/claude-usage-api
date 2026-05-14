FROM oven/bun:1 AS base
WORKDIR /app

COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

COPY . .

RUN bun run build


FROM gcr.io/distroless/cc-debian13

WORKDIR /app

COPY --from=base /app/server /app/server

EXPOSE 3000
CMD ["/app/server"]
