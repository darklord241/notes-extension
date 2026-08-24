### Cursor movement 
- the change done in panel.js is in togglePanel where the cursor is moved to the panel when a new note is opened either using collapse button or shortcut key 
- the functionality of it is mentioned using comments in the code as well 
- this is mainly done so that you can start typing immediately after solving a question instead of using the mouse and clicking on the panel for typing 
- the `showEditMode` function was declared internally to `renderPanel` and i didnt feel the need to move it outside jusst so that it can be used in `togglePanel` instead the functionality was copied into it
