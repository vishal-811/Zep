FROM node:22-alpine 

WORKDIR /app

RUN npm i pnpm -g

COPY package.json .
COPY pnpm-lock.yaml   .
COPY pnpm-workspace.yaml .
COPY turbo.json  .

COPY apps/server ./apps/server
COPY packages   ./packages 

RUN pnpm install
RUN cd packages/db &&  pnpm add -D prisma
RUN cd packages/db && npx prisma generate --schema=./prisma/schema.prisma
RUN pnpm build

CMD ["pnpm", "server:start"]
