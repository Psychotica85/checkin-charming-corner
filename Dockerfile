
FROM node:18-alpine

# Install dependencies for better-sqlite3
RUN apk add --no-cache python3 make g++ 

# Set working directory
WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy project files
COPY . .

# Build the application
RUN npm run build

# Create directory for SQLite database
RUN mkdir -p /app/data
RUN chmod 777 /app/data

# Set environment variables
ENV NODE_ENV=production
ENV ADMIN_USERNAME=admin
ENV ADMIN_PASSWORD=admin

# Expose port
EXPOSE 3000

# Command to run the application
CMD ["npm", "run", "start"]
