# Frontend User Dockerfile (Development Mode)
FROM node:18-alpine

# Set working directory
WORKDIR /usr/src/app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy prisma schema (if needed for type generation)
COPY prisma ./prisma/

# Copy application code
COPY . .

# Generate Prisma Client
RUN npx prisma generate || true

# Expose port
EXPOSE 3000

# Start in DEVELOPMENT mode (no build step)
CMD ["npm", "run", "dev"]
