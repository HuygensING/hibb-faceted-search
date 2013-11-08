define(['jade'], function(jade) { if(jade && jade['runtime'] !== undefined) { jade = jade.runtime; }

this["JST"] = this["JST"] || {};

this["JST"]["faceted-search/facets/boolean.body"] = function anonymous(locals) {
var buf = [];
var locals_ = (locals || {}),options = locals_.options,name = locals_.name,ucfirst = locals_.ucfirst;buf.push("<div class=\"options\"><ul>");
// iterate options
;(function(){
  var $$obj = options;
  if ('number' == typeof $$obj.length) {

    for (var $index = 0, $$l = $$obj.length; $index < $$l; $index++) {
      var option = $$obj[$index];

buf.push("<li class=\"option\"><div class=\"row span6\"><div class=\"cell span5\"><input" + (jade.attrs({ 'id':(name+'_'+option.name), 'name':(name+'_'+option.name), 'type':("checkbox"), 'data-value':(option.name) }, {"id":true,"name":true,"type":true,"data-value":true})) + "/><label" + (jade.attrs({ 'for':(name+'_'+option.name) }, {"for":true})) + ">" + (jade.escape(null == (jade.interp = ucfirst(option.name)) ? "" : jade.interp)) + "</label></div><div class=\"cell span1 alignright\"><div class=\"count\">" + (jade.escape(null == (jade.interp = option.count) ? "" : jade.interp)) + "</div></div></div></li>");
    }

  } else {
    var $$l = 0;
    for (var $index in $$obj) {
      $$l++;      var option = $$obj[$index];

buf.push("<li class=\"option\"><div class=\"row span6\"><div class=\"cell span5\"><input" + (jade.attrs({ 'id':(name+'_'+option.name), 'name':(name+'_'+option.name), 'type':("checkbox"), 'data-value':(option.name) }, {"id":true,"name":true,"type":true,"data-value":true})) + "/><label" + (jade.attrs({ 'for':(name+'_'+option.name) }, {"for":true})) + ">" + (jade.escape(null == (jade.interp = ucfirst(option.name)) ? "" : jade.interp)) + "</label></div><div class=\"cell span1 alignright\"><div class=\"count\">" + (jade.escape(null == (jade.interp = option.count) ? "" : jade.interp)) + "</div></div></div></li>");
    }

  }
}).call(this);

buf.push("</ul></div>");;return buf.join("");
};

this["JST"]["faceted-search/facets/date"] = function anonymous(locals) {
var buf = [];
var locals_ = (locals || {}),name = locals_.name,title = locals_.title,options = locals_.options;buf.push("<header><h3" + (jade.attrs({ 'data-name':(name) }, {"data-name":true})) + ">" + (jade.escape(null == (jade.interp = title) ? "" : jade.interp)) + "</h3></header><div class=\"body\"><label>From:</label><select>");
// iterate options
;(function(){
  var $$obj = options;
  if ('number' == typeof $$obj.length) {

    for (var $index = 0, $$l = $$obj.length; $index < $$l; $index++) {
      var option = $$obj[$index];

buf.push("<option>" + (jade.escape(null == (jade.interp = option) ? "" : jade.interp)) + "</option>");
    }

  } else {
    var $$l = 0;
    for (var $index in $$obj) {
      $$l++;      var option = $$obj[$index];

buf.push("<option>" + (jade.escape(null == (jade.interp = option) ? "" : jade.interp)) + "</option>");
    }

  }
}).call(this);

buf.push("</select><label>To:</label><select>");
// iterate options.reverse()
;(function(){
  var $$obj = options.reverse();
  if ('number' == typeof $$obj.length) {

    for (var $index = 0, $$l = $$obj.length; $index < $$l; $index++) {
      var option = $$obj[$index];

buf.push("<option>" + (jade.escape(null == (jade.interp = option) ? "" : jade.interp)) + "</option>");
    }

  } else {
    var $$l = 0;
    for (var $index in $$obj) {
      $$l++;      var option = $$obj[$index];

buf.push("<option>" + (jade.escape(null == (jade.interp = option) ? "" : jade.interp)) + "</option>");
    }

  }
}).call(this);

buf.push("</select></div>");;return buf.join("");
};

this["JST"]["faceted-search/facets/list.body"] = function anonymous(locals) {
var buf = [];
buf.push("<div class=\"options\"><ul></ul></div>");;return buf.join("");
};

this["JST"]["faceted-search/facets/list.menu"] = function anonymous(locals) {
var buf = [];
buf.push("<div class=\"row span4 align middle\"><div class=\"cell span2\"><input type=\"text\" name=\"listsearch\" class=\"listsearch\"/></div><div class=\"cell span1\"><small class=\"optioncount\"></small></div><div class=\"cell span1 alignright\"><nav><ul><li class=\"all\">All </li><li class=\"none\">None</li></ul></nav></div></div>");;return buf.join("");
};

this["JST"]["faceted-search/facets/list.options"] = function anonymous(locals) {
var buf = [];
var locals_ = (locals || {}),options = locals_.options,generateID = locals_.generateID;buf.push("<ul>");
// iterate options
;(function(){
  var $$obj = options;
  if ('number' == typeof $$obj.length) {

    for (var $index = 0, $$l = $$obj.length; $index < $$l; $index++) {
      var option = $$obj[$index];

randomId = generateID();
buf.push("<li class=\"option\"><div" + (jade.attrs({ 'data-count':(option.get('count')), "class": [('row'),('span6')] }, {"data-count":true})) + "><div class=\"cell span5\"><input" + (jade.attrs({ 'id':(randomId), 'name':(randomId), 'type':("checkbox"), 'data-value':(option.id), 'checked':(option.get('checked')?true:false) }, {"id":true,"name":true,"type":true,"data-value":true,"checked":true})) + "/><label" + (jade.attrs({ 'for':(randomId) }, {"for":true})) + ">" + (null == (jade.interp = option.id === ':empty' ? '<i>(empty)</i>' : option.id) ? "" : jade.interp) + "</label></div><div class=\"cell span1 alignright\"><div class=\"count\">" + (jade.escape(null == (jade.interp = option.get('count') === 0 ? option.get('total') : option.get('count')) ? "" : jade.interp)) + "</div></div></div></li>");
    }

  } else {
    var $$l = 0;
    for (var $index in $$obj) {
      $$l++;      var option = $$obj[$index];

randomId = generateID();
buf.push("<li class=\"option\"><div" + (jade.attrs({ 'data-count':(option.get('count')), "class": [('row'),('span6')] }, {"data-count":true})) + "><div class=\"cell span5\"><input" + (jade.attrs({ 'id':(randomId), 'name':(randomId), 'type':("checkbox"), 'data-value':(option.id), 'checked':(option.get('checked')?true:false) }, {"id":true,"name":true,"type":true,"data-value":true,"checked":true})) + "/><label" + (jade.attrs({ 'for':(randomId) }, {"for":true})) + ">" + (null == (jade.interp = option.id === ':empty' ? '<i>(empty)</i>' : option.id) ? "" : jade.interp) + "</label></div><div class=\"cell span1 alignright\"><div class=\"count\">" + (jade.escape(null == (jade.interp = option.get('count') === 0 ? option.get('total') : option.get('count')) ? "" : jade.interp)) + "</div></div></div></li>");
    }

  }
}).call(this);

buf.push("</ul>");;return buf.join("");
};

this["JST"]["faceted-search/facets/main"] = function anonymous(locals) {
var buf = [];
var locals_ = (locals || {}),name = locals_.name,title = locals_.title;buf.push("<div class=\"placeholder pad4\"><header><h3" + (jade.attrs({ 'data-name':(name) }, {"data-name":true})) + ">" + (jade.escape(null == (jade.interp = title) ? "" : jade.interp)) + "</h3><small>&#8711;</small><div class=\"options\"></div></header><div class=\"body\"></div></div>");;return buf.join("");
};

this["JST"]["faceted-search/facets/search.body"] = function anonymous(locals) {
var buf = [];
buf.push("<div class=\"row span4 align middle\"><div class=\"cell span3\"><div class=\"padr4\"><input id=\"search\" type=\"text\" name=\"search\"/></div></div><div class=\"cell span1\"><button class=\"search\">Search</button></div></div>");;return buf.join("");
};

this["JST"]["faceted-search/facets/search.menu"] = function anonymous(locals) {
var buf = [];
var locals_ = (locals || {}),searchOptions = locals_.searchOptions;buf.push("<div class=\"row span1 align middle\"><div class=\"cell span1 casesensitive\"><input id=\"cb_casesensitive\" type=\"checkbox\" name=\"cb_casesensitive\" data-prop=\"caseSensitive\"/><label for=\"cb_casesensitive\">Match case</label></div></div>");
if ( searchOptions.hasOwnProperty('searchInAnnotations') || searchOptions.hasOwnProperty('searchInTranscriptions'))
{
buf.push("<div class=\"row span1\"><div class=\"cell span1\"><h4>Search in</h4><ul class=\"searchins\">");
if ( searchOptions.hasOwnProperty('searchInAnnotations'))
{
buf.push("<li class=\"searchin\"><input" + (jade.attrs({ 'id':("cb_searchin_annotations"), 'type':("checkbox"), 'data-prop':("searchInAnnotations"), 'checked':(searchOptions.searchInAnnotations?true:false) }, {"id":true,"type":true,"data-prop":true,"checked":true})) + "/><label for=\"cb_searchin_annotations\">Annotations</label></li>");
}
if ( searchOptions.hasOwnProperty('searchInTranscriptions'))
{
buf.push("<li class=\"searchin\"><input" + (jade.attrs({ 'id':("cb_searchin_transcriptions"), 'type':("checkbox"), 'data-prop':("searchInTranscriptions"), 'checked':(searchOptions.searchInTranscriptions?true:false) }, {"id":true,"type":true,"data-prop":true,"checked":true})) + "/><label for=\"cb_searchin_transcriptions\">Transcriptions</label></li>");
}
buf.push("</ul></div></div>");
}
if ( searchOptions.hasOwnProperty('textLayers'))
{
buf.push("<div class=\"row span1\"><div class=\"cell span1\"><h4>Text layers</h4><ul class=\"textlayers\">");
// iterate searchOptions.textLayers
;(function(){
  var $$obj = searchOptions.textLayers;
  if ('number' == typeof $$obj.length) {

    for (var $index = 0, $$l = $$obj.length; $index < $$l; $index++) {
      var textLayer = $$obj[$index];

buf.push("<li class=\"textlayer\"><input" + (jade.attrs({ 'id':('cb_textlayer'+textLayer), 'type':("checkbox"), 'data-proparr':("textLayers") }, {"id":true,"type":true,"data-proparr":true})) + "/><label" + (jade.attrs({ 'for':('cb_textlayer'+textLayer) }, {"for":true})) + ">" + (jade.escape(null == (jade.interp = textLayer) ? "" : jade.interp)) + "</label></li>");
    }

  } else {
    var $$l = 0;
    for (var $index in $$obj) {
      $$l++;      var textLayer = $$obj[$index];

buf.push("<li class=\"textlayer\"><input" + (jade.attrs({ 'id':('cb_textlayer'+textLayer), 'type':("checkbox"), 'data-proparr':("textLayers") }, {"id":true,"type":true,"data-proparr":true})) + "/><label" + (jade.attrs({ 'for':('cb_textlayer'+textLayer) }, {"for":true})) + ">" + (jade.escape(null == (jade.interp = textLayer) ? "" : jade.interp)) + "</label></li>");
    }

  }
}).call(this);

buf.push("</ul></div></div>");
};return buf.join("");
};

this["JST"]["faceted-search/main"] = function anonymous(locals) {
var buf = [];
buf.push("<div class=\"faceted-search\"><form><div class=\"search-placeholder\"></div><div class=\"facets\"><div class=\"loader\"><h4>Loading facets...</h4><br/><img src=\"../images/faceted-search/loader.gif\"/></div></div></form></div>");;return buf.join("");
};

return this["JST"];

});