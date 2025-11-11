"""
RAICES Event Scraper

Scrapes immigration-related events from RAICES Texas website.
RAICES (Refugee and Immigrant Center for Education and Legal Services)
is a nonprofit agency that promotes justice for immigrants and refugees.

Website: https://www.raicestexas.org/events/
"""

import requests
from bs4 import BeautifulSoup
from datetime import datetime
import re
from .utils import normalize_event_data, parse_date, parse_time, clean_description


def scrape_raices_events(max_events=50):
    """
    Scrape events from RAICES Texas website

    Args:
        max_events (int): Maximum number of events to scrape (default: 50)

    Returns:
        list: List of normalized event dictionaries
    """
    print("[RAICES Scraper] Starting to scrape events...")

    url = "https://www.raicestexas.org/events/"
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
    }

    try:
        response = requests.get(url, headers=headers, timeout=10)
        response.raise_for_status()
    except requests.RequestException as e:
        print(f"[RAICES Scraper] Error fetching page: {e}")
        return []

    soup = BeautifulSoup(response.content, 'html.parser')
    events = []

    # RAICES uses Squarespace event system
    # Look for event items in the page
    event_items = soup.find_all('article', class_='eventlist-event') or \
                  soup.find_all('div', class_='eventlist-event') or \
                  soup.find_all('li', class_='eventlist-event')

    if not event_items:
        print(f"[RAICES Scraper] No events found. Page structure may have changed.")
        print(f"[RAICES Scraper] Attempting alternative selectors...")

        # Try alternative selectors
        event_items = soup.find_all('div', class_=re.compile(r'event|Event')) or \
                      soup.find_all('article', class_=re.compile(r'event|Event'))

    print(f"[RAICES Scraper] Found {len(event_items)} potential event items")

    for idx, item in enumerate(event_items[:max_events]):
        try:
            event_data = parse_raices_event(item)
            if event_data:
                normalized = normalize_event_data(event_data)
                events.append(normalized)
                print(f"[RAICES Scraper] Scraped event {idx + 1}: {normalized['title']}")
        except Exception as e:
            print(f"[RAICES Scraper] Error parsing event {idx + 1}: {e}")
            continue

    print(f"[RAICES Scraper] Successfully scraped {len(events)} events")
    return events


def parse_raices_event(event_item):
    """
    Parse individual RAICES event item

    Args:
        event_item: BeautifulSoup element containing event data

    Returns:
        dict: Extracted event data
    """
    event_data = {}

    # Extract title
    title_elem = event_item.find('h1', class_='eventlist-title') or \
                 event_item.find('h2', class_='eventlist-title') or \
                 event_item.find('a', class_='eventlist-title-link') or \
                 event_item.find(class_=re.compile(r'title|Title'))

    if title_elem:
        event_data['title'] = title_elem.get_text(strip=True)
    else:
        return None  # Skip if no title found

    # Extract date
    date_elem = event_item.find('time', class_='event-date') or \
                event_item.find(class_=re.compile(r'date|Date')) or \
                event_item.find('time')

    if date_elem:
        # Try to get datetime attribute first
        date_str = date_elem.get('datetime') or date_elem.get_text(strip=True)
        event_data['date'] = date_str
    else:
        # Try to find date in text
        text = event_item.get_text()
        date_match = re.search(r'(\w+ \d{1,2},? \d{4})', text)
        if date_match:
            event_data['date'] = date_match.group(1)

    # Extract time
    time_elem = event_item.find('time', class_='event-time') or \
                event_item.find(class_=re.compile(r'time|Time'))

    if time_elem:
        time_text = time_elem.get_text(strip=True)
        event_data['start_time'] = parse_time(time_text)

        # Try to extract duration from time range
        if '-' in time_text:
            try:
                from .utils import parse_duration
                event_data['duration_minutes'] = parse_duration(time_text)
            except:
                event_data['duration_minutes'] = 120

    # Extract location
    location_elem = event_item.find(class_=re.compile(r'location|Location|venue|Venue'))
    if location_elem:
        location_text = location_elem.get_text(strip=True)
        event_data['location'] = location_text

        # Try to extract city/state
        if ',' in location_text:
            parts = location_text.split(',')
            if len(parts) >= 2:
                event_data['city'] = parts[-2].strip()
                event_data['state'] = parts[-1].strip()

    # If no specific location found, default to RAICES main locations
    if not event_data.get('location'):
        event_data['location'] = 'Texas'
        event_data['state'] = 'Texas'

    # Extract description
    desc_elem = event_item.find('div', class_='eventlist-description') or \
                event_item.find(class_=re.compile(r'description|Description|excerpt'))

    if desc_elem:
        event_data['description'] = clean_description(desc_elem.get_text(strip=True))
    else:
        event_data['description'] = f"Event hosted by RAICES Texas"

    # Extract event URL
    link_elem = event_item.find('a', href=True)
    if link_elem:
        href = link_elem['href']
        if href.startswith('/'):
            event_data['external_url'] = f"https://www.raicestexas.org{href}"
        elif href.startswith('http'):
            event_data['external_url'] = href
        else:
            event_data['external_url'] = f"https://www.raicestexas.org/events/{href}"

    # Extract image
    img_elem = event_item.find('img')
    if img_elem:
        img_src = img_elem.get('src') or img_elem.get('data-src')
        if img_src:
            if img_src.startswith('//'):
                event_data['image_url'] = f"https:{img_src}"
            elif img_src.startswith('/'):
                event_data['image_url'] = f"https://www.raicestexas.org{img_src}"
            else:
                event_data['image_url'] = img_src

    # Set timezone (RAICES is in Texas)
    event_data['timezone'] = 'CST'

    return event_data


if __name__ == '__main__':
    # Test the scraper
    print("Testing RAICES Event Scraper...")
    events = scrape_raices_events(max_events=10)

    print(f"\n{'='*60}")
    print(f"Total events scraped: {len(events)}")
    print(f"{'='*60}\n")

    for i, event in enumerate(events[:3], 1):
        print(f"Event {i}:")
        print(f"  Title: {event['title']}")
        print(f"  Date: {event['date']}")
        print(f"  Time: {event['start_time']}")
        print(f"  Location: {event['location']}")
        print(f"  URL: {event.get('external_url', 'N/A')}")
        print()
