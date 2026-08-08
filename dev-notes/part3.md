### bundler
- so the files use import and export across each other and there is reference fields in manifest.json
- all of this has to be resolved similar to how dependencies in spring are woven and this job is not done by chrome's extension loader
- Vite's job is to do exactly that and trace all those imports, bundle each entry point into a single self contained file and place them at the paths specified in the manifest 
- for more information : visit https://medium.com/@gmmicky1026/easy-explanation-about-vite-8a6493731fc4

### why the special kind of vite (@crxjs/vite-plugin) 
- plain vite is built primarily for regular web apps which dont require the inherent understanding of how a chrome extension works with the manifest and multiple isolated entry points or the relative asset paths
- crxjs is a thin layer on top of vite to teach these specific rules regarding the extension's inner working 

### errors 
The ones i received and solved after my first run 
- **Typos** : manifest.json had permission instead of permissions | content.js had addlistener instead of addListener so camelCase | QUESTION_URL_PATTERN was typed wrong in leetcode-adapter.js | panel.js under renderPanel, classs instead of class 
- manifest.json only had filenames and not the actual filepaths but that is required by `vite` so that it can bundle them so changed that
- vite.config.js had manifest.json taken care of but i had explicitly written it using `assert` which has become outdated and not used. the new one is `with` but that is not required for json since json files are automatically parsed
- panel.css needs to be attached with the extension and this required permissions to explicited declared and was done in manifest.json by adding `web_accessible_resources` block to it 
- `web_accessible_resources` block has `matches` variable which for this extension only requires for that url with `/problems/` in it but according to the testing i did, it seems this variable only takes domain level urls so i had to remove the problems path and make it `https://leetcode.com/*` 

### patch for flow 4 from working-flow.md 
- **Cause** 
    - if i moved from a problem page to somewhere else (SPA style) then the `content_scripts.matches` in manifest.json is not loaded since it was explicitly written for `/problems/*` only 
    - this caused a harmless but unclean error through background.js as it sends a message to the listener(ie content.js) whenever we check the problem check gate but it does not check for the listener's existence 
    - so when we navigate back to a problems page(SPA style), background worker sends the message but content.js is not present so there is no one to recieve it and we get the error 
- **SOlution** 
    - the listener is made to be active on all the pages 
    - this is done by extending the permissions and making another function which deals with the case of non-problem pages
    - this adds extra overhead as we load up the listener on pages where we dont require it but since the script for this situation is quite small and simple, it wont be much of performance problem  

### error after patch 
- i added the removePanel function but didnt actually implement it since the background worker was still told to ignore non problem pages so had to remove that 
- also i hadnt imported the method from panel.js to content.js so a dumb mistake 