# Immigrow — README


## Team Members


| Name                  | EID         | GitLab ID            | Estimated Hours           | Actual Hours             |
|-----------------------|-------------|----------------------|---------------------------|--------------------------|
| Lucas Berio Perez     | lfb1234     | lucasberio           | P1: 10, P2: 16, P3: 4     | 16                       |
| Anisha Bhaskar Torres | avb834      | anisha1045           | 8                         | 15                       |
| Mrinalini Jithendra   | mj27496     | mrinalinij05         | 8                         | 10                       |
| Rakesh Singh          | rps2439     | rrrakesh             | P1: 8; P2: 15; P3: 18     | P1: 6.75; P2: 25; P3:    |


---


## Project Leaders


**Lucas Berio Perez** served as the **Project Leader** for phase 1. 
Responsibilities included:
- Setting up AWS infrastructure (S3, CloudFront, Route53) for deployment. 
- Organizing and delegating tasks based on each member’s skills. 
- Overseeing integration between frontend components and deployment pipeline. 
- Ensuring team communication.


**Anisha Bhaskar Torres** served as the **Project Leader** for phase 2. 
Responsibilities included:
- Setting up Flask API routes and connections with RDS database and deploying them on an  EC2 instance.
- Writing backend tests and integrating with the Gitlab pipelines.
- Scheduling and hosting meetings, tracking project progress, and delegating tasks.

**Rakesh Singh** served as the **Project Leader** for phase 3. 
Responsibilities included:
- Setting up Flask API routes and making frontend changes to instance grids
- Writing backend and Postman tests and integrating with the Gitlab pipelines.
- Implementing sorting/filtering/search for 3 model pages.
- Implementing general search page



---


## Repository Information


- **Git SHA:** 7fadd02601e9709a51399a50c0e8202d9074c8e5
- **Pipelines URL:** https://gitlab.com/anisha1045/cs373-55090-09/-/pipelines
- **Website URL:** [https://immigrow.me](https://immigrow.me)
- **Backend URL:** [https://api.immigrow.me/](https://api.immigrow.me/)
- **API Documentation URL:** [https://documenter.getpostman.com/view/48953688/2sB3QGsAi5](https://documenter.getpostman.com/view/48953688/2sB3QGsAi5)


---


## Comments


- **Phase 1:**: This phase focused on setting up core infrastructure and the initial deployment. 
The team collaborated well, with responsibilities split cleanly between frontend development, AWS setup, and GitLab CI/CD configuration. Some challenges arose during the initial DNS propagation and SSL certificate validation, but they were resolved through group debugging sessions.


- **Phase 2:**: This phase was more involved, as we focused on setting up the backend and handling dynamic data through web scraping and API integration. We worked with RDS, EC2, and other AWS services to host and manage the data. The most challenging part was web scraping and sourcing reliable data, but we were able to collaborate well and successfully integrate the data flow across the system.

- **Phase 3:** This phase focused on implementing search, sort, and filter functionality across all model pages, along with a global search feature. We implemented a Google-like multi-word search algorithm with relevance ranking, added sort/filter capabilities for 5+ attributes per model, and created a comprehensive global search page that searches across all three models simultaneously. The implementation includes search highlighting, match indicators, independent pagination per model, and reusable components. Testing was expanded to cover the new search/sort/filter functionality.


---
