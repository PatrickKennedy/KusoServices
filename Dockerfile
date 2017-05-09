FROM node:7.9.0

EXPOSE 3000
EXPOSE 9229

RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

ARG NODE_ENV
ENV NODE_ENV $NODE_ENV
COPY package.json /usr/src/app/
RUN npm install && npm cache clean
COPY . /usr/src/app

CMD [ "node", "--inspect=9229", "server.js" ]
