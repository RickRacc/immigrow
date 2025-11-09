from flask import Flask, jsonify, request
from flask_cors import CORS
import os

# Import models and database
from models import db, Event, Organization, Resource

app = Flask(__name__)
CORS(app)

# Database Configuration
# Priority: DATABASE_URL (production) > PostgreSQL (recommended) > MySQL > SQLite (fallback)
DATABASE_URL = os.getenv('DATABASE_URL')

if DATABASE_URL:
    # Option 1: Use DATABASE_URL (production - Heroku, AWS, etc.)
    app.config['SQLALCHEMY_DATABASE_URI'] = DATABASE_URL
    print("[OK] Using DATABASE_URL for database connection")
elif os.getenv('POSTGRES_HOST'):
    # Option 2: PostgreSQL with individual variables (RECOMMENDED for development)
    pg_user = os.getenv('POSTGRES_USER', 'postgres')
    pg_password = os.getenv('POSTGRES_PASSWORD', '')
    pg_host = os.getenv('POSTGRES_HOST', 'localhost')
    pg_port = os.getenv('POSTGRES_PORT', '5432')
    pg_db = os.getenv('POSTGRES_DATABASE', 'immigrow')

    app.config['SQLALCHEMY_DATABASE_URI'] = (
        f'postgresql://{pg_user}:{pg_password}@'
        f'{pg_host}:{pg_port}/{pg_db}'
    )
    print(f"[OK] Using PostgreSQL: {pg_host}:{pg_port}/{pg_db}")
elif os.getenv('MYSQL_HOST'):
    # Option 3: MySQL configuration (alternative)
    mysql_user = os.getenv('MYSQL_USER', 'root')
    mysql_password = os.getenv('MYSQL_PASSWORD', '')
    mysql_host = os.getenv('MYSQL_HOST', 'localhost')
    mysql_port = os.getenv('MYSQL_PORT', '3306')
    mysql_db = os.getenv('MYSQL_DATABASE', 'immigrow')

    app.config['SQLALCHEMY_DATABASE_URI'] = (
        f'mysql+pymysql://{mysql_user}:{mysql_password}@'
        f'{mysql_host}:{mysql_port}/{mysql_db}'
    )
    print(f"[OK] Using MySQL: {mysql_host}:{mysql_port}/{mysql_db}")
else:
    # Option 4: SQLite fallback (development only)
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///immigrow.db'
    print("[WARNING] Using SQLite database (development mode)")
    print("   RECOMMENDED: Install PostgreSQL and configure POSTGRES_* variables in .env")
    print("   See backend/SETUP.md for PostgreSQL installation instructions")

app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# Initialize database
db.init_app(app)


# ============================================================================
# HOME ROUTE
# ============================================================================

@app.route("/")
def home():
    """API root endpoint"""
    return jsonify({
        'message': 'Welcome to Immigrow API',
        'version': '2.0',
        'endpoints': {
            'events': '/events',
            'organizations': '/orgs',
            'resources': '/resources'
        }
    })


# ============================================================================
# EVENT ROUTES
# ============================================================================

@app.route("/events", methods=["GET"])
def get_events():
    """
    Get all events with optional filtering and sorting

    Query Parameters:
    - location: Filter by location (city or state)
    - date: Filter by date (YYYY-MM-DD)
    - limit: Limit number of results (default: 100)
    - include_relationships: Include related organizations and resources (true/false)
    """
    try:
        query = Event.query

        # Filtering
        location = request.args.get('location')
        if location:
            query = query.filter(
                (Event.city.ilike(f'%{location}%')) |
                (Event.state.ilike(f'%{location}%')) |
                (Event.location.ilike(f'%{location}%'))
            )

        date_filter = request.args.get('date')
        if date_filter:
            query = query.filter(Event.date == date_filter)

        # Sorting (default: by date ascending)
        sort_by = request.args.get('sort_by', 'date')
        if sort_by == 'date':
            query = query.order_by(Event.date.asc())
        elif sort_by == 'title':
            query = query.order_by(Event.title.asc())

        # Limit
        limit = request.args.get('limit', 100, type=int)
        events = query.limit(limit).all()

        # Include relationships
        include_rel = request.args.get('include_relationships', 'false').lower() == 'true'

        return jsonify([event.to_dict(include_relationships=include_rel) for event in events])

    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route("/events/<int:id>", methods=["GET"])
def get_event_by_id(id):
    """
    Get single event by ID with all relationships

    Path Parameters:
    - id: Event ID
    """
    try:
        event = Event.query.get_or_404(id)
        return jsonify(event.to_dict(include_relationships=True))
    except Exception as e:
        return jsonify({'error': 'Event not found'}), 404


# ============================================================================
# ORGANIZATION ROUTES
# ============================================================================

@app.route("/orgs", methods=["GET"])
def get_orgs():
    """
    Get all organizations with optional filtering and sorting

    Query Parameters:
    - location: Filter by location (city or state)
    - topic: Filter by topic
    - limit: Limit number of results (default: 100)
    - include_relationships: Include related events and resources (true/false)
    """
    try:
        query = Organization.query

        # Filtering
        location = request.args.get('location')
        if location:
            query = query.filter(
                (Organization.city.ilike(f'%{location}%')) |
                (Organization.state.ilike(f'%{location}%'))
            )

        topic = request.args.get('topic')
        if topic:
            query = query.filter(Organization.topic.ilike(f'%{topic}%'))

        # Sorting (default: by name)
        sort_by = request.args.get('sort_by', 'name')
        if sort_by == 'name':
            query = query.order_by(Organization.name.asc())
        elif sort_by == 'city':
            query = query.order_by(Organization.city.asc())

        # Limit
        limit = request.args.get('limit', 100, type=int)
        orgs = query.limit(limit).all()

        # Include relationships
        include_rel = request.args.get('include_relationships', 'false').lower() == 'true'

        return jsonify([org.to_dict(include_relationships=include_rel) for org in orgs])

    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route("/orgs/<int:id>", methods=["GET"])
