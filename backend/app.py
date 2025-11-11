from flask import Flask, jsonify
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from datetime import date, time, datetime

# ---------------------------
# Helpers
# ---------------------------

def as_iso(val):
    """
    Safely serialize dates/times:
    - datetime/date/time -> ISO 8601 string
    - strings pass through unchanged
    - None stays None
    """
    if val is None:
        return None
    if isinstance(val, (datetime, date, time)):
        return val.isoformat()
    if isinstance(val, str):
        return val
    return str(val)

# ---------------------------
# App / DB setup
# ---------------------------

app = Flask(__name__)
CORS(app)

app.config["SQLALCHEMY_DATABASE_URI"] = (
    "postgresql://postgres:Immigrow123@immigrow-db.cz8gegw2sqh9.us-east-2.rds.amazonaws.com:5432/Immigrow"
)
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

db = SQLAlchemy(app)

# ---------------------------
# Models
# ---------------------------

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
    subsection_code = db.Column(db.String(50))
    ntee_code = db.Column(db.String(50))
    external_url = db.Column(db.String(255))
    guidestar_url = db.Column(db.String(255))
    image_url = db.Column(db.String(255))
    created_at = db.Column(db.DateTime)
    updated_at = db.Column(db.DateTime)

class Event(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(255), nullable=False)
    date = db.Column(db.Date, nullable=False)
    start_time = db.Column(db.Time, nullable=False)
    duration_minutes = db.Column(db.Integer, nullable=True)
    end_time = db.Column(db.Time, nullable=True)
    location = db.Column(db.String(255), nullable=True)
    city = db.Column(db.String(100), nullable=True)
    state = db.Column(db.String(50), nullable=True)
    venue_name = db.Column(db.String(255), nullable=True)
    description = db.Column(db.Text, nullable=True)
    external_url = db.Column(db.String(500), nullable=True)
    image_url = db.Column(db.String(500), nullable=True)
    eventbrite_id = db.Column(db.String(100), nullable=True)
    timezone = db.Column(db.String(50), nullable=True)
    organization_id = db.Column(db.Integer, db.ForeignKey("organization.id"), nullable=False)
    created_at = db.Column(db.DateTime)
    updated_at = db.Column(db.DateTime)

class Resource(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(255), nullable=False)
    date_published = db.Column(db.Date)
    topic = db.Column(db.String(100))
    scope = db.Column(db.String(100))
    description = db.Column(db.Text)
    format = db.Column(db.String(50))
    court_name = db.Column(db.String(255))
    citation = db.Column(db.String(255))
    external_url = db.Column(db.String(255))
    image_url = db.Column(db.String(255))
    courtlistener_id = db.Column(db.String(100))
    docket_number = db.Column(db.String(100))
    judge_name = db.Column(db.String(255))
    created_at = db.Column(db.DateTime)
    updated_at = db.Column(db.DateTime)

# ---------------------------
# Routes
# ---------------------------

@app.route("/")
def home():
    return "Hello!"

# --- Organizations ---

@app.route("/orgs/", methods=["GET"])
def get_orgs():
    orgs = Organization.query.all()
    return jsonify([
        {
            "id": o.id,
            "name": o.name,
            "city": o.city,
            "state": o.state,
            "topic": o.topic,
            "size": o.size,
            "meeting_frequency": o.meeting_frequency,
            "description": o.description,
            "address": o.address,
            "zipcode": o.zipcode,
            "subsection_code": o.subsection_code,
            "ntee_code": o.ntee_code,
            "external_url": o.external_url,
            "guidestar_url": o.guidestar_url,
            "image_url": o.image_url,
            "created_at": as_iso(o.created_at),
            "updated_at": as_iso(o.updated_at),
        }
        for o in orgs
    ])

