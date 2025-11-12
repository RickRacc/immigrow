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


As a visitor, I want to understand the mission and purpose of this website so that I know how it can help me. I think it'd be nice for the home and about page to explain the goals of the site and its features, so I can make the most of the resources provided.


---
## 3. Architecture/Hosting Overview
- **Frontend:** React + Vite, Domain from Namecheap, AWS
- **Backend API Layer**: Flask, Gunicorn, Docker, AWS EC2
- **Backend Database:** AWS RDS


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
All APIs are hosted by Flask on an EC2 instance. Unit tests and Postman tests run in GitLab CI for each endpoint.


---
## 5. Data Scraping
ProPublica API - used to fetch nonprofit immigration related organizations
Data Retrieved: Organization names, locations (city, state), EIN (tax ID), subsection codes (501c3), NTEE codes (topic classification), addresses, and links to IRS Form 990 tax filings and GuideStar profiles

CourtListener API v4 - used for fetching immigration related court cases and legal documents
Data Retrieved: Case names, filing dates, court names, docket numbers, judge names, legal citations, case opinions, and audio recordings of oral arguments


RAICES (Refugee and Immigrant Center for Education and Legal Services) Texas web scraper - used to scrape community events
Data Retrieved: Event titles, dates, times, locations, descriptions, registration links, and event banner images
Web scraped using BeautifulSoup


Mobilize America API - also used to gather immigration related community events
Data Retrieved: Event titles, dates, start/end times, locations, venue names, descriptions, registration URLs, and featured images


REST APIS - ProPublica, CourtListener, Mobilize


---
## 6. Models and Instances
- **Events:** Represents nonprofit immigration-related organizations. Each instance corresponds to one organization, containing identifying information, mission classification, and reference materials. Instances usually include the organization’s name, location including city and state, tax ID, IRS subsection type, NTEE topic classification, physical or mailing address, and external links such as IRS Form 990 filings or GuideStar profiles.


- **Resources:** Represents immigration-related legal resources from court data. Each instance corresponds to a single court case or legal document. Instances typically include the case name, court name, docket number, judge names, filing date, legal citations, and links to materials such as written opinions or audio recordings.


- **Organizations:** Represents community events relevant to immigration support and services. Each instance corresponds to a single event and includes information such as the event title, scheduled date, start time, physical location, event description, registration or sign-up links, and images if available.


---
## 7. Challenges
Some of our challenges included setting up backend hosting on AWS, identifying and linking instances with related attributes across multiple models, and integrating media content into the webpages. We overcame these challenges by consulting online resources such as AWS documentation, Geeks for Geeks help pages on HTML, using Gen AI to explain the process, and relying on each other's past knowledge.


There were a few challenges with the data sources. The EventBrite API could not be used to search for immigration related public events, so we had to switch the source. We decided on switching to web scraping from ImmigrationLawHelp.org but many events weren’t formatted in the same structure making it hard to webscrape. Then we switched over to webscraping from RAICES, but there weren’t enough relevant events (not in the 100s) so we paired that with the mobilize API to grab immigration related events.
Also changed the source of organizations to ProPublica API due to conflicts with previous API decisions.
Other challenges included actually retrieving two forms of media from our data sources, which we solved by delegating to different resources and APIs. 


---
## 8. Phase II - Databases
Frontend: On the frontend we switched from hardcoded data to live data from our flash and APIs. We added a small API layer and now fetch all models showing loading spinners and error messages when things fail. Cards and detail pages render whatever fields the API returns. We also surface cross-links where available and show the total count of the resulted instances based on the API response.
API Layer: The Flask API routes retrieve data from our various events, organizations, and resource tables in our RDS instance for the corresponding routes. This layer is hosted on EC2. 
Tables: Created Events, Resources, and Organizations table with 5 non null attributes.
Each table also has 2 forms of media as features. There is a one to many relationship between Organizations and Events, a conjoint table between Events and Resources, and a conjoin table between Resources and Organizations to store the connections.

---
## 9. Phase II - Pagination
Frontend: We split big lists into pages. The frontend asks the API for a specific page and how many items per page. We show how many total items there are. When you click, we load the next slice and update the list right away. Buttons turn off at first.last page. This keeps the site a bit faster and meets the rubric’s “show total + page navigation” requirement.
