# Phase 1 Testing Script for Windows PowerShell

Write-Host "=== Phase 1 Testing Script ===" -ForegroundColor Green
Write-Host "Testing UC1 branch features..." -ForegroundColor Yellow

# Test Backend API
Write-Host "1. Testing Backend API..." -ForegroundColor Cyan
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3002/health" -UseBasicParsing
    Write-Host "Backend API: OK" -ForegroundColor Green
} catch {
    Write-Host "Backend API: Not running" -ForegroundColor Red
}

# Test Products API
Write-Host "2. Testing Products API..." -ForegroundColor Cyan
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3002/api/products" -UseBasicParsing
    Write-Host "Products API: OK" -ForegroundColor Green
} catch {
    Write-Host "Products API: Not accessible" -ForegroundColor Red
}

# Test Categories API  
Write-Host "3. Testing Categories API..." -ForegroundColor Cyan
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3002/api/categories" -UseBasicParsing
    Write-Host "Categories API: OK" -ForegroundColor Green
} catch {
    Write-Host "Categories API: Not accessible" -ForegroundColor Red
}

# Test Search API
Write-Host "4. Testing Search API..." -ForegroundColor Cyan
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3002/api/search?query=laptop" -UseBasicParsing
    Write-Host "Search API: OK" -ForegroundColor Green
} catch {
    Write-Host "Search API: Not accessible" -ForegroundColor Red
}

Write-Host "=== Testing Complete ===" -ForegroundColor Green
