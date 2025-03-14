# Wikipedia Historical Events API

This is a NestJS application that provides an API to fetch historical events from Wikipedia for any given date. It supports multiple languages and different types of historical events (births, deaths, events, holidays).

## Prerequisites

- Node.js (v16 or later)
- npm (v8 or later)
- Git

## Installation

1. Clone the repository:
```bash
git clone <your-repository-url>
cd project
```

2. Install dependencies:
```bash
npm install
```

## Configuration

You can set up your environment configuration in two ways:

### Option 1: Using the Setup Script

Run the provided setup script:
```bash
# Make the script executable
chmod +x scripts/setup-env.sh

# Run the script
./scripts/setup-env.sh
```

The script will:
- Check if `.env` already exists and ask before overwriting
- Create a new `.env` file from `.env.example`
- Display the current environment variables
- Make the file executable

### Option 2: Manual Setup

1. Create a `.env` file in the root directory:
```bash
cp .env.example .env
```

2. Configure the environment variables in `.env`:
```bash
# Application
PORT=3000                                                  # Application port
WIKIPEDIA_API_URL=https://api.wikimedia.org/feed/v1/wikipedia  # Wikipedia API base URL
THROTTLE_TTL=60000                                        # Rate limiting window (ms)
THROTTLE_LIMIT=10                                         # Requests per window
CACHE_TTL=300000                                         # Cache duration (ms)
```

3. Update the User-Agent in `src/feed/feed.service.ts` with your information:
```typescript
'User-Agent': 'WikiApp/1.0 (https://github.com/yourusername/wikiapp; your@email.com)'
```

## Running the Application

### Development Mode

For development with hot-reload:
```bash
npm run start:dev
```

### Debug Mode

For debugging with inspector:
```bash
npm run start:debug
```

### Production Mode

For production:
```bash
# Build the application
npm run build

# Start the production server
npm run start:prod
```

The application will be available at `http://localhost:3000`

## API Documentation

Once the application is running, you can access the Swagger documentation at:
```
http://localhost:3000/api
```

### Available Endpoints

#### GET /v1/feed

Fetch historical events from Wikipedia.

Query Parameters:
- `type` (optional): Type of events to fetch
  - Values: 'all', 'selected', 'births', 'deaths', 'events', 'holidays'
  - Default: 'all'
- `month` (optional): Month in MM format (e.g., '03')
  - Default: current month
- `day` (optional): Day in DD format (e.g., '15')
  - Default: current day
- `language` (optional): Language code
  - Supported: 'en', 'es', 'fr', 'de', 'it', 'pt', 'ru', 'zh', 'ja', 'ar', 'uk'
  - Default: 'en'

Example Requests:
```bash
# Get all events for today
curl http://localhost:3000/v1/feed

# Get births on March 15 in Ukrainian
curl http://localhost:3000/v1/feed?type=births&month=03&day=15&language=uk

# Get historical events for today in Spanish
curl http://localhost:3000/v1/feed?type=events&language=es
```

## Development

### Project Structure
```
src/
├── feed/
│   ├── dto/
│   │   └── wikipedia-query.dto.ts
│   ├── feed.controller.ts
│   ├── feed.module.ts
│   └── feed.service.ts
├── app.module.ts
└── main.ts
```

### Available Scripts

- `npm run build` - Build the application
- `npm run format` - Format code using Prettier
- `npm run start` - Start the application
- `npm run start:dev` - Start in development mode with hot reload
- `npm run start:debug` - Start in debug mode
- `npm run start:prod` - Start in production mode
- `npm run lint` - Lint the code
- `npm run test` - Run tests
- `npm run test:watch` - Run tests in watch mode
- `npm run test:cov` - Run tests with coverage
- `npm run test:debug` - Run tests in debug mode
- `npm run test:e2e` - Run end-to-end tests

## Error Handling

The API includes proper error handling for:
- Invalid language codes
- Invalid date formats
- Wikipedia API errors
- Network issues

## Rate Limiting

The application includes rate limiting to prevent abuse:
- 10 requests per minute per IP address

## Caching

Response caching is available but currently disabled. To enable it, uncomment the `@UseInterceptors(CacheInterceptor)` line in `feed.controller.ts`.
