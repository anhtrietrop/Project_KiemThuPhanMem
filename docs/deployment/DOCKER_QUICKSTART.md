# 🚀 QUICK START - DOCKER DEPLOYMENT

## ✅ Đã có sẵn:

- ✅ `.env.docker` - Environment variables đã được tạo với MoMo credentials

## 📋 CHECKLIST - Làm theo thứ tự

### Bước 1: Kiểm tra file .env.docker

```powershell
# Xem nội dung
cat .\.env.docker

# ✅ Verify các biến quan trọng:
# - DATABASE_URL=mysql://root:rootpassword123@db:3306/singitronic_nextjs_db
# - NEXT_PUBLIC_API_BASE_URL=http://localhost:3002
# - MOMO_PARTNER_CODE, MOMO_ACCESS_KEY, MOMO_SECRET_KEY
```

### Bước 2: Tạo Dockerfiles (theo DOCKER_SETUP_GUIDE.md)

#### 2.1 Backend Dockerfile

**File:** `backend/Dockerfile`

```dockerfile
FROM node:18-alpine
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm ci
COPY prisma ./prisma/
RUN npx prisma generate
COPY . .
EXPOSE 3002
CMD ["npm", "run", "dev"]
```

**File:** `backend/.dockerignore`

```
node_modules
.env
.env.local
logs/
*.log
```

#### 2.2 Frontend User Dockerfile

**File:** `frontend-user/Dockerfile`

```dockerfile
FROM node:18-alpine
WORKDIR /usr/src/app
COPY package*.json yarn.lock ./
RUN yarn install --frozen-lockfile
COPY . .
EXPOSE 3000
CMD ["yarn", "dev"]
```

**File:** `frontend-user/.dockerignore`

```
node_modules
.next
.env.local
*.log
```

#### 2.3 Frontend Admin Dockerfile

**File:** `frontend-admin/Dockerfile`

```dockerfile
FROM node:18-alpine
WORKDIR /usr/src/app
COPY package*.json yarn.lock ./
RUN yarn install --frozen-lockfile
COPY . .
EXPOSE 3001
CMD ["yarn", "dev"]
```

**File:** `frontend-admin/.dockerignore`

```
node_modules
.next
.env.local
*.log
```

### Bước 3: Tạo docker-compose.yml

**File:** `docker-compose.yml` (tại root)

```yaml
version: "3.8"

services:
  db:
    image: mysql:8.0
    container_name: ecommerce_mysql
    restart: unless-stopped
    environment:
      MYSQL_ROOT_PASSWORD: ${MYSQL_ROOT_PASSWORD}
      MYSQL_DATABASE: ${MYSQL_DATABASE}
    ports:
      - "3306:3306"
    volumes:
      - mysql_data:/var/lib/mysql
    healthcheck:
      test:
        [
          "CMD",
          "mysqladmin",
          "ping",
          "-h",
          "localhost",
          "-uroot",
          "-p${MYSQL_ROOT_PASSWORD}",
        ]
      interval: 10s
      timeout: 5s
      retries: 5
    networks:
      - ecommerce_network

  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    container_name: ecommerce_backend
    restart: unless-stopped
    depends_on:
      db:
        condition: service_healthy
    environment:
      NODE_ENV: ${NODE_ENV}
      DATABASE_URL: ${DATABASE_URL}
      PORT: ${PORT}
      FRONTEND_USER_URL: ${FRONTEND_USER_URL}
      FRONTEND_ADMIN_URL: ${FRONTEND_ADMIN_URL}
      MOMO_PARTNER_CODE: ${MOMO_PARTNER_CODE}
      MOMO_ACCESS_KEY: ${MOMO_ACCESS_KEY}
      MOMO_SECRET_KEY: ${MOMO_SECRET_KEY}
      MOMO_ENVIRONMENT: ${MOMO_ENVIRONMENT}
      MOMO_RETURN_URL: ${MOMO_RETURN_URL}
      MOMO_NOTIFY_URL: ${MOMO_NOTIFY_URL}
    ports:
      - "3002:3002"
    volumes:
      - ./backend:/usr/src/app
      - /usr/src/app/node_modules
    command: sh -c "npx prisma migrate deploy && npm run dev"
    networks:
      - ecommerce_network

  frontend-user:
    build:
      context: ./frontend-user
      dockerfile: Dockerfile
    container_name: ecommerce_frontend_user
    restart: unless-stopped
    depends_on:
      - backend
    environment:
      NODE_ENV: ${NODE_ENV}
      NEXT_PUBLIC_API_BASE_URL: ${NEXT_PUBLIC_API_BASE_URL}
      NEXTAUTH_URL: ${NEXTAUTH_URL}
      NEXTAUTH_SECRET: ${NEXTAUTH_SECRET}
    ports:
      - "3000:3000"
    volumes:
      - ./frontend-user:/usr/src/app
      - /usr/src/app/node_modules
      - /usr/src/app/.next
    networks:
      - ecommerce_network

  frontend-admin:
    build:
      context: ./frontend-admin
      dockerfile: Dockerfile
    container_name: ecommerce_frontend_admin
    restart: unless-stopped
    depends_on:
      - backend
    environment:
      NODE_ENV: ${NODE_ENV}
      NEXT_PUBLIC_API_BASE_URL: ${NEXT_PUBLIC_API_BASE_URL}
      NEXTAUTH_URL: http://localhost:3001
      NEXTAUTH_SECRET: ${NEXTAUTH_SECRET}
    ports:
      - "3001:3001"
    volumes:
      - ./frontend-admin:/usr/src/app
      - /usr/src/app/node_modules
      - /usr/src/app/.next
    networks:
      - ecommerce_network

volumes:
  mysql_data:

networks:
  ecommerce_network:
    driver: bridge
```

