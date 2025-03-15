# Wikipedia Events API

A NestJS application that provides historical events from Wikipedia with translation support.

## Features

- Fetch historical events for specific dates
- Start from any date in the year
- Pagination support (20 items per page)
- Translation support for multiple languages
- Caching for improved performance
- Rate limiting for API protection

## API Documentation

### Get Historical Events

```
GET /v1/feed
```

Query Parameters:
- `page` (optional): Page number for pagination (default: 1)
- `date` (optional): Starting date in MM/DD format (default: current date)

Examples:
```bash
# Get events for today
curl http://localhost:3000/v1/feed

# Get events for Valentine's Day (February 14)
curl http://localhost:3000/v1/feed?date=02/14

# Get events for Christmas (December 25)
curl http://localhost:3000/v1/feed?date=12/25

# Get second page of events for Independence Day (July 4)
curl http://localhost:3000/v1/feed?date=07/04&page=2

# Get events for New Year's Day with translation to Spanish
curl http://localhost:3000/v1/feed/translate/es?date=01/01
```

Note: Date format must be MM/DD (e.g., 03/15 for March 15)

### Get Translated Events

```
GET /v1/feed/translate/:language
```

Parameters:
- `language`: Target language code (e.g., 'es', 'fr', 'de')
- `page` (optional): Page number for pagination (default: 1)
- `date` (optional): Starting date in MM/DD format (default: current date)

Example:
```bash
# Get Spanish translation of events starting from April 1st
curl http://localhost:3000/v1/feed/translate/es?date=04/01
```

Response Format:
```typescript
interface FeedContent {
  page: number;
  itemsPerPage: number;
  events: Array<DateSeparator | HistoricalEvent>;
}

interface DateSeparator {
  type: 'date_separator';
  date: string; // Format: MM/DD
}

interface HistoricalEvent {
  type: 'event';
  text: string;
  year: number;
  pages: WikipediaPage[];
}

interface WikipediaPage {
  title: string;
  extract: string;
  thumbnail?: {
    source: string;
    width: number;
    height: number;
  };
}
```

Example Response:
```json
{
  "page": 1,
  "itemsPerPage": 20,
  "events": [
    {
      "type": "date_separator",
      "date": "03/15"
    },
    {
      "type": "event",
      "text": "44 BC – Julius Caesar is assassinated by a group of Roman senators.",
      "year": -44,
      "pages": [
        {
          "title": "Julius Caesar",
          "extract": "Gaius Julius Caesar was a Roman general and statesman...",
          "thumbnail": {
            "source": "https://example.com/caesar.jpg",
            "width": 800,
            "height": 600
          }
        }
      ]
    }
  ]
}
```

## Supported Languages

The translation endpoint supports the following languages:
- English (en)
- Spanish (es)
- French (fr)
- German (de)
- Italian (it)
- Portuguese (pt)
- Russian (ru)
- Japanese (ja)
- Chinese (zh)

## API Endpoints

### Get Translated Events
```
GET /v1/feed/translate/:language
```

Parameters:
- `language`: Target language code (e.g., 'es', 'fr', 'de')
- `page` (optional): Page number for pagination (default: 1)

Supported Languages:
- en (English)
- es (Spanish)
- fr (French)
- de (German)
- it (Italian)
- pt (Portuguese)
- ru (Russian)
- zh (Chinese)
- ja (Japanese)
- ar (Arabic)
- uk (Ukrainian)

Example Requests:
```bash
# Get events in Spanish
curl https://your-app.railway.app/v1/feed/translate/es

# Get second page of events in French
curl https://your-app.railway.app/v1/feed/translate/fr?page=2
```

### Response Format
```typescript
interface FeedContent {
  page: number;          // Current page number
  itemsPerPage: number;  // Items per page (20)
  language?: string;     // Target language (for translations)
  events: Array<{
    // Date separator
    type: 'date_separator';
    date: string;        // Format: "MM/DD"
  } | {
    // Historical event
    type: 'event';
    text: string;        // Event description
    year: number;        // Year of the event
    pages?: Array<{      // Related Wikipedia pages
      title: string;     // Page title
      extract: string;   // Short description
      thumbnail?: {      // Optional thumbnail image
        source: string;  // Image URL
        width: number;   // Image width
        height: number;  // Image height
      };
    }>;
  }>;
}
```

