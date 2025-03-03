
# Digital Check-In System

A modern web application for visitor check-in with document acceptance and PDF report generation.

## Features

- Digital check-in for visitors
- PDF document upload and acceptance
- Automatic PDF report generation for each check-in
- Admin portal with user management
- MongoDB integration for data storage
- Responsive design for all devices

## Environment Variables

The application uses the following environment variables:

| Variable | Description | Format | Example |
|----------|-------------|--------|---------|
| `VITE_MONGODB_URI` | MongoDB connection URI | mongodb://[username:password@]host[:port]/database | mongodb://localhost:27017/checkin |
| `VITE_SMTP_HOST` | SMTP server hostname | string | smtp.example.com |
| `VITE_SMTP_PORT` | SMTP server port | number | 587 |
| `VITE_SMTP_USER` | SMTP username | string | user@example.com |
| `VITE_SMTP_PASS` | SMTP password | string | password123 |
| `VITE_SMTP_FROM` | Email sender address | email | noreply@example.com |
| `VITE_SMTP_TO` | Email recipient address | email | admin@example.com |

## Installation

1. Clone the repository
2. Install dependencies:
```bash
npm install
```
3. Create a `.env` file in the root directory with the environment variables listed above
4. Start the development server:
```bash
npm run dev
```

## MongoDB Setup

The application requires MongoDB 4.4 or higher. Make sure to:

1. Create a MongoDB database named 'checkin' (or your preferred name)
2. Set the `VITE_MONGODB_URI` environment variable to point to your MongoDB instance
3. The application will automatically create the necessary collections:
   - `checkins` - Stores visitor check-in data
   - `documents` - Stores PDF documents for visitors to accept 
   - `users` - Stores admin user accounts

## Default Login

The system creates a default admin user on first run:
- **Username:** admin
- **Password:** admin

*Important: Change this password immediately after first login.*

## Deployment

For production deployment:

1. Build the application:
```bash
npm run build
```
2. Deploy the build folder to your web server
3. Make sure to set all the required environment variables in your production environment

## License

This project is licensed under the MIT License.
