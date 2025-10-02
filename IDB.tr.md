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

---

## 6. Challenges 
Some of our challenges included setting up hosting on AWS, identifying and linking instances with related attributes across multiple models, and integrating media content into the webpages.

---

## 7. AI Report
### Summary of AI Interactions
- Tools Used: ChatGPT
- Debugging Help: ChatGPT was a great resources in helping us set up tools we had limited experience in, such as AWS and Postman. 
- Code Improvement: ChatGPT helped us beautify the website and clarify React concepts.

Original: 
        You can navigate through our site to explore organizations, events and legal resouces. 
        
ChatGPT:
        You can navigate through our site to explore: 
        <br></br>
        <strong>Organizations: </strong> providing direct support and community connections <br></br> ...

- Other: AI was used to format Makefiles and clarify language.

### Reflection on Use
What specific improvements to your code or understanding came from this AI interaction? 
How did you decide what to keep or ignore from the AI’s suggestions?
Did the AI ever produce an incorrect or misleading suggestion? How did you detect that?

### Evidence of Independent Work
Paste a before-and-after snippet (3–5 lines max) showing where you changed your own code in response to AI guidance.
In 2–3 sentences, explain what you learned by making this change.

### Integrity Statement
We confirm that the AI was used only as a helper (explainer, debugger, reviewer) and not as a code generator. All code submitted our my own work.

