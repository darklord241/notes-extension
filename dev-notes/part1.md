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

### leetcode-adapter.js 
- this uses window and document objects which are made available only by the file which is injected into the webpage 
- the main job is to identify the problem webpage and extract it so that it is passed forward properly 
- we also ignore the non problem pages by returning a `null` value instead of error to the extractTitle function 

### content.js 
- This is the file which wires the independent functions or jobs into the main sequence of operation flow 
- currentQuestionId is tracked according to the change in URL and hence the rerendering of the panel is avoided as leetcode fires multiple events for one navigation 
- handleQuestionChange is called twice, once is for the fresh page pull and another is when the navigation changes after the fresh pull 
- handleSave is passed as a callback for onSave intro renderPanel so that the panel.js can call onSave without needing to know how saving actually works underneath 

### constants.js 
- the whole value is being the single source of truth for multiple strings across file boundaries 
- Storage key prefix is used in notes-store.js buildKey() so that every stored key has it. 
- message type is used in background.js as well as content.js and this pattern is used whenever two separate JS contexts need to talk so we can define the vocabulary here 
