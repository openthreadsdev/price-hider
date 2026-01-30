#!/bin/bash

# Build script for Chrome Web Store package
# This creates a clean distribution package without test files

echo "🔨 Building Price Hider extension for Chrome Web Store..."

# Create build directory
BUILD_DIR="dist"
rm -rf $BUILD_DIR
mkdir -p $BUILD_DIR

# Copy only production files
echo "📦 Copying production files..."
cp manifest.json $BUILD_DIR/
cp content.js $BUILD_DIR/
cp -r icons $BUILD_DIR/

# Optional: Copy a minimal README
if [ -f README.md ]; then
  echo "📄 Copying README (optional)..."
  cp README.md $BUILD_DIR/
fi

# Create zip file for Chrome Web Store
echo "🗜️  Creating zip file..."
cd $BUILD_DIR
zip -r ../price-hider-chrome-store.zip .
cd ..

echo "✅ Build complete!"
echo "📦 Package ready: price-hider-chrome-store.zip"
echo ""
echo "File size: $(du -h price-hider-chrome-store.zip | cut -f1)"
echo ""
echo "To upload to Chrome Web Store:"
echo "1. Go to https://chrome.google.com/webstore/devconsole"
echo "2. Upload price-hider-chrome-store.zip"
echo ""
echo "Contents of package:"
unzip -l price-hider-chrome-store.zip
