# Immigrow Database Schema - Phase 2

## Entity Relationship Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                           ORGANIZATIONS                              │
├─────────────────────────────────────────────────────────────────────┤
│ PK | id                  INTEGER                                     │
│    | name                VARCHAR(255)      [REQUIRED]               │
│    | city                VARCHAR(100)      [REQUIRED, INDEXED]      │
│    | state               VARCHAR(50)       [REQUIRED, INDEXED]      │
│    | topic               VARCHAR(100)      [REQUIRED, INDEXED]      │
│    | size                VARCHAR(50)       [REQUIRED]               │
│────┼─────────────────────────────────────────────────────────────────│
│    | meeting_frequency   VARCHAR(50)                                 │
│    | description         TEXT                                        │
│    | address             VARCHAR(255)                                │
│    | zipcode             VARCHAR(20)                                 │
│    | ein                 VARCHAR(20)       [UNIQUE]                  │
│    | subsection_code     VARCHAR(20)                                 │
│    | ntee_code           VARCHAR(20)                                 │
│    | external_url        VARCHAR(500)                                │
│    | guidestar_url       VARCHAR(500)                                │
│    | image_url           VARCHAR(500)                                │
│    | created_at          DATETIME                                    │
│    | updated_at          DATETIME                                    │
└─────────────────────────────────────────────────────────────────────┘
                                    │
                                    │ 1
                                    │
                                    │ has many
                                    │
                                    │ N
                                    ▼
┌─────────────────────────────────────────────────────────────────────┐
│                              EVENTS                                  │
├─────────────────────────────────────────────────────────────────────┤
│ PK | id                  INTEGER                                     │
│    | title               VARCHAR(255)      [REQUIRED, INDEXED]      │
│    | date                DATE              [REQUIRED, INDEXED]      │
│    | start_time          VARCHAR(50)       [REQUIRED]               │
│    | duration_minutes    INTEGER           [REQUIRED]               │
│    | location            VARCHAR(255)      [REQUIRED, INDEXED]      │
│────┼─────────────────────────────────────────────────────────────────│
│    | city                VARCHAR(100)                                │
│    | state               VARCHAR(50)                                 │
│    | venue_name          VARCHAR(255)                                │
│    | description         TEXT                                        │
│    | external_url        VARCHAR(500)                                │
│    | image_url           VARCHAR(500)                                │
│    | eventbrite_id       VARCHAR(100)      [UNIQUE]                  │
│    | end_time            VARCHAR(50)                                 │
│    | timezone            VARCHAR(50)                                 │
│ FK | organization_id     INTEGER           [INDEXED]                 │
│    | created_at          DATETIME                                    │
│    | updated_at          DATETIME                                    │
└─────────────────────────────────────────────────────────────────────┘
                                    │
                                    │ N
                                    │
                                    │ many-to-many
                                    │
                                    │ N
                                    ▼
┌─────────────────────────────────────────────────────────────────────┐
│                        EVENT_RESOURCES                               │
│                     (Association Table)                              │
├─────────────────────────────────────────────────────────────────────┤
│ PK | event_id            INTEGER           [FK → events.id]         │
│ PK | resource_id         INTEGER           [FK → resources.id]      │
└─────────────────────────────────────────────────────────────────────┘
                                    │
                                    │ N
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────┐
│                            RESOURCES                                 │
├─────────────────────────────────────────────────────────────────────┤
│ PK | id                  INTEGER                                     │
│    | title               VARCHAR(500)      [REQUIRED, INDEXED]      │
│    | date_published      DATE              [REQUIRED, INDEXED]      │
│    | topic               VARCHAR(100)      [REQUIRED, INDEXED]      │
│    | scope               VARCHAR(50)       [REQUIRED, INDEXED]      │
│    | description         TEXT              [REQUIRED]               │
│────┼─────────────────────────────────────────────────────────────────│
│    | format              VARCHAR(50)                                 │
│    | court_name          VARCHAR(255)                                │
│    | citation            VARCHAR(255)                                │
│    | external_url        VARCHAR(500)                                │
│    | image_url           VARCHAR(500)                                │
│    | courtlistener_id    VARCHAR(100)      [UNIQUE]                  │
│    | docket_number       VARCHAR(100)                                │
│    | judge_name          VARCHAR(255)                                │
│    | created_at          DATETIME                                    │
│    | updated_at          DATETIME                                    │
└─────────────────────────────────────────────────────────────────────┘
                                    │
                                    │ N
                                    │
                                    │ many-to-many
                                    │
                                    │ N
                                    ▼
┌─────────────────────────────────────────────────────────────────────┐
│                   ORGANIZATION_RESOURCES                             │
│                     (Association Table)                              │
├─────────────────────────────────────────────────────────────────────┤
│ PK | organization_id     INTEGER           [FK → organizations.id]  │
│ PK | resource_id         INTEGER           [FK → resources.id]      │
└─────────────────────────────────────────────────────────────────────┘
```

## Relationships

### One-to-Many
- **Organization → Events** (one organization hosts many events)
  - Foreign Key: `events.organization_id` references `organizations.id`
  - Cascade: Delete events when organization is deleted

### Many-to-Many
- **Events ↔ Resources** (events relate to multiple resources, resources relate to multiple events)
  - Join Table: `event_resources`
  - Composite Primary Key: `(event_id, resource_id)`

- **Organizations ↔ Resources** (organizations provide multiple resources, resources can be from multiple organizations)
  - Join Table: `organization_resources`
  - Composite Primary Key: `(organization_id, resource_id)`

## Data Sources

### Events Table
**Source:** Eventbrite API
- **Endpoint:** `https://www.eventbriteapi.com/v3/events/search/`
- **Search Keywords:** immigration, citizenship, DACA, asylum, refugee, etc.
- **External ID Field:** `eventbrite_id` (stores original API ID)

