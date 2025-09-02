# ---- Build stage ----
FROM node:20-alpine AS build
WORKDIR /app

# Install deps
COPY package*.json ./
RUN npm ci

# Copy sources and build
COPY . .
RUN npx vite build

# ---- Serve stage ----
FROM nginx:1.27-alpine AS serve
# Nginx config with SPA fallback
COPY infra/docker/nginx.conf /etc/nginx/conf.d/default.conf
# Static files
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
