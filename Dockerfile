FROM node:22-alpine
WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

# Create DB and table if not exists
RUN npm run init-db

EXPOSE 3000

CMD ["node", "index.js"]
