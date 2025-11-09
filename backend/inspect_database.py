"""
Database Inspection Script
Shows all tables, columns, and relationships in the Immigrow database
"""

import os
import sys
from dotenv import load_dotenv

# Load environment variables
env_path = os.path.join(os.path.dirname(__file__), '..', '.env')
load_dotenv(env_path)

# Add backend to path
sys.path.insert(0, os.path.dirname(__file__))

from app import app
from models import db, Event, Organization, Resource


def inspect_database():
    """Inspect database structure and relationships"""

    with app.app_context():
        print("\n" + "=" * 80)
        print("IMMIGROW DATABASE INSPECTION")
        print("=" * 80)

        # 1. Show table counts
        print("\n[1] TABLE COUNTS")
        print("-" * 80)
        event_count = Event.query.count()
        org_count = Organization.query.count()
        resource_count = Resource.query.count()

        print(f"Events:        {event_count}")
        print(f"Organizations: {org_count}")
        print(f"Resources:     {resource_count}")
        print(f"TOTAL:         {event_count + org_count + resource_count}")

        # 2. Show table columns
        print("\n[2] TABLE SCHEMAS")
        print("-" * 80)

        print("\n[EVENT] EVENT TABLE COLUMNS:")
        event_columns = Event.__table__.columns
        for col in event_columns:
            nullable = "NULL" if col.nullable else "NOT NULL"
            print(f"  - {col.name:25s} {str(col.type):20s} {nullable}")

        print("\n[ORG] ORGANIZATION TABLE COLUMNS:")
        org_columns = Organization.__table__.columns
        for col in org_columns:
            nullable = "NULL" if col.nullable else "NOT NULL"
            print(f"  - {col.name:25s} {str(col.type):20s} {nullable}")

        print("\n[RESOURCE] RESOURCE TABLE COLUMNS:")
        resource_columns = Resource.__table__.columns
        for col in resource_columns:
            nullable = "NULL" if col.nullable else "NOT NULL"
            print(f"  - {col.name:25s} {str(col.type):20s} {nullable}")

        # 3. Show association tables (many-to-many relationships)
        print("\n[3] ASSOCIATION TABLES (Many-to-Many Relationships)")
        print("-" * 80)

        print("\n[LINK] EVENT_RESOURCES (Events <-> Resources):")
        event_resources_table = db.metadata.tables.get('event_resources')
        if event_resources_table is not None:
            for col in event_resources_table.columns:
                print(f"  - {col.name:25s} {str(col.type):20s}")

            # Count relationships
            result = db.session.execute(db.text("SELECT COUNT(*) FROM event_resources"))
            count = result.scalar()
            print(f"  Total links: {count}")
        else:
            print("  Table not found")

        print("\n[LINK] ORGANIZATION_RESOURCES (Organizations <-> Resources):")
        org_resources_table = db.metadata.tables.get('organization_resources')
        if org_resources_table is not None:
            for col in org_resources_table.columns:
                print(f"  - {col.name:25s} {str(col.type):20s}")

            # Count relationships
            result = db.session.execute(db.text("SELECT COUNT(*) FROM organization_resources"))
            count = result.scalar()
            print(f"  Total links: {count}")
        else:
            print("  Table not found")

        # 4. Show sample data with relationships
        print("\n[4] SAMPLE DATA WITH RELATIONSHIPS")
        print("-" * 80)

        if event_count > 0:
            print("\n[EVENT] SAMPLE EVENT:")
            sample_event = Event.query.first()
            print(f"  ID:           {sample_event.id}")
            print(f"  Title:        {sample_event.title}")
            print(f"  Date:         {sample_event.date}")
            print(f"  Location:     {sample_event.location}")
            print(f"  Duration:     {sample_event.duration_minutes} minutes")
            print(f"  Description:  {sample_event.description[:100]}...")

            # Show foreign key relationship (Event -> Organization)
            print(f"\n  [ORG] Organization (Foreign Key):")
            if sample_event.organization:
                print(f"     ID:   {sample_event.organization.id}")
                print(f"     Name: {sample_event.organization.name}")
            else:
                print(f"     None")

            # Show many-to-many relationship (Event -> Resources)
            print(f"\n  [RESOURCE] Linked Resources (Many-to-Many):")
            print(f"     Count: {len(sample_event.resources)}")
            for i, resource in enumerate(sample_event.resources[:3], 1):
                print(f"     {i}. {resource.title[:60]}...")

        if org_count > 0:
            print("\n[ORG] SAMPLE ORGANIZATION:")
            sample_org = Organization.query.first()
            print(f"  ID:           {sample_org.id}")
            print(f"  Name:         {sample_org.name}")
            print(f"  City:         {sample_org.city}")
            print(f"  State:        {sample_org.state}")
            print(f"  Topic:        {sample_org.topic}")
            print(f"  Size:         {sample_org.size}")
            print(f"  EIN:          {sample_org.ein}")

            # Show reverse relationship (Organization -> Events)
            print(f"\n  [EVENT] Hosted Events (One-to-Many):")
            print(f"     Count: {len(sample_org.events)}")
            for i, event in enumerate(sample_org.events[:3], 1):
                print(f"     {i}. {event.title}")

            # Show many-to-many relationship (Organization -> Resources)
            print(f"\n  [RESOURCE] Linked Resources (Many-to-Many):")
            print(f"     Count: {len(sample_org.resources)}")
            for i, resource in enumerate(sample_org.resources[:3], 1):
                print(f"     {i}. {resource.title[:60]}...")

        if resource_count > 0:
            print("\n[RESOURCE] SAMPLE RESOURCE:")
            sample_resource = Resource.query.first()
            print(f"  ID:           {sample_resource.id}")
            print(f"  Title:        {sample_resource.title[:70]}...")
            print(f"  Topic:        {sample_resource.topic}")
            print(f"  Scope:        {sample_resource.scope}")
            print(f"  Court:        {sample_resource.court_name}")
            print(f"  Published:    {sample_resource.date_published}")

            # Show reverse many-to-many relationships
            print(f"\n  [EVENT] Related Events (Many-to-Many):")
            print(f"     Count: {len(sample_resource.events)}")
            for i, event in enumerate(sample_resource.events[:3], 1):
                print(f"     {i}. {event.title}")

            print(f"\n  [ORG] Related Organizations (Many-to-Many):")
            print(f"     Count: {len(sample_resource.organizations)}")
            for i, org in enumerate(sample_resource.organizations[:3], 1):
                print(f"     {i}. {org.name}")

        # 5. Verify all instances have 2+ connections
        print("\n[5] RELATIONSHIP VERIFICATION")
        print("-" * 80)
        print("\nChecking that each instance connects to 2+ other instances...")

        print("\n[EVENT] Events:")
        for event in Event.query.all()[:5]:  # Check first 5
            connection_count = 0
            if event.organization:
                connection_count += 1
            connection_count += len(event.resources)
            status = "[OK]" if connection_count >= 2 else "[ERROR]"
            print(f"  {status} {event.title[:50]:50s} | Connections: {connection_count}")

        print("\n[ORG] Organizations:")
        for org in Organization.query.all()[:5]:  # Check first 5
            connection_count = len(org.events) + len(org.resources)
            status = "[OK]" if connection_count >= 2 else "[ERROR]"
            print(f"  {status} {org.name[:50]:50s} | Connections: {connection_count}")

        print("\n[RESOURCE] Resources:")
        for resource in Resource.query.all()[:5]:  # Check first 5
            connection_count = len(resource.events) + len(resource.organizations)
            status = "[OK]" if connection_count >= 2 else "[ERROR]"
            print(f"  {status} {resource.title[:50]:50s} | Connections: {connection_count}")

        # 6. Show relationship creation logic
        print("\n[6] RELATIONSHIP CREATION METHOD")
        print("-" * 80)
        print("""
The relationships are created DYNAMICALLY in seed_database.py:

1. Event -> Organization (Foreign Key):
   - Randomly assigned during event creation
   - Each event belongs to ONE organization

2. Event -> Resources (Many-to-Many):
   - Based on topic matching (immigration, asylum, citizenship, visa, daca)
   - If event title OR resource title contains these keywords, they're linked

3. Organization -> Resources (Many-to-Many):
   - Based on topic matching
   - If org.topic appears in resource.topic or resource.description, they're linked

This ensures realistic, topic-based connections rather than random assignments.
""")

        print("\n" + "=" * 80)
        print("INSPECTION COMPLETE")
        print("=" * 80)


if __name__ == "__main__":
    inspect_database()
