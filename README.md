growde
======

growde is a nodejs server that uses a configuration of plugins to fetch notifications from sources (Bitbucket commits and Trac feed plugins are included) and distribute them via growl notifications.

1. make sure you have the growlnotify commandline tool
2. copy config.example.json to config.json
3. edit config.json
4. run "node main.js config.json"


Configuration
-------------

### Plugins

The config.json contains a JSON object with a "plugins" array with all active plugins.

- id must be unique
- name is the app name given to growl
- growlOptions may contain further options to growlnotify
- config given to the module
- module is the module to require, must contain a init function that takes up to three parameters: config, growl, persistence (the configuration object, the growl function to call, a persistence store to put or get keys from)
- interval are the milliseconds between execution of th

### Listeners

An array of growl listeners either type: "local" or type: "remote" with additional host and password values.

### Persistence

Filename of persistence store json file.

Icons
-----

The projects contains tiny [Trac](http://trac.edgewall.org/) and [Bitbucket](https://bitbucket.org) icons that are used for the Growl notifications. The copyright of these icons is probably with Edgewall Software and [Atlassian](http://www.atlassian.com/) respectively.

License
-------

The growde code is licensed under the [MIT License](http://www.opensource.org/licenses/mit-license.php).