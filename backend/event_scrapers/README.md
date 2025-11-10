# Event Scrapers

This folder contains web scrapers for fetching immigration-related events from various organization websites.

## Overview

The event scrapers fetch real immigration-related community events from nonprofit organizations. All scraped data is normalized to match the Event model schema defined in `backend/models.py`.

## Available Scrapers

### 1. RAICES Scraper (`raices_scraper.py`)
- **Organization:** RAICES Texas (Refugee and Immigrant Center for Education and Legal Services)
- **Website:** https://www.raicestexas.org/events/
- **Location:** Texas
- **Expected Events:** 20-50 events

### 2. CHIRLA Scraper (`chirla_scraper.py`)
- **Organization:** CHIRLA (Coalition for Humane Immigrant Rights)
- **Website:** https://chirla.org/events
- **Location:** California
- **Expected Events:** 20-50 events

## Installation

The scrapers require the following Python packages:

```bash
pip install requests beautifulsoup4
```

These are already included in `backend/requirements.txt`.

## Usage

### Using Individual Scrapers

```python
from event_scrapers import scrape_raices_events, scrape_chirla_events

# Scrape RAICES events
raices_events = scrape_raices_events(max_events=50)
print(f"Scraped {len(raices_events)} RAICES events")

# Scrape CHIRLA events
chirla_events = scrape_chirla_events(max_events=50)
print(f"Scraped {len(chirla_events)} CHIRLA events")
```

### Testing Individual Scrapers

Each scraper can be run standalone for testing:

```bash
cd backend
python -m event_scrapers.raices_scraper
python -m event_scrapers.chirla_scraper
```

### Using in Seed Script

The scrapers are integrated into the main seeding script (`seed_database.py`):

```python
from event_scrapers import scrape_raices_events, scrape_chirla_events

# In your seed function
events = []
events.extend(scrape_raices_events())
events.extend(scrape_chirla_events())

# Add events to database
for event_data in events:
    event = Event(**event_data)
    db.session.add(event)
```

## Data Format

Each scraper returns a list of normalized event dictionaries matching the Event model:

```python
{
    'title': 'Citizenship Workshop',
    'date': date(2025, 12, 15),  # Python date object
    'start_time': '7:00 PM CST',
    'duration_minutes': 120,
    'location': 'Austin, TX',
    'city': 'Austin',
    'state': 'Texas',
    'venue_name': 'RAICES Austin Office',
    'description': 'Free citizenship application assistance...',
    'external_url': 'https://www.raicestexas.org/events/...',
    'image_url': 'https://www.raicestexas.org/images/...',
    'timezone': 'CST'
}
```

## Utility Functions

The `utils.py` module provides helper functions:

- `normalize_event_data(scraped_data)`: Normalizes raw scraped data to Event model format
- `parse_date(date_string)`: Parses various date formats into Python date objects
- `parse_location(location_string)`: Extracts city and state from location strings
- `parse_time(time_string)`: Parses time strings into formatted start times
- `parse_duration(time_range)`: Calculates event duration from time ranges
- `clean_description(description)`: Cleans and truncates description text
- `validate_event_data(event_data)`: Validates that all required fields are present

## Schema Compatibility

All scrapers are designed to work with the existing Event model schema **without requiring any database migrations**. The scrapers output data that matches these required fields:

- `title` (required)
- `date` (required)
- `start_time` (required)
- `duration_minutes` (required)
- `location` (required)

And optional fields:
- `city`, `state`, `venue_name`, `description`, `external_url`, `image_url`, `timezone`

## Error Handling

The scrapers include robust error handling:
- Network errors are caught and logged
- Missing fields are filled with sensible defaults
- Invalid dates/times are handled gracefully
- Each event is parsed independently (one failure doesn't stop the entire scrape)

## Adding New Scrapers

To add a new organization scraper:

1. Create a new file: `backend/event_scrapers/[org_name]_scraper.py`
2. Implement a `scrape_[org_name]_events(max_events=50)` function
3. Use the utility functions from `utils.py` for normalization
4. Add the scraper to `__init__.py`:
   ```python
   from .[org_name]_scraper import scrape_[org_name]_events

   __all__ = [
       # ... existing scrapers
       'scrape_[org_name]_events'
   ]
   ```
5. Test the scraper standalone before integrating

## Troubleshooting

### No Events Found
If a scraper returns 0 events:
- The website structure may have changed
- The website may be blocking automated requests
- Check the HTML structure manually and update selectors

### Date Parsing Errors
If dates aren't parsing correctly:
- Add the date format to `parse_date()` in `utils.py`
- Ensure the regex patterns match the actual date format on the page

### Missing Data
If some fields are frequently missing:
- Check if the HTML structure is different than expected
- Update the element selectors in the parse function
- Ensure defaults are set for optional fields

## Notes

- **Respectful Scraping:** The scrapers include delays and proper User-Agent headers to be respectful to the target websites
- **Dynamic Content:** Some websites use JavaScript to load events. If needed, consider using Selenium or Playwright for JavaScript-rendered content
- **Rate Limiting:** Be mindful of request frequency to avoid overloading organization websites
- **Data Freshness:** Scraped data should be refreshed periodically as events are time-sensitive

## Future Enhancements

Potential improvements for future phases:
- Add more organization scrapers (Make the Road NY, CASA, etc.)
- Implement caching to avoid re-scraping unchanged data
- Add Selenium support for JavaScript-heavy sites
- Create automated scraping schedule
- Add data validation and duplicate detection
- Implement retry logic for failed requests
