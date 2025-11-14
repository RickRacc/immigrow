from flask import Flask, jsonify, request
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from datetime import date, time, datetime
import math
import re

app = Flask(__name__)
CORS(app)

# serialize dates and times
def as_iso(val):
    if val is None:
        return None
    if isinstance(val, (datetime, date, time)):
        return val.isoformat()
    if isinstance(val, str):
        return val
    return str(val)


def calculate_relevance_score(item, search_query, searchable_fields):
    """
    Calculate relevance score for search results.
    Returns score where higher = more relevant.

    Algorithm (per PHASE3_STEPS.txt):
    1. Full phrase match (complete phrase as substring) = 1000 points
    2. Each matching word (substring matching) = 100 points
    3. Consecutive word sequences = 50 bonus points per sequence

    Example from spec: query "quick fox"
    - "the quick fox" = 1000 (phrase) + 200 (both words) + 50 (consecutive) = 1250
    - "quickly the fox runs" = 0 (no phrase) + 200 (both: "quick" in "quickly" + "fox") = 200
    - "the fox" = 0 (no phrase) + 100 (only "fox" present) = 100

    Ranking: 1250 > 200 > 100 (matches spec requirement)
    Note: "quick" DOES match "quickly" (substring matching as per spec)
    """
    if not search_query:
        return 0

    # Normalize and split search query into words
    words = re.findall(r'\w+', search_query.lower())
    if not words:
        return 0

    # Normalize search phrase (remove extra whitespace)
    normalized_phrase = ' '.join(words)

    score = 0
    all_text = ""

    # Collect all searchable text from the item
    for field in searchable_fields:
        value = getattr(item, field, None)
        if value:
            all_text += " " + str(value).lower()

    # Normalize whitespace in collected text
    normalized_text = ' '.join(all_text.split())

    # Check for full phrase match (highest priority)
    if normalized_phrase in normalized_text:
        score += 1000

    # Count matching words (substring matching - "quick" matches "quickly")
    matching_words = sum(1 for word in words if word in normalized_text)
    score += matching_words * 100

    # Bonus for consecutive word sequences
    for i in range(len(words) - 1):
        consecutive = f"{words[i]} {words[i+1]}"
        if consecutive in normalized_text:
            score += 50

    return score


app.config['SQLALCHEMY_DATABASE_URI'] = 'postgresql://postgres:Immigrow123@immigrow-db.cz8gegw2sqh9.us-east-2.rds.amazonaws.com:5432/Immigrow'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)

class Organization(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(255), nullable=False)
    city = db.Column(db.String(100), nullable=False)
    state = db.Column(db.String(50), nullable=False)
    topic = db.Column(db.String(100), nullable=False)
    size = db.Column(db.String(50), nullable=False)
    meeting_frequency = db.Column(db.String(50))
    description = db.Column(db.Text)
    address = db.Column(db.String(255))
    zipcode = db.Column(db.String(20))
    ein = db.Column(db.String(20))
    subsection_code = db.Column(db.String(20))
    ntee_code = db.Column(db.String(20))
    external_url = db.Column(db.String(500))
    image_url = db.Column(db.String(500))
    guidestar_url = db.Column(db.String(500))
    form_990_pdf_url = db.Column(db.String(500))
    created_at = db.Column(db.DateTime)
    updated_at = db.Column(db.DateTime)

class OrganizationResources(db.Model):
    organization_id = db.Column(db.Integer, primary_key=True)
    resource_id = db.Column(db.Integer, primary_key=True)

class Event(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(255), nullable=False)
    date = db.Column(db.Date, nullable=False)
    start_time = db.Column(db.String(50), nullable=False)
    duration_minutes = db.Column(db.Integer, nullable=False)
    location = db.Column(db.String(255), nullable=False)
    city = db.Column(db.String(100))
    state = db.Column(db.String(50))
    venue_name = db.Column(db.String(255))
    description = db.Column(db.Text)
    external_url = db.Column(db.String(500))
    image_url = db.Column(db.String(500))
    eventbrite_id = db.Column(db.String(100))
    end_time = db.Column(db.String(50))
    timezone = db.Column(db.String(50))
    organization_id = db.Column(db.Integer)
    created_at = db.Column(db.DateTime)
    updated_at = db.Column(db.DateTime)

