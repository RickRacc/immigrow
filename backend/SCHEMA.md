# Database Schema - Immigrow Phase 2

This document describes the database schema for the Immigrow project. Use this to create UML diagrams and understand the data model.

## Overview

- **Database:** PostgreSQL (AWS RDS)
- **3 Main Tables:** Event, Organization, Resource
- **2 Junction Tables:** event_resources, organization_resources
- **Total Instances:** ~150 (40-50 events, 57 organizations, 57 resources)
- **Media Requirement:** Each instance has 2+ forms of media (images, PDFs, audio, external links)

## Media Requirements

Each model instance must have at least **2 forms of media** to provide rich, diverse content:

### Event Media (2 forms required)
1. **external_url** - Link to event registration/info page (REQUIRED)
2. **image_url** - Event banner/promotional image (REQUIRED)

### Organization Media (2 forms required)
1. **external_url** - Link to ProPublica organization page (REQUIRED)
2. **form_990_pdf_url** - IRS Form 990 tax filing PDF (REQUIRED - fetched from ProPublica API)

**Optional:** guidestar_url, image_url

### Resource Media (2 forms required)
1. **external_url** - Link to CourtListener case page (REQUIRED)
2. **audio_url** - Oral argument audio or opinion PDF download URL (REQUIRED - extracted from CourtListener API)

**Optional:** image_url

## Tables

### 1. Event Table

**Purpose:** Stores immigration-related community events (workshops, legal clinics, etc.)

**Table Name:** `event`

| Column Name       | Data Type    | Constraints                    | Description                         |
|-------------------|--------------|--------------------------------|-------------------------------------|
| id                | INTEGER      | PRIMARY KEY, AUTO INCREMENT    | Unique identifier                   |
| title             | VARCHAR(255) | NOT NULL                       | Event name                          |
| date              | DATE         | NOT NULL                       | Event date                          |
| start_time        | VARCHAR(50)  | NOT NULL                       | Event start time                    |
| end_time          | VARCHAR(50)  | NULL                           | Event end time                      |
| duration_minutes  | INTEGER      | NOT NULL                       | Event duration in minutes           |
| location          | VARCHAR(255) | NOT NULL                       | Full location (City, State)         |
| city              | VARCHAR(100) | NULL                           | City name                           |
| state             | VARCHAR(50)  | NULL                           | State abbreviation                  |
| venue_name        | VARCHAR(255) | NULL                           | Venue/location name                 |
| description       | TEXT         | NULL                           | Event description                   |
| external_url      | VARCHAR(500) | NULL                           | Link to event registration/info     |
| image_url         | VARCHAR(500) | NULL                           | Event image URL                     |
| eventbrite_id     | VARCHAR(100) | NULL                           | Eventbrite event ID                 |
| timezone          | VARCHAR(50)  | NULL                           | Timezone (e.g., "America/New_York") |
| organization_id   | INTEGER      | FOREIGN KEY -> organization(id)| Host organization                   |
| created_at        | DATETIME     | NULL                           | Record creation timestamp           |
| updated_at        | DATETIME     | NULL                           | Record update timestamp             |

**Relationships:**
- **Belongs to ONE Organization** (Many-to-One via `organization_id` foreign key)
- **Has MANY Resources** (Many-to-Many via `event_resources` junction table)

**Example Data:**
```json
{
  "id": 1,
  "title": "Citizenship Workshop",
  "date": "2025-11-16",
  "start_time": "2:00 PM EST",
  "duration_minutes": 120,
  "location": "Austin, TX",
  "city": "Austin",
  "state": "TX",
  "venue_name": "Community Center",
  "description": "Free citizenship application assistance",
  "organization_id": 7
}
```

---

### 2. Organization Table

**Purpose:** Stores nonprofit organizations providing immigration services

**Table Name:** `organization`

