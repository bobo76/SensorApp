# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a **Room Sensors App** - an Angular frontend application for displaying historical sensor data (temperature and humidity) from Arduino units in interactive charts.

## Key Commands

### Development
- `npm start` - Start development server (default: http://localhost:4200)
- `npm run watch` - Build in watch mode with development configuration
- `npm run build` - Production build (outputs to `dist/room-sensors-app`)
- `npm test` - Run unit tests with Karma/Jasmine

### Running Single Test
To run a single test file with Karma:
```bash
npm test -- --include='**/specific-file.spec.ts'
```

## Architecture

### Tech Stack
- **Angular 19** (standalone components)
- **Angular Material** (cyan-orange theme)
- **Chart.js** with ng2-charts for data visualization
- **RxJS** for reactive state management
- **SCSS** for styling

### Project Structure
```
src/app/
├── services/        # Services for API communication
│   └── arduino.service.ts
├── data-chart/      # Main charting component and service
│   ├── data-chart.component.ts
│   └── data-chart.service.ts
├── model.ts         # TypeScript type definitions
├── app.config.ts    # Application configuration (providers)
└── app.routes.ts    # Routing configuration
```

### Backend API Integration

The app communicates with a backend API at `http://localhost:8080` (configured in `src/environments/environment.ts`):

- **GET /arduino/** - Fetch list of Arduino units
- **GET /data/historicalData** - Fetch historical sensor data
  - Query params: `machineName`, `startDate`, `endDate`

### Data Models

**SensorData**: Temperature and humidity readings
- `machineName: string`
- `creationDate: string`
- `temperature: number`
- `humidity: number`

**ArduinoUnit**: Arduino device metadata
- `id: number`
- `hostName: string`
- `creationDate: string`

### Component Architecture

- Uses **standalone components** (no NgModules)
- Services use `inject()` function for dependency injection
- RxJS `takeUntil` pattern for subscription cleanup with `destroy$` Subject
- Chart.js instances are properly destroyed in `ngOnDestroy()`

### TypeScript Configuration

The project uses **strict mode** TypeScript with:
- `strict: true`
- `noImplicitReturns: true`
- `noFallthroughCasesInSwitch: true`
- `strictTemplates: true` for Angular templates

## Important Notes

- Angular CLI is configured with SCSS as the default style preprocessor
- The application uses the new Angular application builder (`@angular-devkit/build-angular:application`)
- HttpClient is provided globally via `provideHttpClient()` in app.config.ts
- Environment files are in `src/environments/` for dev/prod configurations
