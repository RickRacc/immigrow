"""
Database Seeding Script for Immigrow
Fetches data from APIs and populates the database with relationships
"""

import os
import sys
from datetime import datetime
import random
from dotenv import load_dotenv

# Load environment variables
env_path = os.path.join(os.path.dirname(__file__), '..', '.env')
load_dotenv(env_path)

# Add backend to path
sys.path.insert(0, os.path.dirname(__file__))

from models import db, Event, Organization, Resource
from api_integrations import ProPublicaNonprofitAPI, CourtListenerAPI
from event_scrapers.raices_scraper import scrape_raices_events
from api_integrations.mobilize_api import fetch_mobilize_events


def seed_database(app):
    """
    Main seeding function - fetches data from all APIs and populates database

    Args:
        app: Flask application instance
    """
    print("=" * 70)
    print("IMMIGROW DATABASE SEEDING")
    print("=" * 70)

    with app.app_context():
        # Drop all tables and recreate (WARNING: This deletes existing data)
        print("\n[1/6] Dropping and recreating database tables...")
        db.drop_all()
        db.create_all()
        print(" Database tables created")

        # Seed Organizations first (no dependencies)
        print("\n[2/6] Fetching and seeding organizations from ProPublica...")
        organizations = seed_organizations()
        print(f" Seeded {len(organizations)} organizations")

        # Seed Resources (no dependencies)
        print("\n[3/6] Fetching and seeding legal resources from CourtListener...")
        resources = seed_resources()
        print(f"Seeded {len(resources)} legal resources")

        # Seed Events (depends on Organizations)
        print("\n[4/6] Fetching and seeding events from RAICES and Mobilize API...")
        events = seed_events(organizations)
        print(f"Seeded {len(events)} events")

        # Create relationships between models
        print("\n[5/6] Creating relationships between models...")
        create_relationships(events, organizations, resources)
        print("Relationships created")

        # Print summary
        print("\n[6/6] Database seeding complete!")
        print_summary()


def seed_organizations() -> list:
    """Fetch and seed organizations from ProPublica API"""
    try:
        propublica_api = ProPublicaNonprofitAPI()
        org_data_list = propublica_api.fetch_organizations(limit=57)

        organizations = []
        batch_size = 10  # Commit every 10 organizations to avoid long transactions

        for idx, org_data in enumerate(org_data_list):
            try:
                # Check if organization already exists
                existing = Organization.query.filter_by(ein=org_data['ein']).first()
                if existing:
                    print(f"  - Skipping duplicate: {org_data['name']}")
                    organizations.append(existing)
                    continue

                org = Organization(
                    name=org_data['name'],
                    city=org_data['city'],
                    state=org_data['state'],
                    topic=org_data['topic'],
                    size=org_data['size'],
                    meeting_frequency=org_data['meeting_frequency'],
                    description=org_data['description'],
                    address=org_data['address'],
                    zipcode=org_data['zipcode'],
                    ein=org_data['ein'],
                    subsection_code=org_data['subsection_code'],
                    ntee_code=org_data['ntee_code'],
                    external_url=org_data['external_url'],
                    guidestar_url=org_data['guidestar_url'],
                    image_url=org_data['image_url']
                )

                db.session.add(org)
                organizations.append(org)
                print(f"  + Added: {org.name} ({org.city}, {org.state})")

                # Commit in batches to prevent connection timeouts
                if (idx + 1) % batch_size == 0:
                    db.session.commit()
                    print(f"    [Committed batch of {batch_size} organizations]")

            except Exception as e:
                print(f"  ! Error adding organization: {e}")
                db.session.rollback()  # Rollback failed org, continue with others
                continue

        # Final commit for remaining organizations
        db.session.commit()
        return organizations

    except Exception as e:
        print(f"Error seeding organizations: {e}")
        db.session.rollback()
        return []


