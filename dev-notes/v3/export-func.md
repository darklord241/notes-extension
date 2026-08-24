### Main things included 
- the starting point for export process is in `popup.js` where a button triggers the call to the `exportAllNotes` which gets the argument for it from `getAllNotes` in the storage section and this export function has some helper function formatting the notes received 
- the `export.js` has no imports required at all since it is called with an argument from a function call made to storage in popup.js hence making sure there is no place to interfere anywhere
- the `action` field is updated in `manifest.json` so that the popup for the extension comes up and the name popup is the default similar to how there is index.html 
- the export option is provided in this external popup instead of the question page to maintain a clean working and also to not associate it with individual panels 
- there is no need for zero checking in the `buildMd` function since that is taken care of in the popup.js itself and makes this function sole working to convert the notes from a json format to a structured md format 
- the use of `const` in all possible place makes sure the saved notes are not possible to be modified 

### Download process 
- `blob` is a *binary large object* which is a file like object that represents immutable, raw binary data and it directly wraps the binary data unlike the usual js variables and this makes it efficient as it does not load them into native js code formats 
- the local download link path is chosen as it makes sure the file is created right on the user's computer and does not need a browser to access a web server for the file 
- when a blob is used to make a local download link, a built in browser trick called an **Object URL** is used where the browser creates a magic string link which is attached as an element to the body of the webpage 
- this link or web address is the linkage to the raw binary data or blob residing in the computer's RAM and when clicked this blob is grabeed from the browser using its internal mapping and saves it to the computer's download sections 
- This blob stays on the RAM until the webpage is closed and hence `URL.revokeObjectURL` function is called to clear it up after this link has been called 
- so once the export button is clicked the blob is created and a web address is attached and clicked and revoked in the `downloadMdFile` function 



<br> havent tested export function yet - 24th Aug 2026 


