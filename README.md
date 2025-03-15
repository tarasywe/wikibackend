# Wikipedia Events API

A NestJS application that provides historical events from Wikipedia with translation support.

## Features

- Fetch historical events for specific dates
- Translation support for multiple languages
- Pagination support (20 items per page)
- Automatic caching and rate limiting
- Swagger API documentation

## API Endpoints

- `GET /v1/feed` - Get historical events with pagination
- `GET /v1/feed/translate/:language` - Get translated historical events
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
