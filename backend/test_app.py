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
    response = client.get("/api/orgs")
    assert response.status_code == 200
    result = json.loads(response.data)
    assert "data" in result
    assert isinstance(result["data"], list)
    org = result["data"][0]
    assert org["name"] == "Immigration Legal Services"
    assert org["city"] == "Dearborn"
    assert org["topic"] == "Legal Services"

# tests endpoint to get orgs by id
def test_get_org_by_id(client):
    response = client.get("/api/orgs/1")
    assert response.status_code == 200
    org = json.loads(response.data)
    assert org["id"] == 1
    assert org["name"] == "Immigration Legal Services"
    assert org["city"] == "Dearborn"
    assert org["topic"] == "Legal Services"
    # Test that new fields are present
    assert "events" in org
    assert "resources" in org
    assert isinstance(org["events"], list)
    assert isinstance(org["resources"], list)

# tests endpoint to get all events
def test_get_events(client):
    response = client.get("/api/events")
    assert response.status_code == 200
    result = json.loads(response.data)
    assert "data" in result
    assert isinstance(result["data"], list)
    event = result["data"][0]
    assert event["id"] == 1
    assert event["title"] == "Learn Serve Lead 2025"
    assert event["location"] == "Texas"
    assert event["duration_minutes"] == 120

# tests endpoint to get events by id
def test_get_event_by_id(client):
    response = client.get("/api/events/1")
    assert response.status_code == 200
    event = json.loads(response.data)
    assert event["id"] == 1
    assert event["title"] == "Learn Serve Lead 2025"
    assert event["location"] == "Texas"
    assert event["external_url"] == "https://www.raicestexas.org/events/association-of-american-medical-colleges-conference"
    # Test that new fields are present
    assert "organization" in event
    assert "resources" in event
    assert isinstance(event["resources"], list)
    # If organization exists, verify it has expected structure
    if event["organization"]:
        assert "id" in event["organization"]
        assert "name" in event["organization"]

# tests endpoint to get all resources
def test_get_resources(client):
    response = client.get("/api/resources")
    assert response.status_code == 200
    result = json.loads(response.data)
    assert "data" in result
    assert isinstance(result["data"], list)
    resource = result["data"][0]
    assert resource["id"] == 1
    assert resource["title"] == "Calderon-Uresti v. Bondi"
    assert resource["topic"] == "Immigration Law"
    assert "court_name" in resource

# tests endpoint to get resource by id
def test_get_resource_by_id(client):
    response = client.get("/api/resources/1")
    assert response.status_code == 200
    resource = json.loads(response.data)
    assert resource["id"] == 1
    assert resource["title"] == "Calderon-Uresti v. Bondi"
    assert resource["topic"] == "Immigration Law"
    assert resource["court_name"] == "Court of Appeals for the Fifth Circuit"
    # Test that new fields are present
    assert "events" in resource
    assert "organizations" in resource
    assert isinstance(resource["events"], list)
    assert isinstance(resource["organizations"], list)

# tests endpoint to get paginated orgs
def test_get_orgs_paginated(client):
    response = client.get("/api/orgs?page=1&per_page=15")
    assert response.status_code == 200
    data = json.loads(response.data)
    assert "data" in data
    assert "total" in data
    assert "page" in data
    assert "per_page" in data
    assert "total_pages" in data
    assert isinstance(data["data"], list)
    assert len(data["data"]) <= 15
    assert data["page"] == 1
    assert data["per_page"] == 15

# tests endpoint to get paginated events
def test_get_events_paginated(client):
    response = client.get("/api/events?page=1&per_page=15")
    assert response.status_code == 200
    data = json.loads(response.data)
    assert "data" in data
    assert "total" in data
    assert "page" in data
    assert "per_page" in data
    assert "total_pages" in data
    assert isinstance(data["data"], list)
    assert len(data["data"]) <= 15
    assert data["page"] == 1
    assert data["per_page"] == 15
    # Test page 2 exists if we have enough events
    if data["total"] > 15:
        response2 = client.get("/api/events?page=2&per_page=15")
        assert response2.status_code == 200
        data2 = json.loads(response2.data)
        assert data2["page"] == 2

# tests endpoint to get paginated resources
def test_get_resources_paginated(client):
    response = client.get("/api/resources?page=1&per_page=15")
    assert response.status_code == 200
    data = json.loads(response.data)
    assert "data" in data
    assert "total" in data
    assert "page" in data
    assert "per_page" in data
    assert "total_pages" in data
    assert isinstance(data["data"], list)
    assert len(data["data"]) <= 15
    assert data["page"] == 1
    assert data["per_page"] == 15