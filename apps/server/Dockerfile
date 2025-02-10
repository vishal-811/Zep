#Base Stage

FROM node:18-buster AS base

WORKDIR /app

RUN npm install turbo -g

COPY . . 

RUN turbo prune server --docker

# Builder stage
FROM node:18-buster AS builder

WORKDIR /app

RUN npm install -g pnpm@9.11.0

COPY --from=base /app/out/json . 
COPY --from=base /app/out/pnpm-lock.yaml ./pnpm-lock.yaml
COPY --from=base /app/out/pnpm-workspace.yaml ./pnpm-workspace.yaml

RUN pnpm install --frozen-lockfile

COPY --from=base /app/out/full .

RUN cd apps/server && pnpm add -D esbuild

RUN cd packages/db &&  pnpm add  prisma
RUN cd packages/db && npx prisma generate --schema=./prisma/schema.prisma

RUN pnpm run build

# # Production Stage 

# FROM node:22-alpine AS runner 

# WORKDIR app

# RUN npm install -g pnpm@9.11.0

# COPY --from=builder  /app/apps/server/node_modules apps/server/node_modules
# COPY --from=builder /app/apps/server/dist apps/server/dist

CMD ["pnpm", "server:start"]