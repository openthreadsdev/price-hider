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

## Manual Packaging (Alternative)

If you prefer to package manually:

```bash
# Create a clean directory
mkdir dist
cd dist

# Copy only production files
cp ../manifest.json .
cp ../content.js .
cp -r ../icons .

# Create zip
zip -r ../price-hider.zip .
```

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

## Development vs Production

### Development Setup
When developing, you have:
```
price-hider/
├── manifest.json          ← Production
├── content.js             ← Production
├── icons/                 ← Production
├── node_modules/          ← Development only
├── *.test.js             ← Development only
├── package.json          ← Development only
├── jest.config.js        ← Development only
├── coverage/             ← Development only
└── documentation/        ← Development only
```

### Production Package
What users get:
```
price-hider/
├── manifest.json
├── content.js
├── icons/
└── README.md (optional)
```

## Best Practices

1. **Always build before uploading:**
   ```bash
   npm run build
   ```

2. **Test the package locally first:**
   - Extract the zip file
   - Load as unpacked extension in Chrome
   - Verify it works without development files

3. **Keep tests in your repository:**
   - Commit tests to version control (Git)
   - Run tests before building: `npm test`
   - Maintain high test coverage

4. **Version control:**
   - Update `version` in `manifest.json` for each release
   - Tag releases in Git: `git tag v1.0.0`
   - Keep CHANGELOG.md for users

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

## Common Mistakes to Avoid

**Don't include:**
- `node_modules/` folder
- Test files (`*.test.js`, `*.spec.js`)
- Configuration files (`package.json`, `jest.config.js`)
- Build scripts
- Documentation meant for developers
- `.git` folder
- `.DS_Store` or other OS files

**Do include:**
- `manifest.json` (required)
- All JavaScript files referenced in manifest
- All images/icons
- Any CSS files (if you add them)
- LICENSE file (recommended)
- User-facing README (optional)

## Testing the Production Build

Before uploading to Chrome Web Store:

1. **Build the package:**
   ```bash
   npm run build
   ```

2. **Extract to a test directory:**
   ```bash
   mkdir test-build
   unzip price-hider-chrome-store.zip -d test-build
   ```

3. **Load in Chrome:**
   - Go to `chrome://extensions`
   - Enable "Developer mode"
   - Click "Load unpacked"
   - Select the `test-build` directory

4. **Test functionality:**
   - Visit websites with prices (Amazon, eBay, etc.)
   - Verify prices are masked
   - Check for console errors
   - Test on different sites

5. **If it works, upload to Chrome Web Store!**

## CI/CD Integration

You can automate builds in CI/CD:

```yaml
# .github/workflows/release.yml
name: Build and Release
on:
  push:
    tags:
      - 'v*'

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      
      - name: Run tests
        run: |
          npm install
          npm test
      
      - name: Build package
        run: npm run build
      
      - name: Upload artifact
        uses: actions/upload-artifact@v2
        with:
          name: chrome-extension
          path: price-hider-chrome-store.zip
```

## Summary

- Use `npm run build` to create production package
- Only include runtime files in the package
- Keep tests in your Git repository
- Test the package before uploading
- Never include `node_modules/` or test files
- Don't upload development configuration files

The build process ensures you ship a clean, professional package to your users while keeping all development tools in your repository for ongoing development and testing.
