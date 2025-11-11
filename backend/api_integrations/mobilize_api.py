"""
Mobilize America API Integration

Fetches progressive activism events from Mobilize America API,
filtering for immigration-related events.

API Documentation: https://github.com/mobilizeamerica/api
"""

import requests
from datetime import datetime, date
import time


BASE_URL = "https://api.mobilize.us/v1"

# Keywords to identify immigration-related events
IMMIGRATION_KEYWORDS = [
    "immigration", "immigrant", "refugee", "asylum", "daca",
    "citizenship", "deportation", "ice", "border", "undocumented",
    "visa", "green card", "naturalization", "migrant"
]


def fetch_mobilize_events(max_events=100, immigration_only=True):
    """
    Fetch events from Mobilize America API

    Args:
        max_events (int): Maximum number of events to fetch
        immigration_only (bool): Only return immigration-related events

    Returns:
        list: List of event dictionaries matching Event model schema
    """
    print("[Mobilize API] Starting to fetch events...")

    all_events = []
    page = 1  # Mobilize API pages start at 1
    per_page = 25

    while len(all_events) < max_events:
        try:
            # Fetch events from API
            response = requests.get(
                f"{BASE_URL}/events",
                params={
                    "per_page": per_page,
                    "page": page,
                    "timeslot_start": "gte_now"  # Only future events
                },
                timeout=10
            )

            if response.status_code != 200:
                print(f"[Mobilize API] Error: Status {response.status_code}")
                print(f"[Mobilize API] Response: {response.text[:500]}")
                break

            data = response.json()

            if 'data' not in data or not data['data']:
                print(f"[Mobilize API] No more events found")
                break

            events = data['data']
            print(f"[Mobilize API] Fetched page {page}, got {len(events)} events")

            for event in events:
                # Filter for immigration-related events if required
                if immigration_only:
                    if not is_immigration_related(event):
                        continue

                # Transform to Event model schema
                transformed = transform_mobilize_event(event)
                if transformed:
                    all_events.append(transformed)
                    print(f"[Mobilize API] Added event: {transformed['title']}")

                if len(all_events) >= max_events:
                    break

            page += 1

            # Rate limiting - API allows 15 req/s
            time.sleep(0.1)

        except Exception as e:
            print(f"[Mobilize API] Error fetching page {page}: {e}")
            break

    print(f"[Mobilize API] Successfully fetched {len(all_events)} events")
    return all_events


def is_immigration_related(event):
    """
    Check if event is immigration-related based on keywords

    Args:
        event (dict): Mobilize event data

    Returns:
        bool: True if immigration-related
    """
    title = event.get('title', '').lower()
    description = event.get('description', '').lower()
    summary = event.get('summary', '').lower()

    # Check if any immigration keyword is in title, description, or summary
    for keyword in IMMIGRATION_KEYWORDS:
        if keyword in title or keyword in description or keyword in summary:
            return True

    return False


def transform_mobilize_event(event):
    """
    Transform Mobilize event data to match Event model schema

    Args:
        event (dict): Raw Mobilize event data

    Returns:
        dict: Transformed event data matching Event model
    """
    try:
        # Extract basic info
        title = event.get('title', 'Untitled Event')
        description = event.get('description', '')

        # Extract timeslot info
        if not event.get('timeslots') or len(event['timeslots']) == 0:
            return None  # Skip events without timeslots

        timeslot = event['timeslots'][0]  # Use first timeslot
        start_timestamp = timeslot.get('start_date')
        end_timestamp = timeslot.get('end_date')

        if not start_timestamp:
            return None

        # Convert Unix timestamp to date and time
        start_dt = datetime.fromtimestamp(start_timestamp)
        event_date = start_dt.date()
        start_time = start_dt.strftime('%I:%M %p')

        # Calculate duration
        duration_minutes = 120  # Default 2 hours
        if end_timestamp:
            end_dt = datetime.fromtimestamp(end_timestamp)
            duration_minutes = int((end_dt - start_dt).total_seconds() / 60)

        # Extract location info
        location_data = event.get('location', {})
        city = location_data.get('locality', 'Virtual')
        state = location_data.get('region', 'Online')
        venue = location_data.get('venue', '')

        # Build location string
        if city and state:
            location = f"{city}, {state}"
        else:
            location = "Virtual Event"

        # Get timezone (assume EST for now, Mobilize doesn't provide this)
        timezone = 'EST'
        if state:
            # Basic timezone mapping
            west_coast_states = ['CA', 'OR', 'WA', 'NV']
            mountain_states = ['CO', 'AZ', 'UT', 'NM', 'MT', 'WY', 'ID']
            central_states = ['TX', 'IL', 'MO', 'MN', 'WI', 'LA', 'OK', 'KS', 'NE', 'SD', 'ND']

            if state in west_coast_states:
                timezone = 'PST'
            elif state in mountain_states:
                timezone = 'MST'
            elif state in central_states:
                timezone = 'CST'

        # Build event URL
        event_id = event.get('id')
        browser_url = event.get('browser_url')
        external_url = browser_url if browser_url else f"https://www.mobilize.us/event/{event_id}/"

        # Get image
        image_url = event.get('featured_image_url')

        # Get organization info
        sponsor = event.get('sponsor', {})
        org_name = sponsor.get('name', 'Unknown Organization')

        # Build transformed event
        transformed_event = {
            'title': title,
            'date': event_date,
            'start_time': start_time,
            'duration_minutes': duration_minutes,
            'location': location,
            'city': city,
            'state': state,
            'venue_name': venue,
            'description': clean_description(description),
            'external_url': external_url,
            'image_url': image_url,
            'timezone': timezone,
            'end_time': end_dt.strftime('%I:%M %p') if end_timestamp else None,
            # Store mobilize-specific data for reference
            'mobilize_id': event_id,
            'mobilize_org_name': org_name,
            'event_type': event.get('event_type', 'MEETING')
        }

        return transformed_event

    except Exception as e:
        print(f"[Mobilize API] Error transforming event: {e}")
        return None


def clean_description(description):
    """Clean and truncate description"""
    if not description:
        return ''

    # Remove excessive whitespace
    description = ' '.join(description.split())

    # Truncate if too long
    if len(description) > 1000:
        description = description[:997] + '...'

    return description


if __name__ == '__main__':
    # Test the integration
    print("Testing Mobilize API Integration...")
    events = fetch_mobilize_events(max_events=20, immigration_only=True)

    print(f"\n{'='*70}")
    print(f"Total immigration events fetched: {len(events)}")
    print(f"{'='*70}\n")

    for i, event in enumerate(events[:5], 1):
        print(f"{i}. {event['title']}")
        print(f"   Date: {event['date']}")
        print(f"   Time: {event['start_time']}")
        print(f"   Location: {event['location']}")
        print(f"   Organization: {event.get('mobilize_org_name', 'N/A')}")
        print(f"   URL: {event['external_url']}")
        print()
