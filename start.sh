
#!/bin/sh

# Run Prisma migrations
echo "Running database migrations..."
npx prisma migrate deploy

# Start the application
echo "Starting the application..."
serve -s dist -p 8080
