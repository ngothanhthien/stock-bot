FROM node:20

WORKDIR /app

COPY package*.json ./

RUN npm install --production

COPY . .

ENV NODE_ENV=production

EXPOSE 6000

CMD ["node", "index.js"]