### Organizations Table
**Source:** ProPublica Nonprofit Explorer API
- **Endpoint:** `https://projects.propublica.org/nonprofits/api/v2/organizations/{ein}.json`
- **Lookup Method:** By EIN (Employer Identification Number)
- **External ID Field:** `ein` (employer identification number)
- **Classification:** NTEE codes mapped to topics

### Resources Table
**Source:** CourtListener API
- **Endpoint:** `https://www.courtlistener.com/api/rest/v3/search/`
- **Search Keywords:** immigration deportation, asylum refugee, visa, etc.
- **External ID Field:** `courtlistener_id` (stores original API ID)
- **Scope Determination:** Court name → Federal/State/Local

## Indexes

Performance indexes on frequently queried fields:

**Events:**
- `title` - For searching by event name
- `date` - For filtering/sorting by date
- `location` - For location-based queries
- `organization_id` - For join performance

**Organizations:**
- `name` - For searching by organization name
- `city` - For location filtering
- `state` - For location filtering
- `topic` - For topic-based filtering

**Resources:**
- `title` - For searching by resource title
- `date_published` - For sorting by date
- `topic` - For topic-based filtering
- `scope` - For scope filtering (Federal/State/Local)

## Constraints

### Unique Constraints
- `organizations.ein` - Each organization has unique EIN
- `events.eventbrite_id` - Each event has unique Eventbrite ID
- `resources.courtlistener_id` - Each resource has unique CourtListener ID

### Required Fields (NOT NULL)
Every model has 5+ required fields as specified in project requirements:

**Events (5):**
1. `title` - Event name
2. `date` - Event date
3. `start_time` - Start time
4. `duration_minutes` - Event length
5. `location` - Location (city, state)

**Organizations (5):**
1. `name` - Organization name
2. `city` - City location
3. `state` - State location
4. `topic` - Primary focus area
5. `size` - Organization size/classification

**Resources (5):**
1. `title` - Resource title
2. `date_published` - Publication date
3. `topic` - Subject area
4. `scope` - Federal/State/Local
5. `description` - Resource description

## JSON API Response Examples

### Event with Relationships
```json
{
  "id": 1,
  "title": "Citizenship Workshop",
  "date": "2025-12-01",
  "start_time": "2:00 PM EST",
  "duration_minutes": 120,
  "location": "Austin, TX",
  "city": "Austin",
  "state": "TX",
  "organization": {
    "id": 5,
    "name": "Immigration Legal Resource Center",
    "city": "San Francisco",
    "state": "CA"
  },
  "resources": [
    {
      "id": 12,
      "title": "Citizenship Application Guide",
      "topic": "Citizenship",
      "scope": "Federal"
    }
  ]
}
```

### Organization with Relationships
```json
{
  "id": 5,
  "name": "Immigration Legal Resource Center",
  "city": "San Francisco",
  "state": "CA",
  "topic": "Immigration & Refugee Services",
  "size": "501(c)(3) Nonprofit",
  "meeting_frequency": "Weekly",
  "events": [
    {
      "id": 1,
      "title": "Citizenship Workshop",
      "date": "2025-12-01"
    }
  ],
  "resources": [
    {
      "id": 12,
      "title": "Citizenship Application Guide",
      "scope": "Federal"
    }
  ]
}
```

## Database Migrations

For production deployments with existing data:

```python
# Create all tables
flask init-db

# Or using Python
from app import app, db
with app.app_context():
    db.create_all()
```

For schema changes:
1. Update models in `models.py`
2. Consider using Flask-Migrate for production migrations
3. Or use `flask reset-db` for development (drops all data)

## Query Examples

### Get events with organizations
```python
Event.query.join(Organization).all()
```

### Get organization with all events and resources
```python
org = Organization.query.get(1)
events = org.events  # One-to-many relationship
resources = org.resources  # Many-to-many relationship
```

### Get resources used by an event
```python
event = Event.query.get(1)
resources = event.resources  # Many-to-many relationship
```

### Filter events by location
```python
Event.query.filter(Event.state == 'TX').all()
```

### Search across relationships
```python
# Get all events by organizations in California
Event.query.join(Organization).filter(Organization.state == 'CA').all()
```

## Performance Considerations

1. **Indexes** - All frequently queried fields are indexed
2. **Lazy Loading** - Relationships use lazy loading by default
3. **Pagination** - API endpoints support `limit` parameter
4. **Eager Loading** - Use `include_relationships=true` only when needed
5. **Connection Pooling** - SQLAlchemy handles connection pooling

## Scaling Notes

For production at scale:
- Consider partitioning Events table by date
- Add full-text search indexes for title/description fields
- Use database read replicas for heavy read workloads
- Cache frequently accessed organizations/resources
- Consider materialized views for complex queries
