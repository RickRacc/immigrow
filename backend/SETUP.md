# Immigrow Backend Setup Guide - Phase 2

This guide will help you set up the Phase 2 backend with real API integration and database.

## Overview
## Prerequisites

- Python 3.8+
- pip
- PostgreSQL or MySQL (optional - SQLite works for development)

## Quick Start

### 1. Install Dependencies

```bash
cd backend
pip install -r requirements.txt
```

### 2. Configure Environment Variables

Copy the example environment file:

```bash
cp .env.example .env
```

Edit `.env` and add your API keys:

```bash
# REQUIRED for full functionality
EVENTBRITE_API_TOKEN=your_token_here

# OPTIONAL (increases rate limits)
COURTLISTENER_API_TOKEN=your_token_here
```

### 3. Set Up Database

**RECOMMENDED: Use PostgreSQL**

PostgreSQL is the recommended database for Phase 2. For detailed setup instructions:

**See [POSTGRESQL_SETUP.md](POSTGRESQL_SETUP.md) for complete PostgreSQL installation guide**

Quick setup:
```bash
# Install PostgreSQL (see POSTGRESQL_SETUP.md)
# Then create database:
createdb -U postgres immigrow

# Configure in .env (already set in .env.example):
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_USER=postgres
POSTGRES_PASSWORD=your_password
POSTGRES_DATABASE=immigrow
```

**Alternative A: Use SQLite (quick testing only)**
```bash
# No configuration needed - just delete POSTGRES_* variables from .env
# SQLite is NOT recommended for production
python app.py
```

**Alternative B: Use MySQL**
```bash
# Install MySQL, then create database
mysql -u root -p -e "CREATE DATABASE immigrow;"

# Add to .env:
MYSQL_HOST=localhost
MYSQL_USER=root
MYSQL_PASSWORD=your_password
MYSQL_DATABASE=immigrow
```

### 4. Seed the Database

```bash
# Using Flask CLI
flask seed-db

# Or run the seeding script directly
python seed_database.py
```

This will:
1. Create all database tables
2. Fetch organizations from ProPublica Nonprofit Explorer API
3. Fetch legal resources from CourtListener API
4. Fetch events from Eventbrite API (if token is set)
5. Create relationships between models

### 5. Run the Server

```bash
python app.py
```

The API will be available at `http://localhost:5000`

## API Endpoints

### Events
- `GET /events` - Get all events (with optional filters)
- `GET /events/<id>` - Get single event with relationships
- Query parameters: `location`, `date`, `sort_by`, `limit`, `include_relationships`

### Organizations
- `GET /orgs` - Get all organizations (with optional filters)
- `GET /orgs/<id>` - Get single organization with relationships
- Query parameters: `location`, `topic`, `sort_by`, `limit`, `include_relationships`

### Resources
- `GET /resources` - Get all legal resources (with optional filters)
- `GET /resources/<id>` - Get single resource with relationships
- Query parameters: `topic`, `scope`, `sort_by`, `limit`, `include_relationships`

### Utility
- `GET /search?q=query` - Search across all models
- `GET /stats` - Get database statistics

## Example API Calls

```bash
# Get all events
curl http://localhost:5000/events

# Get events in Texas
curl http://localhost:5000/events?location=Texas

# Get single event with relationships
curl http://localhost:5000/events/1?include_relationships=true

# Get federal legal resources
curl http://localhost:5000/resources?scope=Federal

# Search for "citizenship"
curl http://localhost:5000/search?q=citizenship

# Get database stats
curl http://localhost:5000/stats
```

## Database Models

### Event Model
**Required Attributes (5):**
1. `title` - Event name
2. `date` - Event date
3. `start_time` - Start time
4. `duration_minutes` - Length of event
5. `location` - City, State

**Relationships:**
- Belongs to one Organization
- Has many Resources (many-to-many)

### Organization Model
**Required Attributes (5):**
1. `name` - Organization name
2. `city` - City location
3. `state` - State location
4. `topic` - Primary focus (from NTEE code)
5. `size` - Organization classification

**Relationships:**
- Has many Events
- Has many Resources (many-to-many)

### Resource Model
**Required Attributes (5):**
1. `title` - Resource title
2. `date_published` - Publication date
3. `topic` - Subject area
4. `scope` - Federal/State/Local
5. `description` - Resource description

**Relationships:**
- Has many Organizations (many-to-many)
- Has many Events (many-to-many)

## API Data Sources

### 1. Eventbrite API
- **Purpose:** Fetch immigration-related community events
- **Endpoint:** `https://www.eventbriteapi.com/v3/events/search/`
- **Authentication:** OAuth token required
- **Get Token:** https://www.eventbrite.com/platform/api
- **Search Keywords:** immigration, citizenship workshop, DACA, asylum, etc.

### 2. ProPublica Nonprofit Explorer API
- **Purpose:** Fetch nonprofit organizations (immigration-focused)
- **Endpoint:** `https://projects.propublica.org/nonprofits/api/v2/organizations/{ein}.json`
- **Authentication:** None required
- **Documentation:** https://projects.propublica.org/nonprofits/api
- **Organizations:** Fetches by EIN (Employer Identification Number)

### 3. CourtListener API
- **Purpose:** Fetch immigration-related legal cases and resources
- **Endpoint:** `https://www.courtlistener.com/api/rest/v3/search/`
- **Authentication:** Optional (for higher rate limits)
- **Documentation:** https://www.courtlistener.com/help/api/rest/
- **Search Keywords:** immigration deportation, asylum refugee, DACA, etc.

## Testing APIs Without Database

To test API integrations independently:

```bash
python api_integrations.py
```

This will fetch sample data from each API without requiring database setup.

## Flask CLI Commands

```bash
# Initialize database (create tables)
flask init-db

# Seed database with API data
flask seed-db

# Reset database (drop and recreate)
flask reset-db
```

## Troubleshooting

### Issue: "Eventbrite API token is required"
**Solution:** The Eventbrite API requires authentication. Either:
1. Get an API token at https://www.eventbrite.com/platform/api
2. Add it to `.env` as `EVENTBRITE_API_TOKEN=your_token`
3. Or: The seeding script will create sample events if no token is provided

### Issue: Database connection error
**Solution:**
- Check your database credentials in `.env`
- Ensure database server is running
- Verify database exists: `createdb immigrow` (PostgreSQL) or `CREATE DATABASE immigrow;` (MySQL)
- For development, remove database env vars to use SQLite

### Issue: No data returned from API
**Solution:**
- ProPublica and CourtListener work without API keys
- Check your internet connection
- API rate limits may apply - the scripts include delays between requests
- Check console output for specific error messages

### Issue: Import errors
**Solution:**
```bash
pip install -r requirements.txt
```

## Production Deployment

For production (AWS, Heroku, etc.):

1. **Set DATABASE_URL environment variable:**
   ```bash
   DATABASE_URL=postgresql://user:pass@host:port/dbname
   ```

2. **Set API keys as environment variables**

3. **Run database migrations:**
   ```bash
   flask init-db
   flask seed-db
   ```

4. **Use production server:**
   ```bash
   gunicorn app:app
   ```

## Next Steps for Frontend Integration

1. Update frontend API calls to use backend endpoints instead of JSON files
2. Add loading states and error handling
3. Use the `include_relationships=true` parameter to get nested data
4. Example React fetch:
   ```javascript
   fetch('http://localhost:5000/events?include_relationships=true')
     .then(res => res.json())
     .then(data => setEvents(data))
   ```
y