def seed_resources() -> list:
    """Fetch and seed legal resources from CourtListener API"""
    try:
        court_api = CourtListenerAPI()
        resource_data_list = court_api.search_immigration_cases(limit=57)

        resources = []
        for res_data in resource_data_list:
            try:
                # Check if resource already exists
                existing = Resource.query.filter_by(
                    courtlistener_id=res_data['courtlistener_id']
                ).first()
                if existing:
                    print(f"  - Skipping duplicate: {res_data['title'][:50]}...")
                    resources.append(existing)
                    continue

                resource = Resource(
                    title=res_data['title'],
                    date_published=res_data['date_published'],
                    topic=res_data['topic'],
                    scope=res_data['scope'],
                    description=res_data['description'],
                    format=res_data['format'],
                    court_name=res_data['court_name'],
                    citation=res_data['citation'],
                    external_url=res_data['external_url'],
                    image_url=res_data['image_url'],
                    courtlistener_id=res_data['courtlistener_id'],
                    docket_number=res_data['docket_number'],
                    judge_name=res_data['judge_name']
                )

                db.session.add(resource)
                resources.append(resource)
                print(f"  + Added: {resource.title[:60]}...")

            except Exception as e:
                print(f"  ! Error adding resource: {e}")
                continue

        db.session.commit()
        return resources

    except Exception as e:
        print(f"Error seeding resources: {e}")
        db.session.rollback()
        return []


def seed_events(organizations: list) -> list:
    """Fetch and seed events from RAICES scraper and Mobilize API"""
    all_events = []

    try:
        # Fetch from RAICES scraper
        print("\n  Fetching events from RAICES Texas...")
        raices_events = scrape_raices_events(max_events=25)
        print(f"  Fetched {len(raices_events)} events from RAICES")

        # Fetch from Mobilize API
        print("\n  Fetching immigration events from Mobilize API...")
        mobilize_events = fetch_mobilize_events(max_events=30, immigration_only=True)
        print(f"  Fetched {len(mobilize_events)} events from Mobilize")

        # Combine all event data
        all_event_data = raices_events + mobilize_events
        print(f"\n  Total events to process: {len(all_event_data)}")

        # Add events to database
        for event_data in all_event_data:
            try:
                # Randomly assign organization
                org = random.choice(organizations) if organizations else None

                event = Event(
                    title=event_data['title'],
                    date=event_data['date'],
                    start_time=event_data['start_time'],
                    end_time=event_data.get('end_time', ''),
                    duration_minutes=event_data['duration_minutes'],
                    location=event_data['location'],
                    city=event_data.get('city'),
                    state=event_data.get('state'),
                    venue_name=event_data.get('venue_name', ''),
                    description=event_data.get('description', ''),
                    external_url=event_data.get('external_url', ''),
                    image_url=event_data.get('image_url'),
                    timezone=event_data.get('timezone', 'EST'),
                    organization_id=org.id if org else None
                )

                db.session.add(event)
                all_events.append(event)
                print(f"  + Added: {event.title[:60]}... ({event.location})")

            except Exception as e:
                print(f"  ! Error adding event: {e}")
                continue

        db.session.commit()
        return all_events

    except Exception as e:
        print(f"Error seeding events: {e}")
        db.session.rollback()
        return []


