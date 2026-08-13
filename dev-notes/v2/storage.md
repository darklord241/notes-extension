### IndexedDB 
- it is 100% local and still requires zero login but meaningfully more capacity and headroom than the previous chrome's local storage 
- this is better than before due to bigger ceiling, more structured querying via a library like Dexie.js — but it does not solve cross-device sync
- So the abstraction used by other scripts is giving its ROI nicely since i dont have to switch anything else other than notes-store.js when moving to a different storage. 

### Dexie 
- raw IndexedDB's native API is notoriously verbose and callback-heavy (a genuinely unpleasant API to write by hand)
- Dexie.js is thin wrapper around raw IndexDB which gives you a much more promise based, readable interface for defining simple table and doing the basic CRUD operations. 

### code related 
- `new Dexie("DsaNotesDB")` creates or opens(if existing) a named IndexedDB. it is kept isolated from everything else 
- `{ notes: "[site+questionId], site, questionId, updatedAt" }` is the schema used in the db and [..] is the compund primary key used | the next three values are indexes used for efficiently query/sort/filter by these fields which can be used later on 

### storage update 
- indexedDB is a standard web platform API and not an extension API. this means that it was created individually for lc and cf 
- to bring all the notes in a single place, i switched the storage mechanism to be handled by the background service worker instead of the content script which is injected in each site.
- since service worker is only one per extension no matter which site it is hosted on, there will be only one individual db for records from multiple sites 
- manifest v3 requires a service worker and this gives the chance to create one unified database across all websites by default.
- Content scripts can be inspected or manipulated by malicious scripts on a host website. Keeping IndexedDB in the Service Worker isolates your data from the webpage's JavaScript context.

### code update 
- so instead of importing the storage functions in content script , new functions which instead send messages to the service worker using the constants are implemented. this allows for no change in the working of content script other than the addition of messaging functions 
- background or service worker got a message listener which calls the imported storage functions 
- `sender` and `sendResponse` are default tools given by chrome for the listener where `sender` is an object which tell you who sent the message and `sendResponse` is a function you call to send data back to the sender 
- the `return true` in the if blocks of background.js listener makes sure the channel is open for the asynchronous storage functions to return the values 