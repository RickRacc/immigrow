import pytest
from app import app
from flask import json

@pytest.fixture
def client():
    app.config['TESTING'] = True
    with app.test_client() as client:
        yield client

# tests endpoint to get all orgs
def test_get_orgs(client):
    response = client.get("/orgs")
    assert response.status_code == 200
    data = json.loads(response.data)
    assert isinstance(data, list)
    org = data[0]
    assert org["name"] == "Immigration Legal Services"
    assert org["city"] == "Dearborn"
    assert org["topic"] == "Legal Services"

# tests endpoint to get orgs by id
def test_get_org_by_id(client):
    response = client.get("/orgs/1")
    assert response.status_code == 200
    org = json.loads(response.data)
    assert org["id"] == 1
    assert org["name"] == "Immigration Legal Services"
    assert org["city"] == "Dearborn"
    assert org["topic"] == "Legal Services"

# tests endpoint to get all events
def test_get_events(client):
    response = client.get("/events")
    assert response.status_code == 200
    events = json.loads(response.data)
    assert isinstance(events, list)
    event = events[0]
    assert event["id"] == 1
    assert event["title"] == "Learn Serve Lead 2025"
    assert event["location"] == "Texas"
    assert event["duration_minutes"] == 120

# tests endpoint to get events by id
def test_get_event_by_id(client):
    response = client.get("/events/1")
    assert response.status_code == 200
    event = json.loads(response.data)
    assert event["id"] == 1
    assert event["title"] == "Learn Serve Lead 2025"
    assert event["location"] == "Texas"
    assert event["external_url"] == "https://www.raicestexas.org/events/association-of-american-medical-colleges-conference"

# tests endpoint to get all resources
def test_get_resources(client):
    response = client.get("/resources")
    assert response.status_code == 200
    resources = json.loads(response.data)
    assert isinstance(resources, list)
    resource = resources[0]
    assert resource["id"] == 1
    assert resource["title"] == "Calderon-Uresti v. Bondi"
    assert resource["topic"] == "Immigration Law"
    assert "court_name" in resource

# tests endpoint to get resource by id
def test_get_resource_by_id(client):
    response = client.get("/resources/1")
    assert response.status_code == 200
    resource = json.loads(response.data)
    assert resource["id"] == 1
    assert resource["title"] == "Calderon-Uresti v. Bondi"
    assert resource["topic"] == "Immigration Law"
    assert resource["court_name"] == "Court of Appeals for the Fifth Circuit"