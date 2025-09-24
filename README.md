# Immigrow

## Canvas / Slack Group
**55090_09**

## Team Members
- Lucas Berio Perez  
- Anisha Bhaskar Torres  
- Mrinalini Jithendra  
- Andrew Lee  
- Rakesh Singh  

## Project Name
**Immigrow**  

## Proposed Project
Immigrow helps underserved immigrant communities and their allies discover firsthand stories, trustworthy organizations, and nearby resources/events. This includes pulling from platforms like **Eventbrite**, providing a **“Know Your Rights”** model with access to legal clinics, ESL classes, and citizenship workshops. The site promotes civic engagement by connecting users to actionable services, multilingual materials, and community events.  

## Data Sources
- [Eventbrite API](https://www.eventbrite.com/platform/api)  
- [LawHelp API](https://www.lawhelp.org/dc/api/v2)  
- [ProPublica Nonprofit Explorer API](https://projects.propublica.org/nonprofits/api)  

## Models
1. **Events**  
2. **Legal Resources**  
3. **Organizations**  
4. **Immigrant Stories**  

### Estimated Instances
- Events – 100  
- Legal Resources – 30  
- Organizations – 100  
- Immigrant Stories – 50  

### Attributes (Filterable/Sortable)
**Events:** Location, Title, Date, Start Time, Length of Event  
**Legal Resources:** Date, Topic, Scope (Federal/State/Local), Description, Title  
**Organizations:** Location, Size, Topic, Meeting Frequency, Description  
**Immigrant Stories:** Location, Ethnicity, Age, Part of Organization, Story  

### Media Types
**Events:** Link to event webpage, text, images of event  
**Legal Resources:** Links to news articles, text  
**Organizations:** Link to org homepage, text, images of organization  
**Immigrant Stories:** Link, text, images  

## Relations Between Models
- **Events:** (1) Organizations that host events, (2) Events that deal with legal resources  
- **Legal Resources:** (1) Links connecting to organizations, (2) Stories of people affected  
- **Organizations:** (1) Organizations that have legal resources, (2) Events hosted by organizations  
- **Immigrant Stories:** (1) Testimonies from people in organizations, (2) Legal issues and resources used  

## Guiding Questions
1. What are cultural events near me?  
2. What is the newest legislation passed in the U.S. really saying?  
3. What organizations near me can I join for support?  
4. What experiences have other immigrants faced, and how can their stories guide my own journey?  
