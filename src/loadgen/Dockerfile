FROM node:18-alpine AS builder

WORKDIR /usr/src/app

COPY ["package.json", "package-lock.json", "./"]

RUN npm ci

COPY ["tsconfig.json", "./"]
COPY ["src", "./src"]

RUN npm run build

FROM node:18-alpine

WORKDIR /usr/src/app

RUN apk add --no-cache dumb-init \
    && addgroup -g 3369 -S easytrade \
    && adduser -u 3369 -S easytrade -G easytrade

USER easytrade

COPY --chown=easytrade:easytrade ["package.json", "package-lock.json", "./"]

RUN npm ci --omit=dev \
    && npm cache clean --force

COPY --from=builder --chown=easytrade:easytrade ["/usr/src/app/build", "./build"]

ENTRYPOINT [ "/usr/bin/dumb-init", "--" ]
CMD [ "node", "./build/src/main.js" ]
