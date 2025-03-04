
FROM node:18-alpine AS base

# Create app directory
WORKDIR /app

# Install dependencies
FROM base AS deps
COPY package.json ./
RUN npm install

# Build the app
FROM deps AS builder
COPY . .
RUN npx prisma generate
RUN npm run build

# Production image
FROM node:18-alpine AS runner
WORKDIR /app

# Environment variables
ENV DATABASE_URL=postgresql://postgres:postgres@postgres:5432/checkin
ENV VITE_SMTP_HOST=smtp.example.com
ENV VITE_SMTP_PORT=587
ENV VITE_SMTP_USER=user
ENV VITE_SMTP_PASS=password
ENV VITE_SMTP_FROM=no-reply@example.com
ENV VITE_SMTP_TO=admin@example.com

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/prisma ./prisma

# Install Prisma globally for migrations
RUN npm install -g prisma
RUN npm install -g serve

# Expose the port
EXPOSE 8080

# Start script that runs migrations and starts the app
COPY --from=builder /app/start.sh ./start.sh
RUN chmod +x ./start.sh

CMD ["./start.sh"]
