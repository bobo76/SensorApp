# Room Sensors App

A modern Angular frontend application for visualizing historical temperature and humidity sensor data from Arduino IoT devices through interactive charts.

## Features

- **Interactive Data Visualization**: Display temperature and humidity readings using Chart.js
- **Date Range Selection**: Filter sensor data by custom date ranges
- **Multi-Device Support**: View data from multiple Arduino sensor units
- **Real-time Updates**: Reactive data handling with RxJS
- **Responsive Design**: Material Design UI with cyan-orange theme
- **Historical Data Analysis**: Track sensor trends over time

## Prerequisites

Before running this application, ensure you have:

- **Node.js** (v18 or later recommended)
- **npm** (comes with Node.js)
- **Backend API** running on `http://localhost:8080` (see API Integration section)

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/bobo76/SensorApp
   cd SensorApp
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

## Running the Application

### Development Server

Start the development server:
```bash
npm start
```

Navigate to `http://localhost:4200/` in your browser. The application will automatically reload when source files change.

### Production Build

Build the project for production:
```bash
npm run build
```

Build artifacts will be stored in the `dist/room-sensors-app/` directory.

### Watch Mode

Run build in watch mode:
```bash
npm run watch
```

## API Integration

This frontend application communicates with a backend API that must be running on `http://localhost:8080`. The API provides:

### Endpoints

- **GET /arduino/** - Retrieve list of Arduino sensor units
- **GET /data/historicalData** - Fetch historical sensor readings
  - Query parameters:
    - `machineName`: Name of the Arduino device
    - `startDate`: Start date for data range (ISO format)
    - `endDate`: End date for data range (ISO format)

### Data Models

**SensorData**:
```typescript
{
  machineName: string;
  creationDate: string;
  temperature: number;
  humidity: number;
}
```

**ArduinoUnit**:
```typescript
{
  id: number;
  hostName: string;
  creationDate: string;
}
```

### Configuration

API URL can be configured in `src/environments/environment.ts` and `src/environments/environment.development.ts`.

## Tech Stack

- **Angular 19** - Modern frontend framework with standalone components
- **Angular Material** - UI component library with custom theme
- **Chart.js** - Powerful charting library
- **ng2-charts** - Angular wrapper for Chart.js
- **RxJS** - Reactive programming library
- **TypeScript** - Strict mode enabled
- **SCSS** - Styling with preprocessor support

## Project Structure

```
src/
├── app/
│   ├── services/              # Business logic and API communication
│   │   └── arduino.service.ts
│   ├── data-chart/            # Chart component and service
│   │   ├── data-chart.component.ts
│   │   ├── data-chart.component.html
│   │   ├── data-chart.component.scss
│   │   └── data-chart.service.ts
│   ├── model.ts               # TypeScript interfaces and types
│   ├── app.config.ts          # Application configuration
│   └── app.routes.ts          # Routing configuration
├── environments/              # Environment-specific configs
└── styles.scss               # Global styles and theme
```

## Development

### Code Scaffolding

Generate new components:
```bash
ng generate component component-name
```

Generate services, directives, pipes, etc.:
```bash
ng generate service|directive|pipe service-name
```

### Running Tests

Execute unit tests with Karma:
```bash
npm test
```

Run specific test file:
```bash
npm test -- --include='**/specific-file.spec.ts'
```

### Coding Standards

- **Standalone Components**: All components use Angular's standalone API
- **Dependency Injection**: Uses `inject()` function pattern
- **Subscription Management**: RxJS `takeUntil` pattern with `destroy$` Subject
- **TypeScript Strict Mode**: Enabled for type safety
- **Clean Up**: Proper resource disposal in `ngOnDestroy()`

## Key Commands

| Command | Description |
|---------|-------------|
| `npm start` | Start development server |
| `npm run build` | Production build |
| `npm run watch` | Build in watch mode |
| `npm test` | Run unit tests |

## Contributing

1. Follow Angular style guide and project conventions
2. Ensure all tests pass before committing
3. Write descriptive commit messages
4. Keep components focused and single-purpose

## License

[Specify your license here]