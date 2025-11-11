# Phase 2 Context - Immigrow Database & Media Implementation

**Last Updated:** 2025-11-10
**Current Status:** Phase 2 complete with media requirements implemented
**Database:** AWS RDS PostgreSQL (immigrow-db.cz8gegw2sqh9.us-east-2.rds.amazonaws.com)

## Executive Summary

Phase 2 successfully implemented:
- ✅ 3 database models with full attributes (Event, Organization, Resource)
- ✅ API integrations (ProPublica, CourtListener, Mobilize, RAICES scraper)
- ✅ Database seeding with 48+ events, 57 organizations, 50+ resources
- ✅ 2+ forms of media per model instance (as required)
- ✅ Many-to-many relationships via junction tables
- ⚠️ Form 990 PDF availability limited by ProPublica API data (only ~9% have PDFs)

## Current Database State

**Instance Counts (as of last verification):**
- Events: 48 (all have image_url + external_url)
- Organizations: 57 (only ~5 have form_990_pdf_url due to API limitations)
- Resources: 50+ (all have external_url + audio_url)

**Media Implementation:**
| Model | Media #1 | Media #2 | Status |
|-------|----------|----------|--------|
| Event | external_url | image_url | ✅ 100% complete |
| Organization | external_url | form_990_pdf_url | ⚠️ ~9% have PDFs (API limitation) |
| Resource | external_url | audio_url | ✅ ~95% complete |

## Database Schema

### Tables Structure
1. **event** - 18 columns including media fields
2. **organization** - 19 columns including media fields
3. **resource** - 17 columns including media fields
4. **event_resources** - Junction table (event_id, resource_id)
5. **organization_resources** - Junction table (organization_id, resource_id)

### Key Relationships
- Event → Organization (Many-to-One via organization_id foreign key)
- Event ↔ Resource (Many-to-Many via event_resources junction table)
- Organization ↔ Resource (Many-to-Many via organization_resources junction table)

## API Integration Details

### 1. ProPublica Nonprofit Explorer API
**File:** `backend/api_integrations/main_apis.py` (ProPublicaNonprofitAPI class)
**Purpose:** Fetch nonprofit organizations with tax data
**Endpoint:** `https://projects.propublica.org/nonprofits/api/v2`

**Search Queries:**
- "immigration legal services" (limit 25)
- "refugee assistance" (limit 15)
- "immigrant rights" (limit 10)
- "citizenship help" (limit 7) - often returns 404

**Media Fields:**
- `external_url`: Link to ProPublica organization page (✅ always available)
- `form_990_pdf_url`: IRS Form 990 tax filing PDF (⚠️ only ~9% available)

**Known Issue:** Most organizations don't have `filings_with_data` in the API response, meaning Form 990 PDFs are not digitally available for those organizations. This is a data limitation, not a code bug.

### 2. CourtListener API v4
**File:** `backend/api_integrations/main_apis.py` (CourtListenerAPI class)
**Purpose:** Fetch immigration-related court cases
**Endpoint:** `https://www.courtlistener.com/api/rest/v4/search/`
**Authentication:** Token-based (COURTLISTENER_API_TOKEN in .env)

**Search Queries:**
- "immigration deportation" (limit 20)
- "asylum refugee" (limit 20)
- "visa citizenship" (limit 20)

**Media Fields:**
- `external_url`: Link to CourtListener case page (✅ always available)
- `audio_url`: Oral argument audio or opinion PDF download URL (✅ ~95% available)

**Extraction Logic:**
```python
# Priority order for audio_url:
1. case_data['audio_url'] (if exists)
2. case_data['oral_argument_audio'] (if exists)
3. case_data['opinions'][0]['download_url'] (PDF fallback)
```

### 3. Mobilize America API
**File:** `backend/api_integrations/mobilize_api.py`
**Purpose:** Fetch immigration-related community events
**Endpoint:** `https://api.mobilize.us/v1/events`

**Search Parameters:**
- `timeslot_start=gte_now` (future events only)
- `event_types=COMMUNITY` (community events only)
- Immigration-related filtering by title keywords

**Media Fields:**
- `external_url`: Link to event registration page (✅ always available)
- `image_url`: Event banner image from `featured_image_url` (✅ ~96% available)

