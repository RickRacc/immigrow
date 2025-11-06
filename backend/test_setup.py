"""
Quick test script to verify Phase 2 setup
Run this to check if everything is working correctly
"""

import os
import sys

def test_imports():
    """Test if all required modules can be imported"""
    print("Testing imports...")
    try:
        import flask
        import flask_sqlalchemy
        import flask_cors
        import requests
        print("All core dependencies imported successfully")
        return True
    except ImportError as e:
        print(f"Import error: {e}")
        print("Run: pip install -r requirements.txt")
        return False


def test_models():
    """Test if models are properly defined"""
    print("\nTesting models...")
    try:
        from models import db, Event, Organization, Resource
        print(" All models imported successfully")

        # Check Event model
        event_attrs = ['title', 'date', 'start_time', 'duration_minutes', 'location']
        for attr in event_attrs:
            assert hasattr(Event, attr), f"Event missing attribute: {attr}"
        print(" Event model has all required attributes")

        # Check Organization model
        org_attrs = ['name', 'city', 'state', 'topic', 'size']
        for attr in org_attrs:
            assert hasattr(Organization, attr), f"Organization missing attribute: {attr}"
        print(" Organization model has all required attributes")

        # Check Resource model
        resource_attrs = ['title', 'date_published', 'topic', 'scope', 'description']
        for attr in resource_attrs:
            assert hasattr(Resource, attr), f"Resource missing attribute: {attr}"
        print(" Resource model has all required attributes")

        return True
    except Exception as e:
        print(f" Model test error: {e}")
        return False


def test_api_integrations():
    """Test if API integration classes are defined"""
    print("\nTesting API integrations...")
    try:
        from api_integrations import EventbriteAPI, ProPublicaNonprofitAPI, CourtListenerAPI

        # Test ProPublica (no auth required)
        print("  Testing ProPublica API...")
        propublica = ProPublicaNonprofitAPI()
        print(" ProPublica API initialized")

        # Test CourtListener (no auth required)
        print("  Testing CourtListener API...")
        court = CourtListenerAPI()
        print(" CourtListener API initialized")

        # Test Eventbrite (auth required but should handle gracefully)
        print("  Testing Eventbrite API...")
        try:
            eventbrite = EventbriteAPI()
            print(" Eventbrite API initialized (token found)")
        except ValueError:
            print(" Eventbrite API token not set (this is okay for testing)")
            print(" Set EVENTBRITE_API_TOKEN in .env for real event data")

        return True
    except Exception as e:
        print(f"API integration test error: {e}")
        return False


def test_app():
    """Test if Flask app can be created"""
    print("\nTesting Flask app...")
    try:
        from app import app, db
        print("Flask app imported successfully")
        print(f"  Database URI: {app.config.get('SQLALCHEMY_DATABASE_URI', 'Not set')}")

        # Test app context
        with app.app_context():
            # Try to create tables
            db.create_all()
            print("Database tables created successfully")

            # Check if tables exist
            from models import Event, Organization, Resource
            print(f"  Events table: {Event.__tablename__}")
            print(f"  Organizations table: {Organization.__tablename__}")
            print(f"  Resources table: {Resource.__tablename__}")

        return True
    except Exception as e:
        print(f"App test error: {e}")
        return False


def test_api_fetch():
    """Test fetching data from APIs (without database)"""
    print("\nTesting API data fetching...")
    try:
        from api_integrations import ProPublicaNonprofitAPI, CourtListenerAPI

        # Test ProPublica
        print("  Fetching sample organization from ProPublica...")
        propublica = ProPublicaNonprofitAPI()
        orgs = propublica.fetch_organizations(limit=1)
        if orgs:
            print(f" Fetched: {orgs[0]['name']}")
        else:
            print("  No organizations fetched (API may be down)")

        # Test CourtListener
        print("  Fetching sample case from CourtListener...")
        court = CourtListenerAPI()
        cases = court.search_immigration_cases(limit=1)
        if cases:
            print(f"Fetched: {cases[0]['title'][:60]}...")
        else:
            print(" No cases fetched (API may be down)")

        return True
    except Exception as e:
        print(f"API fetch test error: {e}")
        return False


def check_environment():
    """Check environment variables"""
    print("\nChecking environment variables...")

    # Check if .env exists
    env_file = os.path.join(os.path.dirname(__file__), '.env')
    if os.path.exists(env_file):
        print(".env file found")
    else:
        print(".env file not found")
        print("  Copy .env.example to .env and configure")

    # Check important env vars
    if os.getenv('EVENTBRITE_API_TOKEN'):
        print("EVENTBRITE_API_TOKEN is set")
    else:
        print("EVENTBRITE_API_TOKEN not set (optional but recommended)")

    if os.getenv('DATABASE_URL') or os.getenv('POSTGRES_HOST') or os.getenv('MYSQL_HOST'):
        print("Database configuration found")
    else:
        print("No database configuration (will use SQLite)")

    return True


def main():
    """Run all tests"""
    print("=" * 70)
    print("IMMIGROW PHASE 2 - SETUP TEST")
    print("=" * 70)

    results = {
        'Environment Check': check_environment(),
        'Import Test': test_imports(),
        'Model Test': test_models(),
        'API Integration Test': test_api_integrations(),
        'Flask App Test': test_app(),
        'API Fetch Test': test_api_fetch()
    }

    print("\n" + "=" * 70)
    print("TEST SUMMARY")
    print("=" * 70)

    all_passed = True
    for test_name, passed in results.items():
        status = "✓ PASS" if passed else "✗ FAIL"
        print(f"{test_name:.<50} {status}")
        if not passed:
            all_passed = False

    print("=" * 70)

    if all_passed:
        print("\nAll tests passed! Your Phase 2 setup is ready.")
        print("\nNext steps:")
        print("1. Set EVENTBRITE_API_TOKEN in .env (optional)")
        print("2. Run: python seed_database.py")
        print("3. Run: python app.py")
        print("4. Test API: curl http://localhost:5000/stats")
    else:
        print("\nSome tests failed. Please fix the issues above.")
        print("\nCommon fixes:")
        print("1. Install dependencies: pip install -r requirements.txt")
        print("2. Copy environment file: cp .env.example .env")
        print("3. Check Python version: python --version (need 3.8+)")

    print("\n")


if __name__ == "__main__":
    main()
