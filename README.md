# literacy-data-visualizer
A data visualizer framework for the Lexplore literacy research project.

## Running the web server locally
Until we have a working url for the visualisation tool, it can at the very least be hosted locally.

### Node.js and npm
You need Node.js and npm installed to host the application. If you haven't installed them yet, instructions can be found here: https://radixweb.com/blog/installing-npm-and-nodejs-on-windows-and-mac

### Get the web server running
1. Download the repository folder in any manner you deem fit, and unzip the contents if necessary.
2. Open the command prompt or terminal on your device and locate the repository folder.
3. Run the command ```npm start```. This will run the local batch script which will set the web server up for you.
4. When finished, terminate the web server with ctrl-c in the command prompt or terminal, type 'Y', then Enter.

### Known issues
#### "digital envelope routines::unsupported"
Run ```$env:NODE_OPTIONS = "--openssl-legacy-provider"``` once before ```npm start```. Once done, you do not need to do so again.

#### "Module not found: ..."
Let Liang know, and he should push a fix soon enough.