def get_org_by_id(id):
    """
    Get single organization by ID with all relationships

    Path Parameters:
    - id: Organization ID
    """
    try:
        org = Organization.query.get_or_404(id)
        return jsonify(org.to_dict(include_relationships=True))
    except Exception as e:
        return jsonify({'error': 'Organization not found'}), 404


# ============================================================================
# RESOURCE ROUTES
# ============================================================================

@app.route("/resources", methods=["GET"])
def get_resources():
    """
    Get all legal resources with optional filtering and sorting

    Query Parameters:
    - topic: Filter by topic
    - scope: Filter by scope (Federal/State/Local)
    - limit: Limit number of results (default: 100)
    - include_relationships: Include related organizations and events (true/false)
    """
    try:
        query = Resource.query

        # Filtering
        topic = request.args.get('topic')
        if topic:
            query = query.filter(Resource.topic.ilike(f'%{topic}%'))

        scope = request.args.get('scope')
        if scope:
            query = query.filter(Resource.scope.ilike(f'%{scope}%'))

        # Sorting (default: by date descending)
        sort_by = request.args.get('sort_by', 'date')
        if sort_by == 'date':
            query = query.order_by(Resource.date_published.desc())
        elif sort_by == 'title':
            query = query.order_by(Resource.title.asc())

        # Limit
        limit = request.args.get('limit', 100, type=int)
        resources = query.limit(limit).all()

        # Include relationships
        include_rel = request.args.get('include_relationships', 'false').lower() == 'true'

        return jsonify([resource.to_dict(include_relationships=include_rel) for resource in resources])

    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route("/resources/<int:id>", methods=["GET"])
def get_resource_by_id(id):
    """
    Get single resource by ID with all relationships

    Path Parameters:
    - id: Resource ID
    """
    try:
        resource = Resource.query.get_or_404(id)
        return jsonify(resource.to_dict(include_relationships=True))
    except Exception as e:
        return jsonify({'error': 'Resource not found'}), 404


# ============================================================================
# SEARCH ROUTE (BONUS)
# ============================================================================

@app.route("/search", methods=["GET"])
def search_all():
    """
    Search across all models

    Query Parameters:
    - q: Search query
    - limit: Limit per model (default: 10)
    """
    try:
        query = request.args.get('q', '')
        limit = request.args.get('limit', 10, type=int)

        if not query:
            return jsonify({'error': 'Query parameter "q" is required'}), 400

        # Search events
        events = Event.query.filter(
            (Event.title.ilike(f'%{query}%')) |
            (Event.description.ilike(f'%{query}%'))
        ).limit(limit).all()

        # Search organizations
        orgs = Organization.query.filter(
            (Organization.name.ilike(f'%{query}%')) |
            (Organization.description.ilike(f'%{query}%'))
        ).limit(limit).all()

        # Search resources
        resources = Resource.query.filter(
            (Resource.title.ilike(f'%{query}%')) |
            (Resource.description.ilike(f'%{query}%'))
        ).limit(limit).all()

        return jsonify({
            'query': query,
            'results': {
                'events': [e.to_dict() for e in events],
                'organizations': [o.to_dict() for o in orgs],
                'resources': [r.to_dict() for r in resources]
            }
        })

    except Exception as e:
        return jsonify({'error': str(e)}), 500


# ============================================================================
# UTILITY ROUTES
# ============================================================================

@app.route("/stats", methods=["GET"])
def get_stats():
    """Get database statistics"""
    try:
        return jsonify({
            'events': Event.query.count(),
            'organizations': Organization.query.count(),
            'resources': Resource.query.count()
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500


# ============================================================================
# DATABASE INITIALIZATION
# ============================================================================

@app.cli.command('init-db')
def init_db():
    """Initialize the database (create tables)"""
    db.create_all()
    print("[OK] Database tables created")


@app.cli.command('seed-db')
def seed_db():
    """Seed the database with data from APIs"""
    from seed_database import seed_database
    seed_database(app)


@app.cli.command('reset-db')
def reset_db():
    """Reset the database (drop and recreate tables)"""
    db.drop_all()
    db.create_all()
    print("[OK] Database reset complete")


# ============================================================================
# ERROR HANDLERS
# ============================================================================

@app.errorhandler(404)
def not_found(e):
    return jsonify({'error': 'Resource not found'}), 404


@app.errorhandler(500)
def internal_error(e):
    return jsonify({'error': 'Internal server error'}), 500


# ============================================================================
# MAIN
# ============================================================================

if __name__ == "__main__":
    # Create tables if they don't exist
    with app.app_context():
        db.create_all()

    # Run the app
    port = int(os.getenv('PORT', 5000))
    debug = os.getenv('FLASK_ENV') == 'development'

    print("\n" + "=" * 60)
    print("IMMIGROW API SERVER")
    print("=" * 60)
    print(f"Database: {app.config['SQLALCHEMY_DATABASE_URI']}")
    print(f"Port: {port}")
    print(f"Debug: {debug}")
    print("\nAPI Endpoints:")
    print("  GET  /events")
    print("  GET  /events/<id>")
    print("  GET  /orgs")
    print("  GET  /orgs/<id>")
    print("  GET  /resources")
    print("  GET  /resources/<id>")
    print("  GET  /search?q=<query>")
    print("  GET  /stats")
    print("\nTo seed database: flask seed-db")
    print("=" * 60 + "\n")

    app.run(debug=debug, port=port, host='0.0.0.0')
