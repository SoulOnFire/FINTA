# Etapa 1: Build Angular
FROM node:18-slim AS build
WORKDIR /app

# Instalar git e ferramentas de build
RUN apt-get update && apt-get install -y git build-essential python3 && rm -rf /var/lib/apt/lists/*

# Copiar package.json e package-lock.json
COPY package*.json ./
RUN npm install
RUN npm install -g @angular/cli

# Copiar código e build
COPY . .
RUN npm run build --prod

# Etapa 2: Servir com Nginx
FROM nginx:alpine
RUN rm -rf /usr/share/nginx/html/*
COPY --from=build /app/dist/FINTA/ /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]