from flask import Flask, jsonify
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy

app = Flask(__name__)
CORS(app)

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
    subsection_code = db.Column(db.String(50))
    ntee_code = db.Column(db.String(50))
    external_url = db.Column(db.String(255))
    guidestar_url = db.Column(db.String(255))
    image_url = db.Column(db.String(255))
    created_at = db.Column(db.DateTime)
    updated_at = db.Column(db.DateTime)

class Event(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100))

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

@app.route("/")
def home():
    return "Hello!"

# get all organizations
@app.route("/orgs/", methods=["GET"])
def get_orgs():
    orgs = Organization.query.all()
    print("GOT ORGS! ")
    print(orgs)
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
            "subsection_code": org.subsection_code,
            "ntee_code": org.ntee_code,
            "external_url": org.external_url,
            "guidestar_url": org.guidestar_url,
            "image_url": org.image_url,
            "created_at": org.created_at.isoformat() if org.created_at else None,
            "updated_at": org.updated_at.isoformat() if org.updated_at else None
        }
        for org in orgs
    ])

# get organization by ID
@app.route("/orgs/<int:id>", methods=["GET"])
def get_org_by_id(id):
    org = Organization.query.get(id)
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
            "subsection_code": org.subsection_code,
            "ntee_code": org.ntee_code,
            "external_url": org.external_url,
            "guidestar_url": org.guidestar_url,
            "image_url": org.image_url,
            "created_at": org.created_at.isoformat() if org.created_at else None,
            "updated_at": org.updated_at.isoformat() if org.updated_at else None
        })

# get all events
@app.route("/events", methods=["GET"])
def get_events():
    events = Event.query.all()
    return jsonify([{"id": event.id, "name": event.name} for event in events])

# get event by ID
@app.route("/events/<int:id>", methods=["GET"])
def get_event_by_id(id):
    event = Event.query.get(id)
    return jsonify({"id": event.id, "name": event.name})

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
            "courtlistener_id": resource.courtlistener_id,
            "docket_number": resource.docket_number,
            "judge_name": resource.judge_name,
            "created_at": resource.created_at.isoformat() if resource.created_at else None,
            "updated_at": resource.updated_at.isoformat() if resource.updated_at else None
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
            "courtlistener_id": resource.courtlistener_id,
            "docket_number": resource.docket_number,
            "judge_name": resource.judge_name,
            "created_at": resource.created_at.isoformat() if resource.created_at else None,
            "updated_at": resource.updated_at.isoformat() if resource.updated_at else None
        })

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)