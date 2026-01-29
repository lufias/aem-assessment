# AEM Assessment

An Angular + Electron desktop application for interview assessments featuring data visualization capabilities.

## Tech Stack

- **Angular 14** with Angular CLI
- **Electron 28** for desktop application
- **NgRx 14** (Store, Effects, Entity, DevTools) for state management
- **Bootstrap 4** for styling and UI components
- **Chart.js 3** with ng2-charts for data visualization
- **SCSS** for styling
- **Karma/Jasmine** for unit testing

## Setup

### Prerequisites

- Node.js (LTS version recommended)
- npm

### Installation

```bash
# Install dependencies
npm install
```

## Commands

```bash
# Start development server at http://localhost:4200
npm start

# Production build (outputs to dist/aem-assessment)
npm run build

# Development build with watch mode
npm run watch

# Run unit tests via Karma
npm test

# Run a single test file
ng test --include=**/component-name.spec.ts
```

### Electron (Desktop App)

```bash
# Build Angular and launch Electron (production)
npm run electron

# Build Angular (dev) and launch Electron
npm run electron:dev

# Launch Electron only (assumes already built)
npm run electron:serve
```

## Project Structure

```
├── electron/
│   ├── main.js          # Electron main process
│   └── preload.js       # Preload script for IPC
├── src/
│   └── app/             # Angular application
├── dist/                # Built application (generated)
└── package.json
```

## Code Generation

```bash
# Generate a new component
ng generate component components/component-name

# Generate a new service
ng generate service services/service-name

# Generate a new module with routing
ng generate module modules/module-name --routing
```