class EventResources(db.Model):
    event_id = db.Column(db.Integer, primary_key=True)
    resource_id = db.Column(db.Integer, primary_key=True)

class Resource(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(500), nullable=False)
    date_published = db.Column(db.Date, nullable=False)
    topic = db.Column(db.String(100), nullable=False)
    scope = db.Column(db.String(50), nullable=False)
    description = db.Column(db.Text, nullable=False)
    format = db.Column(db.String(50))
    court_name = db.Column(db.String(255))
    citation = db.Column(db.String(255))
    external_url = db.Column(db.String(500))
    image_url = db.Column(db.String(500))
    audio_url = db.Column(db.String(500))
    courtlistener_id = db.Column(db.String(100))
    docket_number = db.Column(db.String(100))
    judge_name = db.Column(db.String(255))
    created_at = db.Column(db.DateTime)
    updated_at = db.Column(db.DateTime)

@app.route("/")
def home():
    return "Hello!"

# get all organizations
@app.route("/api/orgs", methods=["GET"])
def get_orgs():
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 15, type=int)

    # Search parameter
    search_query = request.args.get('search', '', type=str).strip()

    # Sort parameters: sort_by (name, city) and sort_order (asc, desc)
    sort_by = request.args.get('sort_by', '', type=str).lower()
    sort_order = request.args.get('sort_order', 'asc', type=str).lower()

    # Filter parameters (support comma-separated multiple values)
    filter_state = request.args.get('state', '', type=str).strip()
    filter_topic = request.args.get('topic', '', type=str).strip()
    filter_size = request.args.get('size', '', type=str).strip()

    # Start with base query
    query = Organization.query

    # Apply search filter using multi-word search algorithm
    # (searches across ALL text fields including non-displayed ones)
    org_searchable_fields = [
        'name', 'city', 'state', 'topic', 'description', 'address', 'size',
        'meeting_frequency', 'zipcode', 'ein', 'subsection_code', 'ntee_code',
        'external_url', 'guidestar_url'
    ]

    if search_query:
        # Split search query into words
        words = re.findall(r'\w+', search_query.lower())
        if words:
            # Build OR condition for any word match
            word_conditions = []
            for word in words:
                word_pattern = f"%{word}%"
                word_conditions.append(
                    db.or_(
                        Organization.name.ilike(word_pattern),
                        Organization.city.ilike(word_pattern),
                        Organization.state.ilike(word_pattern),
                        Organization.topic.ilike(word_pattern),
                        Organization.description.ilike(word_pattern),
                        Organization.address.ilike(word_pattern),
                        Organization.size.ilike(word_pattern),
                        Organization.meeting_frequency.ilike(word_pattern),
                        Organization.zipcode.ilike(word_pattern),
                        Organization.ein.ilike(word_pattern),
                        Organization.subsection_code.ilike(word_pattern),
                        Organization.ntee_code.ilike(word_pattern),
                        Organization.external_url.ilike(word_pattern),
                        Organization.guidestar_url.ilike(word_pattern)
                    )
                )
            # Combine all word conditions with OR
            query = query.filter(db.or_(*word_conditions))

    # Apply filters - support multiple values (comma-separated)
    if filter_state:
        states = [s.strip() for s in filter_state.split(',') if s.strip()]
        if states:
            state_conditions = [Organization.state.ilike(s) for s in states]
            query = query.filter(db.or_(*state_conditions))

    if filter_topic:
        topics = [t.strip() for t in filter_topic.split(',') if t.strip()]
        if topics:
            topic_conditions = [Organization.topic.ilike(f"%{t}%") for t in topics]
            query = query.filter(db.or_(*topic_conditions))

    if filter_size:
        sizes = [sz.strip() for sz in filter_size.split(',') if sz.strip()]
        if sizes:
            size_conditions = [Organization.size.ilike(f"%{sz}%") for sz in sizes]
            query = query.filter(db.or_(*size_conditions))

    # If search query exists, apply relevance-based sorting
    # Otherwise use the regular sorting
    if search_query:
        # Get all matching results (no pagination yet)
        all_orgs = query.all()

        # Calculate relevance scores for each result
        orgs_with_scores = []
        for org in all_orgs:
            score = calculate_relevance_score(org, search_query, org_searchable_fields)
            orgs_with_scores.append((org, score))

        # Sort by relevance score (descending - highest score first)
        orgs_with_scores.sort(key=lambda x: x[1], reverse=True)

        # Apply pagination manually
        total = len(orgs_with_scores)
        start_idx = (page - 1) * per_page
        end_idx = start_idx + per_page
        paginated_orgs_with_scores = orgs_with_scores[start_idx:end_idx]
        orgs = [o for o, score in paginated_orgs_with_scores]

        # Calculate total pages
        total_pages = math.ceil(total / per_page) if total > 0 else 0
    else:
        # Apply regular sorting when no search query
        if sort_by == 'name':
            query = query.order_by(Organization.name.desc() if sort_order == 'desc' else Organization.name.asc())
        elif sort_by == 'city':
            query = query.order_by(Organization.city.desc() if sort_order == 'desc' else Organization.city.asc())
        else:
            # Default sort by name ascending
            query = query.order_by(Organization.name.asc())

        # Paginate results
        pagination = query.paginate(page=page, per_page=per_page, error_out=False)
        orgs = pagination.items
        total = pagination.total
        total_pages = pagination.pages

    return jsonify({
        "data": [
            {
                "id": org.id,
                "name": org.name,
                "city": org.city,
                "state": org.state,
                "topic": org.topic,
                "size": org.size,
                "meeting_frequency": org.meeting_frequency,
                "description": org.description,
                "address": org.address,
                "zipcode": org.zipcode,
                "ein": org.ein,
                "subsection_code": org.subsection_code,
                "ntee_code": org.ntee_code,
                "external_url": org.external_url,
                "image_url": org.image_url,
                "guidestar_url": org.guidestar_url,
                "form_990_pdf_url": org.form_990_pdf_url,
                "created_at": as_iso(org.created_at),
                "updated_at": as_iso(org.updated_at),
                "resource_ids": [
                    er.resource_id
                    for er in OrganizationResources.query.filter_by(organization_id=org.id).all()
                ]
            }
            for org in orgs
        ],
        "total": total,
        "page": page,
        "per_page": per_page,
        "total_pages": total_pages,
        "search_query": search_query,
        "filters": {
            "state": filter_state,
            "topic": filter_topic,
            "size": filter_size
        },
        "sort": {
            "sort_by": sort_by,
            "sort_order": sort_order
        }
    })

