#!/bin/bash

# Test API Endpoints
# Usage: ./test-api.sh

BASE_URL="http://localhost:3000"

echo "========================================="
echo "Engine Results Viewer - API Test Script"
echo "========================================="
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Test 1: Health check
echo -e "${BLUE}Test 1: Health Check${NC}"
echo "GET /health"
curl -s "$BASE_URL/health" | python3 -m json.tool
echo ""
echo ""

# Test 2: API info
echo -e "${BLUE}Test 2: API Info${NC}"
echo "GET /api"
curl -s "$BASE_URL/api" | python3 -m json.tool
echo ""
echo ""

# Test 3: List projects
echo -e "${BLUE}Test 3: List Projects${NC}"
echo "GET /api/projects"
curl -s "$BASE_URL/api/projects" | python3 -m json.tool
echo ""
echo ""

# Test 4: Get project details (Vesta)
echo -e "${BLUE}Test 4: Get Project Details (Vesta 1.6 IM)${NC}"
echo "GET /api/project/vesta-16-im"
echo "Summary:"
curl -s "$BASE_URL/api/project/vesta-16-im" | python3 -c "
import sys, json
try:
    d = json.load(sys.stdin)
    if d['success']:
        print(f\"  Name: {d['data']['name']}\")
        print(f\"  Engine: {d['data']['metadata']['numCylinders']} cylinders, {d['data']['metadata']['engineType']}\")
        print(f\"  Calculations: {d['meta']['totalCalculations']}\")
        print(f\"  Data points: {d['meta']['totalDataPoints']}\")
        print(f\"  Parse time: {d['meta']['parseDuration']}ms\")
        print(f\"  File size: {d['data']['fileInfo']['sizeFormatted']}\")
    else:
        print(f\"  Error: {d['error']['message']}\")
except Exception as e:
    print(f\"  Error parsing response: {e}\")
"
echo ""
echo ""

# Test 5: Get project details (BMW)
echo -e "${BLUE}Test 5: Get Project Details (BMW M42)${NC}"
echo "GET /api/project/bmw-m42"
echo "Summary:"
curl -s "$BASE_URL/api/project/bmw-m42" | python3 -c "
import sys, json
try:
    d = json.load(sys.stdin)
    if d['success']:
        print(f\"  Name: {d['data']['name']}\")
        print(f\"  Engine: {d['data']['metadata']['numCylinders']} cylinders, {d['data']['metadata']['engineType']}\")
        print(f\"  Calculations: {d['meta']['totalCalculations']}\")
        print(f\"  Data points: {d['meta']['totalDataPoints']}\")
        print(f\"  Parse time: {d['meta']['parseDuration']}ms\")
        print(f\"  File size: {d['data']['fileInfo']['sizeFormatted']}\")
    else:
        print(f\"  Error: {d['error']['message']}\")
except Exception as e:
    print(f\"  Error parsing response: {e}\")
"
echo ""
echo ""

# Test 6: Error handling - nonexistent project
echo -e "${BLUE}Test 6: Error Handling - Nonexistent Project${NC}"
echo "GET /api/project/nonexistent"
curl -s "$BASE_URL/api/project/nonexistent" | python3 -m json.tool
echo ""
echo ""

# Test 7: Error handling - invalid ID
echo -e "${BLUE}Test 7: Error Handling - Invalid ID${NC}"
echo "GET /api/project/Invalid%20ID%20123!"
curl -s "$BASE_URL/api/project/Invalid%20ID%20123!" | python3 -m json.tool
echo ""
echo ""

# Test 8: Performance test
echo -e "${BLUE}Test 8: Performance Test${NC}"
echo "Running 10 requests to /api/projects..."
TOTAL_TIME=0
for i in {1..10}; do
  START=$(date +%s%3N)
  curl -s "$BASE_URL/api/projects" > /dev/null
  END=$(date +%s%3N)
  DURATION=$((END - START))
  TOTAL_TIME=$((TOTAL_TIME + DURATION))
done
AVG_TIME=$((TOTAL_TIME / 10))
echo "  Average response time: ${AVG_TIME}ms"
echo ""

echo "========================================="
echo -e "${GREEN}All tests completed!${NC}"
echo "========================================="
