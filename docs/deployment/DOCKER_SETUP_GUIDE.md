# HƯỚNG DẪN SETUP DOCKER - LOCAL DEPLOYMENT

> **Mục đích:** Hướng dẫn từng bước tạo và chạy Docker containers cho local development

## 📋 MỤC LỤC

1. [Chuẩn bị môi trường](#1-chuẩn-bị-môi-trường)
2. [Tạo Dockerfile cho từng service](#2-tạo-dockerfile-cho-từng-service)
3. [Tạo Docker Compose files](#3-tạo-docker-compose-files)
4. [Chạy và test](#4-chạy-và-test)
5. [Troubleshooting](#5-troubleshooting)

---

## 1. CHUẨN BỊ MÔI TRƯỜNG

### 1.1 Cài đặt Docker Desktop

#### Windows:

1. Download Docker Desktop: https://www.docker.com/products/docker-desktop/
2. Cài đặt và khởi động Docker Desktop
3. Verify installation:

```powershell
docker --version
docker compose version
```

Expected output:

```
Docker version 24.x.x
Docker Compose version v2.x.x
```

### 1.2 Cấu trúc thư mục dự án

```
Project_KiemThuPhanMem/
├── backend/
│   ├── Dockerfile              # ← Sẽ tạo
│   ├── .dockerignore           # ← Sẽ tạo
│   └── ...
├── frontend-user/
│   ├── Dockerfile              # ← Sẽ tạo
│   ├── .dockerignore           # ← Sẽ tạo
│   └── ...
├── frontend-admin/
│   ├── Dockerfile              # ← Sẽ tạo
│   ├── .dockerignore           # ← Sẽ tạo
│   └── ...
├── docker-compose.yml          # ← Sẽ tạo (development)
├── docker-compose.uc1.yml      # ← Sẽ tạo (UC1 only)
└── .env.docker                 # ← Sẽ tạo (environment variables)
```

---

## 2. TẠO DOCKERFILE CHO TỪNG SERVICE

### 2.1 Backend Dockerfile

**File:** `backend/Dockerfile`

Tạo file mới với nội dung:

```dockerfile
# Backend Dockerfile
FROM node:18-alpine

# Set working directory
WORKDIR /usr/src/app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

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
```

**File:** `backend/.dockerignore`

Tạo file mới:

```
node_modules
npm-debug.log
.env
.env.local
logs/
*.log
.git
.gitignore
README.md
tests/
.vscode/
```

### 2.2 Frontend User Dockerfile

**File:** `frontend-user/Dockerfile`

```dockerfile
# Frontend User Dockerfile
FROM node:18-alpine

# Set working directory
WORKDIR /usr/src/app

# Copy package files
COPY package*.json yarn.lock ./

# Install dependencies
RUN yarn install --frozen-lockfile

# Copy application code
COPY . .

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=60s \
  CMD node -e "require('http').get('http://localhost:3000', (r) => { process.exit(r.statusCode === 200 ? 0 : 1) })"

# Development mode (for production, use: yarn build && yarn start)
CMD ["yarn", "dev"]
```

**File:** `frontend-user/.dockerignore`

```
node_modules
.next
npm-debug.log
yarn-debug.log
.env.local
.env*.local
*.log
.git
.gitignore
README.md
.vscode/
```

### 2.3 Frontend Admin Dockerfile

**File:** `frontend-admin/Dockerfile`

```dockerfile
# Frontend Admin Dockerfile
FROM node:18-alpine

# Set working directory
WORKDIR /usr/src/app

# Copy package files
COPY package*.json yarn.lock ./

# Install dependencies
RUN yarn install --frozen-lockfile

# Copy application code
COPY . .

# Expose port
EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=60s \
  CMD node -e "require('http').get('http://localhost:3001', (r) => { process.exit(r.statusCode === 200 ? 0 : 1) })"

# Development mode
CMD ["yarn", "dev"]
```

**File:** `frontend-admin/.dockerignore`

```
node_modules
.next
npm-debug.log
yarn-debug.log
.env.local
.env*.local
*.log
.git
.gitignore
README.md
.vscode/
```

---

## 3. TẠO DOCKER COMPOSE FILES

### 3.1 Environment Variables File

**File:** `.env.docker` (tại root project)

```env
# ========================================
# DATABASE CONFIGURATION
# ========================================
MYSQL_ROOT_PASSWORD=rootpassword123
MYSQL_DATABASE=singitronic_nextjs_db
MYSQL_USER=root
MYSQL_PASSWORD=rootpassword123

# ========================================
# BACKEND CONFIGURATION
# ========================================
NODE_ENV=development
# Container-to-container: dùng service name 'db'
DATABASE_URL=mysql://root:rootpassword123@db:3306/singitronic_nextjs_db
PORT=3002
FRONTEND_USER_URL=http://localhost:3000
FRONTEND_ADMIN_URL=http://localhost:3001

# ========================================
# FRONTEND USER CONFIGURATION
# ========================================
# Browser calls (client-side)
NEXT_PUBLIC_API_BASE_URL=http://localhost:3002
# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key-change-this-in-production

# ========================================
# FRONTEND ADMIN CONFIGURATION
# ========================================
# Browser calls (client-side)
# NEXT_PUBLIC_API_BASE_URL=http://localhost:3002 (same as user)
# NextAuth
# NEXTAUTH_URL=http://localhost:3001
# NEXTAUTH_SECRET=your-secret-key-change-this-in-production

# ========================================
# MOMO PAYMENT INTEGRATION
# ========================================
MOMO_PARTNER_CODE=MOMO
MOMO_ACCESS_KEY=F8BBA842ECF85
MOMO_SECRET_KEY=K951B6PE1waDMi640xX08PD3vg6EkVlz
MOMO_ENVIRONMENT=sandbox
# ⚠️ Cập nhật URLs này khi deploy
MOMO_RETURN_URL=http://localhost:3000/payment/success
MOMO_NOTIFY_URL=http://localhost:3002/api/momo/callback
```

> **⚠️ LƯU Ý QUAN TRỌNG:**
>
> **DATABASE_URL trong Docker:**
>
> - Dùng service name `db` thay vì `localhost`
> - `mysql://root:rootpassword123@db:3306/singitronic_nextjs_db`
>
> **NEXT_PUBLIC_API_BASE_URL:**
>
> - Client-side (browser): `http://localhost:3002`
> - Server-side (container): `http://backend:3002` (nếu cần)
>
> **MoMo Credentials:**
>
> - Đây là sandbox credentials từ MoMo docs
> - Production: thay bằng credentials thật từ MoMo Business
>
> **MOMO_RETURN_URL & MOMO_NOTIFY_URL:**
>
> - Development: `localhost:3000` và `localhost:3002`
> - Production: thay bằng domain thật (https://yourdomain.com)

### 3.2 Docker Compose - Full Development

**File:** `docker-compose.yml` (tại root project)

```yaml
version: "3.8"

services:
  # MySQL Database
  db:
    image: mysql:8.0
    container_name: ecommerce_mysql
    restart: unless-stopped
    environment:
      MYSQL_ROOT_PASSWORD: ${MYSQL_ROOT_PASSWORD}
      MYSQL_DATABASE: ${MYSQL_DATABASE}
      MYSQL_USER: ${MYSQL_USER}
      MYSQL_PASSWORD: ${MYSQL_PASSWORD}
    ports:
      - "3306:3306"
    volumes:
      - mysql_data:/var/lib/mysql
      - ./docker/mysql/init:/docker-entrypoint-initdb.d
    healthcheck:
      test:
        [
          "CMD",
          "mysqladmin",
          "ping",
          "-h",
          "localhost",
          "-u${MYSQL_USER}",
          "-p${MYSQL_PASSWORD}",
        ]
      interval: 10s
      timeout: 5s
      retries: 5
      start_period: 30s
    networks:
      - ecommerce_network

  # Backend API
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
      PORT: ${BACKEND_PORT}
      JWT_SECRET: ${JWT_SECRET}
      MOMO_PARTNER_CODE: ${MOMO_PARTNER_CODE}
      MOMO_ACCESS_KEY: ${MOMO_ACCESS_KEY}
      MOMO_SECRET_KEY: ${MOMO_SECRET_KEY}
    ports:
      - "3002:3002"
    volumes:
      - ./backend:/usr/src/app
      - /usr/src/app/node_modules
    command: sh -c "npx prisma migrate deploy && npm run dev"
    networks:
      - ecommerce_network

  # Frontend User
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

  # Frontend Admin
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
      - ./frontend-user:/usr/src/app
      - /usr/src/app/node_modules
      - /usr/src/app/.next
    networks:
      - ecommerce_network

volumes:
  mysql_data:
    driver: local

networks:
  ecommerce_network:
    driver: bridge
```

### 3.3 Docker Compose - UC1 Only

**File:** `docker-compose.uc1.yml`

Chỉ chứa các services cần thiết cho UC1 (Core Features):

```yaml
version: "3.8"

# UC1 - CORE FEATURES
# Includes: Auth, Products, Categories, Search
services:
  db:
    image: mysql:8.0
    container_name: ecommerce_mysql_uc1
    restart: unless-stopped
    environment:
      MYSQL_ROOT_PASSWORD: ${MYSQL_ROOT_PASSWORD}
      MYSQL_DATABASE: ${MYSQL_DATABASE}
      MYSQL_USER: ${MYSQL_USER}
      MYSQL_PASSWORD: ${MYSQL_PASSWORD}
    ports:
      - "3306:3306"
    volumes:
      - mysql_data_uc1:/var/lib/mysql
    healthcheck:
      test: ["CMD", "mysqladmin", "ping", "-h", "localhost"]
      interval: 10s
      retries: 5
    networks:
      - ecommerce_network_uc1

  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    container_name: ecommerce_backend_uc1
    depends_on:
      db:
        condition: service_healthy
    environment:
      NODE_ENV: development
      DATABASE_URL: ${DATABASE_URL}
      PORT: 3002
    ports:
      - "3002:3002"
    volumes:
      - ./backend:/usr/src/app
      - /usr/src/app/node_modules
    command: sh -c "npx prisma migrate deploy && npm run dev"
    networks:
      - ecommerce_network_uc1

  frontend-user:
    build:
      context: ./frontend-user
      dockerfile: Dockerfile
    container_name: ecommerce_frontend_user_uc1
    depends_on:
      - backend
    environment:
      NEXT_PUBLIC_API_BASE_URL: http://localhost:3002
    ports:
      - "3000:3000"
    volumes:
      - ./frontend-user:/usr/src/app
      - /usr/src/app/node_modules
    networks:
      - ecommerce_network_uc1

  frontend-admin:
    build:
      context: ./frontend-admin
      dockerfile: Dockerfile
    container_name: ecommerce_frontend_admin_uc1
    depends_on:
      - backend
    environment:
      NEXT_PUBLIC_API_BASE_URL: http://localhost:3002
    ports:
      - "3001:3001"
    volumes:
      - ./frontend-admin:/usr/src/app
      - /usr/src/app/node_modules
    networks:
      - ecommerce_network_uc1

volumes:
  mysql_data_uc1:

networks:
  ecommerce_network_uc1:
    driver: bridge
```

---

## 4. CHẠY VÀ TEST

### 4.1 Khởi động lần đầu (Full stack)

```powershell
# Tại root project
# Build và start tất cả containers
docker compose --env-file .env.docker up --build

# Hoặc chạy ở background
docker compose --env-file .env.docker up -d --build
```

### 4.2 Khởi động UC1 only

```powershell
docker compose -f docker-compose.uc1.yml --env-file .env.docker up --build -d
```

### 4.3 Xem logs

```powershell
# Xem logs tất cả services
docker compose logs -f

# Xem logs specific service
docker compose logs -f backend
docker compose logs -f frontend-user

# Xem logs UC1
docker compose -f docker-compose.uc1.yml logs -f
```

### 4.4 Kiểm tra health status

```powershell
# List containers
docker compose ps

# Expected output:
# NAME                     STATUS              PORTS
# ecommerce_mysql          Up (healthy)        0.0.0.0:3306->3306/tcp
# ecommerce_backend        Up (healthy)        0.0.0.0:3002->3002/tcp
# ecommerce_frontend_user  Up                  0.0.0.0:3000->3000/tcp
# ecommerce_frontend_admin Up                  0.0.0.0:3001->3001/tcp
```

### 4.5 Test endpoints

```powershell
# Health check backend
curl http://localhost:3002/health

# Get products
curl http://localhost:3002/api/products

# Frontend user
# Mở browser: http://localhost:3000

# Frontend admin
# Mở browser: http://localhost:3001
```

### 4.6 Run migrations và seed data

```powershell
# Exec vào backend container
docker compose exec backend sh

# Inside container:
npx prisma migrate deploy
node scripts/create-test-user.js
node scripts/create-test-data.js
exit
```

Hoặc một lệnh:

```powershell
docker compose exec backend npx prisma migrate deploy
docker compose exec backend node scripts/create-test-user.js
docker compose exec backend node scripts/create-test-data.js
```

### 4.7 Stop containers

```powershell
# Stop and remove containers
docker compose down

# Stop and remove volumes (XÓA DATA!)
docker compose down -v

# UC1
docker compose -f docker-compose.uc1.yml down
```

---

## 5. TROUBLESHOOTING

### 5.1 MySQL connection refused

**Lỗi:**

```
Error: connect ECONNREFUSED 127.0.0.1:3306
```

**Giải pháp:**

1. Kiểm tra DB container đã healthy chưa:

```powershell
docker compose ps db
```

2. Kiểm tra `DATABASE_URL` trong backend container:

```powershell
docker compose exec backend printenv DATABASE_URL
```

3. Đảm bảo backend `depends_on: db: condition: service_healthy`

### 5.2 Frontend không connect được backend

**Lỗi:**

```
Failed to fetch http://localhost:3002/api/...
```

**Giải pháp:**

**Lưu ý quan trọng:** Trong Docker network:

- **Server-side calls** (getServerSideProps, API routes): dùng `http://backend:3002`
- **Client-side calls** (browser fetch): dùng `http://localhost:3002`

Cập nhật `.env.docker`:

```env
# Client-side API URL (accessible from browser)
NEXT_PUBLIC_API_BASE_URL=http://localhost:3002

# Server-side API URL (inside Docker network)
API_BASE_URL=http://backend:3002
```

### 5.3 Port đã được sử dụng

**Lỗi:**

```
Error: bind: address already in use
```

**Giải pháp:**

```powershell
# Kiểm tra port đang được dùng bởi process nào
netstat -ano | findstr :3000
netstat -ano | findstr :3001
netstat -ano | findstr :3002
netstat -ano | findstr :3306

# Kill process (thay <PID> bằng số từ output trên)
taskkill /PID <PID> /F
```

Hoặc thay đổi ports trong `docker-compose.yml`:

```yaml
ports:
  - "3010:3000" # Map port 3010 trên host -> 3000 trong container
```

### 5.4 Prisma client not generated

**Lỗi:**

```
Error: @prisma/client not found
```

**Giải pháp:**

```powershell
# Rebuild backend container
docker compose build --no-cache backend
docker compose up backend
```

Hoặc exec vào container và generate manual:

```powershell
docker compose exec backend npx prisma generate
```

### 5.5 Frontend build chậm/lỗi memory

**Lỗi:**

```
FATAL ERROR: Ineffective mark-compacts near heap limit
```

**Giải pháp:**

Tăng memory cho Docker Desktop:

- Docker Desktop → Settings → Resources → Memory → tăng lên 4GB+

Hoặc giảm số concurrent builds:

```powershell
# Build từng service
docker compose build db
docker compose build backend
docker compose build frontend-user
docker compose build frontend-admin

# Sau đó up
docker compose up -d
```

### 5.6 Hot reload không hoạt động (Windows)

**Vấn đề:** Thay đổi code nhưng container không tự restart

**Giải pháp:**

Trong `docker-compose.yml`, thêm `polling` cho Next.js:

```yaml
frontend-user:
  # ... existing config
  environment:
    WATCHPACK_POLLING: "true" # Enable polling for Windows
```

### 5.7 Xóa tất cả và start lại từ đầu

```powershell
# Stop tất cả containers
docker compose down -v

# Xóa images
docker compose down --rmi all

# Xóa volumes
docker volume prune -f

# Rebuild từ đầu
docker compose up --build
```

---

## 6. TIPS & BEST PRACTICES

### 6.1 Development workflow

```powershell
# Workflow hàng ngày:
# 1. Start containers
docker compose up -d

# 2. Xem logs nếu có lỗi
docker compose logs -f backend

# 3. Làm việc bình thường (code sẽ auto-reload)

# 4. Stop khi hết việc
docker compose stop
```

### 6.2 Database management

```powershell
# Connect to MySQL từ host
mysql -h 127.0.0.1 -P 3306 -u devuser -p
# Password: devpass123

# Hoặc dùng MySQL Workbench:
# Host: 127.0.0.1
# Port: 3306
# User: devuser
# Password: devpass123
```

### 6.3 Backup database

```powershell
# Backup
docker compose exec db mysqldump -u devuser -pdevpass123 singitronic_nextjs_db > backup.sql

# Restore
docker compose exec -T db mysql -u devuser -pdevpass123 singitronic_nextjs_db < backup.sql
```

### 6.4 Clean development

```powershell
# Xóa node_modules (nếu gặp lỗi dependency)
Remove-Item -Recurse -Force .\backend\node_modules
Remove-Item -Recurse -Force .\frontend-user\node_modules
Remove-Item -Recurse -Force .\frontend-admin\node_modules

# Rebuild containers
docker compose build --no-cache
docker compose up
```

---

## 7. NEXT STEPS

✅ **Đã hoàn thành phần này:**

- Tạo Dockerfiles
- Tạo docker-compose.yml
- Start và test local

📚 **Đọc tiếp:**

- `GIT_WORKFLOW_GUIDE.md` - Branching strategy và CI/CD
- `DATABASE_MIGRATION_GUIDE.md` - Migration cho từng UC
- `UC_ANALYSIS.md` - Checklist features

🚀 **Để deploy lên cloud:**
Sau khi test local thành công, xem hướng dẫn deploy lên Railway/Render/AWS trong docs/DEPLOYMENT_CLOUD.md (sẽ tạo sau).
