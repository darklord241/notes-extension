### Cursor movement 
- the change done in panel.js is in togglePanel where the cursor is moved to the panel when a new note is opened either using collapse button or shortcut key 
- the functionality of it is mentioned using comments in the code as well 
- this is mainly done so that you can start typing immediately after solving a question instead of using the mouse and clicking on the panel for typing 
- the `showEditMode` function was declared internally to `renderPanel` and i didnt feel the need to move it outside jusst so that it can be used in `togglePanel` instead the functionality was copied into it

### Miscellaneous
- `db.version(1).stores` : is used to access the 1st version of the database and to define the schema and indexes for this version of the db 
- `console` : log , debug and error are different from each other in their log lvl, visual presentation and intended purpose. they each use different node.js streams 
- `toLocaleDateString` : can have multiple country's format and in this `en-IN` makes it in dd mm yyyy format and it is explicitly stated here for month to be of type short which means short forms of months (Ex: Aug)
- an export function using other functions in the script need not require those helper functions to be of export type as well 
- since it is difficult to compare complex objects, the `localeCompare` method is used 