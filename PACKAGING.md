# Packaging for Chrome Web Store

## Quick Answer

**DO NOT include test files in your Chrome Web Store package.** Only include runtime files needed for the extension to work.

## Building the Package

Simply run:
```bash
npm run build
```

This creates `price-hider-chrome-store.zip` containing only production files.

## What Gets Included

The build package contains:
- `manifest.json` - Extension configuration
- `content.js` - Main extension code
- `icons/` - Extension icons (all sizes)
- `README.md` (optional) - User documentation

**Total package size: ~424KB**

## What Gets Excluded

These development files stay in your repository only:
- `node_modules/` (~50MB) - Development dependencies
- `*.test.js` files - Test code
- `package.json`, `package-lock.json` - npm configuration
- `jest.config.js` - Test configuration
- `coverage/` - Test coverage reports
- `.gitignore` - Git configuration
- `build.sh` - Build script
- `TESTING.md`, `TEST_SUMMARY.md`, `DEVELOPER_GUIDE.md` - Developer docs
- `.git/` - Git history

## Why Exclude Test Files?

1. **Size**: Test files and dependencies add ~50MB+ of unnecessary bloat
2. **Security**: No need to expose test code to end users
3. **Performance**: Smaller package = faster installation
4. **Store Requirements**: Chrome Web Store reviews may flag unnecessary files
5. **Professionalism**: Clean packages show attention to quality

## Uploading to Chrome Web Store

1. **Build the package:**
   ```bash
   npm run build
   ```

2. **Go to Chrome Web Store Developer Dashboard:**
   https://chrome.google.com/webstore/devconsole

3. **Upload the zip file:**
   - Click "New Item" or update existing item
   - Upload `price-hider-chrome-store.zip`
   - Fill in store listing details
   - Submit for review

## Verifying the Package

Check what's in your package:
```bash
unzip -l price-hider-chrome-store.zip
```

Should only show:
```
manifest.json
content.js
icons/price-hider-16.png
icons/price-hider-48.png
icons/price-hider-128.png
icons/price-hider.png
README.md (optional)
```
