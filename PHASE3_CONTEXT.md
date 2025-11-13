# Phase 3 Implementation Context

## Project Overview
**ImmigRow** - An immigration resources platform connecting Events, Organizations, and Resources

## Database Schema Summary

### Event Model (48 rows)
**Core Attributes (All NOT NULL):**
- `id` (integer, primary key)
- `title` (varchar 255)
- `date` (date) - indexed
- `start_time` (varchar 50)
- `duration_minutes` (integer)
- `location` (varchar 255)

**Additional Attributes (Nullable):**
- `city` (varchar 100)
- `state` (varchar 50)
- `venue_name` (varchar 255)
- `description` (text)
- `external_url` (varchar 500)
- `image_url` (varchar 500)
- `eventbrite_id` (varchar 100)
- `end_time` (varchar 50)
- `timezone` (varchar 50)
- `organization_id` (integer, FK)
- `created_at`, `updated_at` (timestamp)

### Organization Model (57 rows)
**Core Attributes (All NOT NULL):**
- `id` (integer, primary key)
- `name` (varchar 255) - indexed
- `city` (varchar 100) - indexed
- `state` (varchar 50) - indexed
- `topic` (varchar 100) - indexed
- `size` (varchar 50)

**Additional Attributes (Nullable):**
- `meeting_frequency` (varchar 50)
- `description` (text)
- `address` (varchar 255)
- `zipcode` (varchar 20)
- `ein` (varchar 20, unique)
- `subsection_code` (varchar 20)
- `ntee_code` (varchar 20)
- `external_url` (varchar 500)
- `image_url` (varchar 500)
- `guidestar_url` (varchar 500)
- `form_990_pdf_url` (varchar 500)
- `created_at`, `updated_at` (timestamp)

### Resource Model (54 rows)
**Core Attributes (All NOT NULL):**
- `id` (integer, primary key)
- `title` (varchar 500) - indexed
- `date_published` (date) - indexed
- `topic` (varchar 100) - indexed
- `scope` (varchar 50) - indexed (Federal/State/Local)
- `description` (text)

**Additional Attributes (Nullable):**
- `format` (varchar 50)
- `court_name` (varchar 255)
- `citation` (varchar 255)
- `external_url` (varchar 500)
- `image_url` (varchar 500)
- `audio_url` (varchar 500)
- `courtlistener_id` (varchar 100, unique)
- `docket_number` (varchar 100)
- `judge_name` (varchar 255)
- `created_at`, `updated_at` (timestamp)

## Current Backend API Endpoints

### Organizations
- `GET /api/orgs?page=1&per_page=15` - List all organizations (paginated)
- `GET /api/orgs/<id>` - Get single organization with related events and resources

### Events
- `GET /api/events?page=1&per_page=15` - List all events (paginated)
- `GET /api/events/<id>` - Get single event with related organization and resources

### Resources
- `GET /api/resources?page=1&per_page=15` - List all resources (paginated)
- `GET /api/resources/<id>` - Get single resource with related organizations and events

**Response Format (all list endpoints):**
```json
{
  "data": [...],
  "total": 48,
  "page": 1,
  "per_page": 15,
  "total_pages": 4
}
```

## Current Frontend Structure

### Pages
- `/events` - Events.jsx (grid view with pagination)
- `/orgs` - Orgs.jsx (grid view with pagination)
- `/resources` - Resources.jsx (grid view with pagination)
- `/events/:id`, `/orgs/:id`, `/resources/:id` - Detail pages

### Components
- `EntityGrid.jsx` - Reusable grid component
- `Pagination.jsx` - Pagination controls
- `Layout.jsx` - Page layout with navigation

### API Client (`frontend/src/lib/api.js`)
- `fetchEvents(page, perPage)`
- `fetchOrgs(page, perPage)`
- `fetchResources(page, perPage)`
- Plus individual fetch functions

## Phase 3 Requirements Summary

### 1. Sorting & Filtering (5 attributes per model)
- MUST implement on each model page (Events, Organizations, Resources)
- MUST have at least ONE sorted attribute AND ONE filtered attribute per model
- Implemented via backend API query parameters
- Usage instructions must be added to API documentation

**Recommended Attributes for Implementation:**

**Events (5 attributes):**
1. `date` - SORT (asc/desc) - NOT NULL, indexed, useful for chronological ordering
2. `state` - FILTER (dropdown/multi-select) - Has data, useful for location filtering
3. `duration_minutes` - FILTER (range: short/medium/long) - NOT NULL, useful categorization
4. `title` - SORT (alphabetical) - NOT NULL, common sorting need
5. `organization_id` - FILTER (by organization) - Has relationships, useful for filtering events by host

**Organizations (5 attributes):**
1. `name` - SORT (alphabetical) - NOT NULL, indexed, primary sorting
2. `state` - FILTER (dropdown/multi-select) - NOT NULL, indexed, location filtering
3. `topic` - FILTER (dropdown/multi-select) - NOT NULL, indexed, subject filtering
4. `size` - FILTER (dropdown/multi-select) - NOT NULL, useful categorization
5. `city` - SORT (alphabetical) - NOT NULL, indexed, secondary sorting option

