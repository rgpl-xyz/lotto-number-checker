# Lotto Number Matcher

A simple Angular 19 application that allows users to:
1. Enter a winning set of 6 numbers
2. Input subsequent numbers to check for matches
3. Get visual feedback on matching numbers

## Features

- Uses Angular 19's modern features:
  - Signals for reactive state management
  - Input/Output for component communication
  - New control flow syntax (instead of *ngIf and *ngFor)
  - Standalone components

## Development

This project was generated with [Angular CLI](https://github.com/angular/angular-cli).

### Development server

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The application will automatically reload if you change any of the source files.

### Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory.

## How to Use

1. Enter 6 numbers in the "Winning Numbers" section (values between 1-59)
2. Click "Set Winning Numbers" to save them
3. In the "Check Your Numbers" section, input numbers to see if they match the winning set
4. Matching numbers will be highlighted in yellow
5. A counter will show how many matching numbers you have

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

## Running end-to-end tests

For end-to-end (e2e) testing, run:

```bash
ng e2e
```

Angular CLI does not come with an end-to-end testing framework by default. You can choose one that suits your needs.

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.
