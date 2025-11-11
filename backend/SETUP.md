# Immigrow Backend Setup Guide - Phase 2

This guide will help you set up the Phase 2 backend with real API integration and AWS RDS PostgreSQL database.

## Overview

The backend uses:
- **Flask** - REST API server
- **AWS RDS PostgreSQL** - Cloud database
- **2 REST APIs** - ProPublica (orgs) + CourtListener (legal resources)
- **Sample Events** - Temporary (will be replaced with web scraper)

## Prerequisites

- Python 3.8+
- pip
- AWS RDS PostgreSQL (already set up)

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

Edit `.env` and add your configuration:

```bash
# AWS RDS Database (REQUIRED)
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@immigrow-db.cz8gegw2sqh9.us-east-2.rds.amazonaws.com:5432/Immigrow

# CourtListener API (REQUIRED - for legal resources)
COURTLISTENER_API_TOKEN=your_token_here

```

**Note:** ProPublica API requires no authentication - it's completely public

### 3. Database is Already Set Up

Your team is using **AWS RDS PostgreSQL**:
- Instance: `immigrow-db`
- Database name: `Immigrow` (capital I)
- Region: us-east-2
- Already configured in `.env`

**No local database installation needed!**

### 4. Seed the Database

```bash
# Run the seeding script
python seed_database.py
```

This will:
1. Drop and recreate all database tables
2. Fetch 15 organizations from ProPublica API (no auth needed)
3. Fetch 20 legal resources from CourtListener V4 API
4. Create 12 sample immigration events (temporary)
5. Create relationships: each instance has 2+ connections

**Expected output:**
```
[2/6] Fetching organizations from ProPublica...
  Seeded 15 organizations
[3/6] Fetching legal resources from CourtListener...
  Seeded 20 legal resources
[4/6] Creating sample events...
  Seeded 12 events
[5/6] Creating relationships...
  [SUCCESS] All 47 instances have 2+ connections
```

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
**Attributes (18 total, 5+ required for Phase 2):**
- `title`, `date`, `start_time`, `duration_minutes`, `location`
- `city`, `state`, `venue_name`, `description`, `external_url`
- `image_url`, `eventbrite_id`, `end_time`, `timezone`
- `organization_id` (foreign key), `created_at`, `updated_at`

**Relationships:**
- Belongs to ONE Organization (foreign key)
- Has MANY Resources (many-to-many via `event_resources` table)

### Organization Model
**Attributes (18 total, 5+ required for Phase 2):**
- `name`, `city`, `state`, `topic`, `size`
- `meeting_frequency`, `description`, `address`, `zipcode`, `ein`
- `subsection_code`, `ntee_code`, `external_url`, `guidestar_url`
- `image_url`, `created_at`, `updated_at`

**Relationships:**
- Has MANY Events (one-to-many, reverse of Event.organization)
- Has MANY Resources (many-to-many via `organization_resources` table)

### Resource Model
**Attributes (16 total, 5+ required for Phase 2):**
- `title`, `date_published`, `topic`, `scope`, `description`
- `format`, `court_name`, `citation`, `external_url`, `image_url`
- `courtlistener_id`, `docket_number`, `judge_name`
- `created_at`, `updated_at`

**Relationships:**
- Has MANY Events (many-to-many via `event_resources` table)
- Has MANY Organizations (many-to-many via `organization_resources` table)

## API Data Sources

### 1. ProPublica Nonprofit Explorer API (Organizations)
- **Purpose:** Fetch real nonprofit organizations
- **Type:** REST API
- **Endpoint:** `https://projects.propublica.org/nonprofits/api/v2/search.json`
- **Authentication:** **None required** (public API)
- **Documentation:** https://projects.propublica.org/nonprofits/api
- **Status:** Working - fetches 15 immigration-related nonprofits

