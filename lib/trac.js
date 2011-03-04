var RSS = require('./rss').RSS;

var Trac = (function(){
    return function(config, growl, persistence){
        var trac = RSS(config, growl, persistence);
        trac.workItem = function(item){
            growl(item.creator + ": " + item.title + "\n" + item.description.replace(/<\/?\w+ ?\/?>/g, "").replace(/\n/, ""));
        };
        
        return trac;
    };
}());
exports.Trac = Trac;

exports.init = function(config, growl, persistence){
    return Trac(config, growl, persistence);
};