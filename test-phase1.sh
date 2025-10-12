#!/bin/bash

echo "=== Phase 1 Testing Script ==="
echo "Testing UC1 branch features..."

# Test Backend API
echo "1. Testing Backend API..."
curl -s http://localhost:3002/health || echo "Backend not running"

# Test Products API
echo "2. Testing Products API..."
curl -s http://localhost:3002/api/products | head -c 100 || echo "Products API not accessible"

# Test Categories API  
echo "3. Testing Categories API..."
curl -s http://localhost:3002/api/categories | head -c 100 || echo "Categories API not accessible"

# Test Search API
echo "4. Testing Search API..."
curl -s "http://localhost:3002/api/search?query=laptop" | head -c 100 || echo "Search API not accessible"

echo "=== Testing Complete ==="
