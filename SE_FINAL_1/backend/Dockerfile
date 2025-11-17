FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
COPY prisma ./prisma/

RUN npm ci

COPY . .

RUN npm run prisma:generate
RUN npm run build

EXPOSE 3000

CMD ["sh", "-c", "npm run migrate && npm start"]
