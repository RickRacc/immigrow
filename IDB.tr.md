# Immigo

## 1. Purpose & Motivation
Immigo is a platform designed to make it easier for immigrants to access information about immigration. It provides users with information across legal resources including recent immigration-related bills, organizations for legal aid, and community events. Target users are immigrants seeking reliable information to help with their transition. This project is important because it offers a centralized place to access multiple sources that empower immigrants with the support they need. 

---

## 2. User Stories

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

**Resources Model**
```json
Data Source: ProPublica Congress API
{
  "id": "int",
  "resource_number": "int",
  "title": "string",
  "introduced_date": "date",
  "latest_major_action": "string",
  "subject": "string"
}
```
**Organizations Model**
Data Source: www.immigrationlawhelp.org(www.immigrationlawhelp.org)
```json
{
  "organization_id": "int",
  "name": "string",
  "areas_of_assistance": ["string"],
  "types_of_assistance": ["string"],
  "location": "string",
  "contact": "string"
}
```

** Events Model**
Data Source: Eventbrite API
```json
{
  "event_id": "int",
  "title": "string",
  "description": "string",
  "location": "string",
  "date": "date",
  "start_time": "time",
  "organizer": "string"
}
```

## 6. Challenges 
Some of our challenges included setting up hosting on AWS, identifying and linking instances with related attributes across multiple models, and integrating media content into the webpages.