# get organization by ID
@app.route("/api/orgs/<int:id>", methods=["GET"])
def get_org_by_id(id):
    org = Organization.query.get_or_404(id)

    # Get events hosted by this organization
    events = Event.query.filter_by(organization_id=org.id).all()
    events_list = []
    for event in events:
        events_list.append({
            "id": event.id,
            "title": event.title,
            "date": event.date.isoformat() if event.date else None,
            "start_time": event.start_time,
            "location": event.location,
            "city": event.city,
            "state": event.state,
            "description": event.description,
            "external_url": event.external_url,
            "image_url": event.image_url
        })

    # Get resource details
    resource_ids = [er.resource_id for er in OrganizationResources.query.filter_by(organization_id=org.id).all()]
    resources = []
    for rid in resource_ids:
        res = Resource.query.get(rid)
        if res:
            resources.append({
                "id": res.id,
                "title": res.title,
                "topic": res.topic,
                "scope": res.scope,
                "description": res.description,
                "external_url": res.external_url,
                "image_url": res.image_url
            })

    return jsonify({
        "id": org.id,
        "name": org.name,
        "city": org.city,
        "state": org.state,
        "topic": org.topic,
        "size": org.size,
        "meeting_frequency": org.meeting_frequency,
        "description": org.description,
        "address": org.address,
        "zipcode": org.zipcode,
        "ein": org.ein,
        "subsection_code": org.subsection_code,
        "ntee_code": org.ntee_code,
        "external_url": org.external_url,
        "image_url": org.image_url,
        "guidestar_url": org.guidestar_url,
        "form_990_pdf_url": org.form_990_pdf_url,
        "created_at": as_iso(org.created_at),
        "updated_at": as_iso(org.updated_at),
        "events": events_list,
        "resources": resources
    })

