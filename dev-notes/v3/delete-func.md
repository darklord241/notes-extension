### Important things 
- the flow was same as how save process works
- i moved on solving it starting from `panel.js` -> `content.js` -> `background.js` and then back again to `panel.js` and also `constants.js` 
- this is one of the significant changes not in the product sense but for me personally since i initiated from a blank state instead of relying on AI and hence helped me to understand the flow of things 
- thought of reusing updatePanel function but realised it is very useless and only updates the status and nothing else and this made look into the redundant argument as well and also the motivation to make clearPanel 
- added delete button, listener and a helper function in panel.js -> two helper functions and actual argument defined in content.js -> message receiver in background.js 
- some basic errors were the variables being used in the clearPanel had to be made sure not to be local and hence the addition of lastSavedContent to panelElements was decided 
- css and html changes made to contain the two buttons (save n delete) 


### future work
- i found out the `updatePanel` function in panel.js has a redundant argument and this made me think to look over the code in more detail and i will do that through the next commit 
- have to make the cursor move to the panel after deleting so thought of making a separate function for that by removing it out of togglePanel function 