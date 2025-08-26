FROM nginx:stable AS final
WORKDIR /app
RUN apk add --no-cache git
RUN git clone https://github.com/SoulOnFire/FINTA.git .

RUN chmod -R 755 /usr/share/nginx/html
RUN rm -rf /usr/share/nginx/html/*
COPY --from=build /app/dist/finta/browser /usr/share/nginx/html
COPY --from=build /app/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]