# Claude.md - Immigrow Project Documentation

## Project Overview
**Immigrow** (formerly Immigo) is a web platform designed to help underserved immigrant communities and their allies discover firsthand stories, trustworthy organizations, and nearby resources/events. The site promotes civic engagement by connecting users to actionable services, multilingual materials, and community events.

**Current Phase:** Phase 2 (Database and API Integration)
**Website:** https://immigrow.site
**GitLab:** https://gitlab.com/anisha1045/cs373-55090-09

## Team Members
- Lucas Berio Perez (lfb1234) - lucasberio - Phase 1 Leader
- Anisha Bhaskar Torres (avb834) - anisha1045
- Mrinalini Jithendra (mj27496) - mrinalinij05
- Rakesh Singh (rps2439) - rrrakesh

## Project Architecture

### Tech Stack
- **Frontend:** React + Vite
- **Backend:** Flask + SQLAlchemy
- **Database:** SQLite (Phase 2: needs expansion to real database)
- **Hosting:** AWS (S3, CloudFront, Route53)
- **CI/CD:** GitLab Pipelines

### Project Structure
```
cs373-55090-09/
├── backend/
│   ├── app.py                 # Flask app with basic SQLAlchemy models
│   ├── requirements.txt       # Python dependencies
│   ├── Dockerfile            # Docker configuration for backend
│   └── venv/                 # Python virtual environment
├── src/
│   ├── data/                 # Static JSON data (Phase 1)
│   │   ├── events.json       # 3 hardcoded events
│   │   ├── orgs.json         # 3 hardcoded organizations
│   │   └── resources.json    # 3 hardcoded resources
│   ├── pages/                # React page components
│   │   ├── Home.jsx
│   │   ├── About.jsx
│   │   ├── Events.jsx        # Displays event grid
│   │   ├── Orgs.jsx          # Displays organization grid
│   │   ├── Resources.jsx     # Displays resource grid
│   │   └── [instance pages]  # Individual instance detail pages
│   └── components/
│       └── EntityGrid.jsx    # Reusable grid component
├── .env.example              # Environment variables template
├── project_info.txt          # Project requirements and model definitions
├── IDB.tr.md                 # Technical report
├── IDB.ai.md                 # AI usage report
└── README.md                 # Team and project info
```

## Data Models

### 1. Events Model
**Attributes (from current JSON):**
- `id` (string): Unique identifier (e.g., "evt-1")
- `title` (string): Event name
- `date` (date): Event date (YYYY-MM-DD)
- `location` (string): City, State
- `durationMins` (integer): Event duration in minutes
- `startTime` (string): Event start time
- `imageUrl` (string): Path to event image
- `orgId` (string): Associated organization ID
- `resourceIds` (array): Related resource IDs
- `externalUrl` (string): Link to event registration/info
- `selfUrl` (string): Internal route to event details

**Relationships:**
- Belongs to one Organization (orgId)
- Related to many Resources (resourceIds)

### 2. Organizations Model
**Attributes (from current JSON):**
- `id` (string): Unique identifier (e.g., "org-1")
- `name` (string): Organization name
- `city` (string): City location
- `state` (string): State location
- `topic` (string): Primary focus area
- `foundedYear` (integer): Year established
- `meetingFrequency` (string): How often they meet
- `imageUrl` (string): Path to organization image
- `externalUrl` (string): Organization website
- `eventIds` (array): Related event IDs
- `resourceIds` (array): Related resource IDs
- `selfUrl` (string): Internal route to org details

**Relationships:**
- Has many Events (eventIds)
- Has many Resources (resourceIds)

### 3. Resources Model
**Attributes (from current JSON):**
- `id` (string): Unique identifier (e.g., "res-1")
- `title` (string): Resource title
- `scope` (string): Federal/State/Local
- `topic` (string): Subject area
- `published` (date): Publication date
- `format` (string): PDF/Web/etc.
- `imageUrl` (string): Path to resource image
- `externalUrl` (string): Link to resource
- `orgIds` (array): Related organization IDs
- `selfUrl` (string): Internal route to resource details

**Relationships:**
- Related to many Organizations (orgIds)
- Related to many Events (through org connections)

## Current State (Phase 1 Complete)

### What's Working:
1. Static frontend with React displaying hardcoded JSON data
2. Three models with 3 instances each (9 instance pages total)
3. EntityGrid component for displaying model grids
4. Individual instance pages for each item
5. Basic Flask backend with minimal SQLAlchemy models (id, name only)
6. AWS deployment infrastructure
7. Postman API documentation (design only, not implemented)
8. HTTPS support

### What's NOT Working (Phase 2 Tasks):
1. **Database is not functional** - Models only have id/name fields
2. **No API integration** - Data is hardcoded in JSON files
3. **No real data fetching** from external APIs:
   - Eventbrite API (for events)
   - LawHelp/Immigration Law Help API (for organizations)
   - ProPublica Congress API (for legal resources/bills)
