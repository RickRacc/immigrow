# Immigo
## 1. Purpose & Motivation
Immigo is a platform designed to make it easier for immigrants to access information about
immigration. It provides users with information across legal resources including recent
immigration-related bills, organizations for legal aid, and community events. Target users are
immigrants seeking reliable information to help with their transition. This project is important
because it offers a centralized place to access multiple sources that empower immigrants with
the support they need.
---
## 2. User Stories
The design of this website is organized very succinctly. As someone interested in immigration, especially with the recent political climate, I think this website is informative. I like how easy the website aims to encourage personal action in educating ourselves on immigrant rights. For feedback, I would want a feature that allows me to perform a simple search or filter my results so that I can access information easily.

As a user, I want to learn about local organizations that support immigrants so that I can connect with them for assistance. On the Organizations page, I hope to a list of groups with their logos, descriptions, and contact information. I want to easily identify which organizations offer the services I need. This helps me build a support network in my new community.

I think it would be nice to view a list of upcoming events in the events page so visitors can participate in community activities. The events page could have a grid of events with images and descriptions. Moreover, it would be nice to easily find dates, locations, and details for each event.

As a user of your website, I want the website to be very visually appealing and easy to navigate so that I can find information quickly and easily. The site should have a neat and clean layout and also still have a completely working design for mobile devices. I want to move between pages seamlessly, maybe through a navigation bar. This improves my overall experience and would encourage me to return to your site as a future user.

As a visitor, I want to understand the mission and purpose of this website so that I know how it can help me. I think it'd be nice for the home and about page to expalin the goals of the site and its features, so I can make the most of the resources provided.


---
## 3. Architecture Overview
- **Frontend:** React + Vite
- **Hosting:** AWS
---
## 4. API Documentation
Link:
https://documenter.getpostman.com/view/48953688/2sB3QGsAi5(https://
documenter.getpostman.com/view/48953688/2sB3QGsAi5)
- **Base URL:** `https://immigrow.site/`
- **Endpoints:**
- `GET /orgs/` → Get all organizations
- `GET /orgs/{id}` → Fetch organization by ID
- `GET /events` → Get all events
- `GET /events/{id}` → Fetch event by ID
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
Data Source:
www.immigrationlawhelp.org(www.immigrationlawhelp.org) ```json
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
---
## 6. Challenges
Some of our challenges included setting up hosting on AWS, identifying and linking instances
with related attributes across multiple models, and integrating media content into the
webpages. We overcame these challenges by consulting online resources such as AWS documentation, Geeks for Geeks help pages on HTML, using Gen AI to explain the process, and relying on each other's past knowledge. 
---

