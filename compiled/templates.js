define(['jade'], function(jade) { if(jade && jade['runtime'] !== undefined) { jade = jade.runtime; }

this["JST"] = this["JST"] || {};

this["JST"]["faceted-search/facets/boolean.body"] = function template(locals) {
var buf = [];
var jade_mixins = {};
var locals_ = (locals || {}),options = locals_.options,ucfirst = locals_.ucfirst;
buf.push("<ul>");
// iterate options
;(function(){
  var $$obj = options;
  if ('number' == typeof $$obj.length) {

    for (var $index = 0, $$l = $$obj.length; $index < $$l; $index++) {
      var option = $$obj[$index];

buf.push("<li><div class=\"row span6\"><div class=\"cell span5\"><i" + (jade.attr("data-value", option.name, true, false)) + (jade.cls([option.checked?'fa fa-check-square-o':'fa fa-square-o'], [true])) + "></i><label" + (jade.attr("data-value", option.name, true, false)) + ">" + (jade.escape(null == (jade.interp = ucfirst(option.name)) ? "" : jade.interp)) + "</label></div><div class=\"cell span1 alignright\"><div class=\"count\">" + (jade.escape(null == (jade.interp = option.count) ? "" : jade.interp)) + "</div></div></div></li>");
    }

  } else {
    var $$l = 0;
    for (var $index in $$obj) {
      $$l++;      var option = $$obj[$index];

buf.push("<li><div class=\"row span6\"><div class=\"cell span5\"><i" + (jade.attr("data-value", option.name, true, false)) + (jade.cls([option.checked?'fa fa-check-square-o':'fa fa-square-o'], [true])) + "></i><label" + (jade.attr("data-value", option.name, true, false)) + ">" + (jade.escape(null == (jade.interp = ucfirst(option.name)) ? "" : jade.interp)) + "</label></div><div class=\"cell span1 alignright\"><div class=\"count\">" + (jade.escape(null == (jade.interp = option.count) ? "" : jade.interp)) + "</div></div></div></li>");
    }

  }
}).call(this);

buf.push("</ul>");;return buf.join("");
};

this["JST"]["faceted-search/facets/date"] = function template(locals) {
var buf = [];
var jade_mixins = {};
var locals_ = (locals || {}),name = locals_.name,title = locals_.title,options = locals_.options;
buf.push("<header><h3" + (jade.attr("data-name", name, true, false)) + ">" + (jade.escape(null == (jade.interp = title) ? "" : jade.interp)) + "</h3></header><div class=\"body\"><label>From:</label><select>");
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

this["JST"]["faceted-search/facets/list.body"] = function template(locals) {
var buf = [];
var jade_mixins = {};

buf.push("<ul></ul>");;return buf.join("");
};

this["JST"]["faceted-search/facets/list.menu"] = function template(locals) {
var buf = [];
var jade_mixins = {};
var locals_ = (locals || {}),selectAll = locals_.selectAll;
buf.push("<input type=\"checkbox\" name=\"all\"" + (jade.attr("style", selectAll?'visibility:visible':'visibility:hidden', true, false)) + "/><input type=\"text\" name=\"filter\"/><small class=\"optioncount\"></small><div class=\"orderby\"><i class=\"alpha fa fa-sort-alpha-asc\"></i><i class=\"amount active fa fa-sort-amount-desc\"></i></div>");;return buf.join("");
};

this["JST"]["faceted-search/facets/list.option"] = function template(locals) {
var buf = [];
var jade_mixins = {};
var locals_ = (locals || {}),option = locals_.option;
buf.push("<li" + (jade.attr("data-count", option.get('count'), true, false)) + "><i" + (jade.attr("data-value", option.id, true, false)) + (jade.cls([option.get('checked')?'fa fa-check-square-o':'fa fa-square-o'], [true])) + "></i><label" + (jade.attr("data-value", option.id, true, false)) + ">" + (null == (jade.interp = option.id === ':empty' ? '<em>(empty)</em>' : option.id) ? "" : jade.interp) + "</label><div class=\"count\">" + (jade.escape(null == (jade.interp = option.get('count') === 0 ? option.get('total') : option.get('count')) ? "" : jade.interp)) + "</div></li>");;return buf.join("");
};

this["JST"]["faceted-search/facets/list.options"] = function template(locals) {
var buf = [];
var jade_mixins = {};
var locals_ = (locals || {}),options = locals_.options,randomId = locals_.randomId,generateID = locals_.generateID;
buf.push("<ul>");
// iterate options
;(function(){
  var $$obj = options;
  if ('number' == typeof $$obj.length) {

    for (var index = 0, $$l = $$obj.length; index < $$l; index++) {
      var option = $$obj[index];

randomId = generateID();
if ( index < 50)
{
buf.push("<li><div" + (jade.attr("data-count", option.get('count'), true, false)) + " class=\"row span6\"><div class=\"cell span5\"><input" + (jade.attr("id", randomId, true, false)) + (jade.attr("name", randomId, true, false)) + " type=\"checkbox\"" + (jade.attr("data-value", option.id, true, false)) + (jade.attr("checked", option.get('checked')?true:false, true, false)) + "/><label" + (jade.attr("for", randomId, true, false)) + ">" + (null == (jade.interp = option.id === ':empty' ? '<em>(empty)</em>' : option.id) ? "" : jade.interp) + "</label></div><div class=\"cell span1 alignright\"><div class=\"count\">" + (jade.escape(null == (jade.interp = option.get('count') === 0 ? option.get('total') : option.get('count')) ? "" : jade.interp)) + "</div></div></div></li>");
}
    }

  } else {
    var $$l = 0;
    for (var index in $$obj) {
      $$l++;      var option = $$obj[index];

randomId = generateID();
if ( index < 50)
{
buf.push("<li><div" + (jade.attr("data-count", option.get('count'), true, false)) + " class=\"row span6\"><div class=\"cell span5\"><input" + (jade.attr("id", randomId, true, false)) + (jade.attr("name", randomId, true, false)) + " type=\"checkbox\"" + (jade.attr("data-value", option.id, true, false)) + (jade.attr("checked", option.get('checked')?true:false, true, false)) + "/><label" + (jade.attr("for", randomId, true, false)) + ">" + (null == (jade.interp = option.id === ':empty' ? '<em>(empty)</em>' : option.id) ? "" : jade.interp) + "</label></div><div class=\"cell span1 alignright\"><div class=\"count\">" + (jade.escape(null == (jade.interp = option.get('count') === 0 ? option.get('total') : option.get('count')) ? "" : jade.interp)) + "</div></div></div></li>");
}
    }

  }
}).call(this);

buf.push("</ul>");;return buf.join("");
};

this["JST"]["faceted-search/facets/main"] = function template(locals) {
var buf = [];
var jade_mixins = {};
var locals_ = (locals || {}),name = locals_.name,title = locals_.title;
buf.push("<div class=\"placeholder pad4\"><header><h3" + (jade.attr("data-name", name, true, false)) + ">" + (jade.escape(null == (jade.interp = title) ? "" : jade.interp)) + "</h3><i class=\"openclose fa fa-plus-square-o\"></i><div class=\"options\"></div></header><div class=\"body\"></div></div>");;return buf.join("");
};

this["JST"]["faceted-search/facets/range.body"] = function template(locals) {
var buf = [];
var jade_mixins = {};
var locals_ = (locals || {}),options = locals_.options;
buf.push("<div class=\"slider\"><div class=\"min-handle\"></div><div class=\"max-handle\"></div><div class=\"bar\">&nbsp;</div><div class=\"min-value\">" + (jade.escape(null == (jade.interp = options.lowerLimit) ? "" : jade.interp)) + "</div><div class=\"max-value\">" + (jade.escape(null == (jade.interp = options.upperLimit) ? "" : jade.interp)) + "</div><button>Search?</button></div>");;return buf.join("");
};

this["JST"]["faceted-search/facets/search.body"] = function template(locals) {
var buf = [];
var jade_mixins = {};

buf.push("<div class=\"row span4 align middle\"><div class=\"cell span3\"><div class=\"padr4\"><input type=\"text\" name=\"search\"/></div></div><div class=\"cell span1\"><button class=\"search\">Search</button></div></div>");;return buf.join("");
};

this["JST"]["faceted-search/facets/search.menu"] = function template(locals) {
var buf = [];
var jade_mixins = {};
var locals_ = (locals || {}),model = locals_.model;
buf.push("<div class=\"row span2 align middle\"><div class=\"cell span1 casesensitive\"><input id=\"cb_casesensitive\" type=\"checkbox\" name=\"cb_casesensitive\" data-attr=\"caseSensitive\"/><label for=\"cb_casesensitive\">Match case</label></div><div class=\"cell span1 fuzzy\"><input id=\"cb_fuzzy\" type=\"checkbox\" name=\"cb_fuzzy\" data-attr=\"fuzzy\"/><label for=\"cb_fuzzy\">Fuzzy</label></div></div>");
if ( model.has('searchInAnnotations') || model.has('searchInTranscriptions'))
{
buf.push("<h4>Search</h4><ul class=\"searchins\">");
if ( model.has('searchInTranscriptions'))
{
buf.push("<li class=\"searchin\"><input id=\"cb_searchin_transcriptions\" type=\"checkbox\" data-attr=\"searchInTranscriptions\"" + (jade.attr("checked", model.get('searchInTranscriptions'), true, false)) + "/><label for=\"cb_searchin_transcriptions\">Transcriptions</label>");
if ( model.has('textLayers'))
{
buf.push("<ul class=\"textlayers\">");
// iterate model.get('textLayers')
;(function(){
  var $$obj = model.get('textLayers');
  if ('number' == typeof $$obj.length) {

    for (var $index = 0, $$l = $$obj.length; $index < $$l; $index++) {
      var textLayer = $$obj[$index];

buf.push("<li class=\"textlayer\"><input" + (jade.attr("id", 'cb_textlayer'+textLayer, true, false)) + " type=\"checkbox\" data-attr-array=\"textLayers\"" + (jade.attr("data-value", textLayer, true, false)) + " checked=\"checked\"/><label" + (jade.attr("for", 'cb_textlayer'+textLayer, true, false)) + ">" + (jade.escape(null == (jade.interp = textLayer) ? "" : jade.interp)) + "</label></li>");
    }

  } else {
    var $$l = 0;
    for (var $index in $$obj) {
      $$l++;      var textLayer = $$obj[$index];

buf.push("<li class=\"textlayer\"><input" + (jade.attr("id", 'cb_textlayer'+textLayer, true, false)) + " type=\"checkbox\" data-attr-array=\"textLayers\"" + (jade.attr("data-value", textLayer, true, false)) + " checked=\"checked\"/><label" + (jade.attr("for", 'cb_textlayer'+textLayer, true, false)) + ">" + (jade.escape(null == (jade.interp = textLayer) ? "" : jade.interp)) + "</label></li>");
    }

  }
}).call(this);

buf.push("</ul>");
}
buf.push("</li>");
}
if ( model.has('searchInAnnotations'))
{
buf.push("<li class=\"searchin\"><input id=\"cb_searchin_annotations\" type=\"checkbox\" data-attr=\"searchInAnnotations\"" + (jade.attr("checked", model.get('searchInAnnotations'), true, false)) + "/><label for=\"cb_searchin_annotations\">Annotations</label></li>");
}
buf.push("</ul>");
};return buf.join("");
};

this["JST"]["faceted-search/main"] = function template(locals) {
var buf = [];
var jade_mixins = {};

buf.push("<div class=\"overlay\"><div><i class=\"fa fa-spinner fa-spin fa-2x\"></i></div></div><div class=\"faceted-search\"><i class=\"fa fa-compress\"></i><form><div class=\"search-placeholder\"></div><div class=\"facets\"><div class=\"loader\"><h4>Loading facets...</h4><br/><i class=\"fa fa-spinner fa-spin fa-2x\"></i></div></div></form></div>");;return buf.join("");
};

return this["JST"];

});