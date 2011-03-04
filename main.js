var fs = require('fs')
    , args = process.argv.slice(2)
    , spawn = require('child_process').spawn
    , path = require('path')
    , plugins = []
    , persistence
    , listeners
    ;


var readFile = function(file, clb) {
    var stream = fs.createReadStream(file);
    var data = "";
    stream.on("data", function(d){
        data += d;
    });
    stream.on("end", function(){
        clb(data);
    });
};

var writeFile = function(file, data, clb) {
    var stream = fs.createWriteStream(file);
    stream.on("close", function(){
        if (clb){
            clb();
        }
    });
    stream.write(data);
    stream.end();
};

var writeJSONFile = function(file, json, clb){
    writeFile(file, JSON.stringify(json), clb);
};

var readJSONFile = function(file, clb){
    readFile(file, function(data){
        clb(JSON.parse(data));
    });
};

var PersistenceStore = function(file, clb){
    var makeStore = function(d){
        return {
            data: d
            , put: function(id, key, value, c){
                this.data[id] = this.data[id] || {};
                this.data[id][key] = value;
                this.write(c);
            }
            , get: function(id, key){
                this.data[id] = this.data[id] || {};
                return this.data[id][key];
            }
            , write: function(c){
                if (c === undefined){
                    c = function(){};
                }
                writeJSONFile(file, this.data, c);
            }
        };
    };
    if(path.existsSync(file)){
        readJSONFile(file, function(obj){
            clb(makeStore(obj));
        });
    } else {
        clb(makeStore({}));
    }
};

var initPlugin = function(plugin){
    var module = require(plugin.module);
    var obj = module.init(plugin.config, function(message){
        growl(plugin.name, message, plugin.growlOptions);
    }, {
        get: function(key){
            return persistence.get(plugin.id, key);
        },
        put: function(key, value){
            return persistence.put(plugin.id, key, value);
        }
    });
    plugins.push({config: plugin, obj: obj});
};

var growl = function(name, message, options){
    var args, growlnotify, listener;
    for (var i=0; i<listeners.length; i++){
        listener = listeners[i];
        args = [];
        if (listener.type === "local") {
            
        } else if (listener.type === "remote") {
            args.push("-H");
            args.push(listener.host);
            args.push("-P");
            args.push(listener.password);
        }
        if (options){
            for (var key in options){
                args.push("--"+key);
                args.push(options[key]);
            }
        }
        growlnotify = spawn("growlnotify", args);
        growlnotify.stderr.on('data', function (data) {
            console.log('stderr: ' + data);
        });
        growlnotify.stdin.write(name+"\n");
        growlnotify.stdin.write(message);
        growlnotify.stdin.end();
    }
};

var startPlugins = function(){
    var i, l = plugins.length, plugin;
    for (i=0; i<l; i++){
        var plug = plugins[i];
        var sto = function(plug){
            console.log("Checking "+ plug.config.name);
            plug.obj.check(function(){
                console.log(plug.config.name+": next in "+Math.round(plug.config.interval/1000)+"s");
                setTimeout(sto, plug.config.interval, plug);
            });
        };
        sto(plug);
    }
};

var configFile = args.length > 0 ? args[0] : "config.json";

readJSONFile(configFile, function(obj){
    listeners = obj.listeners;
    PersistenceStore(obj.persistence, function(p){
        persistence = p;
        var l = obj.plugins.length, i, plugin;
        for (i=0; i<l; i++){
            initPlugin(obj.plugins[i]);
        }
        startPlugins();
    });
});