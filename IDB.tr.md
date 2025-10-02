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
webpages.
---

## 7. AI Report
### Summary of AI Interactions
- Tools Used: ChatGPT
- Debugging Help: ChatGPT was a great resources in helping us set up tools we had limited
experience in, such as AWS and Postman.
- Code Improvement: ChatGPT helped us beautify the website and clarify React concepts.
Original:
You can navigate through our site to explore organizations, events and legal resouces.
ChatGPT:
You can navigate through our site to explore:
<br></br>
<strong>Organizations: </strong> providing direct support and community connections
<br></br> ...
- Other: AI was used to format Makefiles and clarify language.
## 7. AI Report
### Summary of AI Interactions
- Tools Used: ChatGPT
- Debugging Help: ChatGPT was a great resources in helping us set up tools we had limited
experience in, such as AWS and Postman.
- Code Improvement: ChatGPT helped us beautify the website and clarify React concepts.
Original:
You can navigate through our site to explore organizations, events and legal resouces.
ChatGPT:
You can navigate through our site to explore:
<br></br>
<strong>Organizations: </strong> providing direct support and community connections
<br></br> ...
- Other: AI was used to format Makefiles and clarify language.
### Reflection on Use
What specific improvements to your code or understanding came from this AI interaction?
The AI interaction significantly improved my understanding of creating a complete instance page
system with proper cross-linking between different data models. I learned how to effectively use
React Router to create detailed pages for each item, and how to establish data relationships
using JavaScript array methods like find() and filter() to connect events with their hosting
organizations and related resources.

How did you decide what to keep or ignore from the AI’s suggestions?
I adopted AI suggestions that aligned with established patterns in my codebase, particularly
those involving Bootstrap styling and React component structure. However, I adapted these
suggestions to fit my specific data model and project requirements. I ignored overly complex
suggestions that would have made the code harder to maintain, instead focusing on clean,
data-driven approaches that would scale naturally with my JSON files. I also prioritized
suggestions that maintained consistency across all three models (events, organizations,
resources).

Did the AI ever produce an incorrect or misleading suggestion? How did you detect that?
Yes, the AI initially suggested file creation approaches that resulted in content duplication errors
and broken JavaScript syntax. I detected these issues through JavaScript syntax errors
appearing in the browser console and by directly examining the generated files, which contained
duplicated imports and malformed JSX. I resolved this by requesting simpler, cleaner
implementations and testing each component individually before integration.

### Evidence of Independent Work
Paste a before-and-after snippet (3–5 lines max) showing where you changed your own code in
response to AI guidance.
Before: const events = eventsData.filter(e => org.eventIds.includes(e.id));
After: const resources = resourcesData.filter(r => org.resourceIds.includes(r.id));
In 2–3 sentences, explain what you learned by making this change.
I learned that establishing bi-directional relationships between data models requires careful
consideration of the data structure. By adding the resources filter alongside the events filter, I
created a more complete cross-referencing system that allows users to navigate between all
related content seamlessly!!

### Integrity Statement
We confirm that the AI was used only as a helper (explainer, debugger, reviewer) and not as a
code generator. All code submitted our my own work.