# Etapa 1: Build da aplicação Angular
FROM node:20-alpine AS build

WORKDIR /app

# Instalar git
RUN apk add --no-cache git

# Copiar package.json e package-lock.json para instalar dependências
COPY package*.json ./

RUN npm install

# Copiar todo o código
COPY . .

# Build de produção
RUN npm run build --prod

# Etapa 2: Servir a aplicação com Nginx (imagem leve)
FROM nginx:alpine

# Limpar conteúdo default do Nginx
RUN rm -rf /usr/share/nginx/html/*

# Copiar build do Angular para o Nginx
COPY --from=build /app/dist/FINTA /usr/share/nginx/html

COPY nginx.conf /etc/nginx/conf.d/default.conf
# Expor porta 80
EXPOSE 80

# Iniciar Nginx
CMD ["nginx", "-g", "daemon off;"]