# get all events
@app.route("/api/events", methods=["GET"])
def get_events():
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 15, type=int)

    # Search parameter
    search_query = request.args.get('search', '', type=str).strip()

    # Sort parameters: sort_by (date, title) and sort_order (asc, desc)
    sort_by = request.args.get('sort_by', '', type=str).lower()
    sort_order = request.args.get('sort_order', 'asc', type=str).lower()

    # Filter parameters (now support comma-separated multiple values)
    filter_location = request.args.get('location', '', type=str).strip()
    filter_timezone = request.args.get('timezone', '', type=str).strip()
    filter_duration = request.args.get('duration', '', type=str).strip()  # short, medium, long

    # Start with base query
    query = Event.query

    # Apply search filter using multi-word search algorithm
    # (searches across ALL text fields including non-displayed ones)
    event_searchable_fields = [
        'title', 'description', 'location', 'city', 'state', 'venue_name',
        'start_time', 'end_time', 'timezone', 'external_url', 'eventbrite_id'
    ]

    if search_query:
        # Split search query into words
        words = re.findall(r'\w+', search_query.lower())
        if words:
            # Build OR condition for any word match
            word_conditions = []
            for word in words:
                word_pattern = f"%{word}%"
                word_conditions.append(
                    db.or_(
                        Event.title.ilike(word_pattern),
                        Event.description.ilike(word_pattern),
                        Event.location.ilike(word_pattern),
                        Event.city.ilike(word_pattern),
                        Event.state.ilike(word_pattern),
                        Event.venue_name.ilike(word_pattern),
                        Event.start_time.ilike(word_pattern),
                        Event.end_time.ilike(word_pattern),
                        Event.timezone.ilike(word_pattern),
                        Event.external_url.ilike(word_pattern),
                        Event.eventbrite_id.ilike(word_pattern)
                    )
                )
            # Combine all word conditions with OR
            query = query.filter(db.or_(*word_conditions))

    # Apply filters - support multiple values (comma-separated)
    if filter_location:
        locations = [loc.strip() for loc in filter_location.split(',') if loc.strip()]
        if locations:
            location_conditions = [Event.location.ilike(f"%{loc}%") for loc in locations]
            query = query.filter(db.or_(*location_conditions))

    if filter_timezone:
        timezones = [tz.strip() for tz in filter_timezone.split(',') if tz.strip()]
        if timezones:
            timezone_conditions = [Event.timezone.ilike(tz) for tz in timezones]
            query = query.filter(db.or_(*timezone_conditions))

    if filter_duration:
        if filter_duration == 'short':
            query = query.filter(Event.duration_minutes < 60)
        elif filter_duration == 'medium':
            query = query.filter(Event.duration_minutes >= 60, Event.duration_minutes <= 90)
        elif filter_duration == 'long':
            query = query.filter(Event.duration_minutes > 90)

    # If search query exists, apply relevance-based sorting
    # Otherwise use the regular sorting
    if search_query:
        # Get all matching results (no pagination yet)
        all_events = query.all()

        # Calculate relevance scores for each result
        events_with_scores = []
        for event in all_events:
            score = calculate_relevance_score(event, search_query, event_searchable_fields)
            events_with_scores.append((event, score))

        # Sort by relevance score (descending - highest score first)
        events_with_scores.sort(key=lambda x: x[1], reverse=True)

        # Apply pagination manually
        total = len(events_with_scores)
        start_idx = (page - 1) * per_page
        end_idx = start_idx + per_page
        paginated_events_with_scores = events_with_scores[start_idx:end_idx]
        events = [e for e, score in paginated_events_with_scores]

        # Calculate total pages
        total_pages = math.ceil(total / per_page) if total > 0 else 0
    else:
        # Apply regular sorting when no search query
        if sort_by == 'date':
            query = query.order_by(Event.date.desc() if sort_order == 'desc' else Event.date.asc())
        elif sort_by == 'title':
            query = query.order_by(Event.title.desc() if sort_order == 'desc' else Event.title.asc())
        else:
            # Default sort by date descending (most recent first)
            query = query.order_by(Event.date.desc())

        # Paginate results
        pagination = query.paginate(page=page, per_page=per_page, error_out=False)
        events = pagination.items
        total = pagination.total
        total_pages = pagination.pages

    return jsonify({
        "data": [
            {
                "id": event.id,
                "title": event.title,
                "date": event.date.isoformat() if event.date else None,
                "start_time": event.start_time,
                "end_time": event.end_time,
                "duration_minutes": event.duration_minutes,
                "location": event.location,
                "city": event.city,
                "state": event.state,
                "venue_name": event.venue_name,
                "description": event.description,
                "external_url": event.external_url,
                "image_url": event.image_url,
                "eventbrite_id": event.eventbrite_id,
                "timezone": event.timezone,
                "organization_id": event.organization_id,
                "created_at": as_iso(event.created_at),
                "updated_at": as_iso(event.updated_at),
                "resource_ids": [
                    er.resource_id
                    for er in EventResources.query.filter_by(event_id=event.id).all()
                ]
            }
            for event in events
        ],
        "total": total,
        "page": page,
        "per_page": per_page,
        "total_pages": total_pages,
        "search_query": search_query,
        "filters": {
            "location": filter_location,
            "timezone": filter_timezone,
            "duration": filter_duration
        },
        "sort": {
            "sort_by": sort_by,
            "sort_order": sort_order
        }
    })