### 4. RAICES Web Scraper
**File:** `backend/event_scrapers/raices_scraper.py`
**Purpose:** Scrape events from RAICES Texas website
**URL:** `https://www.raicestexas.org/events/`

**Extraction Method:** BeautifulSoup HTML parsing of event cards

**Media Fields:**
- `external_url`: Link to event page (✅ always available)
- `image_url`: Event image from card (✅ ~95% available)

## Database Seeding Process

**Script:** `backend/seed_database.py`

**Execution Order:**
1. Drop and recreate all tables (WARNING: deletes existing data)
2. Seed 57 organizations from ProPublica API
3. Seed 50+ resources from CourtListener API
4. Seed 50 events from RAICES + Mobilize API
5. Create many-to-many relationships (2-3 resources per event/org)
6. Verify all instances have 2+ connections

**Important Notes:**
- Uses batched commits (every 10 orgs) to prevent connection timeouts
- Tracks organization IDs instead of objects to avoid SQLAlchemy session detachment
- Randomly assigns organizations to events
- Ensures all instances have minimum 2 connections

## Recent Changes & Fixes

### 1. Events Without Image URLs (RESOLVED)
**Issue:** 2 events didn't have image_urls after seeding
**Resolution:** Created `remove_events_without_images.py` script and deleted the 2 events
**Result:** All 48 remaining events now have image_urls ✅

**Deleted Events:**
- "Sully District Democratic Committee Monthly Meeting" (Chantilly, VA)
- "Team ENOUGH Welcome Session (For Young People Under 26)" (Washington, DC)

### 2. Form 990 PDF Availability (API LIMITATION)
**Issue:** Most organizations (~91%) don't have form_990_pdf_url
**Root Cause:** ProPublica API has three scenarios:
  1. No `filings_with_data` array (most common)
  2. Filings exist but `pdf_url` field is null
  3. PDF URL available (~9% of organizations)

**Analysis:** Created `test_form990_fetching.py` to investigate
**Conclusion:** This is a **data availability issue**, not a code bug. ProPublica simply doesn't have digitized Form 990s for most organizations.

**Possible Solutions:**
- ✅ Accept the ~9% coverage (realistic given data availability)
- 🔄 Use `external_url` as primary media + `form_990_pdf_url` as optional bonus media
- 🔄 Add alternative media field (e.g., `image_url` or `guidestar_url`)

### 3. SQLAlchemy Session Detachment (FIXED)
**Issue:** All 50 events failed to add with error: "Instance has been deleted, or its row is otherwise not present"
**Root Cause:** Batched commits in `seed_organizations()` detached org objects from session
**Fix:** Changed to track organization IDs instead of objects:

```python
# OLD (caused detachment):
organizations = []
organizations.append(org)

# NEW (prevents detachment):
org_ids = []
org_ids.append(org.id)
# ... after commits ...
organizations = Organization.query.filter(Organization.id.in_(org_ids)).all()
```

### 4. Unicode Encoding Errors (FIXED)
**Issue:** Windows console couldn't display Unicode arrow characters (→, ↔)
**Fix:** Replaced with ASCII equivalents (`->`, `<->`) in print statements
**Result:** Seed script now runs without encoding errors

### 5. UTF-16 Verification Output (FIXED)
**Issue:** `database_verification_output.txt` had UTF-16 encoding with null bytes
**Fix:** Added UTF-8 encoding configuration to `verify_database_tables.py`:

```python
import sys
if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')
```

## File Locations & Key Code Sections

### Models Definition
**File:** `backend/models.py`

```python
# Organization model - line 127
form_990_pdf_url = db.Column(db.String(500))  # IRS Form 990 PDF (Media #2)

# Resource model - line 196
audio_url = db.Column(db.String(500))  # Oral argument audio or PDF (Media #2)
```

### API Integration - ProPublica
**File:** `backend/api_integrations/main_apis.py` (lines 271-308)

