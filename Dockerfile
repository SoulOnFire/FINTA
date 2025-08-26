# Etapa 1: Build Angular
FROM node:18-alpine AS build

WORKDIR /app

# Instalar git
RUN apk add --no-cache git

# Copiar package.json e package-lock.json
COPY package*.json ./

RUN npm install

# Copiar código e gerar build de produção
COPY . .
RUN npm run build --prod

# Etapa 2: Servir com Nginx (Alpine)
FROM nginx:alpine

# Limpar site default do Nginx
RUN rm -rf /usr/share/nginx/html/*

# Copiar build Angular (substitua 'NOME_DO_PROJETO' pelo nome do projeto)
COPY --from=build /app/dist/FINTA/ /usr/share/nginx/html

# Copiar configuração customizada do Nginx para SPA
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]