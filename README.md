# Lotto Number Checker

An advanced Angular 19 application for checking lottery numbers against winning combinations. The application features live lottery results integration, multiple game support, and enhanced number management capabilities.

## ⚠️ Disclaimer

**This application is intended for development and local environment purposes only.** It is designed as a learning project to demonstrate Angular 19 features and web scraping techniques. This application:

- Fetches data from external sources (PCSO website) for educational purposes
- Should not be used in production environments
- Is not affiliated with or endorsed by PCSO
- May be subject to changes in external API/website structures
- Users should verify all lottery results through official PCSO channels

**Please use official PCSO channels for actual lottery number verification and results.**

## Features

### Core Functionality
- **Live Lottery Results Integration**: Fetches actual winning numbers from PCSO (Philippine Charity Sweepstakes Office) website
- **Multiple Game Support**: Supports various lottery games including:
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
- **Angular 19 Modern Features**:
  - Signals for reactive state management
  - New control flow syntax (`@if`, `@for`, `@switch`)
  - Input/Output functions for component communication
  - Standalone components architecture
  - OnPush change detection strategy
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Error Handling**: Comprehensive error handling with retry mechanisms
- **Loading States**: Visual feedback during data fetching

## How to Use

### Setting Up Winning Numbers

1. **Manual Entry**: Enter 6 numbers manually in the "Winning Numbers" section (values between 1-59)
2. **Search Results**: Toggle "Use Search Results" to fetch actual lottery results:
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

### Search Functionality

- **Live Results**: Fetches recent lottery results from official PCSO website
- **Game Selection**: Filter results by specific lottery games
- **Quick Setup**: Use actual winning numbers from past draws
- **Cache Management**: Results are cached for 5 minutes to improve performance

## Architecture

### Components
- **WinningNumberComponent**: Main container component
- **WinningInputComponent**: Handles manual number entry with validation
- **SearchResultsComponent**: Manages lottery result searching and display
- **NumberDisplayComponent**: Displays and manages user number rows
- **GameSelectionComponent**: Provides game selection dropdown

### Services
- **LottoService**: Handles API integration with PCSO website, caching, and error management

### Models
- **LottoResult**: Interface for lottery result data
- **GameSelectionOption**: Configuration for supported games

## Running end-to-end tests

For end-to-end (e2e) testing, run:

```bash
ng e2e
```

Angular CLI does not come with an end-to-end testing framework by default. You can choose one that suits your needs.

## Configuration

### Proxy Configuration
The application uses a proxy configuration (`proxy.conf.json`) to handle CORS issues when fetching lottery results from external APIs during development.

### Supported Games
The application supports the following Philippine lottery games:
- Ultra Lotto 6/58 (6 numbers from 1-58)
- Grand Lotto 6/55 (6 numbers from 1-55)
- Superlotto 6/49 (6 numbers from 1-49)
- Megalotto 6/45 (6 numbers from 1-45)
- Lotto 6/42 (6 numbers from 1-42)

## Development

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 19.2.12.

### Development server

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The application will automatically reload if you change any of the source files.

### Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory.

## Code scaffolding

Angular CLI includes powerful code scaffolding tools. To generate a new component, run:

```bash
ng generate component component-name
```

For a complete list of available schematics (such as `components`, `directives`, or `pipes`), run:

```bash
ng generate --help
```

## Running unit tests

To execute unit tests with the [Karma](https://karma-runner.github.io) test runner, use the following command:

```bash
ng test
```

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
