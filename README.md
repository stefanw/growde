growde
======

0. make sure you have the growlnotify commandline tool

1. copy config.example.json to config.json
2. edit config.json
3. run "node main.js config.json"

Plugins
-------
config contains a JSON object with a "plugins" array with all active plugins.
 - id must be unique
 - name is the app name given to growl
 - growlOptions may contain further options to growlnotify
 - config given to the module
 - module is the module to require, must contain a init function that takes up to three parameters: config, growl, persistence (the configuration object, the growl function to call, a persistence store to put or get keys from)
 - interval are the milliseconds between execution of th

Listeners
---------
An array of growl listeners either type: "local" or type: "remote" with (host and password option)

Persistence
-----------
Filename of persistence store json file.