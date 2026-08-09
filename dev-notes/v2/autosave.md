### new feature 
- it checks if you have updated anything in the notes and after you pause or stop editing then 1 second later it calls the save function without you requiring to click the save button 
- the save button is just an accesory for people who do like to click it but saving is done automatically 
- `lastSavedContent` is a local variable to `renderPanel` function cuz everytime the panel is rendered through some navigation
- `autosaveTimer` is module level cuz it has to survive the re rendering, in case someone switches to a new question within that 1 second timeline after typing then the text they typed is saved into the new question
- to make sure the above does not happen, two guardrails are added at `renderPanel` and in `removePanel` against leftover timer outliving the panel it belonged to 
- just for clean working we also add this in the save-btn click listener so as to not run the save function twice, one manually and other automatically. though two times save doesnt hurt but is just wasteful 
- `autosaveTimer` is set to 1s only if the text content is changed which is checked using `isUpdated` boolean value
