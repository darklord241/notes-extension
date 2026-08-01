### Basic idea about this project 
- A browser extension is just a folder files which the browser loads with some special access. 
- the main parts 
    1. **content** : this contains js which is directly injected in the webpage and its main job is to read and manipulate the page's DOM(document object model).
    2. **background service worker** : this is a script that runs independently of pages and is managed by browser and i am using manifest V3 which is the current standard. It is event driven and is used to detect navigation events across the webpage and also coordinating backend logic
    3. **action page** : the Ui which appears to showcase the notes and currently it is of floating panel style
    4. **storage** : for now i am using chrome's local storage itself 
    5. **detection** : the identification of the question webpage and not any other is done here through ________ (*fill this up man*)

### manifest.json 
- it is the entry point for everything and tells chrome the details about the extension and the permissions it is going to use 
- nothing runs unless it is declared here first 
- permissions are storage and webNavigation which need to be declared as the extension requires to use these APIs for its working 
- another kind of permission is on which websites can this extension interact 

### notes-store.js 
- it is the core abstraction which contains the main functions related to storage 
- chrome local storage is just a flat key-value system so we cant create complex nested objects here 
- it is also an async API which means it returns a promise instead of the data immediately and hence the function call to these will also need the `await` keyword  as JS does not allow synchronous data back from an inherently async op 
- the formal schema for the note record is also managed here and is explicitly written in the saveNote() func
- the only job here is to store and retrieve the notes records only 
- this is file that has to be modified if i switch the saving system from chrome local to some other option

### 