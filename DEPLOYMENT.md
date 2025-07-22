# Deployment Guide

This guide covers deploying the Inventory Management App to various platforms.

## Environment Variables

Before deploying, ensure you have the following environment variables configured:

### Required Environment Variables

```bash
# Database Configuration
DATABASE_URL="postgresql://username:password@host:5432/database_name"

# NextAuth Configuration
NEXTAUTH_URL="https://your-domain.com"  # Your production URL
NEXTAUTH_SECRET="your-nextauth-secret-key-here-generate-a-secure-one"

# Google Gemini AI API
GOOGLE_GEMINI_API_KEY="your-google-gemini-api-key-here"

# Node Environment
NODE_ENV="production"

# Optional: Disable Next.js telemetry
NEXT_TELEMETRY_DISABLED=1
```

### Generating Secrets

Generate a secure NEXTAUTH_SECRET:
```bash
openssl rand -base64 32
```

Or use online generators for secure random strings.

## Docker Deployment

### Build and Run Locally

```bash
# Build the Docker image
docker build -t inventory-management-app .

# Run the container
docker run -p 3000:3000 \
  -e DATABASE_URL="your-database-url" \
  -e NEXTAUTH_SECRET="your-nextauth-secret" \
  -e NEXTAUTH_URL="http://localhost:3000" \
  -e GOOGLE_GEMINI_API_KEY="your-api-key" \
  inventory-management-app
```

### Docker Compose (Recommended for local development)

Create a `docker-compose.yml` file:

```yaml
version: '3.8'
services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=postgresql://postgres:password@db:5432/inventory
      - NEXTAUTH_SECRET=your-secret-here
      - NEXTAUTH_URL=http://localhost:3000
      - GOOGLE_GEMINI_API_KEY=your-api-key
    depends_on:
      - db

  db:
    image: postgres:15
    environment:
      - POSTGRES_DB=inventory
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=password
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

volumes:
  postgres_data:
```

## Railway Deployment

1. Install Railway CLI:
   ```bash
   npm install -g @railway/cli
   ```

2. Login and create project:
   ```bash
   railway login
   railway init
   ```

3. Add PostgreSQL database:
   ```bash
   railway add postgresql
   ```

4. Set environment variables:
   ```bash
   railway variables set NEXTAUTH_SECRET="your-secret"
   railway variables set GOOGLE_GEMINI_API_KEY="your-api-key"
   railway variables set NODE_ENV="production"
   ```

5. Deploy:
   ```bash
   railway up
   ```

The `railway.toml` file is already configured for you.

## Render Deployment

1. Connect your GitHub repository to Render
2. Use the provided `render.yaml` file
3. Set the `GOOGLE_GEMINI_API_KEY` manually in the Render dashboard
4. The database will be automatically provisioned

## Vercel Deployment

1. Install Vercel CLI:
   ```bash
   npm install -g vercel
   ```

2. Deploy:
   ```bash
   vercel
   ```

3. Set environment variables in Vercel dashboard:
   - `DATABASE_URL`
   - `NEXTAUTH_SECRET`
   - `GOOGLE_GEMINI_API_KEY`

## Pre-deployment Checklist

- [ ] Database is set up and accessible
- [ ] All environment variables are configured
- [ ] NEXTAUTH_URL matches your production domain
- [ ] Google Gemini API key is valid and has sufficient quota
- [ ] Database migrations are run (`npx prisma db push`)
- [ ] Build process completes successfully (`npm run build`)

## Build Process

The deployment process will:
1. Install dependencies (`npm ci`)
2. Generate Prisma client (`npx prisma generate`)
3. Build the Next.js application (`npm run build`)
4. Start the production server (`npm start`)

## Database Setup

Make sure to run Prisma migrations on your production database:

```bash
# For new database
npx prisma db push

# For existing database with migrations
npx prisma migrate deploy
```

## Troubleshooting

### Common Issues

1. **Build fails with Prisma errors**: Make sure `DATABASE_URL` is set during build time
2. **NextAuth errors**: Ensure `NEXTAUTH_SECRET` and `NEXTAUTH_URL` are properly set
3. **AI features not working**: Verify `GOOGLE_GEMINI_API_KEY` is correct and has quota

### Health Check

The application includes health check endpoints:
- `/api/health` - Basic health check
- `/` - Main page health check

These are used by deployment platforms to verify the application is running correctly. 