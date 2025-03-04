
FROM node:18-alpine

# Install dependencies for better-sqlite3
RUN apk add --no-cache python3 make g++ 

# Install dependencies for nodemailer (SMTP client)
RUN apk add --no-cache ca-certificates

# Set working directory
WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install
RUN npm install nodemailer

# Copy project files
COPY . .

# Build the application
RUN npm run build

# Create directory for SQLite database
RUN mkdir -p /app/data
RUN chmod 777 /app/data

# Set environment variables
ENV NODE_ENV=production
ENV VITE_ADMIN_USERNAME=admin
ENV VITE_ADMIN_PASSWORD=admin

# SMTP-Konfiguration (standardmäßig leer, kann in docker-compose.yml überschrieben werden)
ENV VITE_SMTP_HOST=
ENV VITE_SMTP_PORT=587
ENV VITE_SMTP_USER=
ENV VITE_SMTP_PASS=
ENV VITE_SMTP_FROM=
ENV VITE_SMTP_TO=

# Expose port
EXPOSE 3000

# Command to run the application
CMD ["npm", "run", "start"]
