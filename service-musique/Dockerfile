FROM node:20-alpine3.22
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 2500
CMD ["node", "index.js"]