**Resources (5 attributes):**
1. `date_published` - SORT (asc/desc) - NOT NULL, indexed, chronological ordering
2. `topic` - FILTER (dropdown/multi-select) - NOT NULL, indexed, subject filtering
3. `scope` - FILTER (Federal/State/Local) - NOT NULL, indexed, jurisdictional filtering
4. `court_name` - FILTER (dropdown/multi-select) - Has some data, legal filtering
5. `title` - SORT (alphabetical) - NOT NULL, indexed, alphabetical ordering

### 2. Model-Specific Search (on each model page)
- Search all text and attributes of the model (even if not visible on card)
- Results displayed as identical cards to model page
- Results link to instance pages
- Implement Ctrl+F style highlighting
- Google-like relevance ranking:
  - Full phrase matches ranked highest
  - Multi-word matches (all words present) ranked second
  - Single-word matches ranked third
  - Additional factors at discretion (frequency, fuzzy matching)

### 3. Global Website Search (new dedicated page)
- Search across ALL models
- Results organized by model type (Events, Organizations, Resources sections)
- Same relevance algorithm as model-specific search
- Same highlighting as model-specific search
- Results displayed as same cards used everywhere else

### 4. Code Reusability
**Appearance and code must be IDENTICAL in all 4 situations:**
1. Grid of instances on model pages
2. Grid of instances on instance detail pages (showing connected instances)
3. Result of general search on separate page
4. Result of model-specific search on model pages

**Including:**
- Pagination (instances per page, total pages, navigation controls)
- Card styling and layout
- Highlighting functionality

### 5. API Documentation
- Document all new query parameters
- Include descriptions for searching, sorting, and filtering
- Add usage examples

### 6. Testing
**Add tests for new functionality:**
- Frontend unit tests (Mocha/Jest) - at least 10 already exist
- Frontend acceptance tests (Selenium) - at least 10 already exist
- Backend tests per endpoint (UnitTest/PyTest) - already exist
- API tests per endpoint (Postman) - already exist

**Need to add:**
- Tests for search functionality
- Tests for sort functionality
- Tests for filter functionality

## Technology Stack
- **Backend:** Flask, SQLAlchemy, PostgreSQL (AWS RDS)
- **Frontend:** React, React Router, React Bootstrap, Vite
- **Testing:** Jest (frontend), Selenium (acceptance), PyTest (backend), Postman (API)

## Key Files to Modify

### Backend
- `backend/app.py` - Add query parameter handling for search/sort/filter
- `backend/models.py` - May need helper methods for search
- `backend/test_app.py` - Add tests

### Frontend
- `frontend/src/pages/Events.jsx` - Add search/sort/filter UI
- `frontend/src/pages/Orgs.jsx` - Add search/sort/filter UI
- `frontend/src/pages/Resources.jsx` - Add search/sort/filter UI
- `frontend/src/pages/Search.jsx` - NEW: Global search page
- `frontend/src/lib/api.js` - Add new API functions
- `frontend/src/App.jsx` - Add route for global search
- `frontend/src/components/EntityGrid.jsx` - May need highlighting component
- `frontend/src/tests/` - Add new tests

### Documentation
- Create or update API documentation file
- Document query parameters for search, sort, filter

## Notes from User
- Search should include all attributes even if not visible on cards
- Consider adding "matching phrases/keywords" indicator on cards to explain relevance
- Global search will have 3 separate grids/sections: Events, Organizations, Resources
- Focus on attributes with good data coverage (avoid fields with too many NULLs)
- Time is limited, so implement EITHER sort OR filter per attribute (not both)

## Current Pagination Setup
- 15 items per page
- Backend handles pagination via `page` and `per_page` query params
- Frontend has reusable Pagination component
- All model pages already implement pagination

---

## IMPLEMENTATION PROGRESS

### ✅ Completed: Events Model (Backend + Frontend)

**Backend Changes (`backend/app.py`):**
- Updated `/api/events` endpoint with query parameter support:
  - `search` - Full-text search across all event text fields
  - `sort_by` - Sort by `date` or `title`
  - `sort_order` - `asc` or `desc`
  - `state` - Filter by state
  - `timezone` - Filter by timezone (EST/PST/CST/MST)
  - `duration` - Filter by duration category (short <60min, medium 60-90min, long >90min)
- Returns search_query, filters, and sort parameters in response for frontend state sync

**Frontend Changes:**
1. **New Components:**
   - `frontend/src/components/SearchAndFilters.jsx` - Reusable search/sort/filter UI component
   - `frontend/src/components/HighlightedText.jsx` - Highlights search matches in text

2. **Updated Files:**
   - `frontend/src/lib/api.js` - Updated `fetchEvents()` to accept options object with search/sort/filter params
   - `frontend/src/pages/Events.jsx` - Integrated SearchAndFilters component with highlighting

**Features Implemented for Events:**
- ✅ Sort by: date (asc/desc), title (asc/desc)
- ✅ Filter by: state, timezone, duration
- ✅ Full-text search across all event attributes
- ✅ Search highlighting with `<mark>` tags
- ✅ Maintains pagination functionality
- ✅ Reusable components for other models

**Next Steps:** Organizations Model
