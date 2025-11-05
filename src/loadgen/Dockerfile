FROM node:18-alpine AS builder

WORKDIR /usr/src/app

COPY ["package.json", "./"]

RUN npm install

COPY ["tsconfig.json", "./"]
COPY ["src", "./src"]

RUN npm run build

FROM node:18-alpine

WORKDIR /usr/src/app

RUN apk add --no-cache dumb-init

COPY ["package.json", "./"]

RUN npm install --omit=dev \
    && npm cache clean --force

COPY --from=builder ["/usr/src/app/build", "./build"]

ENTRYPOINT [ "/usr/bin/dumb-init", "--" ]
CMD [ "node", "./build/src/main.js" ]

