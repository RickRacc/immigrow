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
from api_integrations import EventbriteAPI, ProPublicaNonprofitAPI, CourtListenerAPI


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
        print("\n[4/6] Fetching and seeding events from Eventbrite...")
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
        org_data_list = propublica_api.fetch_organizations(limit=15)

        organizations = []
        for org_data in org_data_list:
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

            except Exception as e:
                print(f"  ! Error adding organization: {e}")
                continue

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
        resource_data_list = court_api.search_immigration_cases(limit=20)

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
    """Fetch and seed events from Eventbrite API"""
    try:
        # Check if Eventbrite token is available
        if not os.getenv('EVENTBRITE_API_TOKEN'):
            print("  ! Warning: EVENTBRITE_API_TOKEN not set")
            print("  ! Creating sample events instead of fetching from API")
            return create_sample_events(organizations)

        eventbrite_api = EventbriteAPI()
        event_data_list = eventbrite_api.search_events(limit=20)

        # If no events found from Eventbrite, use sample events
        if not event_data_list:
            print("  ! No events found from Eventbrite API")
            print("  ! Creating sample events instead")
            return create_sample_events(organizations)

        events = []
        for event_data in event_data_list:
            try:
                # Check if event already exists
                existing = Event.query.filter_by(
                    eventbrite_id=event_data['eventbrite_id']
                ).first()
                if existing:
                    print(f"  - Skipping duplicate: {event_data['title']}")
                    events.append(existing)
                    continue

                # Randomly assign organization (in reality, you'd match by organizer)
                org = random.choice(organizations) if organizations else None

                event = Event(
                    title=event_data['title'],
                    date=event_data['date'],
                    start_time=event_data['start_time'],
                    end_time=event_data['end_time'],
                    duration_minutes=event_data['duration_minutes'],
                    location=event_data['location'],
                    city=event_data['city'],
                    state=event_data['state'],
                    venue_name=event_data['venue_name'],
                    description=event_data['description'],
                    external_url=event_data['external_url'],
                    image_url=event_data['image_url'],
                    eventbrite_id=event_data['eventbrite_id'],
                    timezone=event_data['timezone'],
                    organization_id=org.id if org else None
                )

                db.session.add(event)
                events.append(event)
                print(f"  + Added: {event.title} ({event.location})")

            except Exception as e:
                print(f"  ! Error adding event: {e}")
                continue

        db.session.commit()
        return events

    except ValueError as e:
        print(f"  ! {e}")
        print("  ! Creating sample events instead")
        return create_sample_events(organizations)
    except Exception as e:
        print(f"Error seeding events: {e}")
        db.session.rollback()
        return []


