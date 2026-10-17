FROM node:24.20.0-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
RUN mkdir -p public
COPY . .
RUN npm run build

FROM node:24.20.0-alpine AS production
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public
EXPOSE 3000
CMD ["node", "server.js"]
