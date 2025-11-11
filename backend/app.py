from flask import Flask, jsonify
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from datetime import date, time, datetime

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
@app.route("/orgs", methods=["GET"])
def get_orgs():
    orgs = Organization.query.all()
    return jsonify([
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
                for er in EventResources.query.filter_by(organization_id=org.id).all()
            ]
        }
        for org in orgs
    ])

# get organization by ID
@app.route("/orgs/<int:id>", methods=["GET"])
def get_org_by_id(id):
    org = Organization.query.get_or_404(id)
    return jsonify(
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
                for er in EventResources.query.filter_by(organization_id=org.id).all()
            ]
        })

# get all events
@app.route("/events", methods=["GET"])
def get_events():
    events = Event.query.all()
    return jsonify([
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
    ])

# get event by ID
@app.route("/events/<int:id>", methods=["GET"])
def get_event_by_id(id):
    event = Event.query.get(id)
    return jsonify(        {
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
        })

# get all resources
@app.route("/resources", methods=["GET"])
def get_resources():
    resources = Resource.query.all()
    return jsonify([
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
                for er in EventResources.query.filter_by(resource_id=resource.id).all()
            ]
        }
        for resource in resources
    ])

# get resource by ID
@app.route("/resources/<int:id>", methods=["GET"])
def get_resource_by_id(id):
    resource = Resource.query.get(id)
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
            "updated_at":  as_iso(resource.updated_at),
            "event_ids": [
                er.event_id
                for er in EventResources.query.filter_by(resource_id=resource.id).all()
            ],
            "organization_ids": [
                er.organization_id
                for er in EventResources.query.filter_by(resource_id=resource.id).all()
            ]
        })

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
