### bundler
- so the files use import and export across each other and there is reference fields in manifest.json
- all of this has to be resolved similar to how dependencies in spring are woven and this job is not done by chrome's extension loader
- Vite's job is to do exactly that and trace all those imports, bundle each entry point into a single self contained file and place them at the paths specified in the manifest 
- for more information : visit https://medium.com/@gmmicky1026/easy-explanation-about-vite-8a6493731fc4

### why the special kind of vite (@crxjs/vite-plugin) 
- plain vite is built primarily for regular web apps which dont require the inherent understanding of how a chrome extension works with the manifest and multiple isolated entry points or the relative asset paths
- crxjs is a thin layer on top of vite to teach these specific rules regarding the extension's inner working 

