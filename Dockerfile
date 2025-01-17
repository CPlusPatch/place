FROM oven/bun:1.1.17-alpine AS base

FROM base AS builder

LABEL maintainer="Jesse Wierzbinski <contact@cpluspatch.com>"
LABEL version="0.1.0"
LABEL description="r/Place clone built with Bun"
LABEL org.opencontainers.image.authors="Jesse Wierzbinski <contact@cpluspatch.com>"
LABEL org.opencontainers.image.url="https://cpluspatch.com"
LABEL org.opencontainers.image.source="https://github.com/cpluspatch/place"
LABEL org.opencontainers.image.version="0.1.0"
LABEL org.opencontainers.image.licenses="AGPL-3.0"

WORKDIR /app

COPY package.json bun.lockb* ./
# Copy package patches during install
COPY patches/ patches/
COPY cplace-fe/package.json cplace-fe/bun.lockb* cplace-fe/

RUN bun install --frozen-lockfile

# Copy the rest of the application code
COPY . .

# Build the application
RUN bun run build

FROM base AS production

COPY --from=builder /app/dist /app/dist

WORKDIR /app
# Specify the command to run the application
CMD ["bun", "run", "dist/index.js"]