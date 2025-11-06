# Immigrow Backend - Phase 2

Real API integration with PostgreSQL/MySQL/SQLite database for immigration resources platform.

## Quick Start

**New to this? Start here: [QUICKSTART.md](QUICKSTART.md)** - 5-minute setup guide

```bash
# 1. Install dependencies
pip install -r requirements.txt

# 2. Create PostgreSQL database (see POSTGRESQL_SETUP.md for installation)
createdb -U postgres immigrow

# 3. Configure .env (copy .env.example and set your password)
cp .env.example .env

# 4. Test your setup
python test_setup.py

# 5. Seed database with real data
python seed_database.py

# 6. Run server
python app.py
```

Server runs at `http://localhost:5000`

**Database:** PostgreSQL recommended (see [POSTGRESQL_SETUP.md](POSTGRESQL_SETUP.md))



## Data Models

### Events (from Eventbrite API)
Immigration-related community events

**Required Attributes:**
- `title` - Event name
- `date` - Event date
- `start_time` - Start time
- `duration_minutes` - Length of event
- `location` - City, State

**Relationships:** Belongs to Organization, Has many Resources

### Organizations (from ProPublica Nonprofit Explorer API)
Nonprofit organizations supporting immigrants

**Required Attributes:**
- `name` - Organization name
- `city` - City location
- `state` - State location
- `topic` - Primary focus area
- `size` - Organization classification

**Relationships:** Has many Events, Has many Resources

### Resources (from CourtListener API)
Legal resources and court cases

**Required Attributes:**
- `title` - Resource title
- `date_published` - Publication date
- `topic` - Subject area
- `scope` - Federal/State/Local
- `description` - Resource description

**Relationships:** Has many Organizations, Has many Events

## API Endpoints

```
GET  /                    - API info
GET  /events              - List all events
GET  /events/<id>         - Get single event
GET  /orgs                - List all organizations
GET  /orgs/<id>           - Get single organization
GET  /resources           - List all resources
GET  /resources/<id>      - Get single resource
GET  /search?q=query      - Search all models
GET  /stats               - Database statistics
```

### Query Parameters

All list endpoints support:
- `limit` - Limit results (default: 100)
- `sort_by` - Sort field
- `include_relationships` - Include nested data (true/false)

Plus model-specific filters:
- Events: `location`, `date`
- Organizations: `location`, `topic`
- Resources: `topic`, `scope`

### Example Requests

```bash
# Get all events in Texas
curl http://localhost:5000/events?location=Texas

# Get organization with relationships
curl http://localhost:5000/orgs/1?include_relationships=true

# Get federal legal resources
curl http://localhost:5000/resources?scope=Federal

# Search for "citizenship"
curl http://localhost:5000/search?q=citizenship

# Get stats
curl http://localhost:5000/stats
```

## Configuration

### Environment Variables

Copy `.env.example` to `.env`:

```bash
# Eventbrite API (required for real events)
EVENTBRITE_API_TOKEN=your_token_here

# CourtListener API (optional - increases rate limits)
COURTLISTENER_API_TOKEN=your_token_here

# Database (PostgreSQL)
POSTGRES_HOST=localhost
POSTGRES_USER=postgres
POSTGRES_PASSWORD=password
POSTGRES_DATABASE=immigrow

# Or MySQL
MYSQL_HOST=localhost
MYSQL_USER=root
MYSQL_PASSWORD=password
MYSQL_DATABASE=immigrow

# Or use DATABASE_URL
DATABASE_URL=postgresql://user:pass@host:port/db
```

### Database Setup

**SQLite (Development):**
No configuration needed - works out of the box.

**PostgreSQL:**
```bash
createdb immigrow
# Set POSTGRES_* env vars in .env
```

**MySQL:**
```bash
mysql -u root -p -e "CREATE DATABASE immigrow;"
# Set MYSQL_* env vars in .env
```

## API Keys

### Eventbrite (Required for Events)
1. Go to https://www.eventbrite.com/platform/api
2. Create an app and get OAuth token
3. Add to `.env`: `EVENTBRITE_API_TOKEN=your_token`

**Note:** Sample events are created if no token is provided.

### CourtListener (Optional)
1. Go to https://www.courtlistener.com/help/api/
2. Sign up and get API token
3. Add to `.env`: `COURTLISTENER_API_TOKEN=your_token`

**Note:** Works without token but with rate limits.

### ProPublica (No Key Required)
The ProPublica Nonprofit Explorer API requires no authentication.

## Flask CLI Commands

```bash
# Initialize database (create tables)
flask init-db

# Seed database with API data
flask seed-db

# Reset database (drop and recreate)
flask reset-db
```

## Testing

```bash
# Run setup tests
python test_setup.py

# Test APIs independently (no database)
python api_integrations.py

# Test full seeding
python seed_database.py
```

## Project Structure

```
backend/
├── app.py                      # Main Flask application
├── models.py                   # SQLAlchemy models
├── api_integrations.py         # API client classes
├── seed_database.py            # Database seeding
├── test_setup.py               # Setup verification
├── requirements.txt            # Dependencies
├── .env.example                # Environment template
├── SETUP.md                    # Detailed setup guide
├── PHASE2_SUMMARY.md          # Implementation summary
└── README.md                   # This file
```

## Deployment

For production (AWS, Heroku, etc.):

1. Set environment variables (DATABASE_URL, API keys)
2. Install dependencies: `pip install -r requirements.txt`
3. Initialize database: `flask init-db`
4. Seed database: `flask seed-db`
5. Run with gunicorn: `gunicorn app:app`

## Troubleshooting

**"Eventbrite API token is required"**
- Add token to `.env` OR let it create sample events

**Database connection error**
- Check credentials in `.env`
- Ensure database exists
- Use SQLite by removing database env vars

**Import errors**
- Run: `pip install -r requirements.txt`

**No data returned**
- Check internet connection
- API rate limits may apply
- Check console for error messages

See [SETUP.md](SETUP.md) for detailed troubleshooting.

## Documentation

- **[SETUP.md](SETUP.md)** - Complete setup instructions
- **[PHASE2_SUMMARY.md](PHASE2_SUMMARY.md)** - Implementation details
- **[.env.example](.env.example)** - Configuration template

## Technology Stack

- **Flask** - Web framework
- **SQLAlchemy** - ORM
- **PostgreSQL/MySQL/SQLite** - Databases
- **Requests** - HTTP client
- **Eventbrite API** - Event data
- **ProPublica API** - Organization data
- **CourtListener API** - Legal resources

## Phase 2 Requirements ✅

- ✅ All models have 5+ required attributes
- ✅ Data from external APIs (not hardcoded)
- ✅ Database stores API data
- ✅ Relationships between models
- ✅ REST API endpoints with filtering
- ✅ Production database support (PostgreSQL/MySQL)
- ✅ 10-15+ instances per model
- ✅ Complete documentation

## Support

For issues or questions, refer to:
- [SETUP.md](SETUP.md) for installation help
- API docstrings in [api_integrations.py](api_integrations.py)
- Model documentation in [models.py](models.py)

## License

Part of Immigrow project - CS373 Software Engineering
