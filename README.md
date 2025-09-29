# warpper-ts

A TypeScript wrapper utility package that provides error-safe function execution. Instead of throwing exceptions, it returns a tuple with either an error or result, similar to Go's error handling pattern.

## Installation

```bash
npm install @akikungz/warpper-ts
```

## Usage

### Basic Import

```typescript
import { warpper } from '@akikungz/warpper-ts';
```

### Simple Functions

```typescript
// Synchronous function
const [error, result] = await warpper(() => 42);
if (error) {
  console.error('Error:', error.message);
} else {
  console.log('Result:', result); // 42
}
```

### Async Functions

```typescript
// Asynchronous function
const [error, data] = await warpper(async () => {
  const response = await fetch('https://api.example.com/data');
  return response.json();
});

if (error) {
  console.error('API call failed:', error.message);
} else {
  console.log('Data received:', data);
}
```

### Functions with Parameters

```typescript
// Function with parameters
const divide = (a: number, b: number) => {
  if (b === 0) throw new Error('Division by zero');
  return a / b;
};

const [error, result] = await warpper(divide, 10, 2);
if (error) {
  console.error('Division failed:', error.message);
} else {
  console.log('Result:', result); // 5
}
```

### Error Handling

```typescript
// Function that throws an error
const riskyFunction = () => {
  throw new Error('Something went wrong!');
};

const [error, result] = await warpper(riskyFunction);
console.log(error?.message); // "Something went wrong!"
console.log(result); // null
```

### Real-world Example

```typescript
import { warpper } from '@akikungz/warpper-ts';
import fs from 'fs/promises';

async function readConfigFile(filename: string) {
  const [readError, content] = await warpper(fs.readFile, filename, 'utf8');
  if (readError) {
    return [readError, null];
  }

  const [parseError, config] = await warpper(JSON.parse, content);
  if (parseError) {
    return [new Error(`Invalid JSON in ${filename}: ${parseError.message}`), null];
  }

  return [null, config];
}

// Usage
const [error, config] = await readConfigFile('config.json');
if (error) {
  console.error('Failed to load config:', error.message);
  process.exit(1);
} else {
  console.log('Config loaded successfully:', config);
}
```

### TypeScript Support

The package includes full TypeScript support with proper type inference:

```typescript
// Type inference works automatically
const [error, num] = await warpper(() => 42);
// num is inferred as number

const [error, str] = await warpper(async () => 'hello');
// str is inferred as string

// Custom error types
class CustomError extends Error {
  code: number;
  constructor(message: string, code: number) {
    super(message);
    this.code = code;
  }
}

const [error, result] = await warpper<CustomError>(() => {
  throw new CustomError('Custom error', 404);
});
// error is typed as CustomError | null
```

## API Reference

### `warpper<TError, TFunction, TResult>(callback, ...args)`

Executes a callback function and returns a promise that resolves with a tuple containing an error (if any) and the result.

#### Parameters

- `callback: TFunction` - The function to execute
- `...args: Parameters<TFunction>` - Arguments to pass to the callback function

#### Returns

`Promise<[TError | null, TResult]>` - A tuple where:
- First element: Error object if the function throws, `null` if successful
- Second element: Function result if successful, `null` if an error occurred

#### Type Parameters

- `TError extends Error = Error` - The expected error type
- `TFunction extends CallbackFunction = CallbackFunction` - The callback function type
- `TResult` - The return type (automatically inferred)

## GitHub Actions Setup

This repository includes automated CI/CD workflows using GitHub Actions for testing and publishing to npm.

### Workflows

1. **CI Workflow** (`.github/workflows/ci.yml`)
   - Runs on push/PR to main/master branches
   - Tests against Node.js versions 18.x, 20.x, and 22.x
   - Runs tests and builds the package

2. **Publish Workflow** (`.github/workflows/publish.yml`)
   - Triggers when a GitHub release is published
   - Runs tests, builds, and publishes to npm

3. **Version and Release Workflow** (`.github/workflows/version-and-release.yml`)
   - Auto-bumps version based on conventional commits
   - Creates GitHub releases automatically

### Setup Instructions

#### 1. NPM Token Setup

To enable automatic publishing to npm, you need to set up an NPM token:

1. Go to [npmjs.com](https://www.npmjs.com) and log in
2. Go to Access Tokens in your account settings
3. Create a new token with "Automation" type
4. In your GitHub repository, go to Settings → Secrets and variables → Actions
5. Create a new repository secret named `NPM_TOKEN` with your token value

#### 2. Repository Permissions

Make sure your repository has the following permissions:

1. Go to Settings → Actions → General
2. Set "Workflow permissions" to "Read and write permissions"
3. Check "Allow GitHub Actions to create and approve pull requests"

#### 3. Branch Protection (Optional but Recommended)

1. Go to Settings → Branches
2. Add a branch protection rule for `main` (or `master`)
3. Require status checks to pass before merging
4. Require branches to be up to date before merging

### How It Works

#### Automatic Testing
- Every push or pull request triggers the CI workflow
- Tests run on multiple Node.js versions
- Build verification ensures the package compiles correctly

#### Automatic Publishing
- Create a new release on GitHub (either manually or automatically)
- The publish workflow will automatically:
  - Run tests
  - Build the package
  - Publish to npm with the version from package.json

#### Automatic Versioning (Optional)
- The version-and-release workflow can automatically bump versions based on commit messages
- Use conventional commit messages:
  - `feat:` for minor version bumps
  - `fix:` for patch version bumps
  - `BREAKING CHANGE:` for major version bumps

### Manual Release Process

1. Update the version in `package.json`:
   ```bash
   npm version patch  # or minor, major
   ```

2. Push the changes:
   ```bash
   git push
   git push --tags
   ```

3. Create a release on GitHub:
   - Go to Releases → Create a new release
   - Choose the tag you just pushed
   - Add release notes
   - Publish the release

4. The publish workflow will automatically run and publish to npm

### Local Development

```bash
# Install dependencies
npm install

# Run tests
npm test

# Build the package
npm run build

# Test publishing (dry run)
npm publish --dry-run
```

## Package Information

- **Name**: `@akikungz/warpper-ts`
- **Registry**: npm (public)
- **Built with**: TypeScript
- **Tested with**: Jest

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests: `npm test`
5. Build the package: `npm run build`
6. Submit a pull request

The CI workflow will automatically test your changes across multiple Node.js versions.