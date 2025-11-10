## AI Report
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
- Conceptual Clarification: AI helped us understand the architecture and data flow throughout the system with EC2, RDS, and the front end. 
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
suggestions that would have made the code harder to maintain, instead focusing on clean approaches that would scale naturally with my JSON files. I also prioritized
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
Before: const events = ["event1", "event2"];
After: const events = eventsData.filter(e => org.eventsIds.includes(e.id))
In 2–3 sentences, explain what you learned by making this change.
We learned that establishing bi-directional relationships between data models requires careful
consideration of the data structure. By adding the events filter, we
created a more complete cross-referencing system that allows for better scalibility and future use cases!!

### Integrity Statement
We confirm that the AI was used only as a helper (explainer, debugger, reviewer) and not as a
code generator. All code submitted is our own work.