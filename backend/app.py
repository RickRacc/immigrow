from flask import Flask, jsonify
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy

app = Flask(__name__)
CORS(app)

app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///app.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)

class Organization(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100))

class Event(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100))

class Resource(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100))

@app.route("/")
def home():
    return "Hello!"

# get all organizations
@app.route("/orgs/", methods=["GET"])
def get_orgs():
    orgs = Organization.query.all()
    return jsonify([{"id": org.id, "name": org.name} for org in orgs])

# get organization by ID
@app.route("/orgs/<int:id>", methods=["GET"])
def get_org_by_id(id):
    org = Organization.query.get(id)
    return jsonify({"id": org.id, "name": org.name})

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
    return jsonify([{"id": resource.id, "name": resource.name} for resource in resources])

# get resource by ID
@app.route("/resources/<int:id>", methods=["GET"])
def get_resource_by_id(id):
    resource = Resource.query.get(id)
    return jsonify({"id": resource.id, "name": resource.name})

if __name__ == "__main__":
    app.run(debug=True, port=5000)