def create_relationships(events: list, organizations: list, resources: list):
    """
    Create many-to-many relationships between models

    Logic:
    - Each Event links to 2-3 Resources
    - Each Organization links to 2-3 Resources
    - Ensures ALL instances have at least 2 connections
    - Caps total connections at ~5 per instance
    """
    try:
        import random

        # Link Events to Resources (2-3 resources per event)
        print("\n  Linking Events to Resources...")
        for event in events:
            # Randomly select 2-3 resources for this event
            num_resources = random.randint(2, 3)
            selected_resources = random.sample(resources, min(num_resources, len(resources)))

            for resource in selected_resources:
                if resource not in event.resources:
                    event.resources.append(resource)
                    print(f"    → Event '{event.title[:35]}' ↔ Resource '{resource.title[:35]}'")

        # Link Organizations to Resources (2-3 resources per org)
        print("\n  Linking Organizations to Resources...")
        for org in organizations:
            # Randomly select 2-3 resources for this organization
            num_resources = random.randint(2, 3)
            selected_resources = random.sample(resources, min(num_resources, len(resources)))

            for resource in selected_resources:
                if resource not in org.resources:
                    org.resources.append(resource)
                    print(f"    → Org '{org.name[:35]}' ↔ Resource '{resource.title[:35]}'")

        db.session.commit()
        print("\n  ✓ Initial relationships created")

        # ENSURE ALL RESOURCES HAVE AT LEAST 2 CONNECTIONS
        print("\n  Ensuring all resources have minimum 2 connections...")
        for resource in resources:
            conn_count = len(resource.events) + len(resource.organizations)

            if conn_count < 2:
                # Resource needs more connections
                needed = 2 - conn_count
                print(f"    ! '{resource.title[:40]}' only has {conn_count} connections, adding {needed} more...")

                # Try to add from organizations first (less likely to have many already)
                available_orgs = [o for o in organizations if resource not in o.resources]
                if available_orgs:
                    selected = random.sample(available_orgs, min(needed, len(available_orgs)))
                    for org in selected:
                        org.resources.append(resource)
                        print(f"      + Added Org '{org.name[:30]}'")
                        needed -= 1

                # If still need more, add from events
                if needed > 0:
                    available_events = [e for e in events if resource not in e.resources]
                    if available_events:
                        selected = random.sample(available_events, min(needed, len(available_events)))
                        for event in selected:
                            event.resources.append(resource)
                            print(f"      + Added Event '{event.title[:30]}'")

        db.session.commit()
        print("\n  ✓ All relationships finalized")

        # Final verification
        print("\n  Final verification of all 47 instances...")
        issues = []

        for event in events:
            conn_count = len(event.resources) + (1 if event.organization else 0)
            if conn_count < 2:
                issues.append(f"Event '{event.title}' has only {conn_count} connection(s)")

        for org in organizations:
            conn_count = len(org.events) + len(org.resources)
            if conn_count < 2:
                issues.append(f"Organization '{org.name}' has only {conn_count} connection(s)")

        for resource in resources:
            conn_count = len(resource.events) + len(resource.organizations)
            if conn_count < 2:
                issues.append(f"Resource '{resource.title[:50]}' has only {conn_count} connection(s)")

        if issues:
            print(f"\n  [FAILED] Found {len(issues)} instances with < 2 connections:")
            for issue in issues:
                print(f"    - {issue}")
        else:
            print(f"  [SUCCESS] All {len(events) + len(organizations) + len(resources)} instances have 2+ connections")

    except Exception as e:
        print(f"Error creating relationships: {e}")
        db.session.rollback()


def print_summary():
    """Print database summary statistics"""
    print("\n" + "=" * 70)
    print("DATABASE SUMMARY")
    print("=" * 70)

    event_count = Event.query.count()
    org_count = Organization.query.count()
    resource_count = Resource.query.count()

    print(f"\nEvents:          {event_count}")
    print(f"Organizations:   {org_count}")
    print(f"Resources:       {resource_count}")

    # Show sample relationships
    if event_count > 0:
        sample_event = Event.query.first()
        print(f"\nSample Event Relationships:")
        print(f"   Event: {sample_event.title}")
        if sample_event.organization:
            print(f"   → Organization: {sample_event.organization.name}")
        print(f"   → Linked Resources: {len(sample_event.resources)}")

    if org_count > 0:
        sample_org = Organization.query.first()
        print(f"\nSample Organization Relationships:")
        print(f"   Organization: {sample_org.name}")
        print(f"   → Events hosted: {len(sample_org.events)}")
        print(f"   → Linked Resources: {len(sample_org.resources)}")

    print("\n" + "=" * 70)
    print("SEEDING COMPLETE!")
    print("=" * 70)


def main():
    """
    Standalone script execution
    Run with: python seed_database.py
    """
    # Import Flask app
    try:
        from app import app
        seed_database(app)
    except ImportError:
        print("Error: Could not import Flask app")
        print("Make sure you're running this from the backend directory")
        print("Usage: python seed_database.py")
        sys.exit(1)


if __name__ == "__main__":
    main()