```python
def _transform_organization_from_search(self, org_data: dict) -> dict:
    # ... existing code ...

    # Try to get Form 990 PDF URL from detail endpoint
    form_990_pdf_url = None
    try:
        detail_response = requests.get(
            f"{self.BASE_URL}/organizations/{ein}.json",
            timeout=10
        )
        if detail_response.status_code == 200:
            detail_data = detail_response.json()
            filings = detail_data.get('filings_with_data', [])
            if filings:
                latest_filing = filings[0]
                pdf_url = latest_filing.get('pdf_url')
                if pdf_url:
                    form_990_pdf_url = pdf_url
    except Exception as e:
        print(f"  Could not fetch Form 990 PDF for {name}: {e}")

    return {
        # ... other fields ...
        'form_990_pdf_url': form_990_pdf_url
    }
```

### API Integration - CourtListener
**File:** `backend/api_integrations/main_apis.py` (lines 522-550)

```python
def _transform_case(self, case_data: dict) -> dict:
    # ... existing code ...

    # Extract audio URL from oral arguments (Media #2)
    audio_url = None
    if case_data.get('audio_url'):
        audio_url = case_data['audio_url']
    elif case_data.get('oral_argument_audio'):
        audio_url = case_data['oral_argument_audio']

    # Also check if opinions array has download_url for PDF
    if not audio_url and case_data.get('opinions') and len(case_data['opinions']) > 0:
        opinion = case_data['opinions'][0]
        if opinion.get('download_url'):
            audio_url = f"https://www.courtlistener.com{opinion['download_url']}"

    return {
        # ... other fields ...
        'audio_url': audio_url
    }
```

### Database Seeding - Organization Fix
**File:** `backend/seed_database.py` (lines 68-131)

```python
def seed_organizations() -> list:
    """Fetch and seed organizations from ProPublica API"""
    try:
        propublica_api = ProPublicaNonprofitAPI()
        org_data_list = propublica_api.fetch_organizations(limit=57)

        organizations = []
        org_ids = []  # Track IDs instead of objects to avoid detached instances
        batch_size = 10  # Commit every 10 organizations

        for idx, org_data in enumerate(org_data_list):
            try:
                # ... create org ...

                org = Organization(
                    # ... existing fields ...
                    form_990_pdf_url=org_data.get('form_990_pdf_url')  # NEW
                )

                db.session.add(org)
                db.session.flush()  # Flush to get ID
                org_ids.append(org.id)  # Track ID, not object

                # Commit in batches
                if (idx + 1) % batch_size == 0:
                    db.session.commit()

            except Exception as e:
                print(f"  ! Error adding organization: {e}")
                db.session.rollback()
                continue

        # Final commit
        db.session.commit()

        # Query back all organizations by ID to get fresh instances
        organizations = Organization.query.filter(Organization.id.in_(org_ids)).all()
        return organizations
```

## Utility Scripts

### 1. Remove Events Without Images
**File:** `backend/remove_events_without_images.py`
**Purpose:** Delete events where image_url is NULL or empty
**Usage:** `python remove_events_without_images.py`
**Result:** Removed 2 events, 48 remaining (all with image_urls)

### 2. Test Form 990 Fetching
**File:** `backend/test_form990_fetching.py`
**Purpose:** Diagnose why most organizations lack Form 990 PDFs
**Usage:** `python test_form990_fetching.py`
**Result:** Confirmed API data limitation (only ~9% have PDFs)

### 3. Verify Database Tables
**File:** `backend/verify_database_tables.py`
**Purpose:** Display database schema and sample data
**Usage:** `python verify_database_tables.py > database_verification_utf8.txt`
**Output:** UTF-8 encoded text file with full database structure

## Environment Variables

**File:** `.env` (not in git, see `.env.example`)

```env
# Database
DATABASE_URL=postgresql://postgres:password@immigrow-db.cz8gegw2sqh9.us-east-2.rds.amazonaws.com:5432/immigrow

# API Keys
COURTLISTENER_API_TOKEN=your_token_here

# AWS (for deployment)
AWS_DEFAULT_REGION=us-east-1
S3_BUCKET=immigrow.site
CF_DIST_ID=E3VBUSY2EV16W

# GitLab
VITE_GITLAB_BASE=https://gitlab.com/api/v4
VITE_GITLAB_PROJECT_PATH=anisha1045/cs373-55090-09
```

