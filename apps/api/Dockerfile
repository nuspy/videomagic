FROM node:20-alpine
WORKDIR /app

# Tools for healthcheck
RUN apk add --no-cache curl

# Install deps
COPY apps/api/package*.json ./
RUN npm install

# Copy app
COPY apps/api ./

ENV NODE_ENV=production
EXPOSE 4000

# Run migrations (deploy) then start API
CMD ["sh", "-c", "npm run prisma:deploy && node src/index.js"]
