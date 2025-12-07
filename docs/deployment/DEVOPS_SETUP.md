# DevOps Setup Guide - CI/CD Pipeline

This document provides a comprehensive guide to the CI/CD pipeline setup for the Singitronic eCommerce platform.

## 📋 Table of Contents

1. [Pipeline Architecture](#pipeline-architecture)
2. [CI Pipeline (Continuous Integration)](#ci-pipeline-continuous-integration)
3. [CD Pipeline (Continuous Deployment)](#cd-pipeline-continuous-deployment)
4. [Required GitHub Secrets](#required-github-secrets)
5. [Branch Protection Rules](#branch-protection-rules)
6. [Local Testing](#local-testing)
7. [Troubleshooting](#troubleshooting)

---

## 🏗️ Pipeline Architecture

### Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                    Developer Workflow                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  feature/UC-123 ──┐                                              │
│  hotfix/BUG-456 ──┼──► Push ──► CI Pipeline (Test & Validate)   │
│                   │                        │                     │
│                   └──► Pull Request ───────┘                     │
│                              │                                   │
│                              ▼                                   │
│                         Code Review                              │
│                              │                                   │
│                              ▼                                   │
│                    ✅ All Checks Pass?                           │
│                              │                                   │
│                              ▼                                   │
│                      Merge to main                               │
│                              │                                   │
│                              ▼                                   │
│                    CD Pipeline (Deploy)                          │
│                              │                                   │
│                              ▼                                   │
│             Build Docker Images → Push to Registry               │
│                              │                                   │
│                              ▼                                   │
│                     Deploy to Production                         │
└─────────────────────────────────────────────────────────────────┘
```

### Workflow Files

- **`.github/workflows/ci.yml`**: Continuous Integration Pipeline

  - Runs on: `push` to `feature/**`, `hotfix/**` branches
  - Runs on: `pull_request` to `main` branch
  - Purpose: Test, lint, type-check, verify builds, enforce coverage

- **`.github/workflows/cd.yml`**: Continuous Deployment Pipeline
  - Runs on: `push` to `main` branch only (after successful PR merge)
  - Purpose: Build Docker images, push to GitHub Container Registry, deploy

---

## 🔄 CI Pipeline (Continuous Integration)

### Trigger Events

```yaml
on:
  push:
    branches:
      - "feature/**"
      - "hotfix/**"

  pull_request:
    branches:
      - main
```

### Jobs Breakdown

#### 1. **Backend Tests** (`test-backend`)

**Purpose:** Run unit and integration tests with coverage enforcement

**Steps:**

1. Checkout code
2. Setup Node.js 18.x
3. Install backend dependencies (`npm ci`)
4. Start MySQL service container (port 3307)
5. Wait for MySQL to be ready
6. Create `.env.test` file with test credentials
7. Run Prisma migrations (`npx prisma migrate deploy`)
8. Run tests (`npm test`)
9. Generate coverage report (`npm run test:coverage`)
10. Check coverage thresholds (Lines ≥ 80%, Functions ≥ 70%, Branches ≥ 70%, Statements ≥ 80%)
11. Upload coverage artifacts
12. Comment coverage report on PR

**Service Container:**

```yaml
mysql:
  image: mysql:8.0
  env:
    MYSQL_ROOT_PASSWORD: rootpassword123
    MYSQL_DATABASE: test_ecommerce_db
  ports:
    - 3307:3306
```

**Coverage Thresholds:**

- Lines: **≥ 80%**
- Statements: **≥ 80%**
- Functions: **≥ 70%**
- Branches: **≥ 70%**

**⚠️ Note:** If coverage is below thresholds, the job **FAILS** and PR cannot be merged.

#### 2. **Frontend Admin Quality** (`test-frontend-admin`)

**Purpose:** Lint, type-check, and verify build success

**Steps:**

1. Checkout code
2. Setup Node.js 18.x
3. Install dependencies (`npm ci`)
4. Run ESLint (`npm run lint:check`)
5. Run TypeScript type checker (`npm run type-check`)
6. Build Next.js application (`npm run build`)

**Environment Variables Required:**

- `NEXTAUTH_SECRET` (from GitHub Secrets)
- `DATABASE_URL` (mock for build only)
- `NEXTAUTH_URL` (set to http://localhost:3001)
- `NEXT_PUBLIC_API_BASE_URL` (set to http://localhost:3002)

#### 3. **Frontend User Quality** (`test-frontend-user`)

**Purpose:** Lint, type-check, and verify build success

**Steps:**

1. Checkout code
2. Setup Node.js 18.x
3. Install dependencies (`npm ci`)
4. Run ESLint (`npm run lint:check`)
5. Run TypeScript type checker (`npm run type-check`)
6. Build Next.js application (`npm run build`)

**Environment Variables Required:**

- `NEXTAUTH_SECRET` (from GitHub Secrets)
- `DATABASE_URL` (mock for build only)
- `NEXTAUTH_URL` (set to http://localhost:3000)
- `NEXT_PUBLIC_API_BASE_URL` (set to http://localhost:3002)

#### 4. **CI Status Check** (`build-status`)

**Purpose:** Aggregate all job results and block merge if any failed

**Steps:**

1. Check results of all previous jobs
2. Exit with error code if any job failed
3. Post summary comment on PR with status table

**Example PR Comment:**

```markdown
## 🚀 CI Pipeline Results

| Component          | Status | Result  |
| ------------------ | ------ | ------- |
| **Backend Tests**  | ✅     | success |
| **Frontend Admin** | ✅     | success |
| **Frontend User**  | ✅     | success |

✅ **All checks passed!** This PR is ready to merge.

---

**Backend Tests:** Unit + Integration tests with MySQL, coverage thresholds enforced
**Frontend Checks:** Linting, Type-checking, Build verification
```

---

## 🚀 CD Pipeline (Continuous Deployment)

### Trigger Events

```yaml
on:
  push:
    branches:
      - main
```

**⚠️ Important:** CD pipeline **ONLY** runs when code is pushed to `main` (i.e., after PR merge and CI success).

### Jobs Breakdown

#### 1. **Build and Push Docker Images** (`build-and-push`)

**Purpose:** Build Docker images for all services and push to GitHub Container Registry

**Matrix Strategy:**

```yaml
matrix:
  service: [backend, frontend-user, frontend-admin]
```

**Steps:**

1. Checkout code
2. Setup Docker Buildx
3. Login to GitHub Container Registry (`ghcr.io`)
4. Extract metadata (tags, labels)
5. Build Docker image
6. Push to `ghcr.io/<your-github-username>/<service>:latest`
7. Also tag with commit SHA: `ghcr.io/<your-github-username>/<service>:<date>-<sha>`

**Image Tags:**

- `latest` (always points to most recent main branch build)
- `<YYYYMMDD>-<short-sha>` (e.g., `20231215-a1b2c3d`)

**Registry:**

- **GitHub Container Registry:** `ghcr.io`
- **Authentication:** Uses GitHub Actions built-in `GITHUB_TOKEN`

#### 2. **Deploy** (`deploy`)

**Purpose:** Deploy images to production environment

**⚠️ Note:** This job currently only logs deployment information. Uncomment and configure the deployment steps based on your infrastructure:

**Option A: Deploy to Docker Server via SSH**

```yaml
- name: Deploy to Production Server
  uses: appleboy/ssh-action@v1.0.0
  with:
    host: ${{ secrets.DEPLOY_HOST }}
    username: ${{ secrets.DEPLOY_USER }}
    key: ${{ secrets.DEPLOY_SSH_KEY }}
    port: ${{ secrets.DEPLOY_PORT }}
    script: |
      cd /path/to/your/app
      docker compose pull
      docker compose up -d --force-recreate
      docker image prune -f
```

**Option B: Deploy to Kubernetes**

```yaml
- name: Deploy to Kubernetes
  uses: azure/k8s-deploy@v4
  with:
    manifests: |
      k8s/deployment.yaml
      k8s/service.yaml
    images: |
      ghcr.io/${{ github.repository_owner }}/backend:${{ github.sha }}
      ghcr.io/${{ github.repository_owner }}/frontend-user:${{ github.sha }}
      ghcr.io/${{ github.repository_owner }}/frontend-admin:${{ github.sha }}
```

#### 3. **Notification** (`notification`)

**Purpose:** Send deployment status notifications

**Optional Integrations:**

- Slack webhook
- Email notifications
- Discord webhook
- Microsoft Teams

---

## 🔐 Required GitHub Secrets

To set up secrets, go to **Repository Settings → Secrets and variables → Actions → New repository secret**

### Essential Secrets

| Secret Name         | Description                               | Example                                     | Used In    |
| ------------------- | ----------------------------------------- | ------------------------------------------- | ---------- |
| `JWT_SECRET`        | JWT signing secret for authentication     | `super-secret-jwt-key-change-in-production` | CI, CD     |
| `NEXTAUTH_SECRET`   | NextAuth.js secret for session encryption | `openssl rand -base64 32`                   | CI, CD     |
| `MOMO_ACCESS_KEY`   | MoMo Payment API access key               | `F8BBA842ECF85`                             | CI (tests) |
| `MOMO_SECRET_KEY`   | MoMo Payment API secret key               | `K951B6PE1waDMi640xX08PD3vg6EkVlz`          | CI (tests) |
| `MOMO_PARTNER_CODE` | MoMo Partner Code                         | `MOMO`                                      | CI (tests) |

### Optional Deployment Secrets

| Secret Name         | Description                       | Example                                | Used In |
| ------------------- | --------------------------------- | -------------------------------------- | ------- |
| `DEPLOY_HOST`       | Production server SSH host        | `123.45.67.89`                         | CD      |
| `DEPLOY_USER`       | Production server SSH username    | `deployer`                             | CD      |
| `DEPLOY_SSH_KEY`    | Production server SSH private key | `-----BEGIN RSA PRIVATE KEY-----...`   | CD      |
| `DEPLOY_PORT`       | Production server SSH port        | `22`                                   | CD      |
| `SLACK_WEBHOOK_URL` | Slack webhook for notifications   | `https://hooks.slack.com/services/...` | CD      |

### How to Create Secrets

**Step 1:** Navigate to Repository Settings

```
GitHub Repository → Settings → Secrets and variables → Actions
```

**Step 2:** Click "New repository secret"

**Step 3:** Add each secret:

- **Name:** `JWT_SECRET`
- **Value:** Your actual secret value
- Click **Add secret**

**Step 4:** Repeat for all required secrets

---

## 🛡️ Branch Protection Rules

To enforce CI checks before merging, configure Branch Protection Rules.

### Setup Instructions

**Step 1:** Navigate to Branch Protection

```
Repository Settings → Branches → Add branch protection rule
```

**Step 2:** Configure Protection for `main` Branch

**Branch name pattern:**

```
main
```

**Settings to Enable:**

✅ **Require a pull request before merging**

- ✅ Require approvals: **1** (or more)
- ✅ Dismiss stale pull request approvals when new commits are pushed
- ✅ Require review from Code Owners (optional)

✅ **Require status checks to pass before merging**

- ✅ Require branches to be up to date before merging
- **Required status checks:**
  - `CI Status Check` (from `.github/workflows/ci.yml`)
  - `Test Backend (Unit & Integration)`
  - `Test Frontend Admin (Lint & Build)`
  - `Test Frontend User (Lint & Build)`

✅ **Require conversation resolution before merging**

✅ **Do not allow bypassing the above settings**

- This ensures even admins must pass CI checks

**Step 3:** Save Changes

### Visual Verification

After setup, when creating a PR:

1. All CI checks will run automatically
2. PR will show status: "Some checks haven't completed yet" → "All checks have passed"
3. **Merge button will be disabled** until all checks pass
4. If any check fails, PR cannot be merged

---

## 🧪 Local Testing

Before pushing to GitHub, test CI jobs locally to catch errors early.

### Run Backend Tests Locally

```bash
cd backend

# Install dependencies
npm ci

# Start local MySQL (Docker)
docker run -d \
  --name test-mysql \
  -e MYSQL_ROOT_PASSWORD=rootpassword123 \
  -e MYSQL_DATABASE=test_ecommerce_db \
  -p 3307:3306 \
  mysql:8.0

# Wait for MySQL to be ready
sleep 15

# Create .env.test file
cat > .env.test << EOF
NODE_ENV=test
DATABASE_URL="mysql://root:rootpassword123@localhost:3307/test_ecommerce_db"
TEST_DATABASE_URL="mysql://root:rootpassword123@localhost:3307/test_ecommerce_db"
JWT_SECRET="test-jwt-secret-key"
JWT_EXPIRES_IN="24h"
TEST_TIMEOUT=10000
DISABLE_EXTERNAL_CALLS=true
MOCK_SERVICES=true
EOF

# Run Prisma migrations
npx prisma generate
npx prisma migrate deploy

# Run tests
npm test

# Run tests with coverage
npm run test:coverage

# Stop MySQL
docker stop test-mysql
docker rm test-mysql
```

### Run Frontend Linting & Build Locally

**Frontend User:**

```bash
cd frontend-user
npm ci
npm run lint:check
npm run type-check

# Set environment variables for build
export DATABASE_URL="mysql://mock:mock@localhost:3306/mock_db"
export NEXTAUTH_SECRET="test-secret"
export NEXTAUTH_URL="http://localhost:3000"
export NEXT_PUBLIC_API_BASE_URL="http://localhost:3002"

npm run build
```

**Frontend Admin:**

```bash
cd frontend-admin
npm ci
npm run lint:check
npm run type-check

# Set environment variables for build
export DATABASE_URL="mysql://mock:mock@localhost:3306/mock_db"
export NEXTAUTH_SECRET="test-secret"
export NEXTAUTH_URL="http://localhost:3001"
export NEXT_PUBLIC_API_BASE_URL="http://localhost:3002"

npm run build
```

---

## 🔧 Troubleshooting

### Common CI Issues

#### 1. **Backend Tests Fail: "Cannot connect to database"**

**Problem:** MySQL service container not ready

**Solution:** Wait for health check

```yaml
- name: Wait for MySQL
  run: |
    for i in {1..30}; do
      if mysqladmin ping -h"127.0.0.1" -P3307 -uroot -prootpassword123 &> /dev/null; then
        echo "✅ MySQL is ready"
        break
      fi
      echo "Waiting for MySQL... ($i/30)"
      sleep 2
    done
```

#### 2. **Backend Tests Fail: "JWT_SECRET is not set"**

**Problem:** GitHub Secret not configured

**Solution:**

1. Go to **Repository Settings → Secrets and variables → Actions**
2. Add `JWT_SECRET` secret
3. Re-run workflow

#### 3. **Frontend Build Fails: "NEXTAUTH_SECRET is not defined"**

**Problem:** Environment variable not passed to build step

**Solution:** Add to workflow file:

```yaml
- name: Build frontend-user
  working-directory: ./frontend-user
  env:
    NEXTAUTH_SECRET: ${{ secrets.NEXTAUTH_SECRET }}
  run: npm run build
```

#### 4. **Coverage Below Threshold**

**Problem:** Test coverage is below required thresholds

**Solution:**

- Write more tests to cover untested code
- Check `backend/coverage/lcov-report/index.html` for coverage details
- Current thresholds: Lines/Statements ≥ 80%, Functions/Branches ≥ 70%

#### 5. **Docker Build Fails in CD Pipeline**

**Problem:** Dockerfile error or missing dependencies

**Solution:**

1. Test Docker build locally:
   ```bash
   cd backend
   docker build -t test-backend .
   ```
2. Fix Dockerfile errors
3. Push fix and re-run CD pipeline

### Debugging Workflows

**View Workflow Logs:**

```
GitHub Repository → Actions → Click on workflow run → Click on job → Expand steps
```

**Re-run Failed Jobs:**

```
GitHub Actions → Workflow run → Re-run failed jobs
```

**Debug with `tmate` (SSH into runner):**
Add this step to workflow:

```yaml
- name: Setup tmate session
  uses: mxschmitt/action-tmate@v3
  if: ${{ failure() }}
```

---

## 📊 Monitoring & Metrics

### CI Pipeline Metrics

Track the following metrics to monitor CI health:

- **Average CI duration:** Target < 10 minutes
- **CI success rate:** Target > 95%
- **Coverage trend:** Ensure coverage increases over time
- **Flaky test rate:** Target < 1%

### CD Pipeline Metrics

- **Deployment frequency:** How often code is deployed to production
- **Deployment success rate:** Target > 98%
- **Mean time to recovery (MTTR):** Time to fix broken deployments
- **Lead time for changes:** Time from commit to production

---

## 🎯 Best Practices

### 1. **Write Meaningful Commit Messages**

```bash
# Good
git commit -m "feat(UC-123): Add product search filter by category"

# Bad
git commit -m "fix stuff"
```

### 2. **Keep PRs Small and Focused**

- Aim for PRs < 400 lines of code
- One feature/fix per PR
- Easier to review and less likely to break CI

### 3. **Run Tests Locally Before Pushing**

```bash
cd backend
npm test
npm run test:coverage
```

### 4. **Fix CI Failures Immediately**

- Don't merge broken code
- Don't push additional commits on top of failing CI
- Fix the root cause first

### 5. **Monitor Coverage Trends**

- Add tests for new features
- Refactor untested legacy code
- Celebrate coverage improvements 🎉

---

## 📚 Additional Resources

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Docker Build Documentation](https://docs.docker.com/build/)
- [Jest Testing Framework](https://jestjs.io/docs/getting-started)
- [Prisma Migrations](https://www.prisma.io/docs/concepts/components/prisma-migrate)
- [Next.js Deployment](https://nextjs.org/docs/deployment)

---

## 🤝 Contributing

When contributing to this project:

1. Create a feature branch: `feature/UC-XXX-description`
2. Make your changes
3. Run tests locally
4. Push to GitHub
5. Create Pull Request to `main`
6. Wait for CI to pass (all checks must be green ✅)
7. Request code review
8. Address review comments
9. Merge when approved and CI passes
10. CD pipeline will automatically deploy to production

---

## 📝 License

This project is part of the Software Testing course at [Your University].

---

**Last Updated:** December 2024  
**Maintained By:** DevOps Team