@app.route("/orgs/<int:id>", methods=["GET"])
def get_org_by_id(id):
    o = Organization.query.get_or_404(id)
    return jsonify({
        "id": o.id,
        "name": o.name,
        "city": o.city,
        "state": o.state,
        "topic": o.topic,
        "size": o.size,
        "meeting_frequency": o.meeting_frequency,
        "description": o.description,
        "address": o.address,
        "zipcode": o.zipcode,
        "subsection_code": o.subsection_code,
        "ntee_code": o.ntee_code,
        "external_url": o.external_url,
        "guidestar_url": o.guidestar_url,
        "image_url": o.image_url,
        "created_at": as_iso(o.created_at),
        "updated_at": as_iso(o.updated_at),
    })

# --- Events ---

@app.route("/events", methods=["GET"])
def get_events():
    events = Event.query.all()
    return jsonify([
        {
            "id": e.id,
            "name": getattr(e, "name", None) or getattr(e, "title", None),
            "date": as_iso(getattr(e, "date", None)),
            "start_time": as_iso(getattr(e, "start_time", None)),
            "end_time": as_iso(getattr(e, "end_time", None)),
            "city": getattr(e, "city", None),
            "state": getattr(e, "state", None),
            "venue": getattr(e, "venue_name", None) or getattr(e, "location", None),
            "url": getattr(e, "external_url", None),
            "description": getattr(e, "description", None),
            "image_url": getattr(e, "image_url", None),

            # NEW: link event -> organization
            "organization_id": getattr(e, "organization_id", None),
        }
        for e in events
    ])

@app.route("/events/<int:id>", methods=["GET"])
def get_event_by_id(id):
    e = Event.query.get_or_404(id)
    return jsonify({
        "id": e.id,
        "name": getattr(e, "name", None) or getattr(e, "title", None),
        "date": as_iso(getattr(e, "date", None)),
        "start_time": as_iso(getattr(e, "start_time", None)),
        "end_time": as_iso(getattr(e, "end_time", None)),
        "city": getattr(e, "city", None),
        "state": getattr(e, "state", None),
        "venue": getattr(e, "venue_name", None) or getattr(e, "location", None),
        "url": getattr(e, "external_url", None),
        "description": getattr(e, "description", None),
        "image_url": getattr(e, "image_url", None),
        "created_at": as_iso(getattr(e, "created_at", None)),
        "updated_at": as_iso(getattr(e, "updated_at", None)),

        # NEW: link event -> organization
        "organization_id": getattr(e, "organization_id", None),
    })

# --- Resources ---

@app.route("/resources", methods=["GET"])
def get_resources():
    resources = Resource.query.all()
    return jsonify([
        {
            "id": r.id,
            "title": r.title,
            "date_published": as_iso(r.date_published),
            "topic": r.topic,
            "scope": r.scope,
            "description": r.description,
            "format": r.format,
            "court_name": r.court_name,
            "citation": r.citation,
            "external_url": r.external_url,
            "image_url": r.image_url,
            "courtlistener_id": r.courtlistener_id,
            "docket_number": r.docket_number,
            "judge_name": r.judge_name,
            "created_at": as_iso(r.created_at),
            "updated_at": as_iso(r.updated_at),
        }
        for r in resources
    ])

@app.route("/resources/<int:id>", methods=["GET"])
def get_resource_by_id(id):
    r = Resource.query.get_or_404(id)
    return jsonify({
        "id": r.id,
        "title": r.title,
        "date_published": as_iso(r.date_published),
        "topic": r.topic,
        "scope": r.scope,
        "description": r.description,
        "format": r.format,
        "court_name": r.court_name,
        "citation": r.citation,
        "external_url": r.external_url,
        "image_url": r.image_url,
        "courtlistener_id": r.courtlistener_id,
        "docket_number": r.docket_number,
        "judge_name": r.judge_name,
        "created_at": as_iso(r.created_at),
        "updated_at": as_iso(r.updated_at),
    })

# ---------------------------
# Run
# ---------------------------

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
