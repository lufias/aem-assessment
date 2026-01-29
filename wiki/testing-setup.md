# Angular Testing Library Setup

This document describes how behavioral testing was set up using Angular Testing Library.

## Overview

Instead of traditional unit tests that test implementation details, we use **Angular Testing Library** which follows the philosophy:

> "The more your tests resemble the way your software is used, the more confidence they can give you."

This approach focuses on testing components the way users interact with them.

## Packages Installed

### NPM Packages

```bash
npm install --save-dev @testing-library/angular@13.0.0 \
                       @testing-library/user-event@14.5.2 \
                       @testing-library/jasmine-dom@1.2.0 \
                       puppeteer
```

### Linux Dependencies (for CI/Docker)

Puppeteer's bundled Chromium requires system libraries. Install these on Ubuntu/Debian:

```bash
# Ubuntu 24.04+
apt-get update && apt-get install -y \
  libnspr4 \
  libnss3 \
  libatk1.0-0 \
  libatk-bridge2.0-0 \
  libcups2 \
  libdrm2 \
  libxkbcommon0 \
  libxcomposite1 \
  libxdamage1 \
  libxfixes3 \
  libxrandr2 \
  libgbm1 \
  libpango-1.0-0 \
  libasound2t64

# Ubuntu 22.04 and earlier (use libasound2 instead)
apt-get update && apt-get install -y \
  libnspr4 \
  libnss3 \
  libatk1.0-0 \
  libatk-bridge2.0-0 \
  libcups2 \
  libdrm2 \
  libxkbcommon0 \
  libxcomposite1 \
  libxdamage1 \
  libxfixes3 \
  libxrandr2 \
  libgbm1 \
  libpango-1.0-0 \
  libasound2
```

**Note:** If running as root (common in Docker), the `--no-sandbox` flag is required in Karma config (already configured).

| Package | Version | Purpose |
|---------|---------|---------|
| `@testing-library/angular` | 13.0.0 | Core testing utilities for Angular (compatible with Angular 14) |
| `@testing-library/user-event` | 14.5.2 | Simulates real user interactions (typing, clicking) |
| `@testing-library/jasmine-dom` | 1.2.0 | Custom Jasmine matchers like `toBeInTheDocument()` |
| `puppeteer` | latest | Provides bundled Chromium for headless testing |

## Configuration Files

### 1. Test Setup (`src/test.ts`)

Added jasmine-dom matchers registration:

```typescript
import JasmineDOM from '@testing-library/jasmine-dom/dist';

// Add jasmine-dom matchers
beforeEach(() => {
  jasmine.addMatchers(JasmineDOM);
});
```

### 2. TypeScript Declarations (`src/jasmine-dom.d.ts`)

Created type declarations for jasmine-dom matchers:

```typescript
/// <reference types="jasmine" />

declare module '@testing-library/jasmine-dom/dist' {
  const JasmineDOM: jasmine.CustomMatcherFactories;
  export default JasmineDOM;
}

declare namespace jasmine {
  interface Matchers<T> {
    toBeInTheDocument(): boolean;
    toBeVisible(): boolean;
    toBeDisabled(): boolean;
    toBeEnabled(): boolean;
    toHaveValue(value: string | string[] | number | null): boolean;
    toHaveTextContent(text: string | RegExp): boolean;
    // ... other matchers
  }
}
```

### 3. Karma Configuration (`karma.conf.js`)

Configured to use Puppeteer's bundled Chromium:

```javascript
process.env.CHROME_BIN = require('puppeteer').executablePath();

module.exports = function (config) {
  config.set({
    // ...
    browsers: ['ChromeHeadless'],
    customLaunchers: {
      ChromeHeadless: {
        base: 'Chrome',
        flags: [
          '--headless',
          '--disable-gpu',
          '--no-sandbox',
          '--disable-dev-shm-usage'
        ]
      }
    },
  });
};
```

### 4. TypeScript Config (`tsconfig.json`)

Added `skipLibCheck` for compatibility:

```json
{
  "compilerOptions": {
    "skipLibCheck": true
  }
}
```

## Writing Behavioral Tests

### Basic Test Structure

```typescript
import { render, screen, fireEvent } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { ReactiveFormsModule } from '@angular/forms';
import { provideMockStore } from '@ngrx/store/testing';
import { MyComponent } from './my.component';

describe('MyComponent', () => {
  async function setup(stateOverrides = {}) {
    const { fixture } = await render(MyComponent, {
      imports: [ReactiveFormsModule],
      providers: [provideMockStore({ initialState: state })]
    });
    return { fixture };
  }

  it('should display the title', async () => {
    await setup();
    expect(screen.getByText('My Title')).toBeInTheDocument();
  });
});
```

### Querying Elements

Use queries that reflect how users find elements:

```typescript
// By text content
screen.getByText('Sign in to your dashboard')

// By placeholder
screen.getByPlaceholderText('Username')

// By role (accessibility)
screen.getByRole('button', { name: /sign in/i })

// Query variants:
// - getBy*    : throws if not found (use for elements that should exist)
// - queryBy*  : returns null if not found (use for elements that may not exist)
// - findBy*   : async, waits for element (use for elements that appear after actions)
```

### User Interactions

Use `userEvent` for realistic user simulation:

```typescript
it('should allow user to type and submit', async () => {
  const user = userEvent.setup();
  await setup();

  const input = screen.getByPlaceholderText('Username');
  await user.type(input, 'testuser');

  const button = screen.getByRole('button', { name: /submit/i });
  await user.click(button);

  expect(input).toHaveValue('testuser');
});
```

For simple events, `fireEvent` also works:

```typescript
fireEvent.click(screen.getByRole('button'));
```

### Testing with NgRx Store

Mock the store and spy on dispatched actions:

```typescript
import { provideMockStore, MockStore } from '@ngrx/store/testing';

async function setup(stateOverrides = {}) {
  const initialState = {
    auth: { login: { loading: false, error: null, ...stateOverrides } }
  };

  const { fixture } = await render(MyComponent, {
    providers: [provideMockStore({ initialState })]
  });

  const store = fixture.debugElement.injector.get(MockStore);
  const dispatchSpy = spyOn(store, 'dispatch').and.callThrough();

  return { store, dispatchSpy };
}

it('should dispatch login action', async () => {
  const { dispatchSpy } = await setup();

  // ... perform actions

  expect(dispatchSpy).toHaveBeenCalledWith(
    LoginActions.login({ credentials: { username: 'test', password: 'pass' } })
  );
});
```

### Testing Different States

Pass state overrides to test loading, error, and success states:

```typescript
it('should show loading state', async () => {
  await setup({ loading: true });

  expect(screen.getByRole('button', { name: /signing in/i })).toBeDisabled();
});

it('should show error message', async () => {
  await setup({ error: 'Invalid credentials' });

  expect(screen.getByText('Invalid credentials')).toBeInTheDocument();
});
```

## Common Matchers

| Matcher | Usage |
|---------|-------|
| `toBeInTheDocument()` | Element exists in DOM |
| `toBeVisible()` | Element is visible to user |
| `toBeDisabled()` | Form element is disabled |
| `toBeEnabled()` | Form element is enabled |
| `toHaveValue(value)` | Input has specific value |
| `toHaveTextContent(text)` | Element contains text |
| `toHaveAttribute(attr, value)` | Element has attribute |
| `toHaveFocus()` | Element is focused |

## Running Tests

```bash
# Run all tests
npm test

# Run specific test file
ng test --include=**/login.component.spec.ts

# Run tests once (CI mode)
npm test -- --watch=false

# Run with coverage
npm test -- --code-coverage
```

## Unit vs Behavioral Testing Comparison

| Aspect | Unit Testing | Behavioral Testing |
|--------|--------------|-------------------|
| Focus | Implementation details | User behavior |
| Queries | By CSS class, component property | By role, text, label |
| Assertions | Internal state | What user sees |
| Refactoring | Tests often break | Tests remain stable |
| Confidence | Tests pass but app may fail | Tests reflect real usage |

### Example Comparison

**Unit test (implementation-focused):**
```typescript
expect(component.isLoading).toBe(true);
expect(fixture.debugElement.query(By.css('.loading-spinner'))).toBeTruthy();
```

**Behavioral test (user-focused):**
```typescript
expect(screen.getByRole('button', { name: /signing in/i })).toBeDisabled();
```

## CI/CD Examples

### GitHub Actions

```yaml
name: Tests
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'

      - name: Install Chrome dependencies
        run: |
          sudo apt-get update
          sudo apt-get install -y libnspr4 libnss3 libatk1.0-0 libatk-bridge2.0-0 \
            libcups2 libdrm2 libxkbcommon0 libxcomposite1 libxdamage1 libxfixes3 \
            libxrandr2 libgbm1 libpango-1.0-0 libasound2

      - name: Install dependencies
        run: npm ci

      - name: Run tests
        run: npm test -- --watch=false --browsers=ChromeHeadless
```

### Dockerfile

```dockerfile
FROM node:18

# Install Chrome dependencies
RUN apt-get update && apt-get install -y \
    libnspr4 \
    libnss3 \
    libatk1.0-0 \
    libatk-bridge2.0-0 \
    libcups2 \
    libdrm2 \
    libxkbcommon0 \
    libxcomposite1 \
    libxdamage1 \
    libxfixes3 \
    libxrandr2 \
    libgbm1 \
    libpango-1.0-0 \
    libasound2 \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .

CMD ["npm", "test", "--", "--watch=false"]
```

## References

- [Testing Library Docs](https://testing-library.com/docs/angular-testing-library/intro)
- [Testing Library Guiding Principles](https://testing-library.com/docs/guiding-principles)
- [Common Mistakes](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)
- [Puppeteer Troubleshooting](https://pptr.dev/troubleshooting)
