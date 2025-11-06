# Immigrow Backend - Quick Start Guide

Get up and running in 5 minutes! ⚡

## Prerequisites

- Python 3.8+
- PostgreSQL installed (recommended) - see [POSTGRESQL_SETUP.md](POSTGRESQL_SETUP.md)

## Step-by-Step Setup

### Step 1: Install Dependencies (1 min)

```bash
cd backend
pip install -r requirements.txt
```

Expected output:
```
Successfully installed Flask-3.1.2 SQLAlchemy-2.0.44 requests-2.31.0 psycopg2-binary-2.9.9 ...
```

---

### Step 2: Create PostgreSQL Database (1 min)

```bash
# Create the database
createdb -U postgres immigrow
```

If you get a password prompt, enter the password you set during PostgreSQL installation.

**Don't have PostgreSQL?** See [POSTGRESQL_SETUP.md](POSTGRESQL_SETUP.md) for installation.

**Want to skip this?** Delete the POSTGRES_* lines from `.env` to use SQLite instead (not recommended).

---

### Step 3: Configure Environment (1 min)

```bash
# Copy the example file
cp .env.example .env
```

Edit `.env` and set your PostgreSQL password:

```bash
# Change this line:
POSTGRES_PASSWORD=your_password_here

# To your actual password:
POSTGRES_PASSWORD=myactualpassword
```

**Optional:** Add API keys for more data (can skip for testing):
```bash
EVENTBRITE_API_TOKEN=your_token_here  # Get at: https://www.eventbrite.com/platform/api
```

---

### Step 4: Test Your Setup (30 sec)

```bash
python test_setup.py
```

Expected output:
```
PostgreSQL: localhost:5432/immigrow
All core dependencies imported successfully
All models imported successfully
Database tables created successfully
All tests passed!
```

If you see errors, check [POSTGRESQL_SETUP.md](POSTGRESQL_SETUP.md) for troubleshooting.

---

### Step 5: Seed Database with Real Data (1-2 min)

```bash
python seed_database.py
```

Expected output:
```
======================================================================
IMMIGROW DATABASE SEEDING
======================================================================

[1/6] Dropping and recreating database tables...
Database tables created

[2/6] Fetching and seeding organizations from ProPublica...
  + Added: American Immigration Council (Washington, DC)
  + Added: International Rescue Committee (New York, NY)
  ...
Seeded 10 organizations

[3/6] Fetching and seeding legal resources from CourtListener...
  + Added: United States v. Texas (Immigration Case)
  ...
Seeded 15 legal resources

[4/6] Fetching and seeding events from Eventbrite...
  + Added sample: Citizenship Workshop
  ...
Seeded 5 events

[5/6] Creating relationships between models...
Relationships created

[6/6] Database seeding complete!

DATABASE SUMMARY FOR NOW
======================================================================
Events:          5
Organizations:   10
Resources:       15

EEDING COMPLETE!
```

**Note:** Sample events are created if `EVENTBRITE_API_TOKEN` is not set. That's okay for testing!

---

### Step 6: Start the Server (10 sec)

```bash
python app.py
```

Expected output:
```
Using PostgreSQL: localhost:5432/immigrow

============================================================
IMMIGROW API SERVER
============================================================
Database: postgresql://postgres:***@localhost:5432/immigrow
Port: 5000
Debug: False

API Endpoints:
  GET  /events
  GET  /events/<id>
  GET  /orgs
  GET  /orgs/<id>
  GET  /resources
  GET  /resources/<id>
  GET  /search?q=<query>
  GET  /stats

To seed database: flask seed-db
============================================================

 * Running on http://0.0.0.0:5000
```

---

### Step 7: Test the API! (30 sec)

Open a new terminal and try these commands:

```bash
# Get stats
curl http://localhost:5000/stats

# Expected: {"events":5,"organizations":10,"resources":15}

# Get all organizations
curl http://localhost:5000/orgs

# Get single organization with relationships
curl http://localhost:5000/orgs/1?include_relationships=true

# Search for "citizenship"
curl http://localhost:5000/search?q=citizenship

# Get events in a specific location
curl http://localhost:5000/events?location=Texas
```

Or open in your browser:
- http://localhost:5000/stats
- http://localhost:5000/events
- http://localhost:5000/orgs
- http://localhost:5000/resources

---


## Next Steps

### Get More Events 
To get real events instead of sample events:

1. Get Eventbrite API token: https://www.eventbrite.com/platform/api
2. Add to `.env`:
   ```bash
   EVENTBRITE_API_TOKEN=your_token_here
   ```
3. Re-seed database:
   ```bash
   python seed_database.py
   ```

### Connect Frontend
Update your React frontend to use the API:

```javascript
// Old (Phase 1)
import events from './data/events.json'

// New (Phase 2)
fetch('http://localhost:5000/events?include_relationships=true')
  .then(res => res.json())
  .then(data => setEvents(data))
```

### Explore the Data

**Using Python:**
```python
from app import app, db
from models import Event, Organization, Resource

with app.app_context():
    # Get all organizations
    orgs = Organization.query.all()
    print(f"Found {len(orgs)} organizations")

    # Get an org with its events
    org = Organization.query.first()
    print(f"{org.name} has {len(org.events)} events")
```

**Using PostgreSQL:**
```bash
psql -U postgres -d immigrow

# In psql:
\dt                                    # List tables
SELECT * FROM organization LIMIT 5;   # View organizations
SELECT * FROM event LIMIT 5;          # View events
SELECT * FROM resource LIMIT 5;       # View resources
\q                                     # Exit
```

## Common Issues

### "Command not found: createdb"
PostgreSQL is not installed. See [POSTGRESQL_SETUP.md](POSTGRESQL_SETUP.md)

### "FATAL: password authentication failed"
Wrong password in `.env`. Check `POSTGRES_PASSWORD` matches your PostgreSQL password.

### "psycopg2 not installed"
```bash
pip install psycopg2-binary
```

### "database 'immigrow' does not exist"
```bash
createdb -U postgres immigrow
```

### Want to use SQLite instead?
Edit `.env` and comment out all POSTGRES_* lines:
```bash
# POSTGRES_HOST=localhost
# POSTGRES_PORT=5432
# etc...
```

## File Overview

- `app.py` - Main Flask application
- `models.py` - Database models (Event, Organization, Resource)
- `api_integrations.py` - Fetches data from external APIs
- `seed_database.py` - Populates database
- `test_setup.py` - Verifies your setup
- `.env` - Your configuration (create from `.env.example`)

## Documentation

For more details:
- **[README.md](README.md)** - Full overview
- **[SETUP.md](SETUP.md)** - Detailed setup instructions
- **[POSTGRESQL_SETUP.md](POSTGRESQL_SETUP.md)** - PostgreSQL installation guide
- **[DATABASE_SCHEMA.md](DATABASE_SCHEMA.md)** - Database structure
- **[PHASE2_SUMMARY.md](PHASE2_SUMMARY.md)** - Implementation details

## Help

If you're stuck:
1. Check [POSTGRESQL_SETUP.md](POSTGRESQL_SETUP.md) for database issues
2. Run `python test_setup.py` to diagnose problems
3. Check the console output for specific error messages
4. Review [SETUP.md](SETUP.md) troubleshooting section

---

**Total time: ~5 minutes** ⚡

Happy coding! 🚀
