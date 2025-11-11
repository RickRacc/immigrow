"""
Master Event Scraper

Runs all available event scrapers and aggregates results.
Use this script to fetch events from all organizations at once.

Usage:
    python -m event_scrapers.scrape_all
"""

from .raices_scraper import scrape_raices_events
from .chirla_scraper import scrape_chirla_events
from .nyic_scraper import scrape_nyic_events


def scrape_all_events(max_per_source=50):
    """
    Scrape events from all available sources

    Args:
        max_per_source (int): Maximum events to scrape from each source

    Returns:
        dict: Dictionary with scraped events organized by source
    """
    print("\n" + "="*70)
    print("STARTING COMPREHENSIVE EVENT SCRAPING")
    print("="*70 + "\n")

    results = {
        'raices': [],
        'chirla': [],
        'nyic': [],
        'all': []
    }

    # Scrape RAICES events
    print("\n[1/3] Scraping RAICES Texas events...")
    print("-" * 70)
    try:
        raices_events = scrape_raices_events(max_events=max_per_source)
        results['raices'] = raices_events
        results['all'].extend(raices_events)
        print(f"✓ Successfully scraped {len(raices_events)} RAICES events")
    except Exception as e:
        print(f"✗ Failed to scrape RAICES: {e}")

    # Scrape CHIRLA events
    print("\n[2/3] Scraping CHIRLA (California) events...")
    print("-" * 70)
    try:
        chirla_events = scrape_chirla_events(max_events=max_per_source)
        results['chirla'] = chirla_events
        results['all'].extend(chirla_events)
        print(f"✓ Successfully scraped {len(chirla_events)} CHIRLA events")
    except Exception as e:
        print(f"✗ Failed to scrape CHIRLA: {e}")

    # Scrape NYIC events
    print("\n[3/3] Scraping NYIC (New York) events...")
    print("-" * 70)
    try:
        nyic_events = scrape_nyic_events(max_events=max_per_source)
        results['nyic'] = nyic_events
        results['all'].extend(nyic_events)
        print(f"✓ Successfully scraped {len(nyic_events)} NYIC events")
    except Exception as e:
        print(f"✗ Failed to scrape NYIC: {e}")

    # Summary
    print("\n" + "="*70)
    print("SCRAPING COMPLETE - SUMMARY")
    print("="*70)
    print(f"RAICES (Texas):     {len(results['raices']):3d} events")
    print(f"CHIRLA (California): {len(results['chirla']):3d} events")
    print(f"NYIC (New York):    {len(results['nyic']):3d} events")
    print("-" * 70)
    print(f"TOTAL:              {len(results['all']):3d} events")
    print("="*70 + "\n")

    return results


if __name__ == '__main__':
    # Run all scrapers
    results = scrape_all_events(max_per_source=50)

    # Display sample events
    if results['all']:
        print("\nSample Events (first 5):")
        print("="*70)
        for i, event in enumerate(results['all'][:5], 1):
            print(f"\n{i}. {event['title']}")
            print(f"   Date: {event['date']}")
            print(f"   Time: {event['start_time']}")
            print(f"   Location: {event['location']}")
            if event.get('description'):
                desc = event['description'][:100] + "..." if len(event['description']) > 100 else event['description']
                print(f"   Description: {desc}")
            if event.get('external_url'):
                print(f"   URL: {event['external_url']}")
    else:
        print("\nNo events were scraped. Check error messages above.")
