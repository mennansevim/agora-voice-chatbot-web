FROM node:20-alpine

WORKDIR /app

# Bağımlılıkları kur
COPY package*.json ./
RUN npm install

# Kaynak kodları kopyala ve build et
COPY . .
RUN npm run build

# data klasörü volume olarak mount edilecek (kalıcı)
VOLUME ["/app/data"]

ENV NODE_ENV=production
ENV PORT=3000
ENV HOST=0.0.0.0

EXPOSE 3000

CMD ["node", "server.mjs"]
