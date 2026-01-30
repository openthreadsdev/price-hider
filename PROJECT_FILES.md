# Project Files Overview

## Production Files (Included in Chrome Web Store Package)

These files are included when you run `npm run build`:

| File | Purpose | Size |
|------|---------|------|
| `manifest.json` | Extension configuration | 261 B |
| `content.js` | Main extension logic | ~11 KB |
| `icons/price-hider-16.png` | Small icon (16x16) | ~1 KB |
| `icons/price-hider-48.png` | Medium icon (48x48) | ~4 KB |
| `icons/price-hider-128.png` | Large icon (128x128) | ~19 KB |
| `icons/price-hider.png` | Original icon | ~436 KB |
| `README.md` | User documentation | ~3 KB |

**Total package size:** ~424 KB

## Development Files (NOT Included in Package)

These files stay in your repository for development:

### Test Files
| File | Purpose | Size |
|------|---------|------|
| `content.test.js` | Unit tests (52 tests) | ~20 KB |
| `content.integration.test.js` | Integration tests (55 tests) | ~22 KB |
| `jest.config.js` | Test configuration | ~307 B |
| `coverage/` | Test coverage reports | Generated |

### Configuration Files
| File | Purpose |
|------|---------|
| `package.json` | npm configuration and scripts |
| `package-lock.json` | Locked dependency versions |
| `.gitignore` | Git ignore rules |

### Documentation Files
| File | Purpose |
|------|---------|
| `TESTING.md` | Testing documentation |
| `TEST_SUMMARY.md` | Test coverage report |
| `DEVELOPER_GUIDE.md` | Developer quick start |
| `PACKAGING.md` | Packaging instructions |
| `PROJECT_FILES.md` | This file |

### Build Files
| File | Purpose |
|------|---------|
| `build.sh` | Build script for packaging |
| `dist/` | Build output directory |
| `*.zip` | Generated package files |

### Dependencies
| Directory | Purpose | Size |
|-----------|---------|------|
| `node_modules/` | npm packages (Jest, jsdom, etc.) | ~50 MB |

## File Structure

```
price-hider/
├── Production Files (→ Chrome Web Store)
│   ├── manifest.json
│   ├── content.js
│   ├── icons/
│   │   ├── price-hider-16.png
│   │   ├── price-hider-48.png
│   │   ├── price-hider-128.png
│   │   └── price-hider.png
│   └── README.md
│
├── Test Files (Development Only)
│   ├── content.test.js
│   ├── content.integration.test.js
│   └── jest.config.js
│
├── Configuration (Development Only)
│   ├── package.json
│   ├── package-lock.json
│   └── .gitignore
│
├── Documentation (Development Only)
│   ├── TESTING.md
│   ├── TEST_SUMMARY.md
│   ├── DEVELOPER_GUIDE.md
│   ├── PACKAGING.md
│   └── PROJECT_FILES.md
│
├── Build Files (Development Only)
│   ├── build.sh
│   ├── dist/
│   └── price-hider-chrome-store.zip
│
└── Dependencies (Development Only)
    ├── node_modules/
    └── coverage/
```

## npm Scripts

| Command | Purpose |
|---------|---------|
| `npm test` | Run all tests once |
| `npm run test:watch` | Run tests in watch mode |
| `npm run test:coverage` | Generate coverage report |
| `npm run build` | Build production package |

## Size Comparison

| Package Type | Size | Files |
|--------------|------|-------|
| **Production Package** (Chrome Web Store) | 424 KB | 8 files |
| **Full Repository** (with node_modules) | ~50 MB | 370+ files |
| **Repository** (without node_modules) | ~500 KB | ~20 files |

## What Goes Where?

### ✅ Include in Chrome Web Store Package
- All files needed for the extension to run
- Icons and assets
- User-facing documentation (optional)

### ✅ Include in Git Repository
- All production files
- All test files
- All configuration files
- All documentation
- Build scripts
- **Exclude:** `node_modules/`, `coverage/`, `dist/`, `*.zip`

### ❌ Never Include Anywhere Public
- `.env` files with secrets
- API keys or credentials
- Personal information
- Large binary files (videos, etc.)

## Workflow Summary

### 1. Development
```bash
git clone <repo>
npm install          # Install test dependencies
npm test            # Run tests during development
```

### 2. Pre-Release
```bash
npm test            # Verify all tests pass
npm run test:coverage  # Check coverage
git commit -m "Ready for release"
git tag v1.0.0
```

### 3. Build for Chrome Web Store
```bash
npm run build       # Creates clean package
# Upload price-hider-chrome-store.zip to Chrome Web Store
```

### 4. Distribution
- Chrome Web Store: Contains only production files (~424 KB)
- GitHub Repository: Contains everything (~50 MB with node_modules)
- Users Download: From Chrome Web Store (automatic)
- Developers Clone: From GitHub (includes tests)

## Key Points

1. **Tests stay in the repository** - They're for developers, not end users
2. **Build creates clean package** - Only production files included
3. **Two audiences:**
   - **End Users:** Get minimal, tested code via Chrome Web Store
   - **Developers:** Get full repository with tests via Git

4. **Size matters:**
   - 424 KB package downloads and installs fast
   - 50 MB repo with tests is fine for development
   - Users never see the 50 MB version

5. **Professional approach:**
   - Thorough testing during development (98% coverage)
   - Clean distribution to users (no test files)
   - Full transparency for developers (open source)

## Questions?

- **"Do users need the tests?"** No, tests are for development
- **"Will tests slow down the extension?"** No, they're not included
- **"Should I commit tests to Git?"** Yes, absolutely
- **"Can I include tests in the package?"** You could, but shouldn't
- **"What if I want to include tests?"** Don't - it adds bloat and confuses users

## Best Practice

✅ **Do this:**
1. Write comprehensive tests (we have 107!)
2. Maintain high coverage (we have 98%+)
3. Commit tests to Git
4. Build clean packages for distribution
5. Document everything

❌ **Don't do this:**
1. Upload test files to Chrome Web Store
2. Include node_modules in the package
3. Ship development configuration to users
4. Skip writing tests to save time
5. Include unnecessary files in the package