def create_sample_events(organizations: list) -> list:
    """
    Create sample events when Eventbrite API is not available
    This is a fallback for testing/development
    """
    from datetime import date, timedelta

    sample_events = [
        {
            'title': 'Citizenship Workshop',
            'date': date.today() + timedelta(days=7),
            'start_time': '2:00 PM EST',
            'duration_minutes': 120,
            'location': 'Austin, TX',
            'city': 'Austin',
            'state': 'TX',
            'description': 'Free citizenship application assistance and information session'
        },
        {
            'title': 'Know Your Rights - Immigration Law',
            'date': date.today() + timedelta(days=14),
            'start_time': '6:00 PM CST',
            'duration_minutes': 90,
            'location': 'Houston, TX',
            'city': 'Houston',
            'state': 'TX',
            'description': 'Legal clinic providing information about immigrant rights'
        },
        {
            'title': 'DACA Renewal Assistance',
            'date': date.today() + timedelta(days=21),
            'start_time': '10:00 AM EST',
            'duration_minutes': 180,
            'location': 'New York, NY',
            'city': 'New York',
            'state': 'NY',
            'description': 'Free assistance with DACA renewal applications'
        },
        {
            'title': 'Immigration Resources Fair',
            'date': date.today() + timedelta(days=28),
            'start_time': '12:00 PM PST',
            'duration_minutes': 240,
            'location': 'Los Angeles, CA',
            'city': 'Los Angeles',
            'state': 'CA',
            'description': 'Community event with immigration service providers and legal aid'
        },
        {
            'title': 'ESL and Citizenship Classes',
            'date': date.today() + timedelta(days=35),
            'start_time': '7:00 PM EST',
            'duration_minutes': 60,
            'location': 'Miami, FL',
            'city': 'Miami',
            'state': 'FL',
            'description': 'Weekly English classes and citizenship test preparation'
        },
        {
            'title': 'Asylum Seeker Support Group',
            'date': date.today() + timedelta(days=10),
            'start_time': '5:00 PM CST',
            'duration_minutes': 120,
            'location': 'Chicago, IL',
            'city': 'Chicago',
            'state': 'IL',
            'description': 'Monthly support group for asylum seekers and refugees'
        },
        {
            'title': 'Green Card Application Workshop',
            'date': date.today() + timedelta(days=17),
            'start_time': '1:00 PM PST',
            'duration_minutes': 150,
            'location': 'San Francisco, CA',
            'city': 'San Francisco',
            'state': 'CA',
            'description': 'Legal assistance with green card and permanent residency applications'
        },
        {
            'title': 'Immigration Court Preparation Clinic',
            'date': date.today() + timedelta(days=24),
            'start_time': '9:00 AM EST',
            'duration_minutes': 180,
            'location': 'Boston, MA',
            'city': 'Boston',
            'state': 'MA',
            'description': 'Free legal clinic to prepare for immigration court hearings'
        },
        {
            'title': 'Refugee Resettlement Information Session',
            'date': date.today() + timedelta(days=31),
            'start_time': '3:00 PM MST',
            'duration_minutes': 90,
            'location': 'Phoenix, AZ',
            'city': 'Phoenix',
            'state': 'AZ',
            'description': 'Information session on refugee resettlement programs and resources'
        },
        {
            'title': 'Naturalization Test Prep Course',
            'date': date.today() + timedelta(days=38),
            'start_time': '6:30 PM EST',
            'duration_minutes': 120,
            'location': 'Philadelphia, PA',
            'city': 'Philadelphia',
            'state': 'PA',
            'description': 'Free course to prepare for the U.S. citizenship naturalization test'
        },
        {
            'title': 'Immigration Legal Aid Clinic',
            'date': date.today() + timedelta(days=45),
            'start_time': '10:00 AM PST',
            'duration_minutes': 240,
            'location': 'Seattle, WA',
            'city': 'Seattle',
            'state': 'WA',
            'description': 'Walk-in legal clinic for immigration questions and consultations'
        },
        {
            'title': 'Immigrant Entrepreneur Workshop',
            'date': date.today() + timedelta(days=52),
            'start_time': '2:00 PM CST',
            'duration_minutes': 150,
            'location': 'Dallas, TX',
            'city': 'Dallas',
            'state': 'TX',
            'description': 'Workshop on starting a business as an immigrant, visa options, and resources'
        }
    ]

    events = []
    for event_data in sample_events:
        try:
            org = random.choice(organizations) if organizations else None

            event = Event(
                title=event_data['title'],
                date=event_data['date'],
                start_time=event_data['start_time'],
                end_time='',
                duration_minutes=event_data['duration_minutes'],
                location=event_data['location'],
                city=event_data['city'],
                state=event_data['state'],
                venue_name='Community Center',
                description=event_data['description'],
                external_url='https://immigrow.site',
                image_url=None,
                eventbrite_id=f'sample-{len(events)}',
                timezone='America/New_York',
                organization_id=org.id if org else None
            )

            db.session.add(event)
            events.append(event)
            print(f"  + Added sample: {event.title}")

        except Exception as e:
            print(f"  ! Error adding sample event: {e}")
            continue

    db.session.commit()
    return events


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
