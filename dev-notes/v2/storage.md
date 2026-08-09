### IndexDB 
- it is 100% local and still requires zero login but meaningfully more capacity and headroom than the previous chrome's local storage 
- this is better than before due to bigger ceiling, more structured querying via a library like Dexie.js — but it does not solve cross-device sync
- So the abstraction used by other scripts is giving its ROI nicely since i dont have to switch anything else other than notes-store.js when moving to a different storage. 

### Dexie 
- raw IndexedDB's native API is notoriously verbose and callback-heavy (a genuinely unpleasant API to write by hand)
- Dexie.js is thin wrapper around raw IndexDB which gives you a much more promise based, readable interface for defining simple table and doing the basic CRUD operations. 

### code related 
- `new Dexie("DsaNotesDB")` creates or opens(if existing) a named IndexedDB. it is kept isolated from everything else 
- `{ notes: "[site+questionId], site, questionId, updatedAt" }` is the schema used in the db and [..] is the compund primary key used | the next three values are indexes used for efficiently query/sort/filter by these fields which can be used later on 
