var RSS = require('./rss').RSS;

var BitBucket = (function(){
    return function(config, growl, persistence){
        var bitbucket = RSS(config, growl, persistence);
        bitbucket.workItem = function(item){
            item.a = item.a || [];
            if (typeof item.a === "string"){
                item.a = [item.a];
            }
            for (var i=0; i<item.a.length; i++){
                item.a[i] = " - " + item.a[i]
                    .replace(/(?:(?:^|\n)\s+|\s+(?:$|\n))/g,'');
            }
            growl(item.author+": "+item.title+'\n'+item.a.join("\n"));
        };
        
        return bitbucket;
    };
}());

exports.BitBucket = BitBucket;

exports.init = function(config, growl, persistence){
    return BitBucket(config, growl, persistence);
};