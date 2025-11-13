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
    assert len(result["data"]) > 0
    # Check first org has required fields
    org = result["data"][0]
    assert "name" in org
    assert "city" in org
    assert "topic" in org
    assert isinstance(org["name"], str)
    assert len(org["name"]) > 0

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
    assert len(result["data"]) > 0
    # Check first event has required fields
    event = result["data"][0]
    assert "id" in event
    assert "title" in event
    assert "location" in event
    assert isinstance(event["id"], int)
    assert isinstance(event["title"], str)
    assert len(event["title"]) > 0

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
    assert len(result["data"]) > 0
    # Check first resource has required fields
    resource = result["data"][0]
    assert "id" in resource
    assert "title" in resource
    assert "topic" in resource
    assert isinstance(resource["id"], int)
    assert isinstance(resource["title"], str)
    assert len(resource["title"]) > 0
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
# Phase 3: Test search functionality
def test_events_search(client):
    response = client.get("/api/events?search=clinic")
    assert response.status_code == 200
    data = json.loads(response.data)
    assert "data" in data
    assert isinstance(data["data"], list)

def test_orgs_search(client):
    response = client.get("/api/orgs?search=legal")
    assert response.status_code == 200
    data = json.loads(response.data)
    assert "data" in data
    assert isinstance(data["data"], list)

def test_resources_search(client):
    response = client.get("/api/resources?search=immigration")
    assert response.status_code == 200
    data = json.loads(response.data)
    assert "data" in data
    assert isinstance(data["data"], list)

# Phase 3: Test sort functionality
def test_events_sort_by_date(client):
    response = client.get("/api/events?sort_by=date&sort_order=asc")
    assert response.status_code == 200
    data = json.loads(response.data)
    assert "data" in data

def test_orgs_sort_by_name(client):
    response = client.get("/api/orgs?sort_by=name&sort_order=desc")
    assert response.status_code == 200
    data = json.loads(response.data)
    assert "data" in data

def test_resources_sort_by_title(client):
    response = client.get("/api/resources?sort_by=title&sort_order=asc")
    assert response.status_code == 200
    data = json.loads(response.data)
    assert "data" in data

# Phase 3: Test filter functionality
def test_events_filter_by_location(client):
    response = client.get("/api/events?location=Texas")
    assert response.status_code == 200
    data = json.loads(response.data)
    assert "data" in data

def test_orgs_filter_by_state(client):
    response = client.get("/api/orgs?state=TX")
    assert response.status_code == 200
    data = json.loads(response.data)
    assert "data" in data

def test_resources_filter_by_scope(client):
    response = client.get("/api/resources?scope=Federal")
    assert response.status_code == 200
    data = json.loads(response.data)
    assert "data" in data

# Phase 3: Test combined search + sort + filter
def test_events_combined(client):
    response = client.get("/api/events?search=clinic&sort_by=date&location=Texas")
    assert response.status_code == 200
    data = json.loads(response.data)
    assert "data" in data
    assert "total" in data

def test_orgs_combined(client):
    response = client.get("/api/orgs?search=legal&sort_by=name&state=TX")
    assert response.status_code == 200
    data = json.loads(response.data)
    assert "data" in data

def test_resources_combined(client):
    response = client.get("/api/resources?search=immigration&sort_by=title&scope=Federal")
    assert response.status_code == 200
    data = json.loads(response.data)
    assert "data" in data