# get event by ID
@app.route("/api/events/<int:id>", methods=["GET"])
def get_event_by_id(id):
    event = Event.query.get_or_404(id)

    # Get organization details if exists
    organization = None
    if event.organization_id:
        org = Organization.query.get(event.organization_id)
        if org:
            organization = {
                "id": org.id,
                "name": org.name,
                "city": org.city,
                "state": org.state,
                "topic": org.topic,
                "size": org.size,
                "description": org.description,
                "external_url": org.external_url,
                "image_url": org.image_url
            }

    # Get resource details
    resource_ids = [er.resource_id for er in EventResources.query.filter_by(event_id=event.id).all()]
    resources = []
    for rid in resource_ids:
        res = Resource.query.get(rid)
        if res:
            resources.append({
                "id": res.id,
                "title": res.title,
                "topic": res.topic,
                "scope": res.scope,
                "description": res.description,
                "external_url": res.external_url,
                "image_url": res.image_url
            })

    return jsonify({
        "id": event.id,
        "title": event.title,
        "date": event.date.isoformat() if event.date else None,
        "start_time": event.start_time,
        "end_time": event.end_time,
        "duration_minutes": event.duration_minutes,
        "location": event.location,
        "city": event.city,
        "state": event.state,
        "venue_name": event.venue_name,
        "description": event.description,
        "external_url": event.external_url,
        "image_url": event.image_url,
        "eventbrite_id": event.eventbrite_id,
        "timezone": event.timezone,
        "organization_id": event.organization_id,
        "organization": organization,
        "resources": resources,
        "created_at": as_iso(event.created_at),
        "updated_at": as_iso(event.updated_at)
    })

