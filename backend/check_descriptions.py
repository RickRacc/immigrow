"""
Check full descriptions in database (not truncated)
Verify that real data is stored, not just what's displayed
"""

import os
import psycopg2
from dotenv import load_dotenv

# Load environment variables
env_path = os.path.join(os.path.dirname(__file__), '..', '.env')
load_dotenv(env_path)

DATABASE_URL = os.getenv('DATABASE_URL')

def check_descriptions():
    """Check full description fields from database"""

    print("\n" + "=" * 100)
    print("DESCRIPTION FIELD VERIFICATION - Full Text (No Truncation)")
    print("=" * 100)

    try:
        conn = psycopg2.connect(DATABASE_URL)
        cursor = conn.cursor()

        # Events - Check descriptions (should be fabricated sample data)
        print("\n[EVENT] EVENT DESCRIPTIONS (Sample/Fabricated Data)")
        print("-" * 100)
        cursor.execute("SELECT id, title, description FROM event ORDER BY id;")
        events = cursor.fetchall()

        for event_id, title, description in events:
            print(f"\nEvent #{event_id}: {title}")
            print(f"Description: {description}")
            print(f"Length: {len(description) if description else 0} characters")

        # Organizations - Check descriptions (should be real API data)
        print("\n\n[ORG] ORGANIZATION DESCRIPTIONS (Real ProPublica API Data)")
        print("-" * 100)
        cursor.execute("SELECT id, name, description FROM organization ORDER BY id LIMIT 5;")
        orgs = cursor.fetchall()

        for org_id, name, description in orgs:
            print(f"\nOrganization #{org_id}: {name}")
            print(f"Description: {description}")
            print(f"Length: {len(description) if description else 0} characters")

        # Resources - Check descriptions (should be real CourtListener API data)
        print("\n\n[RESOURCE] RESOURCE DESCRIPTIONS (Real CourtListener API Data)")
        print("-" * 100)
        cursor.execute("SELECT id, title, description FROM resource ORDER BY id LIMIT 5;")
        resources = cursor.fetchall()

        for res_id, title, description in resources:
            print(f"\nResource #{res_id}: {title}")
            print(f"Description (first 500 chars): {description[:500] if description else 'NULL'}...")
            print(f"Full length: {len(description) if description else 0} characters")

        # Check other fields to verify real data
        print("\n\n" + "=" * 100)
        print("VERIFY REAL DATA FROM APIs")
        print("=" * 100)

        print("\n[ORG] ORGANIZATION SAMPLE - Check EIN, NTEE Code, External URL (ProPublica specific)")
        cursor.execute("SELECT id, name, ein, ntee_code, external_url FROM organization LIMIT 3;")
        orgs = cursor.fetchall()

        for org in orgs:
            print(f"\nID: {org[0]}")
            print(f"  Name: {org[1]}")
            print(f"  EIN: {org[2]} (Tax ID from IRS/ProPublica)")
            print(f"  NTEE Code: {org[3]} (Nonprofit classification)")
            print(f"  External URL: {org[4]}")

        print("\n\n[RESOURCE] RESOURCE SAMPLE - Check CourtListener ID, Court Name, Docket Number")
        cursor.execute("SELECT id, title, courtlistener_id, court_name, docket_number FROM resource LIMIT 3;")
        resources = cursor.fetchall()

        for res in resources:
            print(f"\nID: {res[0]}")
            print(f"  Title: {res[1][:60]}...")
            print(f"  CourtListener ID: {res[2]} (From CourtListener API)")
            print(f"  Court Name: {res[3]}")
            print(f"  Docket Number: {res[4]}")

        print("\n\n[EVENT] EVENT SAMPLE - Check if sample data (should have 'sample' eventbrite_id)")
        cursor.execute("SELECT id, title, eventbrite_id, external_url FROM event LIMIT 3;")
        events = cursor.fetchall()

        for event in events:
            print(f"\nID: {event[0]}")
            print(f"  Title: {event[1]}")
            print(f"  Eventbrite ID: {event[2]} (Should be 'sample-X' for fabricated data)")
            print(f"  External URL: {event[3]}")

        # Count NULL vs non-NULL descriptions
        print("\n\n" + "=" * 100)
        print("NULL CHECK FOR DESCRIPTIONS")
        print("=" * 100)

        cursor.execute("SELECT COUNT(*) FROM event WHERE description IS NULL OR description = '';")
        event_null = cursor.fetchone()[0]
        cursor.execute("SELECT COUNT(*) FROM event;")
        event_total = cursor.fetchone()[0]
        print(f"\nEvents: {event_null}/{event_total} have NULL/empty descriptions")

        cursor.execute("SELECT COUNT(*) FROM organization WHERE description IS NULL OR description = '';")
        org_null = cursor.fetchone()[0]
        cursor.execute("SELECT COUNT(*) FROM organization;")
        org_total = cursor.fetchone()[0]
        print(f"Organizations: {org_null}/{org_total} have NULL/empty descriptions")

        cursor.execute("SELECT COUNT(*) FROM resource WHERE description IS NULL OR description = '';")
        res_null = cursor.fetchone()[0]
        cursor.execute("SELECT COUNT(*) FROM resource;")
        res_total = cursor.fetchone()[0]
        print(f"Resources: {res_null}/{res_total} have NULL/empty descriptions")

        cursor.close()
        conn.close()

        print("\n" + "=" * 100)
        print("VERIFICATION COMPLETE")
        print("=" * 100)
        print("\nSummary:")
        print("  - Events: Fabricated sample data (eventbrite_id = 'sample-X')")
        print("  - Organizations: Real ProPublica API data (EIN, NTEE codes)")
        print("  - Resources: Real CourtListener API data (cluster_id, court opinions)")

    except Exception as e:
        print(f"\n[ERROR] Error: {e}")


if __name__ == "__main__":
    check_descriptions()
