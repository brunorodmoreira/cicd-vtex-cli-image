FROM node:18-alpine

WORKDIR /app

COPY package.json ./

RUN apk add --no-cache git

RUN yarn global add vtex

RUN yarn install

COPY . .

RUN yarn link

CMD ["/bin/sh"]
