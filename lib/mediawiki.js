var RSS = require('./rss').RSS;

var MediaWiki = (function(){
    return function(config, growl, persistence){
        var mediaWiki = RSS(config, growl, persistence);
        mediaWiki.workItem = function(item){
            item.description = item.description.replace(/<\/\w+>/, "")
                .replace(/<\w+\s*\/?>/, "");
            growl(item.creator+": "+item.description +" - "+ item.title);
        };
        return mediaWiki;
    };
}());
exports.MediaWiki = MediaWiki;

exports.init = function(config, growl, persistence){
    return MediaWiki(config, growl, persistence);
};