4. **Frontend doesn't call backend** - Uses static JSON imports
5. **No database seeding** - No scripts to populate database
6. **No pagination** - Not required until Phase 3
7. **No filtering/sorting** - Not required until Phase 3

## API Sources (Planned)

### 1. Eventbrite API
**Purpose:** Fetch immigration-related community events
**Model:** Events
**Endpoint:** https://www.eventbrite.com/platform/api

### 2. LawHelp / Immigration Law Help API
**Purpose:** Fetch legal aid organizations
**Model:** Organizations
**Website:** www.immigrationlawhelp.org
**Note:** May need to scrape if no public API available

### 3. ProPublica Congress API
**Purpose:** Fetch immigration-related bills and legislation
**Model:** Resources (Legal Resources)
**Endpoint:** https://projects.propublica.org/api-docs/congress-api/

## Phase 2 Requirements

Based on the rubric, Phase 2 should include:
1. **Database Implementation**
   - Expand SQLAlchemy models with all required attributes
   - Add relationships between models
   - Database migrations

2. **API Integration**
   - Write scripts to fetch data from external APIs
   - Transform API responses to match data models
   - Handle API authentication and rate limiting

3. **Backend Endpoints**
   - Implement the endpoints designed in Postman
   - GET all instances for each model
   - GET specific instance by ID
   - Return proper JSON responses

4. **Frontend-Backend Connection**
   - Replace static JSON imports with API calls
   - Handle loading states and errors
   - Update instance pages to fetch from backend

5. **Data Seeding**
   - Create scripts to populate database from APIs
   - Ensure at least 5-10 instances per model
   - Maintain relationships between models

## Backend Current Implementation

The [backend/app.py](backend/app.py) file currently has:
- Basic Flask setup with CORS
- SQLAlchemy configuration (SQLite)
- Minimal models (Organization, Event, Resource) with only id/name
- API endpoints that query empty database
- No data seeding or API integration

**Key Issues:**
1. Models missing most attributes (only have id, name)
2. Database is empty (no seeding script)
3. No API integration to fetch external data
4. Endpoints won't return useful data

## Frontend Current Implementation

The frontend in [src/](src/) currently:
- Imports static JSON files from `src/data/`
- Uses EntityGrid component to display model lists
- Has individual instance pages for each item
- Shows relationships using JSON references (e.g., orgId, resourceIds)
- Works independently of backend

**What needs updating:**
1. Replace JSON imports with fetch() calls to backend
2. Add loading/error states
3. Update routing if needed
4. Handle asynchronous data fetching

## Environment Variables

From [.env.example](.env.example):
```
AWS_DEFAULT_REGION=us-east-1
S3_BUCKET=immigrow.site
CF_DIST_ID=E3VBUSY2EV16W
VITE_GITLAB_BASE=https://gitlab.com/api/v4
VITE_GITLAB_PROJECT_PATH=anisha1045/cs373-55090-09
```

**Needs adding for Phase 2:**
- API keys for Eventbrite, ProPublica, etc.
- Database connection string (if moving from SQLite)

## Recommended Phase 2 Approach

### Step 1: Expand Database Models
Update `backend/app.py` to include all attributes for each model based on the JSON structure and API responses.

### Step 2: Create API Integration Scripts
Create separate scripts/modules to:
- Fetch data from Eventbrite API
- Fetch data from ProPublica Congress API
- Scrape/fetch data from Immigration Law Help
- Transform API responses to match database schema

### Step 3: Create Database Seeding Script
Create a script to:
- Call API integration functions
- Populate database with fetched data
- Create relationships between models

### Step 4: Test Backend Endpoints
Verify that Flask endpoints return correct data from database.

### Step 5: Update Frontend
Replace static JSON imports with fetch calls to backend API.

### Step 6: Test End-to-End
Ensure frontend displays data from backend correctly.

## Important Notes

1. **Data currently hardcoded** - All 9 instances are manually created JSON files
2. **Backend not connected** - Frontend doesn't make any API calls
3. **Models incomplete** - Database models missing most attributes
4. **No API keys yet** - Need to register for API access
5. **SQLite is temporary** - May need to upgrade for production
6. **Relationships are IDs** - Using string IDs to link models (need proper foreign keys in DB)

## Known Challenges

From IDB.tr.md, Phase 1 challenges included:
- Setting up AWS hosting
- Linking instances with related attributes
- Integrating media content

Phase 2 challenges will likely include:
- API rate limiting and authentication
- Data transformation from APIs to database schema
- Maintaining relationships between fetched data
- Handling missing or incomplete API data

## Next Steps for Phase 2 Development

1. Research and get API keys for:
   - Eventbrite API
   - ProPublica Congress API
   - Immigration Law Help (check if API exists)

2. Expand SQLAlchemy models with all attributes

3. Write API integration scripts to fetch data

4. Create database seeding script

5. Test backend endpoints return correct data

6. Update frontend to call backend APIs

7. Deploy updated backend to AWS

8. Update technical report (IDB.tr.md) for Phase 2
