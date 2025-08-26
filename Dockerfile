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
CMD ["npm", "run", "start", "--host=0.0.0.0"]
