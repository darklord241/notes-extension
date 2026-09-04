### Main objective 
- to add a shortcut key to toggle between edit and preview mode 
- got the motivation for this while typing notes for a question yesterday where i stopped to think for some while in between typing and it went into preview mode and hence i had to use mouse again 

### Groundwork or behind-the-scenes work (panel.js)
- i moved `showEditMode` and `showPreviewMode` functions out of renderPanel function so that it can be used for this toggling operation 
- these functions couldnt now use the `textarea` or `previewDiv` from renderPanel so had to use panelElements to access those variables 
- `showEditMode` got one more modification of having a local `focusCursor` func which moves the cursor to the end of the panel and making sure this func is called whenever the parent func is called
- `showPreviewMode` also used a local function for rendering which was extracted from renderPanel and it is made local cuz this is the only func which require rendering md
- the main `toggleMode` function which is the function called is defined and uses textarea to define the modes and switch to the other mode using the functions `showEditMode` and `showPreviewMode` 
- the initial if else ladder for this `toggleMode` was not catching all the states of textarea which were block, none and empty (edit mode, preview mode and no panel : respective situations) and moved only a single if else 

### Pipeline for shortcut
- just copied the same path as the togglePanel shortcut , nothing major 
- add toggle mode to constants.js 
- add a command receiver in background.js which send a message to content.js
- add the toggle mode message receiver in the listener which calls the `toggleMode` func from panel.js 

### major flaw caught due to functions whose scope where changed 
- basically moving `showEditMode` and `showPreviewMode` made bug come up which was invisible before cuz it was under the scope of `renderPanel` only 
- `previewTimer` which was used to make preview mode come up automatically after staying in edit for 2 seconds was never being cleared in `renderPanel` or `removePanel` which it was supposed to be with the `autosaveTimer` 
- why was it not caught before : previously, `howPreviewMode` was a closure inside `renderPanel`, so each render had its own private copy bound to that specific panel's DOM elements. A late-firing stale timer from a previous question would just write to old, detached-but-not-null elements — harmless no-op. After refactoring to module-level functions reading shared panelElements, a late-firing stale timer now reads whatever panelElements currently is — which can be **null** mid-navigation, or worse, pointing at a completely different question's panel.
- so the solution for this was to just clear `previewTimer` wherever `autosaveTimer` was also cleared