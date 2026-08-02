### panel.js
#### 1. shadow dom setup
    - shadowHost and Root are module level and only created once at the beginning and every call after that it return the same thing back as shadowHost is a truthy value. create once, reuse after 
    - the mode for attachShadown is kept open so that external scripts can inspect and access the internal elements via the host element's shadowRoot property 
    - CSS is loaded up as a link for the link tag using the chrome.runtime.getURL which converts the internal file into a URL

#### 2. renderPanel 
    - here we declare the structure of the notes in the HTML code which is the view for a user
    - the ? or ?? are just replacements for if/else statement in case the first argument is missing
    - We use abstraction here and implement it as this file only knows what the user typed and has no information about `updatedAt` tag or deciding the storage keys. 
    
#### 3. updatePanel 
    - 

---

### background.js
- so `chrome.webNavigation.onHistoryStateUpdated` is specifically used for single page application which dont reload the page and hence we need to use the History API to know if leetcode has moved 
- here we are checking if frame is not equal to 0 so as to prevent triggering a false question change when an unrelated frame on the page changes it own internal URL 