# get all resources
@app.route("/api/resources", methods=["GET"])
def get_resources():
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 15, type=int)

    # Search parameter
    search_query = request.args.get('search', '', type=str).strip()

    # Sort parameters: sort_by (date_published, title) and sort_order (asc, desc)
    sort_by = request.args.get('sort_by', '', type=str).lower()
    sort_order = request.args.get('sort_order', 'asc', type=str).lower()

    # Filter parameters (support comma-separated multiple values)
    filter_topic = request.args.get('topic', '', type=str).strip()
    filter_scope = request.args.get('scope', '', type=str).strip()
    filter_court = request.args.get('court_name', '', type=str).strip()

    # Start with base query
    query = Resource.query

    # Apply search filter using multi-word search algorithm
    # (searches across ALL text fields including non-displayed ones)
    resource_searchable_fields = [
        'title', 'topic', 'scope', 'description', 'court_name', 'citation',
        'judge_name', 'docket_number', 'format', 'external_url', 'courtlistener_id'
    ]

    if search_query:
        # Split search query into words
        words = re.findall(r'\w+', search_query.lower())
        if words:
            # Build OR condition for any word match
            word_conditions = []
            for word in words:
                word_pattern = f"%{word}%"
                word_conditions.append(
                    db.or_(
                        Resource.title.ilike(word_pattern),
                        Resource.topic.ilike(word_pattern),
                        Resource.scope.ilike(word_pattern),
                        Resource.description.ilike(word_pattern),
                        Resource.court_name.ilike(word_pattern),
                        Resource.citation.ilike(word_pattern),
                        Resource.judge_name.ilike(word_pattern),
                        Resource.docket_number.ilike(word_pattern),
                        Resource.format.ilike(word_pattern),
                        Resource.external_url.ilike(word_pattern),
                        Resource.courtlistener_id.ilike(word_pattern)
                    )
                )
            # Combine all word conditions with OR
            query = query.filter(db.or_(*word_conditions))

    # Apply filters - support multiple values (comma-separated)
    if filter_topic:
        topics = [t.strip() for t in filter_topic.split(',') if t.strip()]
        if topics:
            topic_conditions = [Resource.topic.ilike(f"%{t}%") for t in topics]
            query = query.filter(db.or_(*topic_conditions))

    if filter_scope:
        scopes = [s.strip() for s in filter_scope.split(',') if s.strip()]
        if scopes:
            scope_conditions = [Resource.scope.ilike(s) for s in scopes]
            query = query.filter(db.or_(*scope_conditions))

    if filter_court:
        courts = [c.strip() for c in filter_court.split(',') if c.strip()]
        if courts:
            court_conditions = [Resource.court_name.ilike(f"%{c}%") for c in courts]
            query = query.filter(db.or_(*court_conditions))

    # If search query exists, apply relevance-based sorting
    # Otherwise use the regular sorting
    if search_query:
        # Get all matching results (no pagination yet)
        all_resources = query.all()

        # Calculate relevance scores for each result
        resources_with_scores = []
        for resource in all_resources:
            score = calculate_relevance_score(resource, search_query, resource_searchable_fields)
            resources_with_scores.append((resource, score))

        # Sort by relevance score (descending - highest score first)
        resources_with_scores.sort(key=lambda x: x[1], reverse=True)

        # Apply pagination manually
        total = len(resources_with_scores)
        start_idx = (page - 1) * per_page
        end_idx = start_idx + per_page
        paginated_resources_with_scores = resources_with_scores[start_idx:end_idx]
        resources = [r for r, score in paginated_resources_with_scores]

        # Calculate total pages
        total_pages = math.ceil(total / per_page) if total > 0 else 0
    else:
        # Apply regular sorting when no search query
        if sort_by == 'date_published':
            query = query.order_by(Resource.date_published.desc() if sort_order == 'desc' else Resource.date_published.asc())
        elif sort_by == 'title':
            query = query.order_by(Resource.title.desc() if sort_order == 'desc' else Resource.title.asc())
        else:
            # Default sort by date_published descending (most recent first)
            query = query.order_by(Resource.date_published.desc())

        # Paginate results
        pagination = query.paginate(page=page, per_page=per_page, error_out=False)
        resources = pagination.items
        total = pagination.total
        total_pages = pagination.pages

    return jsonify({
        "data": [
            {
                "id": resource.id,
                "title": resource.title,
                "date_published": resource.date_published.isoformat() if resource.date_published else None,
                "topic": resource.topic,
                "scope": resource.scope,
                "description": resource.description,
                "format": resource.format,
                "court_name": resource.court_name,
                "citation": resource.citation,
                "external_url": resource.external_url,
                "image_url": resource.image_url,
                "audio_url": resource.audio_url,
                "courtlistener_id": resource.courtlistener_id,
                "docket_number": resource.docket_number,
                "judge_name": resource.judge_name,
                "created_at": as_iso(resource.created_at),
                "updated_at":  as_iso(resource.updated_at),
                "event_ids": [
                    er.event_id
                    for er in EventResources.query.filter_by(resource_id=resource.id).all()
                ],
                "organization_ids": [
                    er.organization_id
                    for er in OrganizationResources.query.filter_by(resource_id=resource.id).all()
                ]
            }
            for resource in resources
        ],
        "total": total,
        "page": page,
        "per_page": per_page,
        "total_pages": total_pages,
        "search_query": search_query,
        "filters": {
            "topic": filter_topic,
            "scope": filter_scope,
            "court_name": filter_court
        },
        "sort": {
            "sort_by": sort_by,
            "sort_order": sort_order
        }
    })

