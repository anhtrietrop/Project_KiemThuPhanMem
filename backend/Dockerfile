# Backend Dockerfile
FROM node:18-alpine

# Install OpenSSL and other dependencies for Prisma
RUN apk add --no-cache libc6-compat openssl

# Set working directory
WORKDIR /usr/src/app

# Copy package files
COPY package*.json ./

# Install dependencies (including dev for development mode)
RUN npm ci

# Copy prisma schema first
COPY prisma ./prisma/

# Generate Prisma client
RUN npx prisma generate

# Copy application code
COPY . .

# Expose port
EXPOSE 3002

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s \
    CMD node -e "require('http').get('http://localhost:3002/health', (r) => { process.exit(r.statusCode === 200 ? 0 : 1) })"

# Start application
CMD ["npm", "start"]