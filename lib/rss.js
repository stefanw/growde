var xml = require("node-xml")
    , sys = require('sys')
    , request = require('request')
    ;

exports.RSS = (function(){
    return function(config, growl, persistence){
        var rss = {
            lastItemDate: false
            , check: function(clb){
                this.checkURL(clb);
            }
            , checkURL: function(clb){
                var self = this;
                request({uri: config.url}, function (error, response, body) {
                    if (!error && response.statusCode == 200) {
                        var parser = new xml.SaxParser(function(cb) {
                            var items = [], index = -1, accessor = false, itemize = false;
                            cb.onEndDocument(function() {
                                self.workItems(items, clb);
                            });
                            cb.onStartElementNS(function(elem, attrs, prefix, uri, namespaces) {
                              if (elem === "item") {
                                  items.push({});
                                  index += 1;
                                  itemize = true;
                              } else if (itemize){
                                  accessor = elem;
                                  if (items[index][accessor] !== undefined) {
                                      if (typeof items[index][accessor] === "string"){
                                          items[index][accessor] = [ items[index][accessor] ];
                                      }
                                      items[index][accessor].push("");
                                  } else {
                                      items[index][accessor] = "";
                                  }
                              }
                            });
                            cb.onEndElementNS(function(elem, prefix, uri) {
                                if (elem === "item"){
                                    itemize = false;
                                } else if(elem === "pubDate"){
                                    items[index][accessor] = new Date(items[index][accessor]);
                                }
                                accessor = false;
                            });
                            cb.onCharacters(function(chars) {
                              if (accessor && itemize){
                                  if (typeof items[index][accessor] === "string"){
                                      items[index][accessor] += chars;
                                  } else {
                                      var l = items[index][accessor].length;
                                      items[index][accessor][l - 1] += chars;
                                  }
                              }
                            });
                            cb.onError(function(msg) {
                              sys.puts('<ERROR>'+JSON.stringify(msg)+"</ERROR>");
                            });
                        });
                        parser.parseString(body);
                    }
                });
            }
            , workItems: function(items, clb){
                items.sort(function(a,b){
                    return a.pubDate > b.pubDate;
                });
                var l = items.length, i, item, lastDate;
                for(i=0; i<l; i++){
                    item = items[i];
                    if (this.lastItemDate !== false && item.pubDate <= this.lastItemDate){
                        continue;
                    }
                    this.workItem(item);
                    lastDate = item.pubDate;
                }
                if (lastDate){
                    this.lastItemDate = lastDate;
                    persistence.put("lastItemDate", this.lastItemDate);
                }
                clb();
            }
            , workItem: function(item){
                growl(item.title+ '\n' + item.description
                        .replace(/<\/?\w+ ?\/?>/g, "").replace(/\n/, ""));
            }
        };
        rss.lastItemDate = new Date(persistence.get("lastItemDate"));
        return rss;
    };
}());

exports.init = function(config, growl, persistence){
    return RSS(config, growl, persistence);
};