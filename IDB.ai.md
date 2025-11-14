## 7. AI Report

### Summary of AI Interactions

**Tools Used:** ChatGPT, Claude Code

**Debugging Help:** ChatGPT was a great resource in helping us set up tools we had limited experience in, such as AWS, Postman, and deployment configurations. AI also helped us debug issues with search result filtering, pagination state management, and understanding backend API query parameters.

**Conceptual Clarification:** AI helped us understand the architecture and data flow throughout the system with EC2, RDS, and the frontend. Additionally, AI explained complex algorithms like relevance scoring with multi-word queries, helping us understand when to use substring matching and how to structure search functionality across multiple models.

**Code Improvement:** ChatGPT helped us beautify the website and clarify React concepts. AI also helped us understand component reusability patterns, proper state management for search/filter interactions, and how to handle data transformations from API responses.

**Example:**
Original:
```
You can navigate through our site to explore organizations, events and legal resouces.
```

ChatGPT:
```jsx
You can navigate through our site to explore:
<br></br>
<strong>Organizations: </strong> providing direct support and community connections
<br></br>
<strong>Events: </strong> workshops, clinics, and community gatherings
<br></br>
<strong>Legal Resources: </strong> court cases, rulings, and legal precedents
```

**Other:** AI was used to format Makefiles, clarify language, and help us understand testing implications when making backend changes. AI also helped explain how to maintain consistency between different pages and components.

### Reflection on Use

**What specific improvements to your code or understanding came from this AI interaction?**

The AI interaction significantly improved our understanding of creating a complete instance page system with proper cross-linking between different data models. We learned how to effectively use React Router to create detailed pages for each item, and how to establish data relationships using JavaScript array methods like find() and filter() to connect events with their hosting organizations and related resources.

We also learned how to implement search functionality with relevance scoring algorithms. AI helped us understand the importance of filtering results based on relevance scores, how to handle independent pagination for multiple data types on a single page, and how to properly transform API data (like parsing concatenated time strings) before displaying it to users.

**How did you decide what to keep or ignore from the AI's suggestions?**

We adopted AI suggestions that aligned with established patterns in our codebase, particularly those involving Bootstrap styling and React component structure. However, we adapted these suggestions to fit our specific data model and project requirements. We ignored overly complex suggestions that would have made the code harder to maintain, instead focusing on clean approaches that would scale naturally with our data. We also prioritized suggestions that maintained consistency across all three models (events, organizations, resources).

When implementing search functionality, AI initially suggested using exact word boundary matching for relevance scoring. However, after carefully reviewing our project specifications, we realized substring matching was required to achieve the correct result rankings. We adapted the approach based on our requirements rather than blindly following the suggestion.

**Did the AI ever produce an incorrect or misleading suggestion? How did you detect that?**

Yes, the AI initially suggested file creation approaches that resulted in content duplication errors and broken JavaScript syntax. We detected these issues through JavaScript syntax errors appearing in the browser console and by directly examining the generated files, which contained duplicated imports and malformed JSX. We resolved this by requesting simpler, cleaner implementations and testing each component individually before integration.

Additionally, AI suggested implementing a relevance algorithm with exact word boundaries, where "quick" would NOT match "quickly". However, when we manually worked through the examples in our project specification, we realized substring matching was required for the correct behavior. We detected this discrepancy by testing the expected rankings with concrete examples and comparing them against the spec requirements.

### Evidence of Independent Work

**Paste a before-and-after snippet (3–5 lines max) showing where you changed your own code in response to AI guidance.**

Before:
```javascript
const events = ["event1", "event2"];
```

After:
```javascript
const events = eventsData.filter(e => org.eventIds.includes(e.id));
```

**In 2–3 sentences, explain what you learned by making this change.**

We learned that establishing bi-directional relationships between data models requires careful consideration of the data structure. By adding the events filter, we created a more complete cross-referencing system that allows for better scalability and future use cases. This approach of using array methods to dynamically filter and connect related data became a pattern we used throughout the project.

### Integrity Statement

We confirm that the AI was used only as a helper (explainer, debugger, reviewer) and not as a code generator. All code submitted is our own work.
