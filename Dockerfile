
FROM node:18-alpine AS base

# Create app directory
WORKDIR /app

# Install dependencies with better-sqlite3
FROM base AS deps
COPY package.json ./
RUN apk add --no-cache python3 make g++ 
RUN npm install

# Build the app
FROM deps AS builder
COPY . .
RUN npm run build

# Production image
FROM node:18-alpine AS runner
WORKDIR /app

# Install Python and build tools for better-sqlite3
RUN apk add --no-cache python3 make g++

# Environment variables
ENV VITE_SMTP_HOST=smtp.example.com
ENV VITE_SMTP_PORT=587
ENV VITE_SMTP_USER=user
ENV VITE_SMTP_PASS=password
ENV VITE_SMTP_FROM=no-reply@example.com
ENV VITE_SMTP_TO=admin@example.com

# Create data directory for SQLite
RUN mkdir -p /app/data

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

# Install serve globally for serving the app
RUN npm install -g serve

# Expose the port
EXPOSE 8080

# Start script
COPY --from=builder /app/start.sh ./start.sh
RUN chmod +x ./start.sh

CMD ["./start.sh"]
