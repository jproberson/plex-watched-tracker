FROM node:22

RUN apt-get update && apt-get install -y bash

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run build

COPY .env ./

EXPOSE $PORT

CMD ["node", "dist/server.js"]