Example Response:
```json
{
  "page": 1,
  "itemsPerPage": 20,
  "events": [
    {
      "type": "date_separator",
      "date": "03/15"
    },
    {
      "type": "event",
      "text": "44 BC - Julius Caesar is assassinated by Brutus, Cassius and several other Roman senators on the Ides of March",
      "year": -44,
      "pages": [
        {
          "title": "Assassination of Julius Caesar",
          "extract": "Julius Caesar, the Roman dictator, was assassinated by a group of senators on the Ides of March (15 March) of 44 BC during a meeting of the Senate at the Theatre of Pompey.",
          "thumbnail": {
            "source": "https://example.com/image.jpg",
            "width": 800,
            "height": 600
          }
        }
      ]
    }
  ]
}
```

- `GET /api` - Swagger API documentation

## Development

### Prerequisites

- Node.js 16 or higher
- npm or yarn
- Git

### Installation

```bash
# Clone the repository
git clone <your-repo-url>

# Install dependencies
npm install

# Create .env file
cp .env.example .env
```

### Environment Variables

```env
# API Configuration
PORT=3000

# Wikipedia API
WIKIPEDIA_API_URL=https://api.wikimedia.org/feed/v1/wikipedia

# Translation Service (optional)
LIBRETRANSLATE_API_URL=https://libretranslate.com/translate
LIBRETRANSLATE_API_KEY=your_api_key_here

# Rate Limiting
THROTTLE_TTL=60
THROTTLE_LIMIT=30

# Cache
CACHE_TTL=300
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

## Deployment to Railway

### Prerequisites

1. [Railway Account](https://railway.app/)
2. [Railway CLI](https://docs.railway.app/develop/cli)

### Deployment Steps

1. Install Railway CLI:
```bash
npm i -g @railway/cli
```

2. Login to Railway:
```bash
railway login
```

3. Initialize your project:
```bash
railway init
```

4. Link your repository:
```bash
railway link
```

5. Deploy your application:
```bash
railway up
```

### Configuration

The application uses the following configuration files for Railway deployment:

1. `railway.toml`:
```toml
[build]
builder = "NIXPACKS"
buildCommand = "npm run build"

[deploy]
startCommand = "npm run start:prod"
healthcheckPath = "/v1/feed"
healthcheckTimeout = 100
restartPolicyType = "ON_FAILURE"
numReplicas = 1

[service]
ports = [3000]
```

2. `Procfile`:
```
web: npm run start:prod
```

### Environment Variables in Railway

Set the following environment variables in your Railway project dashboard:

- `PORT` - Set automatically by Railway
- `WIKIPEDIA_API_URL` - Wikipedia API URL
- `LIBRETRANSLATE_API_URL` - Translation service URL (optional)
- `LIBRETRANSLATE_API_KEY` - Translation service API key (optional)
- `THROTTLE_TTL` - Rate limiting time window in seconds
- `THROTTLE_LIMIT` - Maximum requests per time window
- `CACHE_TTL` - Cache duration in seconds

### Monitoring

- View logs in Railway dashboard
- Monitor application health at `/v1/feed` endpoint
- Check API documentation at `/api` endpoint

### Troubleshooting

1. If deployment fails:
   - Check Railway build logs
   - Verify environment variables
   - Ensure all dependencies are listed in package.json

2. If application crashes:
   - Check application logs in Railway dashboard
   - Verify memory usage and CPU utilization
   - Check for rate limiting or API issues

3. If API returns errors:
   - Verify Wikipedia API accessibility
   - Check translation service configuration
   - Monitor rate limiting status

## API Documentation

Visit `/api` endpoint for full Swagger documentation.

## Error Handling

The API includes proper error handling for:
- Invalid language codes
- API rate limiting
- Network issues
- Service unavailability

## Rate Limiting

- 30 requests per minute per IP address
- Configurable via environment variables

## Caching

Response caching is enabled with a default TTL of 5 minutes (300 seconds).

## License

MIT
