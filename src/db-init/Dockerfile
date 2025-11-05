FROM node:18-alpine

WORKDIR /app

COPY package.json ./
RUN npm install

COPY init-db.js ./

CMD ["node", "init-db.js"]

