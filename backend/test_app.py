import pytest
from app import app
from flask import json

@pytest.fixture
def client():
    app.config['TESTING'] = True
    with app.test_client() as client:
        yield client

def test_get_orgs(client):
    response = client.get("/orgs/")
    assert response.status_code == 200
    data = json.loads(response.data)
    assert isinstance(data, list)

def test_get_org_by_id(client):
    response = client.get("/orgs/1")
    assert response.status_code == 200
    data = json.loads(response.data)
    assert "id" in data
    assert data["id"] == 1

def test_get_events(client):
    response = client.get("/events")
    assert response.status_code == 200
    data = json.loads(response.data)
    print(data)
    assert isinstance(data, list)

def test_get_event_by_id(client):
    response = client.get("/events/1")
    assert response.status_code == 200
    data = json.loads(response.data)
    assert data["id"] == 1

def test_get_resources(client):
    response = client.get("/resources")
    assert response.status_code == 200
    data = json.loads(response.data)
    assert isinstance(data, list)

def test_get_resource_by_id(client):
    response = client.get("/resources/1")
    assert response.status_code == 200
    data = json.loads(response.data)
    assert data["id"] == 1

