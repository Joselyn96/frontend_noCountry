# Etapa de build
FROM node:18-alpine AS build

WORKDIR /app

ARG CACHEBUST=1
RUN echo "Cache bust: $CACHEBUST"

# Instalar dependencias
COPY package*.json ./
RUN npm ci --silent

# Copiar el código fuente y compilar
COPY . .
ARG NG_CLI_ANALYTICS=ci
RUN npm run build -- --configuration=production

# Etapa de runtime con Nginx
FROM nginx:stable-alpine

# Eliminar archivos por defecto de Nginx
RUN rm -rf /usr/share/nginx/html/*

# ⚠️ Copiar los archivos generados del directorio correcto
COPY --from=build /app/dist/frontend-no-country/browser /usr/share/nginx/html

# (Opcional) Copiar configuración personalizada de Nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
