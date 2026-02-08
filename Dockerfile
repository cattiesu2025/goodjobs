FROM node:20-alpine AS builder
WORKDIR /app
COPY package.json package-lock.json ./
COPY client/package.json ./client/
COPY server/package.json ./server/
RUN npm ci
COPY . .
RUN npm run build -w client
RUN npm run build -w server

FROM node:20-alpine
WORKDIR /app
COPY --from=builder /app/package.json ./
COPY --from=builder /app/server/package.json ./server/
COPY --from=builder /app/server/dist ./server/dist
COPY --from=builder /app/client/dist ./client/dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/server/node_modules ./server/node_modules
WORKDIR /app/server
ENV NODE_ENV=production
ENV DB_PATH=/data/goodjob.db
EXPOSE 3001
CMD ["node", "dist/index.js"]
