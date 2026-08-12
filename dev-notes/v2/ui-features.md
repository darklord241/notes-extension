### UI Updates 
- Collapse is just adding one more button element and depending on the click event listener we can change the class the overall panel has to modify its state 
- Resizing and draggable are also controlable using mouse event listeners 
- we updated the css so that the textarea also changes according to the resizing of the overall panel
- the css main update was to flex box which allows more convinience to resizing  
- made the changes to css so that it does not match the leetcode colour scheme, ofc colors and other stuff was given by claude 
- added a shortcut Alt+L for toggling the panel and made the corresponding changes for that 
- the command received has the name declared in the manifest.json so had a type there where `-` and `_` were confused so solved that using the console messages to check where the chain was broken 
- made that the panel is collapsed at the beginning itself 