### Bước 4: Chạy Docker

```powershell
# Build và start tất cả containers
docker compose --env-file .env.docker up --build -d

# Xem logs
docker compose logs -f

# Kiểm tra containers đang chạy
docker compose ps
```

### Bước 5: Run Migrations và Seed Data

```powershell
# Exec vào backend container
docker compose exec backend sh

# Inside container:
npx prisma migrate deploy
node scripts/create-test-user.js
node scripts/create-test-data.js
exit
```

### Bước 6: Test Application

```powershell
# Test backend
curl http://localhost:3002/api/products

# Mở browser:
# - Frontend User: http://localhost:3000
# - Frontend Admin: http://localhost:3001
# - Backend API: http://localhost:3002
```

---

## 🔧 TROUBLESHOOTING

### Lỗi: Port đã được sử dụng

```powershell
# Tìm process đang dùng port
netstat -ano | findstr :3000
netstat -ano | findstr :3306

# Kill process
taskkill /PID <PID> /F
```

### Lỗi: MySQL connection refused

```powershell
# Check DB container
docker compose ps db
docker compose logs db

# Verify DATABASE_URL
docker compose exec backend printenv DATABASE_URL
```

### Lỗi: Frontend không gọi được backend

```powershell
# Check NEXT_PUBLIC_API_BASE_URL
docker compose exec frontend-user printenv NEXT_PUBLIC_API_BASE_URL

# Phải là: http://localhost:3002
```

### Restart containers

```powershell
# Stop
docker compose down

# Rebuild và start
docker compose --env-file .env.docker up --build -d
```

### Xóa volumes (XÓA DATA!)

```powershell
docker compose down -v
```

---

## 📚 ĐỌC THÊM

Xem chi tiết trong:

- `docs/DOCKER_SETUP_GUIDE.md` - Full guide
- `docs/DATABASE_MIGRATION_GUIDE.md` - Migration commands
- `docs/IMPLEMENTATION_PLAN.md` - Overall roadmap

---

## ✅ CHECKLIST HOÀN THÀNH

- [ ] Đã tạo `.env.docker` ✅ (đã có sẵn)
- [ ] Đã tạo `backend/Dockerfile`
- [ ] Đã tạo `backend/.dockerignore`
- [ ] Đã tạo `frontend-user/Dockerfile`
- [ ] Đã tạo `frontend-user/.dockerignore`
- [ ] Đã tạo `frontend-admin/Dockerfile`
- [ ] Đã tạo `frontend-admin/.dockerignore`
- [ ] Đã tạo `docker-compose.yml`
- [ ] Đã chạy `docker compose up --build -d`
- [ ] Đã run migrations trong container
- [ ] Đã seed test data
- [ ] Đã test http://localhost:3000, :3001, :3002

---

**Bắt đầu từ Bước 2!** 🚀