| Column Name       | Data Type    | Constraints                 | Description                                      |
|-------------------|--------------|-----------------------------|-------------------------------------------------|
| id                | INTEGER      | PRIMARY KEY, AUTO INCREMENT | Unique identifier                               |
| name              | VARCHAR(255) | NOT NULL                    | Organization name                               |
| city              | VARCHAR(100) | NOT NULL                    | City location                                   |
| state             | VARCHAR(50)  | NOT NULL                    | State location                                  |
| topic             | VARCHAR(100) | NOT NULL                    | Primary focus area                              |
| size              | VARCHAR(50)  | NOT NULL                    | Organization size/type                          |
| meeting_frequency | VARCHAR(50)  | NULL                        | How often they meet                             |
| description       | TEXT         | NULL                        | Organization description                        |
| address           | VARCHAR(255) | NULL                        | Street address                                  |
| zipcode           | VARCHAR(20)  | NULL                        | Zip code                                        |
| ein               | VARCHAR(20)  | NULL                        | Employer Identification Number (Tax ID)         |
| subsection_code   | VARCHAR(20)  | NULL                        | IRS subsection code (e.g., "501(c)(3)")         |
| ntee_code         | VARCHAR(20)  | NULL                        | National Taxonomy of Exempt Entities code       |
| external_url      | VARCHAR(500) | NULL                        | Organization website                            |
| image_url         | VARCHAR(500) | NULL                        | Organization logo/image                         |
| guidestar_url     | VARCHAR(500) | NULL                        | GuideStar profile URL                           |
| form_990_pdf_url  | VARCHAR(500) | NULL                        | IRS Form 990 tax filing PDF URL (Media #2)      |
| created_at        | DATETIME     | NULL                        | Record creation timestamp                       |
| updated_at        | DATETIME     | NULL                        | Record update timestamp                         |

**Relationships:**
- **Has MANY Events** (One-to-Many, reverse of Event.organization)
- **Has MANY Resources** (Many-to-Many via `organization_resources` junction table)

**Example Data:**
```json
{
  "id": 1,
  "name": "Immigration Legal Services",
  "city": "Dearborn",
  "state": "MI",
  "topic": "Legal Services",
  "size": "501(c)(3) Nonprofit",
  "ein": "931497334",
  "ntee_code": "Q30",
  "subsection_code": "501(c)(3)"
}
```

---

### 3. Resource Table

**Purpose:** Stores legal resources and court cases related to immigration law

**Table Name:** `resource`

| Column Name      | Data Type    | Constraints                 | Description                                |
|------------------|--------------|-----------------------------|--------------------------------------------|
| id               | INTEGER      | PRIMARY KEY, AUTO INCREMENT | Unique identifier                          |
| title            | VARCHAR(500) | NOT NULL                    | Resource/case title                        |
| date_published   | DATE         | NOT NULL                    | Publication date                           |
| topic            | VARCHAR(100) | NOT NULL                    | Subject area                               |
| scope            | VARCHAR(50)  | NOT NULL                    | Federal/State/Local                        |
| description      | TEXT         | NOT NULL                    | Resource description                       |
| format           | VARCHAR(50)  | NULL                        | Resource format (e.g., "Court Opinion")    |
| court_name       | VARCHAR(255) | NULL                        | Court name (for legal cases)               |
| citation         | VARCHAR(255) | NULL                        | Legal citation                             |
| external_url     | VARCHAR(500) | NULL                        | Link to resource                           |
| image_url        | VARCHAR(500) | NULL                        | Resource image                             |
| audio_url        | VARCHAR(500) | NULL                        | Oral argument audio or PDF URL (Media #2)  |
| courtlistener_id | VARCHAR(100) | NULL                        | CourtListener cluster ID                   |
| docket_number    | VARCHAR(100) | NULL                        | Court docket number                        |
| judge_name       | VARCHAR(255) | NULL                        | Judge name                                 |
| created_at       | DATETIME     | NULL                        | Record creation timestamp                  |
| updated_at       | DATETIME     | NULL                        | Record update timestamp                    |

**Relationships:**
- **Has MANY Events** (Many-to-Many via `event_resources` junction table)
- **Has MANY Organizations** (Many-to-Many via `organization_resources` junction table)

**Example Data:**
```json
{
  "id": 1,
  "title": "Calderon-Uresti v. Bondi",
  "date_published": "2025-11-06",
  "topic": "Immigration Law",
  "scope": "Federal",
  "description": "Court opinion regarding deportation proceedings",
  "format": "Court Opinion",
  "court_name": "Court of Appeals for the Fifth Circuit",
  "docket_number": "24-60445",
  "courtlistener_id": "10732068"
}
```

---

### 4. event_resources Table (Junction Table)

**Purpose:** Many-to-Many relationship between Events and Resources

**Table Name:** `event_resources`

| Column Name | Data Type | Constraints                                        | Description        |
|-------------|-----------|----------------------------------------------------|--------------------|
| event_id    | INTEGER   | FOREIGN KEY -> event(id), PRIMARY KEY (composite)  | Event reference    |
| resource_id | INTEGER   | FOREIGN KEY -> resource(id), PRIMARY KEY (composite) | Resource reference |

**Relationship:**
- Links Events to Resources
- An Event can have many Resources
- A Resource can be linked to many Events

**Example Data:**
```
event_id | resource_id
---------|------------
1        | 12
1        | 15
2        | 12
2        | 18
3        | 15
```

---

### 5. organization_resources Table (Junction Table)

**Purpose:** Many-to-Many relationship between Organizations and Resources

**Table Name:** `organization_resources`

| Column Name     | Data Type | Constraints                                              | Description            |
|-----------------|-----------|----------------------------------------------------------|------------------------|
| organization_id | INTEGER   | FOREIGN KEY -> organization(id), PRIMARY KEY (composite) | Organization reference |
| resource_id     | INTEGER   | FOREIGN KEY -> resource(id), PRIMARY KEY (composite)     | Resource reference     |

**Relationship:**
- Links Organizations to Resources
- An Organization can have many Resources
- A Resource can be linked to many Organizations

**Example Data:**
```
organization_id | resource_id
----------------|------------
1               | 12
1               | 15
1               | 18
2               | 12
2               | 19
```

---

## Relationships Summary

### 1. Event → Organization (Many-to-One)
- **Type:** Foreign Key Relationship
- **Implementation:** `event.organization_id` references `organization.id`
- **Cardinality:** Many Events can belong to One Organization
- **SQL:** One Organization can host many Events

```
Event.organization_id -> Organization.id
```

### 2. Event ↔ Resources (Many-to-Many)
- **Type:** Junction Table
- **Implementation:** `event_resources` table
- **Cardinality:** Many Events can have Many Resources
- **SQL:** Events and Resources are linked through event_resources

```
Event -< event_resources >- Resource
```

### 3. Organization ↔ Resources (Many-to-Many)
- **Type:** Junction Table
- **Implementation:** `organization_resources` table
- **Cardinality:** Many Organizations can have Many Resources
- **SQL:** Organizations and Resources are linked through organization_resources

```
Organization -< organization_resources >- Resource
```

---

## UML Diagram Guidelines

When creating the UML diagram, show:

### Classes (Tables):
1. **Event** - 18 attributes (includes external_url, image_url)
2. **Organization** - 19 attributes (includes external_url, form_990_pdf_url)
3. **Resource** - 17 attributes (includes external_url, audio_url)

### Relationships:
1. **Organization → Event**
   - Type: One-to-Many
   - Organization side: `1`
   - Event side: `*` (many)
   - Arrow from Event to Organization (Event has organization_id)

2. **Event ↔ Resource**
   - Type: Many-to-Many
   - Both sides: `*` (many)
   - Diamond in the middle representing junction table

3. **Organization ↔ Resource**
   - Type: Many-to-Many
   - Both sides: `*` (many)
   - Diamond in the middle representing junction table

### Example UML Notation:

```
┌──────────────────┐
│   Organization   │
├──────────────────┤
│ - id: int (PK)   │
│ - name: string   │
│ - city: string   │
│ - state: string  │
│ - topic: string  │
│ - ...            │
└──────────────────┘
        │ 1
        │
        │ hosts
        │
        │ *
┌──────────────────┐              ┌──────────────────┐
│      Event       │──────────────│    Resource      │
├──────────────────┤    many-to   ├──────────────────┤
│ - id: int (PK)   │     many     │ - id: int (PK)   │
│ - title: string  │◇────────────◇│ - title: string  │
│ - date: date     │              │ - topic: string  │
│ - location: str  │              │ - scope: string  │
│ - org_id: int(FK)│              │ - ...            │
│ - ...            │              │                  │
└──────────────────┘              └──────────────────┘
        │                                  │
        │ *                                │ *
        │                                  │
        │ relates to                       │ relates to
        │                                  │
        └──────────────────────────────────┘
              event_resources (junction)
           organization_resources (junction)
```

---

## Data Sources

| Table | Source | Type | Authentication |
|-------|--------|------|----------------|
| Organization | ProPublica Nonprofit Explorer | REST API | None (public) |
| Resource | CourtListener V4 | REST API | Token required |
| Event | Sample data | Hardcoded | N/A (temporary) |

---

## Constraints & Business Rules

1. **All instances must have 2+ connections**
   - Events: 1 organization + 2-3 resources = 3-4 total
   - Organizations: 1+ events + 2-3 resources = 3-4+ total
   - Resources: 1-3 events + 1-3 organizations = 2-6 total

2. **Required fields:**
   - All 3 models have 5+ required (NOT NULL) attributes
   - Foreign keys can be NULL (organization_id in Event)

3. **Data integrity:**
   - All foreign keys reference valid IDs
   - Junction tables prevent orphaned relationships
   - Timestamps auto-populate on create/update

4. **String length limits:**
   - Short strings: VARCHAR(50-100)
   - Medium strings: VARCHAR(255-500)
   - Long text: TEXT (unlimited)

---

## SQL Schema (Reference)

```sql
-- Main tables
CREATE TABLE organization (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    city VARCHAR(100) NOT NULL,
    state VARCHAR(50) NOT NULL,
    topic VARCHAR(100) NOT NULL,
    size VARCHAR(50) NOT NULL,
    -- ... other fields
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);

CREATE TABLE event (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    date DATE NOT NULL,
    start_time VARCHAR(50) NOT NULL,
    duration_minutes INTEGER NOT NULL,
    location VARCHAR(255) NOT NULL,
    -- ... other fields
    organization_id INTEGER REFERENCES organization(id),
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);

CREATE TABLE resource (
    id SERIAL PRIMARY KEY,
    title VARCHAR(500) NOT NULL,
    date_published DATE NOT NULL,
    topic VARCHAR(100) NOT NULL,
    scope VARCHAR(50) NOT NULL,
    description TEXT NOT NULL,
    -- ... other fields
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);

-- Junction tables
CREATE TABLE event_resources (
    event_id INTEGER REFERENCES event(id),
    resource_id INTEGER REFERENCES resource(id),
    PRIMARY KEY (event_id, resource_id)
);

CREATE TABLE organization_resources (
    organization_id INTEGER REFERENCES organization(id),
    resource_id INTEGER REFERENCES resource(id),
    PRIMARY KEY (organization_id, resource_id)
);
```

---

## Notes for UML Diagram

- Use proper UML notation for relationships (1, *, 0..1, etc.)
- Show primary keys (PK) and foreign keys (FK)
- Indicate NOT NULL constraints
- Can abbreviate attribute lists ("..." for remaining attributes)
- Junction tables can be shown as diamonds or separate classes
- Use different colors for different model types if helpful
- Include cardinality on both ends of relationships

---

## Questions?

If you need clarification on any part of the schema:
1. Check `backend/models.py` for the actual SQLAlchemy model definitions
2. Run `python verify_database_tables.py` to see the actual database structure
3. Check `backend/SETUP.md` for API endpoints and usage examples
