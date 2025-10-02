# Immigo

## 1. Purpose & Motivation
Immigo is a platform designed to make it easier for immigrants to access information about immigration. It provides users with information across legal resources including recent immigration-related bills, organizations for legal aid, and community events. Target users are immigrants seeking reliable information to help with their transition. This project is important because it offers a centralized place to access multiple sources that empower immigrants with the support they need. 

---

## 2. User Stories
List a few short user stories to illustrate functionality:
- *As a [type of user], I want to [do something], so that [benefit].*
- *As a student, I want to log in with my Canvas account, so I can see my upcoming assignments.*
- *As an admin, I want to manage organizations, so I can keep resources up to date.*

---

## 3. Architecture Overview
- **Frontend:** React + Vite
- **Hosting:** AWS

---

## 4. API Documentation
Link: https://documenter.getpostman.com/view/48953688/2sB3QGsAi5(https://documenter.getpostman.com/view/48953688/2sB3QGsAi5)
- **Base URL:** `https://immigrow.site/`
- **Endpoints:**
  - `GET /orgs/` → Get all organizations
  - `GET /orgs/{id}` →   Fetch organization by ID
  - `GET /events` → Get all events
  - `GET /events/{id}` →   Fetch event by ID
  - `GET /resources` → Get all resources
  - `GET /resources/{id}` → Fetch resources by ID

---

## 5. Models
Outline the data models used in your system (in JSON or schema form):

**Resources Model**
```json
{
  "id": "int",
  "resource_number": "int",
  "title": "string",
  "introduced_date": "date",
  "latest_major_action": "string",
  "subject": "string"
}

**Organizations Model**
{
  "organization_id": "int",
  "name": "string",
  "areas_of_assistance": ["string"],
  "types_of_assistance": ["string"],
  "location": "string",
  "contact": "string"
}

** Events Model**
{
  "event_id": "int",
  "title": "string",
  "description": "string",
  "location": "string",
  "date": "date",
  "start_time": "time",
  "organizer": "string"
}