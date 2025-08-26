# Build Angular
FROM node:20-alpine AS build
WORKDIR /app
RUN apk add --no-cache git
RUN git clone https://github.com/SoulOnFire/FINTA.git .
RUN npm install
RUN npm run build --prod

# Servir com Nginx
FROM nginx:stable AS final
RUN rm -rf /usr/share/nginx/html/*
COPY --from=build /app/dist/finta /usr/share/nginx/html
COPY ./nginx.conf /etc/nginx/conf.d/default.conf
RUN chmod -R 755 /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]