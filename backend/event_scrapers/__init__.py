"""
Event Scrapers Package

This package contains web scrapers for fetching immigration-related events
from various organization websites.

Available scrapers:
- raices_scraper: Scrapes events from RAICES Texas
- chirla_scraper: Scrapes events from CHIRLA (California)
- nyic_scraper: Scrapes events from NYIC (New York Immigration Coalition)
- utils: Helper functions for all scrapers
"""

from .raices_scraper import scrape_raices_events
from .chirla_scraper import scrape_chirla_events
from .nyic_scraper import scrape_nyic_events
from .utils import normalize_event_data

__all__ = [
    'scrape_raices_events',
    'scrape_chirla_events',
    'scrape_nyic_events',
    'normalize_event_data'
]