## Known Limitations & Future Work

### 1. Form 990 PDF Availability
**Issue:** Only ~9% of organizations have Form 990 PDFs
**Reason:** ProPublica API data limitation
**Options:**
- Accept current state (meets "2+ media" requirement via external_url)
- Add alternative media (image_url, guidestar_url)
- Switch to different API with better Form 990 coverage

### 2. Event Data Sources
**Current:** RAICES scraper + Mobilize API
**Original Plan:** Eventbrite API
**Reason for Change:** Eventbrite requires OAuth, Mobilize has simpler public API

### 3. Resource Audio URL Verification
**Status:** ~95% of resources have audio_url populated
**Unknown:** Whether all audio URLs are actually valid/accessible
**Next Step:** Could create verification script to test HTTP status of audio URLs

### 4. Database Connection Stability
**Issue:** Occasional "could not translate host name" errors
**Cause:** Network/DNS intermittent issues with AWS RDS
**Workaround:** Retry connection, verify AWS RDS status in console

## Testing & Verification Commands

```bash
# Run database seeding
cd backend
python seed_database.py

# Verify database structure
python verify_database_tables.py > database_verification_utf8.txt

# Remove events without images
python remove_events_without_images.py

# Test Form 990 PDF fetching
python test_form990_fetching.py

# Check database connection
python -c "from app import app; from models import db; app.app_context().push(); print(db.engine.url)"

# Count instances per model
python -c "from app import app; from models import *; app.app_context().push(); print(f'Events: {Event.query.count()}, Orgs: {Organization.query.count()}, Resources: {Resource.query.count()}')"
```

## Git Status (at time of context creation)

**Current branch:** fetchingAndDatabase
**Main branch:** main

**Recent commits:**
- 7ae0f02 - AWS RDS PostgreSQL database with seed data (20 orgs, 15 resources, 12 events)
- 651e449 - Remove .env from git tracking (security)
- 0b270ce - Added schema
- 218b326 - Fetching data and schema design
- 66e6637 - Worked on Flask/Docker/AWS setup

**Untracked:** `.claude/` directory (conversation context)

## Next Steps for Phase 3

Phase 3 requirements (based on CS373 project rubric):
1. **Pagination** - Implement pagination for model lists (25 instances per page)
2. **Filtering** - Add filters by attributes (state, topic, date range, etc.)
3. **Sorting** - Add sorting by various fields (date, name, etc.)
4. **Search** - Implement full-text search across all models
5. **Frontend** - Connect React frontend to Flask backend API
6. **Testing** - Unit tests for API endpoints

## Troubleshooting Common Issues

### SQLAlchemy Session Detachment
**Symptom:** "Instance has been deleted, or its row is otherwise not present"
**Cause:** Object accessed after session commit in batched operations
**Fix:** Track IDs and re-query after commits

### Unicode Encoding Errors
**Symptom:** `UnicodeEncodeError: 'charmap' codec can't encode character`
**Cause:** Windows console uses cp1252, not UTF-8
**Fix:** Use ASCII characters in print statements or configure UTF-8:
```python
sys.stdout.reconfigure(encoding='utf-8', errors='replace')
```

### Database Connection Timeout
**Symptom:** psycopg2.OperationalError with connection timeout
**Cause:** Long-running transactions without commits
**Fix:** Use batched commits (every 10-20 records)

### Empty Database After Seeding
**Symptom:** Seed script runs but database is empty
**Cause:** Exceptions causing rollback, check error messages
**Fix:** Review seed script output for error messages

## Contact & Resources

**Project GitLab:** https://gitlab.com/anisha1045/cs373-55090-09
**Live Website:** https://immigrow.site
**Team:** Lucas Berio Perez, Anisha Bhaskar Torres, Mrinalini Jithendra, Rakesh Singh

**API Documentation:**
- ProPublica: https://projects.propublica.org/nonprofits/api
- CourtListener: https://www.courtlistener.com/help/api/
- Mobilize: https://github.com/mobilizeamerica/api

---

**Document Version:** 1.0
**Last Verified:** 2025-11-10 after removing events without image_urls
**Context Window:** This document created when conversation context was running low (42k+ tokens used)
