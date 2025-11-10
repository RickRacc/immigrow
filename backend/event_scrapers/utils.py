"""
Utility functions for event scrapers

Provides helper functions for normalizing, parsing, and transforming
scraped event data to match the Event model schema.
"""

from datetime import datetime, date
import re


def normalize_event_data(scraped_data):
    """
    Normalize scraped event data to match Event model schema

    Args:
        scraped_data (dict): Raw scraped event data

    Returns:
        dict: Normalized event data ready for database insertion
    """
    normalized = {
        'title': scraped_data.get('title', 'Untitled Event'),
        'date': parse_date(scraped_data.get('date')),
        'start_time': scraped_data.get('start_time', 'TBD'),
        'duration_minutes': scraped_data.get('duration_minutes', 120),  # Default 2 hours
        'location': scraped_data.get('location', 'TBD'),
        'city': scraped_data.get('city'),
        'state': scraped_data.get('state'),
        'venue_name': scraped_data.get('venue_name'),
        'description': scraped_data.get('description', ''),
        'external_url': scraped_data.get('external_url'),
        'image_url': scraped_data.get('image_url'),
        'end_time': scraped_data.get('end_time'),
        'timezone': scraped_data.get('timezone', 'CST'),
    }

    # Parse city/state from location if not provided separately
    if not normalized['city'] or not normalized['state']:
        city, state = parse_location(normalized['location'])
        if not normalized['city']:
            normalized['city'] = city
        if not normalized['state']:
            normalized['state'] = state

    return normalized


def parse_date(date_string):
    """
    Parse date string into date object

    Handles various date formats:
    - YYYY-MM-DD
    - MM/DD/YYYY
    - Month DD, YYYY

    Args:
        date_string: Date string to parse

    Returns:
        date: Parsed date object, or None if parsing fails
    """
    if isinstance(date_string, date):
        return date_string

    if not date_string:
        return None

    # Try different date formats
    formats = [
        '%Y-%m-%d',
        '%m/%d/%Y',
        '%B %d, %Y',
        '%b %d, %Y',
        '%Y/%m/%d',
    ]

    for fmt in formats:
        try:
            return datetime.strptime(str(date_string), fmt).date()
        except ValueError:
            continue

    print(f"Warning: Could not parse date '{date_string}'")
    return None


def parse_location(location_string):
    """
    Parse location string to extract city and state

    Expected formats:
    - "City, State"
    - "City, ST"
    - "Austin, Texas"
    - "Austin, TX"

    Args:
        location_string: Location string to parse

    Returns:
        tuple: (city, state) or (None, None) if parsing fails
    """
    if not location_string:
        return None, None

    # Match "City, State" pattern
    match = re.search(r'^([^,]+),\s*([A-Za-z\s]+)$', location_string.strip())
    if match:
        city = match.group(1).strip()
        state = match.group(2).strip()
        return city, state

    return None, None


def parse_time(time_string):
    """
    Parse time string and extract start time

    Examples:
    - "7:00 PM - 9:00 PM"
    - "7:00 PM EST"
    - "19:00"

    Args:
        time_string: Time string to parse

    Returns:
        str: Formatted start time
    """
    if not time_string:
        return 'TBD'

    # Extract first time if range (e.g., "7:00 PM - 9:00 PM")
    if '-' in time_string:
        time_string = time_string.split('-')[0].strip()

    return time_string


def parse_duration(time_range):
    """
    Parse duration from time range string

    Examples:
    - "7:00 PM - 9:00 PM" -> 120 minutes
    - "2:00 PM - 3:30 PM" -> 90 minutes

    Args:
        time_range: Time range string

    Returns:
        int: Duration in minutes, or 120 (default) if parsing fails
    """
    if not time_range or '-' not in time_range:
        return 120  # Default 2 hours

    try:
        start_str, end_str = time_range.split('-')
        start_time = datetime.strptime(start_str.strip(), '%I:%M %p')
        end_time = datetime.strptime(end_str.strip(), '%I:%M %p')
        duration = (end_time - start_time).seconds // 60
        return duration if duration > 0 else 120
    except Exception:
        return 120


def clean_description(description):
    """
    Clean and truncate description text

    Args:
        description: Raw description text

    Returns:
        str: Cleaned description
    """
    if not description:
        return ''

    # Remove excessive whitespace
    description = ' '.join(description.split())

    # Truncate if too long (keep first 1000 chars)
    if len(description) > 1000:
        description = description[:997] + '...'

    return description


def extract_image_url(img_tag_or_url):
    """
    Extract image URL from img tag or return URL as-is

    Args:
        img_tag_or_url: Image tag HTML or direct URL

    Returns:
        str: Image URL
    """
    if not img_tag_or_url:
        return None

    # If it's already a URL, return it
    if img_tag_or_url.startswith('http'):
        return img_tag_or_url

    # Try to extract src from img tag
    match = re.search(r'src=["\']([^"\']+)["\']', str(img_tag_or_url))
    if match:
        return match.group(1)

    return None


def validate_event_data(event_data):
    """
    Validate that event data has all required fields

    Args:
        event_data (dict): Event data to validate

    Returns:
        tuple: (is_valid, error_message)
    """
    required_fields = ['title', 'date', 'start_time', 'duration_minutes', 'location']

    for field in required_fields:
        if field not in event_data or event_data[field] is None:
            return False, f"Missing required field: {field}"

    return True, None
