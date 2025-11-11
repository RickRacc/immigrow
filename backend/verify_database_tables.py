"""
Verify actual PostgreSQL database tables and data
Shows raw database structure and ALL data (not samples)
"""

import os
import sys
import psycopg2
from dotenv import load_dotenv

# Force UTF-8 encoding for Windows console output
if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')

# Load environment variables
env_path = os.path.join(os.path.dirname(__file__), '..', '.env')
load_dotenv(env_path)

DATABASE_URL = os.getenv('DATABASE_URL')

def verify_database():
    """Connect directly to PostgreSQL and verify tables"""

    print("\n" + "=" * 100)
    print("DIRECT DATABASE VERIFICATION - PostgreSQL")
    print("=" * 100)

    try:
        # Connect to database
        conn = psycopg2.connect(DATABASE_URL)
        cursor = conn.cursor()

        # ==================================================
        # 1. List all tables
        # ==================================================
        print("\n[1] ALL TABLES IN DATABASE")
        print("-" * 100)

        cursor.execute("""
            SELECT table_name
            FROM information_schema.tables
            WHERE table_schema = 'public'
            ORDER BY table_name;
        """)

        tables = cursor.fetchall()
        print(f"Found {len(tables)} tables:\n")
        for table in tables:
            print(f"  - {table[0]}")

        # ==================================================
        # 2. Show table structure for each table
        # ==================================================
        print("\n[2] TABLE STRUCTURES (columns, types, constraints)")
        print("-" * 100)

        for table in tables:
            table_name = table[0]
            print(f"\n[TABLE] {table_name.upper()}")
            print("-" * 100)

            # Get columns
            cursor.execute(f"""
                SELECT
                    column_name,
                    data_type,
                    character_maximum_length,
                    is_nullable,
                    column_default
                FROM information_schema.columns
                WHERE table_name = '{table_name}'
                ORDER BY ordinal_position;
            """)

            columns = cursor.fetchall()
            print(f"Columns ({len(columns)} total):\n")
            print(f"{'Column Name':<30} {'Type':<25} {'Nullable':<10} {'Default':<20}")
            print("-" * 100)

            for col in columns:
                col_name, data_type, max_length, nullable, default = col
                type_str = f"{data_type}"
                if max_length:
                    type_str += f"({max_length})"
                default_str = str(default)[:20] if default else '-'
                print(f"{col_name:<30} {type_str:<25} {nullable:<10} {default_str:<20}")

        # ==================================================
        # 3. Row counts for each table
        # ==================================================
        print("\n\n[3] ROW COUNTS")
        print("-" * 100)

        for table in tables:
            table_name = table[0]
            cursor.execute(f"SELECT COUNT(*) FROM {table_name};")
            count = cursor.fetchone()[0]
            print(f"  {table_name:<30} {count:>5} rows")

        # ==================================================
        # 4. Show ALL data from main tables (TABLE VIEW)
        # ==================================================
        print("\n\n[4] ALL DATA FROM MAIN TABLES")
        print("-" * 100)

        # EVENTS - ALL ROWS WITH ALL COLUMNS (TABLE VIEW)
        print("\n[EVENT] EVENTS TABLE - ALL ROWS (ALL COLUMNS)")
        print("-" * 200)
        cursor.execute("SELECT * FROM event ORDER BY id;")
        events = cursor.fetchall()

        # Get column names
        cursor.execute("""
            SELECT column_name FROM information_schema.columns
            WHERE table_name = 'event'
            ORDER BY ordinal_position;
        """)
        event_cols = [col[0] for col in cursor.fetchall()]

        # Print header
        header = " | ".join([f"{col[:15]:15s}" for col in event_cols])
        print(header)
        print("-" * 200)

        # Print rows
        for event in events:
            row_values = []
            for i, value in enumerate(event):
                if value is None:
                    row_values.append("NULL".ljust(15))
                elif isinstance(value, str):
                    row_values.append(value[:15].ljust(15))
                else:
                    row_values.append(str(value)[:15].ljust(15))
            print(" | ".join(row_values))

        print(f"\nTotal: {len(events)} events\n")

        # ORGANIZATIONS - ALL ROWS WITH ALL COLUMNS (TABLE VIEW)
        print("[ORG] ORGANIZATIONS TABLE - ALL ROWS (ALL COLUMNS)")
        print("-" * 200)
        cursor.execute("SELECT * FROM organization ORDER BY id;")
        orgs = cursor.fetchall()

        # Get column names
        cursor.execute("""
            SELECT column_name FROM information_schema.columns
            WHERE table_name = 'organization'
            ORDER BY ordinal_position;
        """)
        org_cols = [col[0] for col in cursor.fetchall()]

        # Print header
        header = " | ".join([f"{col[:15]:15s}" for col in org_cols])
        print(header)
        print("-" * 200)

        # Print rows
        for org in orgs:
            row_values = []
            for i, value in enumerate(org):
                if value is None:
                    row_values.append("NULL".ljust(15))
                elif isinstance(value, str):
                    row_values.append(value[:15].ljust(15))
                else:
                    row_values.append(str(value)[:15].ljust(15))
            print(" | ".join(row_values))

        print(f"\nTotal: {len(orgs)} organizations\n")

        # RESOURCES - ALL ROWS WITH ALL COLUMNS (TABLE VIEW)
        print("[RESOURCE] RESOURCES TABLE - ALL ROWS (ALL COLUMNS)")
        print("-" * 200)
        cursor.execute("SELECT * FROM resource ORDER BY id;")
        resources = cursor.fetchall()

        # Get column names
        cursor.execute("""
            SELECT column_name FROM information_schema.columns
            WHERE table_name = 'resource'
            ORDER BY ordinal_position;
        """)
        resource_cols = [col[0] for col in cursor.fetchall()]

        # Print header
        header = " | ".join([f"{col[:15]:15s}" for col in resource_cols])
        print(header)
        print("-" * 200)

        # Print rows
        for resource in resources:
            row_values = []
            for i, value in enumerate(resource):
                if value is None:
                    row_values.append("NULL".ljust(15))
                elif isinstance(value, str):
                    row_values.append(value[:15].ljust(15))
                else:
                    row_values.append(str(value)[:15].ljust(15))
            print(" | ".join(row_values))

        print(f"\nTotal: {len(resources)} resources\n")

        # ==================================================
        # 5. Show ALL junction table relationships
        # ==================================================
        print("\n[5] ALL JUNCTION TABLE DATA (Many-to-Many Relationships)")
        print("-" * 100)

        # EVENT_RESOURCES
        print("\n[LINK] EVENT_RESOURCES - ALL LINKS")
        print("-" * 100)
        cursor.execute("SELECT event_id, resource_id FROM event_resources ORDER BY event_id, resource_id;")
        event_resources = cursor.fetchall()
        print(f"{'Event ID':<10} {'Resource ID':<12}")
        print("-" * 100)
        for link in event_resources:
            print(f"{link[0]:<10} {link[1]:<12}")
        print(f"\nTotal: {len(event_resources)} event-resource links")

        # ORGANIZATION_RESOURCES
        print("\n\n[LINK] ORGANIZATION_RESOURCES - ALL LINKS")
        print("-" * 100)
        cursor.execute("SELECT organization_id, resource_id FROM organization_resources ORDER BY organization_id, resource_id;")
        org_resources = cursor.fetchall()
        print(f"{'Org ID':<10} {'Resource ID':<12}")
        print("-" * 100)
        for link in org_resources:
            print(f"{link[0]:<10} {link[1]:<12}")
        print(f"\nTotal: {len(org_resources)} organization-resource links")

        # ==================================================
        # 6. Verify data integrity
        # ==================================================
        print("\n\n[6] DATA INTEGRITY CHECKS")
        print("-" * 100)

        # Check for NULL values in required fields
        print("\n[CHECK] Checking for NULL values in required fields...")

        # Events
        cursor.execute("SELECT COUNT(*) FROM event WHERE title IS NULL;")
        null_titles = cursor.fetchone()[0]
        print(f"  Events with NULL title: {null_titles} {'[OK]' if null_titles == 0 else '[ERROR]'}")

        cursor.execute("SELECT COUNT(*) FROM event WHERE date IS NULL;")
        null_dates = cursor.fetchone()[0]
        print(f"  Events with NULL date: {null_dates} {'[OK]' if null_dates == 0 else '[ERROR]'}")

        # Organizations
        cursor.execute("SELECT COUNT(*) FROM organization WHERE name IS NULL;")
        null_names = cursor.fetchone()[0]
        print(f"  Organizations with NULL name: {null_names} {'[OK]' if null_names == 0 else '[ERROR]'}")

        cursor.execute("SELECT COUNT(*) FROM organization WHERE city IS NULL;")
        null_cities = cursor.fetchone()[0]
        print(f"  Organizations with NULL city: {null_cities} {'[OK]' if null_cities == 0 else '[ERROR]'}")

        # Resources
        cursor.execute("SELECT COUNT(*) FROM resource WHERE title IS NULL;")
        null_res_titles = cursor.fetchone()[0]
        print(f"  Resources with NULL title: {null_res_titles} {'[OK]' if null_res_titles == 0 else '[ERROR]'}")

        cursor.execute("SELECT COUNT(*) FROM resource WHERE description IS NULL;")
        null_descriptions = cursor.fetchone()[0]
        print(f"  Resources with NULL description: {null_descriptions} {'[OK]' if null_descriptions == 0 else '[ERROR]'}")

        # Check foreign key integrity
        print("\n[CHECK] Checking foreign key integrity...")

        cursor.execute("""
            SELECT COUNT(*) FROM event
            WHERE organization_id IS NOT NULL
            AND organization_id NOT IN (SELECT id FROM organization);
        """)
        orphaned_events = cursor.fetchone()[0]
        print(f"  Events with invalid organization_id: {orphaned_events} {'[OK]' if orphaned_events == 0 else '[ERROR]'}")

        # Check relationship integrity
        print("\n[CHECK] Checking relationship integrity...")

        cursor.execute("""
            SELECT COUNT(*) FROM event_resources
            WHERE event_id NOT IN (SELECT id FROM event);
        """)
        invalid_event_links = cursor.fetchone()[0]
        print(f"  Invalid event_resources links: {invalid_event_links} {'[OK]' if invalid_event_links == 0 else '[ERROR]'}")

        cursor.execute("""
            SELECT COUNT(*) FROM event_resources
            WHERE resource_id NOT IN (SELECT id FROM resource);
        """)
        invalid_resource_links = cursor.fetchone()[0]
        print(f"  Invalid resource references in event_resources: {invalid_resource_links} {'[OK]' if invalid_resource_links == 0 else '[ERROR]'}")

        # ==================================================
        # 7. Connection count per instance
        # ==================================================
        print("\n\n[7] CONNECTION COUNT FOR ALL INSTANCES")
        print("-" * 100)

        print("\n[EVENT] ALL EVENTS (with connection counts):")
        cursor.execute("""
            SELECT
                e.id,
                e.title,
                COUNT(DISTINCT er.resource_id) as resource_count,
                CASE WHEN e.organization_id IS NOT NULL THEN 1 ELSE 0 END as has_org,
                COUNT(DISTINCT er.resource_id) + CASE WHEN e.organization_id IS NOT NULL THEN 1 ELSE 0 END as total_connections
            FROM event e
            LEFT JOIN event_resources er ON e.id = er.event_id
            GROUP BY e.id, e.title, e.organization_id
            ORDER BY total_connections, e.id;
        """)
        event_connections = cursor.fetchall()

        print(f"{'ID':<5} {'Title':<45} {'Resources':<10} {'Has Org':<8} {'Total':<6} {'Status':<5}")
        print("-" * 100)
        issues = []
        for ec in event_connections:
            status = '[OK]' if ec[4] >= 2 else '[ERROR]'
            print(f"{ec[0]:<5} {ec[1][:45]:<45} {ec[2]:<10} {ec[3]:<8} {ec[4]:<6} {status:<5}")
            if ec[4] < 2:
                issues.append(f"Event {ec[0]} '{ec[1]}' has only {ec[4]} connections")

        print(f"\n[SUMMARY] Events with < 2 connections: {len(issues)}")

        print("\n\n[ORG] ALL ORGANIZATIONS (with connection counts):")
        cursor.execute("""
            SELECT
                o.id,
                o.name,
                COUNT(DISTINCT e.id) as event_count,
                COUNT(DISTINCT ors.resource_id) as resource_count,
                COUNT(DISTINCT e.id) + COUNT(DISTINCT ors.resource_id) as total_connections
            FROM organization o
            LEFT JOIN event e ON o.id = e.organization_id
            LEFT JOIN organization_resources ors ON o.id = ors.organization_id
            GROUP BY o.id, o.name
            ORDER BY total_connections, o.id;
        """)
        org_connections = cursor.fetchall()

        print(f"{'ID':<5} {'Name':<45} {'Events':<8} {'Resources':<10} {'Total':<6} {'Status':<5}")
        print("-" * 100)
        org_issues = []
        for oc in org_connections:
            status = '[OK]' if oc[4] >= 2 else '[ERROR]'
            print(f"{oc[0]:<5} {oc[1][:45]:<45} {oc[2]:<8} {oc[3]:<10} {oc[4]:<6} {status:<5}")
            if oc[4] < 2:
                org_issues.append(f"Organization {oc[0]} '{oc[1]}' has only {oc[4]} connections")

        print(f"\n[SUMMARY] Organizations with < 2 connections: {len(org_issues)}")

        print("\n\n[RESOURCE] ALL RESOURCES (with connection counts):")
        cursor.execute("""
            SELECT
                r.id,
                r.title,
                COUNT(DISTINCT er.event_id) as event_count,
                COUNT(DISTINCT ors.organization_id) as org_count,
                COUNT(DISTINCT er.event_id) + COUNT(DISTINCT ors.organization_id) as total_connections
            FROM resource r
            LEFT JOIN event_resources er ON r.id = er.resource_id
            LEFT JOIN organization_resources ors ON r.id = ors.resource_id
            GROUP BY r.id, r.title
            ORDER BY total_connections, r.id;
        """)
        resource_connections = cursor.fetchall()

        print(f"{'ID':<5} {'Title':<45} {'Events':<8} {'Orgs':<8} {'Total':<6} {'Status':<5}")
        print("-" * 100)
        res_issues = []
        for rc in resource_connections:
            status = '[OK]' if rc[4] >= 2 else '[ERROR]'
            print(f"{rc[0]:<5} {rc[1][:45]:<45} {rc[2]:<8} {rc[3]:<8} {rc[4]:<6} {status:<5}")
            if rc[4] < 2:
                res_issues.append(f"Resource {rc[0]} '{rc[1][:40]}' has only {rc[4]} connections")

        print(f"\n[SUMMARY] Resources with < 2 connections: {len(res_issues)}")

        # Final summary
        print("\n\n" + "=" * 100)
        print("VERIFICATION SUMMARY")
        print("=" * 100)

        total_issues = len(issues) + len(org_issues) + len(res_issues)

        if total_issues == 0:
            print("\n[SUCCESS] ALL CHECKS PASSED!")
            print(f"   - {len(events)} events - all have 2+ connections")
            print(f"   - {len(orgs)} organizations - all have 2+ connections")
            print(f"   - {len(resources)} resources - all have 2+ connections")
            print(f"   - {len(event_resources)} event-resource links")
            print(f"   - {len(org_resources)} organization-resource links")
        else:
            print(f"\n[FAILED] FOUND {total_issues} ISSUES:")
            for issue in issues + org_issues + res_issues:
                print(f"   - {issue}")

        # Close connection
        cursor.close()
        conn.close()

        print("\n" + "=" * 100)
        print("DATABASE VERIFICATION COMPLETE")
        print("=" * 100)

    except Exception as e:
        print(f"\n[ERROR] Error: {e}")


if __name__ == "__main__":
    verify_database()