### 2. CourtListener API V4 (Legal Resources)
- **Purpose:** Fetch real immigration court cases and legal opinions
- **Type:** REST API
- **Endpoint:** `https://www.courtlistener.com/api/rest/v4/search/`
- **Authentication:** **Token required** (get at courtlistener.com)
- **Documentation:** https://www.courtlistener.com/help/api/rest-v4/
- **Status:** Working - fetches 20 immigration-related court cases

### 3. Sample Events (Temporary)
- **Purpose:** Immigration events (citizenship workshops, legal clinics, etc.)
- **Type:** Hardcoded sample data
- **Status:** ⚠️ Temporary - will be replaced with web scraper
- **Future:** Build ImmigrationLawHelp.org scraper (see backend/TODO_PHASE2.md)

## Database Verification Tools

```bash
# View all tables, data, and relationships (table format)
python verify_database_tables.py

# Quick database inspection with relationship counts
python inspect_database.py

# Check full description fields (no truncation)
python check_descriptions.py

# Test CourtListener API
python test_courtlistener_v4.py
```

## Troubleshooting

### Issue: "database 'immigrow' does not exist"
**Solution:** Database name is case-sensitive! Use `Immigrow` (capital I)
```bash
DATABASE_URL=postgresql://...../Immigrow  # Capital I!
```

### Issue: CourtListener 403 errors
**Solution:**
- V3 API is deprecated for new users
- Make sure you're using V4: `https://www.courtlistener.com/api/rest/v4/`
- Verify API token in `.env`

### Issue: ProPublica returns 404
**Solution:**
- Using search endpoint, not direct EIN lookup
- Endpoint: `/search.json?q=immigration`
- No authentication needed

### Issue: No events showing up
**Solution:**
- Eventbrite public API was deprecated in 2020
- Currently using 12 hardcoded sample events
- This is intentional - will be replaced with web scraper later

## Next Steps for Phase 2

### For Backend Developer (You):
1. Set up AWS RDS PostgreSQL - **DONE**
2. Implement 2 REST APIs - **DONE** (ProPublica + CourtListener)
3. Create database models with relationships - **DONE**
4. Seed database with 47+ instances - **DONE**
5. Ensure all instances have 2+ connections - **DONE**
6. ⚠️ **Optional:** Replace sample events with ImmigrationLawHelp.org scraper (30-40 min)

### For Frontend Developers (Your Teammates):
1. **Connect frontend to backend API** instead of using static JSON files
2. **Update API calls** in React components:
   ```javascript
   // OLD (Phase 1):
   import events from './data/events.json'

   // NEW (Phase 2):
   const [events, setEvents] = useState([])

   useEffect(() => {
     fetch('http://localhost:5000/events?include_relationships=true')
       .then(res => res.json())
       .then(data => setEvents(data))
       .catch(err => console.error(err))
   }, [])
   ```

3. **Add loading states** and error handling
4. **Use relationships** - backend returns nested data when you use `?include_relationships=true`
5. **Test all pages** - Events, Organizations, Resources, instance detail pages

### Division of Work:
- **Backend (You):** ✅ Database, APIs, seeding, relationships - **COMPLETE**
- **Frontend (Teammates):** Connect React to Flask API, display data, handle loading/errors
- **Optional:** Build web scraper for events (can be done anytime before final submission)

## Production Deployment

For AWS deployment:

1. **Backend is already on AWS RDS** ✅
2. **Set environment variables** on your hosting service (EC2, Elastic Beanstalk, etc.)
3. **Run migrations:**
   ```bash
   python seed_database.py
   ```
4. **Start server:**
   ```bash
   gunicorn app:app
   ```

## Important Notes

- Database has **3 tables + 2 junction tables** (Event, Organization, Resource, event_resources, organization_resources)
- **2 many-to-many** relationships (via junction tables)
- **1 one-to-many** relationship (Event -> Organization via foreign key)
- All 47 instances guaranteed to have **2+ connections**
- ProPublica API is **public** (no key needed)
- CourtListener requires **API token**
- Events are **sample data** (will be replaced with scraper later)
