"""
CHIRLA Event Scraper

Scrapes immigration-related events from CHIRLA (Coalition for Humane Immigrant Rights)
CHIRLA is California's leading immigrant rights organization.

Website: https://chirla.org/events
"""

import requests
from bs4 import BeautifulSoup
from datetime import datetime
import re
from .utils import normalize_event_data, parse_date, parse_time, clean_description


def scrape_chirla_events(max_events=50):
    """
    Scrape events from CHIRLA website

    Args:
        max_events (int): Maximum number of events to scrape (default: 50)

    Returns:
        list: List of normalized event dictionaries
    """
    print("[CHIRLA Scraper] Starting to scrape events...")

    url = "https://chirla.org/events"
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
    }

    try:
        response = requests.get(url, headers=headers, timeout=10)
        response.raise_for_status()
    except requests.RequestException as e:
        print(f"[CHIRLA Scraper] Error fetching page: {e}")
        return []

    soup = BeautifulSoup(response.content, 'html.parser')
    events = []

    # Look for event items - CHIRLA may use various selectors
    event_items = soup.find_all('div', class_=re.compile(r'event|Event')) or \
                  soup.find_all('article', class_=re.compile(r'event|Event')) or \
                  soup.find_all('li', class_=re.compile(r'event|Event'))

    # Also try common event listing patterns
    if not event_items:
        event_items = soup.find_all('div', class_='post') or \
                      soup.find_all('div', class_='item') or \
                      soup.find_all('article')

    print(f"[CHIRLA Scraper] Found {len(event_items)} potential event items")

    for idx, item in enumerate(event_items[:max_events]):
        try:
            event_data = parse_chirla_event(item)
            if event_data:
                normalized = normalize_event_data(event_data)
                events.append(normalized)
                print(f"[CHIRLA Scraper] Scraped event {idx + 1}: {normalized['title']}")
        except Exception as e:
            print(f"[CHIRLA Scraper] Error parsing event {idx + 1}: {e}")
            continue

    print(f"[CHIRLA Scraper] Successfully scraped {len(events)} events")
    return events


def parse_chirla_event(event_item):
    """
    Parse individual CHIRLA event item

    Args:
        event_item: BeautifulSoup element containing event data

    Returns:
        dict: Extracted event data
    """
    event_data = {}

    # Extract title
    title_elem = event_item.find('h2') or \
                 event_item.find('h3') or \
                 event_item.find('h1') or \
                 event_item.find(class_=re.compile(r'title|Title|heading|Heading'))

    if title_elem:
        event_data['title'] = title_elem.get_text(strip=True)
    else:
        return None  # Skip if no title found

    # Extract date
    date_elem = event_item.find('time') or \
                event_item.find(class_=re.compile(r'date|Date'))

    if date_elem:
        date_str = date_elem.get('datetime') or date_elem.get_text(strip=True)
        event_data['date'] = date_str
    else:
        # Try to find date pattern in text
        text = event_item.get_text()
        date_patterns = [
            r'(\w+ \d{1,2},? \d{4})',  # January 15, 2025
            r'(\d{1,2}/\d{1,2}/\d{4})',  # 01/15/2025
        ]
        for pattern in date_patterns:
            date_match = re.search(pattern, text)
            if date_match:
                event_data['date'] = date_match.group(1)
                break

    # Extract time
    time_elem = event_item.find(class_=re.compile(r'time|Time'))
    if time_elem:
        time_text = time_elem.get_text(strip=True)
        event_data['start_time'] = parse_time(time_text)

        # Extract duration if time range provided
        if '-' in time_text:
            try:
                from .utils import parse_duration
                event_data['duration_minutes'] = parse_duration(time_text)
            except:
                event_data['duration_minutes'] = 120
    else:
        # Look for time pattern in text
        text = event_item.get_text()
        time_match = re.search(r'(\d{1,2}:\d{2}\s*[AP]M)', text, re.IGNORECASE)
        if time_match:
            event_data['start_time'] = time_match.group(1)

    # Extract location
    location_elem = event_item.find(class_=re.compile(r'location|Location|venue|Venue|address|Address'))
    if location_elem:
        location_text = location_elem.get_text(strip=True)
        event_data['location'] = location_text

        # Extract city/state from location
        if ',' in location_text:
            parts = [p.strip() for p in location_text.split(',')]
            if len(parts) >= 2:
                event_data['city'] = parts[-2]
                event_data['state'] = parts[-1]

    # Default to California if no location found (CHIRLA is CA-based)
    if not event_data.get('location'):
        event_data['location'] = 'Los Angeles, CA'
        event_data['city'] = 'Los Angeles'
        event_data['state'] = 'California'

    # Extract description
    desc_elem = event_item.find('div', class_=re.compile(r'description|Description|content|Content|excerpt|Excerpt')) or \
                event_item.find('p')

    if desc_elem:
        event_data['description'] = clean_description(desc_elem.get_text(strip=True))
    else:
        event_data['description'] = f"Event hosted by CHIRLA (Coalition for Humane Immigrant Rights)"

    # Extract event URL
    link_elem = event_item.find('a', href=True)
    if link_elem:
        href = link_elem['href']
        if href.startswith('/'):
            event_data['external_url'] = f"https://chirla.org{href}"
        elif href.startswith('http'):
            event_data['external_url'] = href
        else:
            event_data['external_url'] = f"https://chirla.org/events/{href}"

    # Extract image
    img_elem = event_item.find('img')
    if img_elem:
        img_src = img_elem.get('src') or img_elem.get('data-src')
        if img_src:
            if img_src.startswith('//'):
                event_data['image_url'] = f"https:{img_src}"
            elif img_src.startswith('/'):
                event_data['image_url'] = f"https://chirla.org{img_src}"
            elif img_src.startswith('http'):
                event_data['image_url'] = img_src

    # Set timezone (CHIRLA is in California)
    event_data['timezone'] = 'PST'

    return event_data


if __name__ == '__main__':
    # Test the scraper
    print("Testing CHIRLA Event Scraper...")
    events = scrape_chirla_events(max_events=10)

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
