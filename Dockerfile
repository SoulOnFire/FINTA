# Usamos Node para fazer clone e build
FROM node:20-alpine AS build

WORKDIR /app

# Instalar git
RUN apk add --no-cache git

# Clonar o repositório
RUN git clone https://github.com/SoulOnFire/FINTA.git .

# Instalar dependências
RUN npm install

# Build do Angular
RUN npm run build --prod

# Nginx para servir
FROM nginx:stable AS final

# Apaga site default do nginx
RUN rm -rf /usr/share/nginx/html/*

# Copia build do Angular
COPY --from=build /app/dist/finta/browser /usr/share/nginx/html
# Step 3: Copy custom Nginx configuration
COPY ./nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]