# Community WiFi Management System

A full-stack WiFi management platform designed for managing community
hotspots, connected users, vouchers, usage sessions, analytics, and
security events.

## Live Demo

**Frontend:**  
https://community-wifi-frontend.onrender.com

**Backend API:**  
https://community-wifi-api.onrender.com

## Features

- Hotspot management
- WiFi user management
- Voucher management
- Usage session tracking
- Dashboard analytics
- Login auditing
- Security event monitoring
- User blocking and unblocking
- Role-based access model
- JWT authentication
- Password hashing with bcrypt
- API rate limiting
- Security headers with Helmet
- PostgreSQL database

## Security Features

The application includes security-focused functionality such as:

- JWT-based authentication
- bcrypt password hashing
- Login audit records
- Failed login tracking
- Suspicious traffic event support
- Security event severity levels
- IP address logging
- API rate limiting
- HTTP security headers
- Environment-based secrets
- User account status management

## Technology Stack

### Frontend

- React
- TypeScript
- Vite
- React Router
- Axios
- Recharts
- Lucide React

### Backend

- Node.js
- Express
- TypeScript
- Prisma
- PostgreSQL
- JWT
- bcryptjs
- Helmet
- express-rate-limit

### Database

- PostgreSQL
- Neon

### Deployment

- Render

## Architecture

```text
React + TypeScript
        |
        v
   Express REST API
        |
        v
      Prisma
        |
        v
 PostgreSQL / Neon