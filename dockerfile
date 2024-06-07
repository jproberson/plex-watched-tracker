FROM node:16

RUN apt-get update && apt-get install -y bash

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

COPY . .

ENV PORT 3000

EXPOSE $PORT

CMD [ "node", "server.js" ]
