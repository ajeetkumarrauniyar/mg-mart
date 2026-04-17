#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}🧪 Interactive Image Management Test${NC}"
echo "=================================="

# Check if server is running
echo -e "\n${BLUE}Checking if server is running...${NC}"
if ! curl -s http://localhost:5000 > /dev/null; then
    echo -e "${RED}❌ Server is not running on localhost:5000${NC}"
    echo "Please start the server with: pnpm run dev"
    exit 1
fi
echo -e "${GREEN}✅ Server is running${NC}"

# Step 1: Login
echo -e "\n${BLUE}1. 🔑 Getting JWT Token...${NC}"
LOGIN_RESPONSE=$(curl -s -X POST http://localhost:5000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "user9@example.com", "password": "1234567890"}')

TOKEN=$(echo $LOGIN_RESPONSE | jq -r '.data.token' 2>/dev/null)

if [ -z "$TOKEN" ] || [ "$TOKEN" = "null" ]; then
    echo -e "${RED}❌ Login failed${NC}"
    echo "Response: $LOGIN_RESPONSE"
    exit 1
fi

echo -e "${GREEN}✅ Login successful${NC}"
echo "Token: ${TOKEN:0:30}..."

# Step 2: Health Check
echo -e "\n${BLUE}2. 🏥 Health Check...${NC}"
HEALTH_RESPONSE=$(curl -s http://localhost:5000/api/v1/image-management/health)
echo $HEALTH_RESPONSE | jq .

# Step 3: Choose product type
echo -e "\n${YELLOW}Choose a product type to test:${NC}"
echo "1. iPhone (should find many images)"
echo "2. Samsung Galaxy (should find many images)"
echo "3. MacBook (should find laptop images)"
echo "4. Nike Shoes (should find shoe images)"
echo "5. Custom product name"

read -p "Enter choice (1-5): " choice

case $choice in
    1) PRODUCT_BASE="iphone" ;;
    2) PRODUCT_BASE="samsung-galaxy" ;;
    3) PRODUCT_BASE="macbook" ;;
    4) PRODUCT_BASE="nike-shoes" ;;
    5) 
        read -p "Enter custom product name: " PRODUCT_BASE
        # Clean up the product name for URL safety
        PRODUCT_BASE=$(echo "$PRODUCT_BASE" | sed 's/[^a-zA-Z0-9 ]//g' | sed 's/ /-/g' | tr '[:upper:]' '[:lower:]')
        ;;
    *) 
        echo "Invalid choice, using iPhone"
        PRODUCT_BASE="iphone"
        ;;
esac

PRODUCT_ID="test-$PRODUCT_BASE-$(date +%s)"

# Step 3: Discover Images
echo -e "\n${BLUE}3. 🔍 Discovering images for product: $PRODUCT_ID${NC}"
echo -e "${BLUE}   (Cleaned from: \"$PRODUCT_BASE\")${NC}"

DISCOVERY_RESPONSE=$(curl -s -X POST http://localhost:5000/api/v1/products/$PRODUCT_ID/discover-images \
  -H "Authorization: Bearer $TOKEN")

# Check if response is valid JSON
if echo "$DISCOVERY_RESPONSE" | jq . > /dev/null 2>&1; then
    echo $DISCOVERY_RESPONSE | jq .
    # Extract discovered image count
    IMAGE_COUNT=$(echo $DISCOVERY_RESPONSE | jq -r '.data.discoveredImages | length' 2>/dev/null)
else
    echo -e "${RED}❌ Invalid JSON response:${NC}"
    echo "$DISCOVERY_RESPONSE"
    IMAGE_COUNT="0"
fi

if [ "$IMAGE_COUNT" = "0" ] || [ "$IMAGE_COUNT" = "null" ]; then
    echo -e "${YELLOW}⚠️ No images found. This might be normal for some product names.${NC}"
    echo -e "${BLUE}Test completed - no images to approve.${NC}"
    exit 0
fi

echo -e "${GREEN}✅ Found $IMAGE_COUNT images${NC}"

# Step 4: Check Status
echo -e "\n${BLUE}4. 📋 Checking processing status...${NC}"
sleep 1
STATUS_RESPONSE=$(curl -s http://localhost:5000/api/v1/products/$PRODUCT_ID/processing-status \
  -H "Authorization: Bearer $TOKEN")

echo $STATUS_RESPONSE | jq .

# Step 5: Ask if user wants to approve images
echo -e "\n${YELLOW}Do you want to approve the first 2 images? (y/n):${NC}"
read -p "" approve

if [ "$approve" = "y" ] || [ "$approve" = "Y" ]; then
    # Extract first 2 image IDs
    IMAGE_IDS=$(echo $DISCOVERY_RESPONSE | jq -r '.data.discoveredImages[0:2] | map(.id) | @json')
    
    echo -e "\n${BLUE}5. ✅ Approving images...${NC}"
    echo "Image IDs: $IMAGE_IDS"
    
    APPROVAL_RESPONSE=$(curl -s -X POST http://localhost:5000/api/v1/products/$PRODUCT_ID/approve-images \
      -H "Content-Type: application/json" \
      -H "Authorization: Bearer $TOKEN" \
      -d "{\"imageIds\": $IMAGE_IDS, \"approvedBy\": \"manual-test\"}")
    
    echo $APPROVAL_RESPONSE | jq .
    
    # Step 6: Wait and check final status
    echo -e "\n${BLUE}6. ⏳ Waiting for processing (3 seconds)...${NC}"
    sleep 3
    
    echo -e "\n${BLUE}7. 🏁 Checking final status...${NC}"
    FINAL_STATUS=$(curl -s http://localhost:5000/api/v1/products/$PRODUCT_ID/processing-status \
      -H "Authorization: Bearer $TOKEN")
    
    echo $FINAL_STATUS | jq .
    
    # Step 7: Get product images
    echo -e "\n${BLUE}8. 🖼️ Getting product images...${NC}"
    IMAGES_RESPONSE=$(curl -s http://localhost:5000/api/v1/products/$PRODUCT_ID/images \
      -H "Authorization: Bearer $TOKEN")
    
    echo $IMAGES_RESPONSE | jq .
    
else
    echo -e "${BLUE}Skipping image approval.${NC}"
fi

# Step 8: Get statistics
echo -e "\n${BLUE}9. 📊 Getting processing statistics...${NC}"
STATS_RESPONSE=$(curl -s http://localhost:5000/api/v1/image-management/statistics \
  -H "Authorization: Bearer $TOKEN")

echo $STATS_RESPONSE | jq .

echo -e "\n${GREEN}🎉 Interactive test completed!${NC}"
echo -e "${BLUE}Product ID used: $PRODUCT_ID${NC}"
echo -e "${BLUE}You can use this ID to test other endpoints manually.${NC}"