# get resource by ID
@app.route("/api/resources/<int:id>", methods=["GET"])
def get_resource_by_id(id):
    resource = Resource.query.get_or_404(id)

    # Get event details
    event_ids = [er.event_id for er in EventResources.query.filter_by(resource_id=resource.id).all()]
    events = []
    for eid in event_ids:
        event = Event.query.get(eid)
        if event:
            events.append({
                "id": event.id,
                "title": event.title,
                "date": event.date.isoformat() if event.date else None,
                "start_time": event.start_time,
                "location": event.location,
                "city": event.city,
                "state": event.state,
                "description": event.description,
                "external_url": event.external_url,
                "image_url": event.image_url
            })

    # Get organization details
    organization_ids = [er.organization_id for er in OrganizationResources.query.filter_by(resource_id=resource.id).all()]
    organizations = []
    for oid in organization_ids:
        org = Organization.query.get(oid)
        if org:
            organizations.append({
                "id": org.id,
                "name": org.name,
                "city": org.city,
                "state": org.state,
                "topic": org.topic,
                "size": org.size,
                "description": org.description,
                "external_url": org.external_url,
                "image_url": org.image_url
            })

    return jsonify({
        "id": resource.id,
        "title": resource.title,
        "date_published": resource.date_published.isoformat() if resource.date_published else None,
        "topic": resource.topic,
        "scope": resource.scope,
        "description": resource.description,
        "format": resource.format,
        "court_name": resource.court_name,
        "citation": resource.citation,
        "external_url": resource.external_url,
        "image_url": resource.image_url,
        "audio_url": resource.audio_url,
        "courtlistener_id": resource.courtlistener_id,
        "docket_number": resource.docket_number,
        "judge_name": resource.judge_name,
        "created_at": as_iso(resource.created_at),
        "updated_at": as_iso(resource.updated_at),
        "events": events,
        "organizations": organizations
    })

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
