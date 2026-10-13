# Lotto Number Checker

A modern Angular 22 application for checking lottery numbers against winning combinations. Built with the latest Angular features including signals, zoneless change detection, and the new control flow syntax.

## ⚠️ Disclaimer

This is a learning project that demonstrates modern Angular features. It:

- Is not affiliated with or endorsed by PCSO
- Fetches live results from the PCSO website only in local development, behind the `liveResults` flag (see [Live results flag](#live-results-flag)); the deployed build never contacts PCSO
- May stop parsing live results whenever the PCSO website changes or refuses the request

**Please use official PCSO channels for actual lottery number verification and results.**

## Live results flag

The number checker works with no network access: enter the winning numbers by hand, then check your rows against them. Fetching live results from PCSO is a local-development feature, controlled by a build-time flag:

| Command | Build configuration | `liveResults` | "Use Search Results" toggle |
|---|---|---|---|
| `ng serve` | development | `true` | shown |
| `ng build` | production | `false` | hidden |
| `ng test` | production (set explicitly in `angular.json`) | `false` | tests override it to cover both values |

- The flag is defined in `src/environments/environment.ts` (production) and `src/environments/environment.development.ts` (development). `fileReplacements` in `angular.json` swaps in the development file for `ng serve`.
- Components read it through the `FEATURE_FLAGS` injection token in `src/app/feature-flags.ts`, so tests can provide either value.
- Live results need `proxy.conf.json`, which only the dev server applies. A production build has no proxy, which is why the flag is off there.
- With the flag off, the search UI is never rendered and `LottoService` is never created, so the deployed app makes no requests to PCSO.
- With the flag on, a failed fetch (for example PCSO answering 403) shows an error with a "Try Again" button; manual entry keeps working.
- To try the production behaviour locally, run `ng serve --configuration production`.

As of October 2026 the PCSO website refuses requests from the dev-server proxy with `403 Access Denied`, so with the flag on you will most likely see the error state.

## Features

### Core Functionality
- **Live Lottery Results (local development only)**: Fetches actual winning numbers from the PCSO (Philippine Charity Sweepstakes Office) website when the `liveResults` flag is on
- **Multiple Game Support**: Supports various Philippine lottery games including:
  - Ultra Lotto 6/58
  - Grand Lotto 6/55
  - Superlotto 6/49
  - Megalotto 6/45
  - Lotto 6/42
- **Enhanced Number Management**: 
  - Add, edit, and organize multiple rows of numbers
  - Visual feedback for matching numbers
  - Row-based editing and deletion
  - Automatic match counting per row
- **Search and Filter**: Search recent lottery results and use actual winning numbers
- **Smart Caching**: Caches lottery results for improved performance

### Technical Features
- **Modern Angular Features**:
  - Signals for reactive state management
  - New control flow syntax (`@if`, `@for`, `@switch`)
  - Input/Output functions for component communication
  - Standalone components architecture
  - OnPush change detection strategy
  - Zoneless change detection for improved performance
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Error Handling**: Comprehensive error handling with retry mechanisms
- **Loading States**: Visual feedback during data fetching
- **Proxy Configuration**: Handles CORS for live results during local development

## How to Use

### Setting Up Winning Numbers

1. **Manual Entry**: Enter 6 numbers manually in the "Winning Numbers" section (values between 1-59)
2. **Search Results** (local development only, `liveResults` flag on): Toggle "Use Search Results" to fetch actual lottery results:
   - Select a lottery game from the dropdown
   - Click "Search Results" to fetch recent draws
   - Click "Use Numbers" on any result to set them as winning numbers
3. Click "Set Winning Numbers" to save your selection

### Checking Your Numbers

1. In the "Check Your Numbers" section, enter numbers one by one
2. Numbers are automatically organized into rows of 6
3. **Visual Feedback**:
   - Matching numbers are highlighted in yellow
   - Rows with the highest number of matches are highlighted
   - Each row shows its match count
4. **Row Management**:
   - Edit individual numbers within a row
   - Delete entire rows
   - Track multiple number combinations

### Search Functionality (local development only)

- **Live Results**: Fetches recent lottery results from the official PCSO website through the dev-server proxy
- **Game Selection**: Filter results by specific lottery games
- **Quick Setup**: Use actual winning numbers from past draws
- **Cache Management**: Results are cached for 5 minutes to improve performance

## Architecture

### Components
- **WinningNumberComponent**: Main container component with signal-based state management
- **WinningInputComponent**: Handles manual number entry with validation
- **SearchResultsComponent**: Manages lottery result searching and display
- **NumberDisplayComponent**: Displays and manages user number rows
- **GameSelectionComponent**: Provides game selection dropdown

### Services
- **LottoService**: Handles API integration with PCSO website, caching, and error management
  - Signal-based state management for cached results, loading states, and errors
  - Automatic caching with 5-minute expiration
  - Comprehensive error handling with retry mechanisms

### Models
- **LottoResult**: Interface for lottery result data
- **GameSelectionOption**: Configuration for supported games

### Configuration
- **Feature Flags**: `FEATURE_FLAGS` (`src/app/feature-flags.ts`) reads the build-time values in `src/environments/`
- **Proxy Configuration**: `proxy.conf.json` handles CORS when `ng serve` fetches from PCSO
- **Angular Configuration**: Angular 22 setup with zoneless change detection

## Development

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 20.1.4 and has since been updated to 22.

### Prerequisites

- Node.js in Angular 22's supported range (`^22.22.3`, `^24.15.0` or `>=26`); `.nvmrc` pins the version this project uses
- Angular CLI 22 (installed locally; use `npx ng` or the npm scripts)

### Installation

```bash
npm install
```

### Development server

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The application will automatically reload if you change any of the source files.

### Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory.

### Running unit tests

To execute unit tests with [Vitest](https://vitest.dev/), use the following command:

```bash
ng test
```

## Code scaffolding

Angular CLI includes powerful code scaffolding tools. To generate a new component, run:

```bash
ng generate component component-name
```

For a complete list of available schematics (such as `components`, `directives`, or `pipes`), run:

```bash
ng generate --help
```

## Supported Games

The application supports the following Philippine lottery games:
- Ultra Lotto 6/58 (6 numbers from 1-58)
- Grand Lotto 6/55 (6 numbers from 1-55)
- Superlotto 6/49 (6 numbers from 1-49)
- Megalotto 6/45 (6 numbers from 1-45)
- Lotto 6/42 (6 numbers from 1-42)

## Technical Stack

- **Framework**: Angular 22.2
- **Language**: TypeScript 6.0
- **Testing**: Vitest 5
- **Styling**: SCSS
- **State Management**: Angular Signals
- **HTTP Client**: Angular HttpClient with fetch support
- **Change Detection**: Zoneless change detection

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.

## License

This project is licensed under the GNU General Public License v3.0 - see the [LICENSE](LICENSE) file for details.
