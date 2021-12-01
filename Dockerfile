FROM node

WORKDIR /usr/src/app

COPY . /usr/src/app

RUN npm install

CMD ["npm", "run", "start:production"]