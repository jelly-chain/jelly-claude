#!/bin/bash
# JELLY_DEMO.sh — Demonstration script for Jelly terminal command

echo ""
echo "=========================================="
echo "Jelly Terminal Command Demonstration"
echo "=========================================="
echo ""

# Test 1: List agents
echo "1. Listing all agents:"
echo "   <Jelly> agents"
echo ""
<Jelly> agents
echo ""

# Test 2: List skills
echo "2. Listing all skills:"
echo "   <Jelly> skills"
echo ""
<Jelly> skills
echo ""

# Test 3: Show system status
echo "3. System status:"
echo "   <Jelly> status"
echo ""
<Jelly> status
echo ""

# Test 4: Quick prediction
echo "4. Quick prediction:"
echo "   <Jelly> predict \"Solana TVL surge\" solana"
echo ""
<Jelly> predict "Solana TVL surge" solana
echo ""

# Test 5: Scanner query
echo "6. Scanner query:"
echo "   <Jelly> scan newTokens --chain bnb"
echo ""
<Jelly> scan newTokens --chain bnb
echo ""

# Test 6: Run a module
echo "6. Run a module:"
echo "   <Jelly> run modules/market/predict --text \"Test\" --chain solana"
echo ""
<Jelly> run modules/market/predict --text "Test" --chain solana
echo ""

echo "=========================================="
echo "Jelly Terminal Command Demonstration Complete"
echo "=========================================="