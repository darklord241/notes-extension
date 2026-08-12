### Changes
- made a codeforces-adapter js file which handles the getting the question info 
- i tried using the variable expansion in the `import` line to decide which adapter to use but imports are static and i need to change the adapter based on dynamic web pages n navigation and hence i had to import both but selection is done using the new `getActiveAdapter` function
- updated the permission to include the codeforces site as well which is done in manifest.json 
- i could use the DOM to access the title and use it for the panel name and it is convinient given that it is not a SPA but codeforces problems can have similar names so dont wanna take the chance so using the unique contestId and index is sufficient 
- i think i shld study regex cuz it seems useful so if i am free when reading this then do learn it 
