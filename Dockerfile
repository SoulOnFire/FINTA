FROM nginx:alpine AS final
WORKDIR /app
RUN apk add --no-cache git
RUN git clone https://github.com/SoulOnFire/FINTA.git .
RUN rm -rf /usr/share/nginx/html/*

# Copia os arquivos estáticos do repositório
COPY ./dist/finta/browser /usr/share/nginx/html

# Copia a configuração do Nginx, se tiver personalizada
COPY ./nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
