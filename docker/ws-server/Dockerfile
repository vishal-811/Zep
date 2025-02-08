FROM node:22-alpine 

WORKDIR app

RUN npm i pnpm -g

COPY package.json .
COPY pnpm-*.yaml .
COPY turbo.json .

COPY apps/ws  ./apps/ws 
COPY packages  ./packages

RUN pnpm install 

RUN cd packages/db && pnpm install prisma 
RUN cd packages/db && npx prisma generate --schema=./prisma/schema.prisma

RUN pnpm build 

CMD ["pnpm","ws:start"]