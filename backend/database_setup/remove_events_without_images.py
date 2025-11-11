"""
Script to remove events without image_urls from database
"""
import os
import sys
from dotenv import load_dotenv

# Load environment variables
env_path = os.path.join(os.path.dirname(__file__), '..', '.env')
load_dotenv(env_path)

# Add backend to path
sys.path.insert(0, os.path.dirname(__file__))

from models import db, Event
from app import app

def remove_events_without_images():
    """Query and delete events where image_url is NULL"""
    print("=" * 70)
    print("REMOVING EVENTS WITHOUT IMAGE_URLS")
    print("=" * 70)

    with app.app_context():
        # Query events without image_url
        events_without_images = Event.query.filter(
            (Event.image_url == None) | (Event.image_url == '')
        ).all()

        print(f"\nFound {len(events_without_images)} events without image_url:")

        if len(events_without_images) == 0:
            print("  No events to remove!")
            return

        for event in events_without_images:
            print(f"  - ID {event.id}: {event.title} ({event.location})")

        # Delete the events
        print(f"\nDeleting {len(events_without_images)} events...")
        for event in events_without_images:
            db.session.delete(event)

        db.session.commit()
        print(f"Successfully deleted {len(events_without_images)} events")

        # Verify deletion
        remaining_events = Event.query.count()
        print(f"\nRemaining events in database: {remaining_events}")

        # Check if all remaining events have image_urls
        events_without_images_after = Event.query.filter(
            (Event.image_url == None) | (Event.image_url == '')
        ).count()

        if events_without_images_after == 0:
            print("[SUCCESS] All remaining events have image_urls!")
        else:
            print(f"[WARNING] Still {events_without_images_after} events without image_url")

if __name__ == "__main__":
    remove_events_without_images()
