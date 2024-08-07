FROM node:22

RUN apt-get update && apt-get install -y bash

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

COPY src/ ./src

COPY .env ./

EXPOSE $PORT

CMD ["node", "src/server.ts"]
