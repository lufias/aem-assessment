# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Interview assessment Angular application with data visualization capabilities.

## Tech Stack

- Angular 14 with Angular CLI
- NgRx 14 (Store, Effects, Entity, DevTools)
- Bootstrap 4 (CSS framework)
- Chart.js 3 with ng2-charts (charting library)
- SCSS for styling
- Karma/Jasmine for testing

## Commands

```bash
# Development
npm start              # Start dev server at http://localhost:4200
npm run build          # Production build to dist/aem-assessment
npm run watch          # Development build with watch mode

# Testing
npm test               # Run unit tests via Karma
ng test --include=**/component-name.spec.ts  # Run single test file

# Code Generation
ng generate component components/component-name
ng generate service services/service-name
ng generate module modules/module-name --routing
```

## Architecture

```
src/
├── app/
│   ├── store/
│   │   └── index.ts            # Root state, reducers, meta-reducers
│   ├── app.module.ts           # Root module (Store configured here)
│   ├── app-routing.module.ts   # Root routing configuration
│   └── app.component.*         # Root component
├── assets/                     # Static assets
├── environments/               # Environment configs (dev/prod)
└── styles.scss                 # Global styles
```

## NgRx Store Pattern

Feature state files should follow this structure:
```
feature/
├── store/
│   ├── feature.actions.ts      # createAction definitions
│   ├── feature.reducer.ts      # createReducer with on() handlers
│   ├── feature.selectors.ts    # createSelector for derived state
│   ├── feature.effects.ts      # Injectable Effects class
│   └── feature.state.ts        # State interface and initial state
```

Register feature stores in feature modules:
```typescript
StoreModule.forFeature('featureName', featureReducer)
EffectsModule.forFeature([FeatureEffects])
```

## Using ng2-charts

Import `NgChartsModule` in your module:
```typescript
import { NgChartsModule } from 'ng2-charts';

@NgModule({
  imports: [NgChartsModule]
})
```

## Bootstrap Integration

Bootstrap 4 CSS and JS are globally available via angular.json. Use Bootstrap classes directly in templates.

## Windows File Paths in WSL

When the user shares a Windows file path (e.g., `c:/Users/Saiful/Desktop/image.png`), convert it to the WSL mount point path before accessing:

- **Windows path**: `c:/Users/Saiful/Desktop/image.png`
- **WSL path**: `/mnt/c/Users/Saiful/Desktop/image.png`

**Conversion rule**: Replace the drive letter prefix (e.g., `c:/` or `C:\`) with `/mnt/c/` (lowercase drive letter).

## CLI Shortcut
- Typing `>gcm` tells Claude to look at the staged changes, craft an appropriate commit message, and run `git commit -m "<message>"`; if nothing is staged, call it out instead of committing.
