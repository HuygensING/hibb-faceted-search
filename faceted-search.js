!function(e){if("object"==typeof exports)module.exports=e();else if("function"==typeof define&&define.amd)define(e);else{var f;"undefined"!=typeof window?f=window:"undefined"!=typeof global?f=global:"undefined"!=typeof self&&(f=self),f.facetedSearch=e()}}(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(_dereq_,module,exports){

},{}],2:[function(_dereq_,module,exports){
(function (global){!function(e){if("object"==typeof exports)module.exports=e();else if("function"==typeof define&&define.amd)define(e);else{var f;"undefined"!=typeof window?f=window:"undefined"!=typeof global?f=global:"undefined"!=typeof self&&(f=self),f.lib=e()}}(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof _dereq_=="function"&&_dereq_;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof _dereq_=="function"&&_dereq_;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(_dereq_,module,exports){

},{}],2:[function(_dereq_,module,exports){
var $, defaultOptions, token;

$ = _dereq_('jquery');

$.support.cors = true;

token = _dereq_('./token');

defaultOptions = {
  token: true
};

module.exports = {
  get: function(args, options) {
    if (options == null) {
      options = {};
    }
    return this.fire('get', args, options);
  },
  post: function(args, options) {
    if (options == null) {
      options = {};
    }
    return this.fire('post', args, options);
  },
  put: function(args, options) {
    if (options == null) {
      options = {};
    }
    return this.fire('put', args, options);
  },
  poll: function(args) {
    var done, dopoll, testFn, url;
    url = args.url, testFn = args.testFn, done = args.done;
    dopoll = (function(_this) {
      return function() {
        var xhr;
        xhr = _this.get({
          url: url
        });
        return xhr.done(function(data, textStatus, jqXHR) {
          if (testFn(data)) {
            return done(data, textStatus, jqXHR);
          } else {
            return setTimeout(dopoll, 5000);
          }
        });
      };
    })(this);
    return dopoll();
  },
  fire: function(type, args, options) {
    var ajaxArgs;
    options = $.extend({}, defaultOptions, options);
    ajaxArgs = {
      type: type,
      dataType: 'json',
      contentType: 'application/json; charset=utf-8',
      processData: false,
      crossDomain: true
    };
    if (options.token && (token.get() != null)) {
      ajaxArgs.beforeSend = (function(_this) {
        return function(xhr) {
          return xhr.setRequestHeader('Authorization', "" + (token.getType()) + " " + (token.get()));
        };
      })(this);
    }
    return $.ajax($.extend(ajaxArgs, args));
  }
};


},{"./token":8,"jquery":1}],3:[function(_dereq_,module,exports){
var Async, _;

_ = _dereq_('underscore');

Async = (function() {
  function Async(names) {
    var name, _i, _len;
    if (names == null) {
      names = [];
    }
    _.extend(this, Backbone.Events);
    this.callbacksCalled = {};
    for (_i = 0, _len = names.length; _i < _len; _i++) {
      name = names[_i];
      this.callbacksCalled[name] = false;
    }
  }

  Async.prototype.called = function(name, data) {
    if (data == null) {
      data = true;
    }
    this.callbacksCalled[name] = data;
    if (_.every(this.callbacksCalled, function(called) {
      return called !== false;
    })) {
      return this.trigger('ready', this.callbacksCalled);
    }
  };

  return Async;

})();

module.exports = Async;


},{"underscore":1}],4:[function(_dereq_,module,exports){
module.exports = {
  get: function(name) {
    var c, nameEQ, _i, _len, _ref;
    nameEQ = name + "=";
    _ref = document.cookie.split(';');
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      c = _ref[_i];
      while (c.charAt(0) === ' ') {
        c = c.substring(1, c.length);
      }
      if (c.indexOf(nameEQ) === 0) {
        return c.substring(nameEQ.length, c.length);
      }
    }
  },
  set: function(name, value, days) {
    var date, expires;
    if (days) {
      date = new Date();
      date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
      expires = "expires=" + date.toGMTString();
    } else {
      expires = "";
    }
    return document.cookie = "" + name + "=" + value + "; " + expires + "; path=/";
  },
  remove: function(name) {
    return this.set(name, "", -1);
  }
};


},{}],5:[function(_dereq_,module,exports){
var History;

History = (function() {
  function History() {}

  History.prototype.history = [];

  History.prototype.update = function() {
    if (window.location.pathname !== '/login') {
      this.history.push(window.location.pathname);
    }
    return sessionStorage.setItem('history', JSON.stringify(this.history));
  };

  History.prototype.clear = function() {
    return sessionStorage.removeItem('history');
  };

  History.prototype.last = function() {
    return this.history[this.history.length - 1];
  };

  return History;

})();

module.exports = new History();


},{}],6:[function(_dereq_,module,exports){
var ajax, async, cookie, history, modal, token, view, view2;

ajax = _dereq_('./ajax');

async = _dereq_('./async');

cookie = _dereq_('./cookie');

history = _dereq_('./history');

modal = _dereq_('./modal');

token = _dereq_('./token');

view = _dereq_('./view');

view2 = _dereq_('./view2');

module.exports = {
  ajax: ajax,
  async: async,
  cookie: cookie,
  history: history,
  modal: modal,
  token: token,
  view: view,
  view2: view2
};


},{"./ajax":2,"./async":3,"./cookie":4,"./history":5,"./modal":7,"./token":8,"./view":9,"./view2":10}],7:[function(_dereq_,module,exports){
var ModalManager;

ModalManager = (function() {
  function ModalManager() {
    this.modals = [];
  }

  ModalManager.prototype.add = function(modal) {
    var arrLength, m, _i, _len, _ref;
    _ref = this.modals;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      m = _ref[_i];
      m.$('.overlay').css('opacity', '0.2');
    }
    arrLength = this.modals.push(modal);
    modal.$('.overlay').css('z-index', 10000 + (arrLength * 2) - 1);
    modal.$('.modalbody').css('z-index', 10000 + (arrLength * 2));
    return $('body').prepend(modal.$el);
  };

  ModalManager.prototype.remove = function(modal) {
    var index;
    index = this.modals.indexOf(modal);
    this.modals.splice(index, 1);
    if (this.modals.length > 0) {
      this.modals[this.modals.length - 1].$('.overlay').css('opacity', '0.7');
    }
    modal.trigger('removed');
    modal.off();
    return modal.remove();
  };

  return ModalManager;

})();

module.exports = new ModalManager();


},{}],8:[function(_dereq_,module,exports){
var Token;

Token = (function() {
  function Token() {}

  Token.prototype.token = null;

  Token.prototype.set = function(token, type) {
    this.token = token;
    if (type == null) {
      type = 'SimpleAuth';
    }
    sessionStorage.setItem('huygens_token_type', type);
    return sessionStorage.setItem('huygens_token', this.token);
  };

  Token.prototype.getType = function() {
    return sessionStorage.getItem('huygens_token_type');
  };

  Token.prototype.get = function() {
    if (this.token == null) {
      this.token = sessionStorage.getItem('huygens_token');
    }
    return this.token;
  };

  Token.prototype.clear = function() {
    sessionStorage.removeItem('huygens_token');
    return sessionStorage.removeItem('huygens_token_type');
  };

  return Token;

})();

module.exports = new Token();


},{}],9:[function(_dereq_,module,exports){
var StringFn, ViewManager,
  __hasProp = {}.hasOwnProperty;

StringFn = _dereq_('../utils/string');

ViewManager = (function() {
  var cachedViews, currentViews;

  function ViewManager() {}

  currentViews = {};

  cachedViews = {};

  ViewManager.prototype.clear = function(view) {
    var cid, selfDestruct, _results;
    selfDestruct = function(view) {
      if (view.options.persist !== true) {
        if (view.destroy != null) {
          view.destroy();
        } else {
          view.remove();
        }
        return delete currentViews[view.cid];
      }
    };
    if (view != null) {
      return selfDestruct(view);
    } else {
      _results = [];
      for (cid in currentViews) {
        if (!__hasProp.call(currentViews, cid)) continue;
        view = currentViews[cid];
        _results.push(selfDestruct(view));
      }
      return _results;
    }
  };

  ViewManager.prototype.clearCache = function() {
    this.clear();
    return cachedViews = {};
  };

  ViewManager.prototype.register = function(view) {
    if (view != null) {
      return currentViews[view.cid] = view;
    }
  };

  ViewManager.prototype.show = function(el, View, options) {
    var cid, view, viewHashCode;
    if (options == null) {
      options = {};
    }
    for (cid in currentViews) {
      if (!__hasProp.call(currentViews, cid)) continue;
      view = currentViews[cid];
      if (!view.options.cache && !view.options.persist) {
        this.clear(view);
      }
    }
    if (_.isString(el)) {
      el = document.querySelector(el);
    }
    if (options.append == null) {
      options.append = false;
    }
    if (options.prepend == null) {
      options.prepend = false;
    }
    if (options.persist == null) {
      options.persist = false;
    }
    if (options.persist === true) {
      options.cache = false;
    }
    if (options.cache == null) {
      options.cache = true;
    }
    if (options.cache) {
      viewHashCode = StringFn.hashCode(View.toString() + JSON.stringify(options));
      if (!cachedViews.hasOwnProperty(viewHashCode)) {
        cachedViews[viewHashCode] = new View(options);
      }
      view = cachedViews[viewHashCode];
    } else {
      view = new View(options);
    }
    if (_.isElement(el) && (view != null)) {
      if (!(options.append || options.prepend)) {
        el.innerHTML = '';
      }
      if (options.prepend && (el.firstChild != null)) {
        el.insertBefore(view.el, el.firstChild);
      } else {
        el.appendChild(view.el);
      }
    }
    return view;
  };

  return ViewManager;

})();

module.exports = new ViewManager();


},{"../utils/string":11}],10:[function(_dereq_,module,exports){
var StringFn, ViewManager;

StringFn = _dereq_('../utils/string');

ViewManager = (function() {
  var cachedViews, currentView;

  function ViewManager() {}

  currentView = null;

  cachedViews = {};

  ViewManager.prototype.show = function($el, View, options) {
    var el, viewHashCode;
    if (options == null) {
      options = {};
    }
    if (options.append == null) {
      options.append = false;
    }
    if (options.prepend == null) {
      options.prepend = false;
    }
    if (options.cache == null) {
      options.cache = true;
    }
    viewHashCode = StringFn.hashCode(View.toString() + JSON.stringify(options));
    if (!(cachedViews.hasOwnProperty(viewHashCode) && options.cache)) {
      cachedViews[viewHashCode] = new View(options);
    }
    currentView = cachedViews[viewHashCode];
    el = $el[0];
    if (!(options.append || options.prepend)) {
      el.innerHTML = '';
    }
    if (options.prepend && (el.firstChild != null)) {
      el.insertBefore(currentView.el, el.firstChild);
    } else {
      el.appendChild(currentView.el);
    }
    return currentView;
  };

  return ViewManager;

})();

module.exports = new ViewManager();


},{"../utils/string":11}],11:[function(_dereq_,module,exports){
var $;

$ = _dereq_('jquery');

module.exports = {
  ucfirst: function(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  },

  /*
  	Slugify a string
   */
  slugify: function(str) {
    var from, index, strlen, to;
    from = "àáäâèéëêìíïîòóöôùúüûñç·/_:;";
    to = "aaaaeeeeiiiioooouuuunc-----";
    str = str.trim().toLowerCase();
    strlen = str.length;
    while (strlen--) {
      index = from.indexOf(str[strlen]);
      if (index !== -1) {
        str = str.substr(0, strlen) + to[index] + str.substr(strlen + 1);
      }
    }
    return str.replace(/[^a-z0-9 -]/g, '').replace(/\s+|\-+/g, '-').replace(/^\-+|\-+$/g, '');
  },

  /*
  	Strips the tags from a string
  	
  	Example: "This is a <b>string</b>." => "This is a string."
  	
  	return String
   */
  stripTags: function(str) {
    return $('<span />').html(str).text();
  },

  /*
  	Removes non numbers from a string
  	
  	Example: "Count the 12 monkeys." => "12"
  	
  	return String
   */
  onlyNumbers: function(str) {
    return str.replace(/[^\d.]/g, '');
  },
  hashCode: function(str) {
    var c, chr, hash, i, _i, _len;
    if (str.length === 0) {
      return false;
    }
    hash = 0;
    for (i = _i = 0, _len = str.length; _i < _len; i = ++_i) {
      chr = str[i];
      c = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + c;
      hash = hash & hash;
    }
    return hash;
  },
  insertAt: function(str, needle, index) {
    return str.slice(0, index) + needle + str.slice(index);
  }
};


},{"jquery":1}]},{},[6])
(6)
});}).call(this,typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],3:[function(_dereq_,module,exports){
(function (global){!function(e){if("object"==typeof exports)module.exports=e();else if("function"==typeof define&&define.amd)define(e);else{var f;"undefined"!=typeof window?f=window:"undefined"!=typeof global?f=global:"undefined"!=typeof self&&(f=self),f.lib=e()}}(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof _dereq_=="function"&&_dereq_;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof _dereq_=="function"&&_dereq_;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(_dereq_,module,exports){

},{}],2:[function(_dereq_,module,exports){
var $, defaultOptions, token;

$ = _dereq_('jquery');

$.support.cors = true;

token = _dereq_('./token');

defaultOptions = {
  token: true
};

module.exports = {
  get: function(args, options) {
    if (options == null) {
      options = {};
    }
    return this.fire('get', args, options);
  },
  post: function(args, options) {
    if (options == null) {
      options = {};
    }
    return this.fire('post', args, options);
  },
  put: function(args, options) {
    if (options == null) {
      options = {};
    }
    return this.fire('put', args, options);
  },
  poll: function(args) {
    var done, dopoll, testFn, url;
    url = args.url, testFn = args.testFn, done = args.done;
    dopoll = (function(_this) {
      return function() {
        var xhr;
        xhr = _this.get({
          url: url
        });
        return xhr.done(function(data, textStatus, jqXHR) {
          if (testFn(data)) {
            return done(data, textStatus, jqXHR);
          } else {
            return setTimeout(dopoll, 5000);
          }
        });
      };
    })(this);
    return dopoll();
  },
  fire: function(type, args, options) {
    var ajaxArgs;
    options = $.extend({}, defaultOptions, options);
    ajaxArgs = {
      type: type,
      dataType: 'json',
      contentType: 'application/json; charset=utf-8',
      processData: false,
      crossDomain: true
    };
    if (options.token && (token.get() != null)) {
      ajaxArgs.beforeSend = (function(_this) {
        return function(xhr) {
          return xhr.setRequestHeader('Authorization', "" + (token.getType()) + " " + (token.get()));
        };
      })(this);
    }
    return $.ajax($.extend(ajaxArgs, args));
  }
};


},{"./token":3,"jquery":1}],3:[function(_dereq_,module,exports){
var Token;

Token = (function() {
  function Token() {}

  Token.prototype.token = null;

  Token.prototype.set = function(token, type) {
    this.token = token;
    if (type == null) {
      type = 'SimpleAuth';
    }
    sessionStorage.setItem('huygens_token_type', type);
    return sessionStorage.setItem('huygens_token', this.token);
  };

  Token.prototype.getType = function() {
    return sessionStorage.getItem('huygens_token_type');
  };

  Token.prototype.get = function() {
    if (this.token == null) {
      this.token = sessionStorage.getItem('huygens_token');
    }
    return this.token;
  };

  Token.prototype.clear = function() {
    sessionStorage.removeItem('huygens_token');
    return sessionStorage.removeItem('huygens_token_type');
  };

  return Token;

})();

module.exports = new Token();


},{}],4:[function(_dereq_,module,exports){
var Backbone, Fn, mainTpl, optionMixin;

Backbone = _dereq_('backbone');

Fn = _dereq_('../../utils/general');

optionMixin = _dereq_('./options');

mainTpl = _dereq_('./main.jade');

module.exports = {
  dropdownInitialize: function() {
    var models, _base, _base1, _base2, _base3, _ref, _ref1;
    if ((_base = this.options).config == null) {
      _base.config = {};
    }
    this.data = (_ref = this.options.config.data) != null ? _ref : {};
    this.settings = (_ref1 = this.options.config.settings) != null ? _ref1 : {};
    if ((_base1 = this.settings).mutable == null) {
      _base1.mutable = false;
    }
    if ((_base2 = this.settings).editable == null) {
      _base2.editable = false;
    }
    if ((_base3 = this.settings).defaultAdd == null) {
      _base3.defaultAdd = true;
    }
    this.selected = null;
    if (this.data instanceof Backbone.Collection) {
      this.collection = this.data.clone();
    } else if (_.isArray(this.data) && _.isString(this.data[0])) {
      models = this.strArray2optionArray(this.data);
      this.collection = new Backbone.Collection(models);
    } else {
      console.error('No valid data passed to dropdown');
    }
    this.filtered_options = this.collection.clone();
    _.extend(this.filtered_options, optionMixin);
    if (this.settings.mutable) {
      this.listenTo(this.collection, 'add', (function(_this) {
        return function(model, collection, options) {
          _this.selected = model;
          return _this.triggerChange();
        };
      })(this));
    }
    this.listenTo(this.collection, 'add', (function(_this) {
      return function(model, collection, options) {
        _this.trigger('change:data', _this.collection.models);
        return _this.filtered_options.add(model);
      };
    })(this));
    this.listenTo(this.filtered_options, 'add', this.renderOptions);
    this.listenTo(this.filtered_options, 'reset', this.renderOptions);
    this.listenTo(this.filtered_options, 'currentOption:change', (function(_this) {
      return function(model) {
        return _this.$('li[data-id="' + model.id + '"]').addClass('active');
      };
    })(this));
    return this.on('change', (function(_this) {
      return function() {
        return _this.resetOptions();
      };
    })(this));
  },
  dropdownRender: function(tpl) {
    var rtpl;
    if (this.preDropdownRender != null) {
      this.preDropdownRender();
    }
    rtpl = tpl({
      viewId: this.cid,
      selected: this.selected,
      settings: this.settings
    });
    this.$el.html(rtpl);
    this.$optionlist = this.$('ul.list');
    this.renderOptions();
    this.$('input').focus();
    $('body').click((function(_this) {
      return function(ev) {
        if (!(_this.el === ev.target || Fn.isDescendant(_this.el, ev.target))) {
          return _this.hideOptionlist();
        }
      };
    })(this));
    if (this.settings.inputClass != null) {
      this.$('input').addClass(this.settings.inputClass);
    }
    if (this.postDropdownRender != null) {
      this.postDropdownRender();
    }
    return this;
  },
  renderOptions: function() {
    var rtpl;
    rtpl = mainTpl({
      collection: this.filtered_options,
      selected: this.selected
    });
    return this.$optionlist.html(rtpl);
  },
  dropdownEvents: function() {
    var evs;
    evs = {
      'click .caret': 'toggleList',
      'click li.list': 'addSelected'
    };
    evs['keyup input[data-view-id="' + this.cid + '"]'] = 'onKeyup';
    evs['keydown input[data-view-id="' + this.cid + '"]'] = 'onKeydown';
    return evs;
  },
  toggleList: function(ev) {
    this.$optionlist.toggle();
    return this.$('input').focus();
  },
  onKeydown: function(ev) {
    if (ev.keyCode === 38 && this.$optionlist.is(':visible')) {
      return ev.preventDefault();
    }
  },
  onKeyup: function(ev) {
    this.$('.active').removeClass('active');
    if (ev.keyCode === 38) {
      this.$optionlist.show();
      return this.filtered_options.prev();
    } else if (ev.keyCode === 40) {
      this.$optionlist.show();
      return this.filtered_options.next();
    } else if (ev.keyCode === 13) {
      return this.addSelected(ev);
    } else if (ev.keyCode === 27) {
      return this.$optionlist.hide();
    } else {
      return this.filter(ev.currentTarget.value);
    }
  },
  destroy: function() {
    $('body').off('click');
    return this.remove();
  },
  resetOptions: function() {
    this.filtered_options.reset(this.collection.reject((function(_this) {
      return function(model) {
        return _this.selected.get(model.id) != null;
      };
    })(this)));
    this.filtered_options.resetCurrentOption();
    return this.hideOptionlist();
  },
  hideOptionlist: function() {
    return this.$optionlist.hide();
  },
  filter: function(value) {
    var models, re;
    if (this.settings.editable) {
      this.$('button.edit').removeClass('visible');
    }
    this.resetOptions();
    if (value.length > 1) {
      value = Fn.escapeRegExp(value);
      re = new RegExp(value, 'i');
      models = this.collection.filter(function(model) {
        return re.test(model.get('title'));
      });
      if (models.length > 0) {
        this.filtered_options.reset(models);
        this.$optionlist.show();
      }
    }
    if (this.postDropdownFilter != null) {
      return this.postDropdownFilter(models);
    }
  },
  strArray2optionArray: function(strArray) {
    return _.map(strArray, function(item) {
      return {
        id: item,
        title: item
      };
    });
  }
};


},{"../../utils/general":11,"./main.jade":5,"./options":6,"backbone":1}],5:[function(_dereq_,module,exports){
var jade = _dereq_("jade/runtime");

module.exports = function template(locals) {
var buf = [];
var jade_mixins = {};
var locals_ = (locals || {}),collection = locals_.collection,selected = locals_.selected;
// iterate collection.models
;(function(){
  var $$obj = collection.models;
  if ('number' == typeof $$obj.length) {

    for (var $index = 0, $$l = $$obj.length; $index < $$l; $index++) {
      var model = $$obj[$index];

buf.push("<li" + (jade.attr("data-id", model.id, true, false)) + (jade.cls(['list',selected===model?'active':''], [null,true])) + ">" + (jade.escape(null == (jade.interp = model.get('title')) ? "" : jade.interp)) + "</li>");
    }

  } else {
    var $$l = 0;
    for (var $index in $$obj) {
      $$l++;      var model = $$obj[$index];

buf.push("<li" + (jade.attr("data-id", model.id, true, false)) + (jade.cls(['list',selected===model?'active':''], [null,true])) + ">" + (jade.escape(null == (jade.interp = model.get('title')) ? "" : jade.interp)) + "</li>");
    }

  }
}).call(this);
;return buf.join("");
};
},{"jade/runtime":1}],6:[function(_dereq_,module,exports){
define(function(_dereq_) {
  return {
    dropdownOptionsInitialize: function() {
      return this.resetCurrentOption();
    },
    resetCurrentOption: function() {
      return this.currentOption = null;
    },
    setCurrentOption: function(model) {
      this.currentOption = model;
      return this.trigger('currentOption:change', this.currentOption);
    },
    prev: function() {
      var previousIndex;
      previousIndex = this.indexOf(this.currentOption) - 1;
      if (previousIndex < 0) {
        previousIndex = this.length - 1;
      }
      return this.setCurrentOption(this.at(previousIndex));
    },
    next: function() {
      var nextIndex;
      nextIndex = this.indexOf(this.currentOption) + 1;
      if (nextIndex > (this.length - 1)) {
        nextIndex = 0;
      }
      return this.setCurrentOption(this.at(nextIndex));
    }
  };
});


},{}],7:[function(_dereq_,module,exports){
var dropdown, modelChangedsincelastsave, modelSync, pubsub, validation;

validation = './validation';

pubsub = _dereq_('./pubsub');

modelSync = _dereq_('./model.sync');

modelChangedsincelastsave = _dereq_('./model.changedsincelastsave');

dropdown = _dereq_('./dropdown/main');

module.exports = {
  validation: validation,
  pubsub: pubsub,
  'model.sync': modelSync,
  'model.changedsincelastsave': modelChangedsincelastsave,
  dropdown: dropdown
};


},{"./dropdown/main":4,"./model.changedsincelastsave":8,"./model.sync":9,"./pubsub":10}],8:[function(_dereq_,module,exports){
module.exports = function(attrs) {
  return {
    changedSinceLastSave: null,
    initChangedSinceLastSave: function() {
      var attr, _i, _len, _results;
      this.on('sync', (function(_this) {
        return function() {
          return _this.changedSinceLastSave = null;
        };
      })(this));
      _results = [];
      for (_i = 0, _len = attrs.length; _i < _len; _i++) {
        attr = attrs[_i];
        _results.push(this.on("change:" + attr, (function(_this) {
          return function(model, options) {
            if (_this.changedSinceLastSave == null) {
              return _this.changedSinceLastSave = model.previousAttributes()[attr];
            }
          };
        })(this)));
      }
      return _results;
    },
    cancelChanges: function() {
      var attr, _i, _len;
      for (_i = 0, _len = attrs.length; _i < _len; _i++) {
        attr = attrs[_i];
        this.set(attr, this.changedSinceLastSave);
      }
      return this.changedSinceLastSave = null;
    }
  };
};


},{}],9:[function(_dereq_,module,exports){
var ajax, token;

ajax = _dereq_('../managers/ajax');

token = _dereq_('../managers/token');

module.exports = {
  syncOverride: function(method, model, options) {
    var data, defaults, jqXHR, name, obj, _i, _len, _ref;
    if (options.attributes != null) {
      obj = {};
      _ref = options.attributes;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        name = _ref[_i];
        obj[name] = this.get(name);
      }
      data = JSON.stringify(obj);
    } else {
      data = JSON.stringify(model.toJSON());
    }
    defaults = {
      url: this.url(),
      dataType: 'text',
      data: data
    };
    options = $.extend(defaults, options);
    if (method === 'create') {
      ajax.token = token.get();
      jqXHR = ajax.post(options);
      jqXHR.done((function(_this) {
        return function(data, textStatus, jqXHR) {
          var xhr;
          if (jqXHR.status === 201) {
            xhr = ajax.get({
              url: jqXHR.getResponseHeader('Location')
            });
            return xhr.done(function(data, textStatus, jqXHR) {
              _this.trigger('sync');
              return options.success(data);
            });
          }
        };
      })(this));
      return jqXHR.fail((function(_this) {
        return function(response) {
          return console.log('fail', response);
        };
      })(this));
    } else if (method === 'update') {
      ajax.token = token.get();
      jqXHR = ajax.put(options);
      jqXHR.done((function(_this) {
        return function(response) {
          return _this.trigger('sync');
        };
      })(this));
      return jqXHR.fail((function(_this) {
        return function(response) {
          return console.log('fail', response);
        };
      })(this));
    }
  }
};


},{"../managers/ajax":2,"../managers/token":3}],10:[function(_dereq_,module,exports){
var Backbone;

Backbone = _dereq_('backbone');

module.exports = {
  subscribe: function(ev, done) {
    return this.listenTo(Backbone, ev, done);
  },
  publish: function() {
    return Backbone.trigger.apply(Backbone, arguments);
  }
};


},{"backbone":1}],11:[function(_dereq_,module,exports){
var $,
  __hasProp = {}.hasOwnProperty;

$ = _dereq_('jquery');

module.exports = {
  closest: function(el, selector) {
    var matchesSelector;
    matchesSelector = el.matches || el.webkitMatchesSelector || el.mozMatchesSelector || el.msMatchesSelector;
    while (el) {
      if (matchesSelector.bind(el)(selector)) {
        return el;
      } else {
        el = el.parentNode;
      }
    }
  },

  /*
  	Generates an ID that starts with a letter
  	
  	Example: "aBc12D34"
  
  	param Number length of the id
  	return String
   */
  generateID: function(length) {
    var chars, text;
    length = (length != null) && length > 0 ? length - 1 : 7;
    chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    text = chars.charAt(Math.floor(Math.random() * 52));
    while (length--) {
      text += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return text;
  },

  /*
  	Deepcopies arrays and object literals
  	
  	return Array or object
   */
  deepCopy: function(object) {
    var newEmpty;
    newEmpty = Array.isArray(object) ? [] : {};
    return $.extend(true, newEmpty, object);
  },
  timeoutWithReset: (function() {
    var timer;
    timer = null;
    return function(ms, cb, onResetFn) {
      if (timer != null) {
        if (onResetFn != null) {
          onResetFn();
        }
        clearTimeout(timer);
      }
      return timer = setTimeout((function() {
        timer = null;
        return cb();
      }), ms);
    };
  })(),

  /*
  	Highlight text between two nodes. 
  
  	Creates a span.hilite between two given nodes, surrounding the contents of the nodes
  
  	Example usage:
  	hl = Fn.highlighter
  		className: 'highlight' # optional
  		tagName: 'div' # optional
  
  	supEnter = (ev) -> hl.on
  		startNode: el.querySelector(#someid) # required
  		endNode: ev.currentTarget # required
  	supLeave = -> hl.off()
  	$(sup).hover supEnter, supLeave
   */
  highlighter: function(args) {
    var className, el, tagName;
    if (args == null) {
      args = {};
    }
    className = args.className, tagName = args.tagName;
    if (className == null) {
      className = 'hilite';
    }
    if (tagName == null) {
      tagName = 'span';
    }
    el = null;
    return {
      on: function(args) {
        var endNode, range, startNode;
        startNode = args.startNode, endNode = args.endNode;
        range = document.createRange();
        range.setStartAfter(startNode);
        range.setEndBefore(endNode);
        el = document.createElement(tagName);
        el.className = className;
        el.appendChild(range.extractContents());
        return range.insertNode(el);
      },
      off: function() {
        return $(el).replaceWith(function() {
          return $(this).contents();
        });
      }
    };
  },

  /*
  	Native alternative to jQuery's $.offset()
  
  	http://www.quirksmode.org/js/findpos.html
   */
  position: function(el, parent) {
    var left, top;
    left = 0;
    top = 0;
    while (el !== parent) {
      left += el.offsetLeft;
      top += el.offsetTop;
      el = el.offsetParent;
    }
    return {
      left: left,
      top: top
    };
  },
  boundingBox: function(el) {
    var box;
    box = $(el).offset();
    box.width = el.clientWidth;
    box.height = el.clientHeight;
    box.right = box.left + box.width;
    box.bottom = box.top + box.height;
    return box;
  },

  /*
  	Is child el a descendant of parent el?
  
  	http://stackoverflow.com/questions/2234979/how-to-check-in-javascript-if-one-element-is-a-child-of-another
   */
  isDescendant: function(parent, child) {
    var node;
    node = child.parentNode;
    while (node != null) {
      if (node === parent) {
        return true;
      }
      node = node.parentNode;
    }
    return false;
  },

  /*
  	Removes an item from an array
   */
  removeFromArray: function(arr, item) {
    var index;
    index = arr.indexOf(item);
    arr.splice(index, 1);
    return arr;
  },

  /* Escape a regular expression */
  escapeRegExp: function(str) {
    return str.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
  },

  /*
  	Flattens an object
  
  	songs:
  		mary:
  			had:
  				little: 'lamb'
  
  	becomes
  
  	songs:
  		mary.had.little: 'lamb'
  
  	Taken from: http://thedersen.com/projects/backbone-validation
   */
  flattenObject: function(obj, into, prefix) {
    var k, v;
    if (into == null) {
      into = {};
    }
    if (prefix == null) {
      prefix = '';
    }
    for (k in obj) {
      if (!__hasProp.call(obj, k)) continue;
      v = obj[k];
      if (_.isObject(v) && !_.isArray(v) && !_.isFunction(v) && !(v instanceof Backbone.Model) && !(v instanceof Backbone.Collection)) {
        this.flattenObject(v, into, prefix + k + '.');
      } else {
        into[prefix + k] = v;
      }
    }
    return into;
  },
  compareJSON: function(current, changed) {
    var attr, changes, value;
    changes = {};
    for (attr in current) {
      if (!__hasProp.call(current, attr)) continue;
      value = current[attr];
      if (!changed.hasOwnProperty(attr)) {
        changes[attr] = 'removed';
      }
    }
    for (attr in changed) {
      if (!__hasProp.call(changed, attr)) continue;
      value = changed[attr];
      if (current.hasOwnProperty(attr)) {
        if (_.isArray(value) || this.isObjectLiteral(value)) {
          if (!_.isEqual(current[attr], changed[attr])) {
            changes[attr] = changed[attr];
          }
        } else {
          if (current[attr] !== changed[attr]) {
            changes[attr] = changed[attr];
          }
        }
      } else {
        changes[attr] = 'added';
      }
    }
    return changes;
  },
  isObjectLiteral: function(obj) {
    var ObjProto;
    if ((obj == null) || typeof obj !== "object") {
      return false;
    }
    ObjProto = obj;
    while (Object.getPrototypeOf(ObjProto = Object.getPrototypeOf(ObjProto)) !== null) {
      0;
    }
    return Object.getPrototypeOf(obj) === ObjProto;
  },
  getScrollPercentage: function(el) {
    var left, scrolledLeft, scrolledTop, top, totalLeft, totalTop;
    scrolledTop = el.scrollTop;
    totalTop = el.scrollHeight - el.clientHeight;
    scrolledLeft = el.scrollLeft;
    totalLeft = el.scrollWidth - el.clientWidth;
    top = totalTop === 0 ? 0 : Math.floor((scrolledTop / totalTop) * 100);
    left = totalLeft === 0 ? 0 : Math.floor((scrolledLeft / totalLeft) * 100);
    return {
      top: top,
      left: left
    };
  },
  setScrollPercentage: function(el, percentages) {
    if (percentages.top < 5) {
      percentages.top = 0;
    }
    if (percentages.top > 95) {
      percentages.top = 100;
    }
    el.scrollTop = (el.scrollHeight - el.clientHeight) * percentages.top / 100;
    return el.scrollLeft = (el.scrollWidth - el.clientWidth) * percentages.left / 100;
  },
  checkCheckboxes: function(selector, checked, baseEl) {
    var cb, checkboxes, _i, _len, _results;
    if (selector == null) {
      selector = 'input[type="checkbox"]';
    }
    if (checked == null) {
      checked = true;
    }
    if (baseEl == null) {
      baseEl = document;
    }
    checkboxes = baseEl.querySelectorAll(selector);
    _results = [];
    for (_i = 0, _len = checkboxes.length; _i < _len; _i++) {
      cb = checkboxes[_i];
      _results.push(cb.checked = checked);
    }
    return _results;
  },
  setCursorToEnd: function(textEl, windowEl) {
    var range, sel, win;
    win = windowEl != null ? windowEl : window;
    if (windowEl == null) {
      windowEl = textEl;
    }
    windowEl.focus();
    range = document.createRange();
    range.selectNodeContents(textEl);
    range.collapse(false);
    sel = win.getSelection();
    if (sel != null) {
      sel.removeAllRanges();
      return sel.addRange(range);
    }
  },
  arraySum: function(arr) {
    if (arr.length === 0) {
      return 0;
    }
    return arr.reduce(function(prev, current) {
      return current + prev;
    });
  },
  getAspectRatio: function(originalWidth, originalHeight, boxWidth, boxHeight) {
    var heightRatio, widthRatio;
    widthRatio = boxWidth / originalWidth;
    heightRatio = boxHeight / originalHeight;
    return Math.min(widthRatio, heightRatio);
  },
  hasScrollBar: function(el) {
    return el.scrollHeight > el.clientHeight || el.scrollWidth > el.clientWidth;
  },
  hasXScrollBar: function(el) {
    return el.scrollWidth > el.clientWidth;
  },
  hasYScrollBar: function(el) {
    return el.scrollHeight > el.clientHeight;
  }
};


},{"jquery":1}]},{},[7])
(7)
});}).call(this,typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],4:[function(_dereq_,module,exports){
(function (global){!function(e){if("object"==typeof exports)module.exports=e();else if("function"==typeof define&&define.amd)define(e);else{var f;"undefined"!=typeof window?f=window:"undefined"!=typeof global?f=global:"undefined"!=typeof self&&(f=self),f.lib=e()}}(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof _dereq_=="function"&&_dereq_;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof _dereq_=="function"&&_dereq_;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(_dereq_,module,exports){

},{}],2:[function(_dereq_,module,exports){
module.exports = function(el) {
  return {
    closest: function(selector) {
      var matchesSelector;
      matchesSelector = el.matches || el.webkitMatchesSelector || el.mozMatchesSelector || el.msMatchesSelector;
      while (el) {
        if (matchesSelector.bind(el)(selector)) {
          return el;
        } else {
          el = el.parentNode;
        }
      }
    },
    prepend: function(childEl) {
      return el.insertBefore(childEl, el.firstChild);
    },

    /*
    		Native alternative to jQuery's $.offset()
    
    		http://www.quirksmode.org/js/findpos.html
     */
    position: function(parent) {
      var left, loopEl, top;
      if (parent == null) {
        parent = document.body;
      }
      left = 0;
      top = 0;
      loopEl = el;
      while (loopEl !== parent) {
        if (this.hasDescendant(parent)) {
          break;
        }
        left += loopEl.offsetLeft;
        top += loopEl.offsetTop;
        loopEl = loopEl.offsetParent;
      }
      return {
        left: left,
        top: top
      };
    },

    /*
    		Is child el a descendant of parent el?
    
    		http://stackoverflow.com/questions/2234979/how-to-check-in-javascript-if-one-element-is-a-child-of-another
     */
    hasDescendant: function(child) {
      var node;
      node = child.parentNode;
      while (node != null) {
        if (node === el) {
          return true;
        }
        node = node.parentNode;
      }
      return false;
    },
    boundingBox: function() {
      var box;
      box = this.position();
      box.width = el.clientWidth;
      box.height = el.clientHeight;
      box.right = box.left + box.width;
      box.bottom = box.top + box.height;
      return box;
    },
    insertAfter: function(newElement, referenceElement) {
      return referenceElement.parentNode.insertBefore(newElement, referenceElement.nextSibling);
    },
    highlightUntil: function(endNode, highlightClass) {
      if (highlightClass == null) {
        highlightClass = 'highlight';
      }
      return {
        on: function() {
          var currentNode, filter, range, treewalker;
          range = document.createRange();
          range.setStartAfter(el);
          range.setEndBefore(endNode);
          filter = (function(_this) {
            return function(node) {
              var end, r, start;
              r = document.createRange();
              r.selectNode(node);
              start = r.compareBoundaryPoints(Range.START_TO_START, range);
              end = r.compareBoundaryPoints(Range.END_TO_START, range);
              if (start === -1 || end === 1) {
                return NodeFilter.FILTER_SKIP;
              } else {
                return NodeFilter.FILTER_ACCEPT;
              }
            };
          })(this);
          filter.acceptNode = filter;
          treewalker = document.createTreeWalker(range.commonAncestorContainer, NodeFilter.SHOW_ELEMENT, filter, false);
          while (treewalker.nextNode()) {
            currentNode = treewalker.currentNode;
            if ((' ' + currentNode.className + ' ').indexOf(' text ') > -1) {
              currentNode.className = currentNode.className + ' ' + highlightClass;
            }
          }
          return this;
        },
        off: function() {
          var classNames, _i, _len, _ref, _results;
          _ref = document.querySelectorAll('.' + highlightClass);
          _results = [];
          for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            el = _ref[_i];
            classNames = ' ' + el.className + ' ';
            classNames = classNames.replace(' ' + highlightClass + ' ', '');
            _results.push(el.className = classNames.replace(/^\s+|\s+$/g, ''));
          }
          return _results;
        }
      };
    }
  };
};


},{}],3:[function(_dereq_,module,exports){
var $,
  __hasProp = {}.hasOwnProperty;

$ = _dereq_('jquery');

module.exports = {
  closest: function(el, selector) {
    var matchesSelector;
    matchesSelector = el.matches || el.webkitMatchesSelector || el.mozMatchesSelector || el.msMatchesSelector;
    while (el) {
      if (matchesSelector.bind(el)(selector)) {
        return el;
      } else {
        el = el.parentNode;
      }
    }
  },

  /*
  	Generates an ID that starts with a letter
  	
  	Example: "aBc12D34"
  
  	param Number length of the id
  	return String
   */
  generateID: function(length) {
    var chars, text;
    length = (length != null) && length > 0 ? length - 1 : 7;
    chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    text = chars.charAt(Math.floor(Math.random() * 52));
    while (length--) {
      text += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return text;
  },

  /*
  	Deepcopies arrays and object literals
  	
  	return Array or object
   */
  deepCopy: function(object) {
    var newEmpty;
    newEmpty = Array.isArray(object) ? [] : {};
    return $.extend(true, newEmpty, object);
  },
  timeoutWithReset: (function() {
    var timer;
    timer = null;
    return function(ms, cb, onResetFn) {
      if (timer != null) {
        if (onResetFn != null) {
          onResetFn();
        }
        clearTimeout(timer);
      }
      return timer = setTimeout((function() {
        timer = null;
        return cb();
      }), ms);
    };
  })(),

  /*
  	Highlight text between two nodes. 
  
  	Creates a span.hilite between two given nodes, surrounding the contents of the nodes
  
  	Example usage:
  	hl = Fn.highlighter
  		className: 'highlight' # optional
  		tagName: 'div' # optional
  
  	supEnter = (ev) -> hl.on
  		startNode: el.querySelector(#someid) # required
  		endNode: ev.currentTarget # required
  	supLeave = -> hl.off()
  	$(sup).hover supEnter, supLeave
   */
  highlighter: function(args) {
    var className, el, tagName;
    if (args == null) {
      args = {};
    }
    className = args.className, tagName = args.tagName;
    if (className == null) {
      className = 'hilite';
    }
    if (tagName == null) {
      tagName = 'span';
    }
    el = null;
    return {
      on: function(args) {
        var endNode, range, startNode;
        startNode = args.startNode, endNode = args.endNode;
        range = document.createRange();
        range.setStartAfter(startNode);
        range.setEndBefore(endNode);
        el = document.createElement(tagName);
        el.className = className;
        el.appendChild(range.extractContents());
        return range.insertNode(el);
      },
      off: function() {
        return $(el).replaceWith(function() {
          return $(this).contents();
        });
      }
    };
  },

  /*
  	Native alternative to jQuery's $.offset()
  
  	http://www.quirksmode.org/js/findpos.html
   */
  position: function(el, parent) {
    var left, top;
    left = 0;
    top = 0;
    while (el !== parent) {
      left += el.offsetLeft;
      top += el.offsetTop;
      el = el.offsetParent;
    }
    return {
      left: left,
      top: top
    };
  },
  boundingBox: function(el) {
    var box;
    box = $(el).offset();
    box.width = el.clientWidth;
    box.height = el.clientHeight;
    box.right = box.left + box.width;
    box.bottom = box.top + box.height;
    return box;
  },

  /*
  	Is child el a descendant of parent el?
  
  	http://stackoverflow.com/questions/2234979/how-to-check-in-javascript-if-one-element-is-a-child-of-another
   */
  isDescendant: function(parent, child) {
    var node;
    node = child.parentNode;
    while (node != null) {
      if (node === parent) {
        return true;
      }
      node = node.parentNode;
    }
    return false;
  },

  /*
  	Removes an item from an array
   */
  removeFromArray: function(arr, item) {
    var index;
    index = arr.indexOf(item);
    arr.splice(index, 1);
    return arr;
  },

  /* Escape a regular expression */
  escapeRegExp: function(str) {
    return str.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
  },

  /*
  	Flattens an object
  
  	songs:
  		mary:
  			had:
  				little: 'lamb'
  
  	becomes
  
  	songs:
  		mary.had.little: 'lamb'
  
  	Taken from: http://thedersen.com/projects/backbone-validation
   */
  flattenObject: function(obj, into, prefix) {
    var k, v;
    if (into == null) {
      into = {};
    }
    if (prefix == null) {
      prefix = '';
    }
    for (k in obj) {
      if (!__hasProp.call(obj, k)) continue;
      v = obj[k];
      if (_.isObject(v) && !_.isArray(v) && !_.isFunction(v) && !(v instanceof Backbone.Model) && !(v instanceof Backbone.Collection)) {
        this.flattenObject(v, into, prefix + k + '.');
      } else {
        into[prefix + k] = v;
      }
    }
    return into;
  },
  compareJSON: function(current, changed) {
    var attr, changes, value;
    changes = {};
    for (attr in current) {
      if (!__hasProp.call(current, attr)) continue;
      value = current[attr];
      if (!changed.hasOwnProperty(attr)) {
        changes[attr] = 'removed';
      }
    }
    for (attr in changed) {
      if (!__hasProp.call(changed, attr)) continue;
      value = changed[attr];
      if (current.hasOwnProperty(attr)) {
        if (_.isArray(value) || this.isObjectLiteral(value)) {
          if (!_.isEqual(current[attr], changed[attr])) {
            changes[attr] = changed[attr];
          }
        } else {
          if (current[attr] !== changed[attr]) {
            changes[attr] = changed[attr];
          }
        }
      } else {
        changes[attr] = 'added';
      }
    }
    return changes;
  },
  isObjectLiteral: function(obj) {
    var ObjProto;
    if ((obj == null) || typeof obj !== "object") {
      return false;
    }
    ObjProto = obj;
    while (Object.getPrototypeOf(ObjProto = Object.getPrototypeOf(ObjProto)) !== null) {
      0;
    }
    return Object.getPrototypeOf(obj) === ObjProto;
  },
  getScrollPercentage: function(el) {
    var left, scrolledLeft, scrolledTop, top, totalLeft, totalTop;
    scrolledTop = el.scrollTop;
    totalTop = el.scrollHeight - el.clientHeight;
    scrolledLeft = el.scrollLeft;
    totalLeft = el.scrollWidth - el.clientWidth;
    top = totalTop === 0 ? 0 : Math.floor((scrolledTop / totalTop) * 100);
    left = totalLeft === 0 ? 0 : Math.floor((scrolledLeft / totalLeft) * 100);
    return {
      top: top,
      left: left
    };
  },
  setScrollPercentage: function(el, percentages) {
    if (percentages.top < 5) {
      percentages.top = 0;
    }
    if (percentages.top > 95) {
      percentages.top = 100;
    }
    el.scrollTop = (el.scrollHeight - el.clientHeight) * percentages.top / 100;
    return el.scrollLeft = (el.scrollWidth - el.clientWidth) * percentages.left / 100;
  },
  checkCheckboxes: function(selector, checked, baseEl) {
    var cb, checkboxes, _i, _len, _results;
    if (selector == null) {
      selector = 'input[type="checkbox"]';
    }
    if (checked == null) {
      checked = true;
    }
    if (baseEl == null) {
      baseEl = document;
    }
    checkboxes = baseEl.querySelectorAll(selector);
    _results = [];
    for (_i = 0, _len = checkboxes.length; _i < _len; _i++) {
      cb = checkboxes[_i];
      _results.push(cb.checked = checked);
    }
    return _results;
  },
  setCursorToEnd: function(textEl, windowEl) {
    var range, sel, win;
    win = windowEl != null ? windowEl : window;
    if (windowEl == null) {
      windowEl = textEl;
    }
    windowEl.focus();
    range = document.createRange();
    range.selectNodeContents(textEl);
    range.collapse(false);
    sel = win.getSelection();
    if (sel != null) {
      sel.removeAllRanges();
      return sel.addRange(range);
    }
  },
  arraySum: function(arr) {
    if (arr.length === 0) {
      return 0;
    }
    return arr.reduce(function(prev, current) {
      return current + prev;
    });
  },
  getAspectRatio: function(originalWidth, originalHeight, boxWidth, boxHeight) {
    var heightRatio, widthRatio;
    widthRatio = boxWidth / originalWidth;
    heightRatio = boxHeight / originalHeight;
    return Math.min(widthRatio, heightRatio);
  },
  hasScrollBar: function(el) {
    return el.scrollHeight > el.clientHeight || el.scrollWidth > el.clientWidth;
  },
  hasXScrollBar: function(el) {
    return el.scrollWidth > el.clientWidth;
  },
  hasYScrollBar: function(el) {
    return el.scrollHeight > el.clientHeight;
  }
};


},{"jquery":1}],4:[function(_dereq_,module,exports){
var $;

$ = _dereq_('jquery');

module.exports = {
  ucfirst: function(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  },

  /*
  	Slugify a string
   */
  slugify: function(str) {
    var from, index, strlen, to;
    from = "àáäâèéëêìíïîòóöôùúüûñç·/_:;";
    to = "aaaaeeeeiiiioooouuuunc-----";
    str = str.trim().toLowerCase();
    strlen = str.length;
    while (strlen--) {
      index = from.indexOf(str[strlen]);
      if (index !== -1) {
        str = str.substr(0, strlen) + to[index] + str.substr(strlen + 1);
      }
    }
    return str.replace(/[^a-z0-9 -]/g, '').replace(/\s+|\-+/g, '-').replace(/^\-+|\-+$/g, '');
  },

  /*
  	Strips the tags from a string
  	
  	Example: "This is a <b>string</b>." => "This is a string."
  	
  	return String
   */
  stripTags: function(str) {
    return $('<span />').html(str).text();
  },

  /*
  	Removes non numbers from a string
  	
  	Example: "Count the 12 monkeys." => "12"
  	
  	return String
   */
  onlyNumbers: function(str) {
    return str.replace(/[^\d.]/g, '');
  },
  hashCode: function(str) {
    var c, chr, hash, i, _i, _len;
    if (str.length === 0) {
      return false;
    }
    hash = 0;
    for (i = _i = 0, _len = str.length; _i < _len; i = ++_i) {
      chr = str[i];
      c = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + c;
      hash = hash & hash;
    }
    return hash;
  },
  insertAt: function(str, needle, index) {
    return str.slice(0, index) + needle + str.slice(index);
  }
};


},{"jquery":1}],5:[function(_dereq_,module,exports){
var dom, general, string;

dom = _dereq_('./dom');

general = _dereq_('./general');

string = _dereq_('./string');

module.exports = {
  dom: dom,
  general: general,
  string: string
};


},{"./dom":2,"./general":3,"./string":4}]},{},[5])
(5)
});}).call(this,typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],5:[function(_dereq_,module,exports){
(function (global){!function(e){if("object"==typeof exports)module.exports=e();else if("function"==typeof define&&define.amd)define(e);else{var f;"undefined"!=typeof window?f=window:"undefined"!=typeof global?f=global:"undefined"!=typeof self&&(f=self),f.jade=e()}}(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof _dereq_=="function"&&_dereq_;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof _dereq_=="function"&&_dereq_;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(_dereq_,module,exports){
'use strict';

/**
 * Merge two attribute objects giving precedence
 * to values in object `b`. Classes are special-cased
 * allowing for arrays and merging/joining appropriately
 * resulting in a string.
 *
 * @param {Object} a
 * @param {Object} b
 * @return {Object} a
 * @api private
 */

exports.merge = function merge(a, b) {
  if (arguments.length === 1) {
    var attrs = a[0];
    for (var i = 1; i < a.length; i++) {
      attrs = merge(attrs, a[i]);
    }
    return attrs;
  }
  var ac = a['class'];
  var bc = b['class'];

  if (ac || bc) {
    ac = ac || [];
    bc = bc || [];
    if (!Array.isArray(ac)) ac = [ac];
    if (!Array.isArray(bc)) bc = [bc];
    a['class'] = ac.concat(bc).filter(nulls);
  }

  for (var key in b) {
    if (key != 'class') {
      a[key] = b[key];
    }
  }

  return a;
};

/**
 * Filter null `val`s.
 *
 * @param {*} val
 * @return {Boolean}
 * @api private
 */

function nulls(val) {
  return val != null && val !== '';
}

/**
 * join array as classes.
 *
 * @param {*} val
 * @return {String}
 */
exports.joinClasses = joinClasses;
function joinClasses(val) {
  return Array.isArray(val) ? val.map(joinClasses).filter(nulls).join(' ') : val;
}

/**
 * Render the given classes.
 *
 * @param {Array} classes
 * @param {Array.<Boolean>} escaped
 * @return {String}
 */
exports.cls = function cls(classes, escaped) {
  var buf = [];
  for (var i = 0; i < classes.length; i++) {
    if (escaped && escaped[i]) {
      buf.push(exports.escape(joinClasses([classes[i]])));
    } else {
      buf.push(joinClasses(classes[i]));
    }
  }
  var text = joinClasses(buf);
  if (text.length) {
    return ' class="' + text + '"';
  } else {
    return '';
  }
};

/**
 * Render the given attribute.
 *
 * @param {String} key
 * @param {String} val
 * @param {Boolean} escaped
 * @param {Boolean} terse
 * @return {String}
 */
exports.attr = function attr(key, val, escaped, terse) {
  if ('boolean' == typeof val || null == val) {
    if (val) {
      return ' ' + (terse ? key : key + '="' + key + '"');
    } else {
      return '';
    }
  } else if (0 == key.indexOf('data') && 'string' != typeof val) {
    return ' ' + key + "='" + JSON.stringify(val).replace(/'/g, '&apos;') + "'";
  } else if (escaped) {
    return ' ' + key + '="' + exports.escape(val) + '"';
  } else {
    return ' ' + key + '="' + val + '"';
  }
};

/**
 * Render the given attributes object.
 *
 * @param {Object} obj
 * @param {Object} escaped
 * @return {String}
 */
exports.attrs = function attrs(obj, terse){
  var buf = [];

  var keys = Object.keys(obj);

  if (keys.length) {
    for (var i = 0; i < keys.length; ++i) {
      var key = keys[i]
        , val = obj[key];

      if ('class' == key) {
        if (val = joinClasses(val)) {
          buf.push(' ' + key + '="' + val + '"');
        }
      } else {
        buf.push(exports.attr(key, val, false, terse));
      }
    }
  }

  return buf.join('');
};

/**
 * Escape the given string of `html`.
 *
 * @param {String} html
 * @return {String}
 * @api private
 */

exports.escape = function escape(html){
  var result = String(html)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
  if (result === '' + html) return html;
  else return result;
};

/**
 * Re-throw the given `err` in context to the
 * the jade in `filename` at the given `lineno`.
 *
 * @param {Error} err
 * @param {String} filename
 * @param {String} lineno
 * @api private
 */

exports.rethrow = function rethrow(err, filename, lineno, str){
  if (!(err instanceof Error)) throw err;
  if ((typeof window != 'undefined' || !filename) && !str) {
    err.message += ' on line ' + lineno;
    throw err;
  }
  try {
    str =  str || _dereq_('fs').readFileSync(filename, 'utf8')
  } catch (ex) {
    rethrow(err, null, lineno)
  }
  var context = 3
    , lines = str.split('\n')
    , start = Math.max(lineno - context, 0)
    , end = Math.min(lines.length, lineno + context);

  // Error context
  var context = lines.slice(start, end).map(function(line, i){
    var curr = i + start + 1;
    return (curr == lineno ? '  > ' : '    ')
      + curr
      + '| '
      + line;
  }).join('\n');

  // Alter exception message
  err.path = filename;
  err.message = (filename || 'Jade') + ':' + lineno
    + '\n' + context + '\n\n' + err.message;
  throw err;
};

},{"fs":2}],2:[function(_dereq_,module,exports){

},{}]},{},[1])
(1)
});}).call(this,typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"fs":1}],6:[function(_dereq_,module,exports){
var Backbone, ListOptions, Models,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Backbone = _dereq_('backbone');

Models = {
  Option: _dereq_('../models/list.option')
};

ListOptions = (function(_super) {
  __extends(ListOptions, _super);

  function ListOptions() {
    return ListOptions.__super__.constructor.apply(this, arguments);
  }

  ListOptions.prototype.model = Models.Option;

  ListOptions.prototype.strategies = {
    alpha_asc: function(model) {
      return model.get('name');
    },
    alpha_desc: function(model) {
      return String.fromCharCode.apply(String, _.map(model.get('name').split(''), function(c) {
        return 0xffff - c.charCodeAt();
      }));
    },
    amount_asc: function(model) {
      return +model.get('count');
    },
    amount_desc: function(model) {
      return -1 * +model.get('count');
    }
  };

  ListOptions.prototype.orderBy = function(strategy) {
    this.comparator = this.strategies[strategy];
    return this.sort();
  };

  ListOptions.prototype.initialize = function() {
    return this.comparator = this.strategies.amount_desc;
  };

  ListOptions.prototype.revert = function() {
    this.each((function(_this) {
      return function(option) {
        return option.set('checked', false, {
          silent: true
        });
      };
    })(this));
    return this.trigger('change');
  };

  ListOptions.prototype.updateOptions = function(newOptions) {
    if (newOptions == null) {
      newOptions = [];
    }
    this.each((function(_this) {
      return function(option) {
        return option.set('count', 0, {
          silent: true
        });
      };
    })(this));
    _.each(newOptions, (function(_this) {
      return function(newOption) {
        var opt;
        opt = _this.get(newOption.name);
        if (opt != null) {
          return opt.set('count', newOption.count, {
            silent: true
          });
        } else {
          opt = new Models.Option(newOption);
          return _this.add(opt);
        }
      };
    })(this));
    return this.sort();
  };

  return ListOptions;

})(Backbone.Collection);

module.exports = ListOptions;


},{"../models/list.option":15,"backbone":1}],7:[function(_dereq_,module,exports){
var Backbone, SearchResult, SearchResults, ajax, config, managers, pubsub, token,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Backbone = _dereq_('backbone');

pubsub = _dereq_('hilib/lib/mixins'.pubsub);

SearchResult = _dereq_('../models/searchresult');

managers = _dereq_('hilib/lib/managers');

ajax = managers.ajax;

token = managers.token;

config = _dereq_('../config');

SearchResults = (function(_super) {
  __extends(SearchResults, _super);

  function SearchResults() {
    return SearchResults.__super__.constructor.apply(this, arguments);
  }

  SearchResults.prototype.model = SearchResult;

  SearchResults.prototype.initialize = function() {
    _.extend(this, pubsub);
    this.cachedModels = {};
    return this.on('add', this.setCurrent, this);
  };

  SearchResults.prototype.setCurrent = function(current) {
    var message;
    this.current = current;
    message = this.current.options.url != null ? 'change:cursor' : 'change:results';
    return this.trigger(message, this.current);
  };

  SearchResults.prototype.runQuery = function(queryOptions, cache) {
    var cacheString, options, resultRows, searchResult;
    if (cache == null) {
      cache = true;
    }
    if (queryOptions.hasOwnProperty('resultRows')) {
      resultRows = queryOptions.resultRows;
      delete queryOptions.resultRows;
    }
    cacheString = JSON.stringify(queryOptions);
    if (cache && this.cachedModels.hasOwnProperty(cacheString)) {
      return this.setCurrent(this.cachedModels[cacheString]);
    } else {
      this.trigger('request');
      options = {};
      options.cacheString = cacheString;
      options.queryOptions = queryOptions;
      if (resultRows != null) {
        options.resultRows = resultRows;
      }
      searchResult = new SearchResult(null, options);
      return searchResult.fetch({
        success: (function(_this) {
          return function(model) {
            _this.cachedModels[cacheString] = model;
            return _this.add(model);
          };
        })(this)
      });
    }
  };

  SearchResults.prototype.moveCursor = function(direction) {
    var searchResult, url;
    url = direction === '_prev' || direction === '_next' ? this.current.get(direction) : direction;
    if (url != null) {
      if (this.cachedModels.hasOwnProperty(url)) {
        return this.setCurrent(this.cachedModels[url]);
      } else {
        searchResult = new SearchResult(null, {
          url: url
        });
        return searchResult.fetch({
          success: (function(_this) {
            return function(model, response, options) {
              _this.cachedModels[url] = model;
              return _this.add(model);
            };
          })(this)
        });
      }
    }
  };

  return SearchResults;

})(Backbone.Collection);

module.exports = SearchResults;


},{"../config":8,"../models/searchresult":19,"backbone":1,"hilib/lib/managers":2}],8:[function(_dereq_,module,exports){
module.exports = {
  baseUrl: '',
  searchPath: '',
  search: true,
  token: null,
  queryOptions: {},
  facetNameMap: {}
};


},{}],9:[function(_dereq_,module,exports){
module.exports = {
  BOOLEAN: _dereq_('./views/facets/boolean'),
  DATE: _dereq_('./views/facets/date'),
  RANGE: _dereq_('./views/facets/range'),
  LIST: _dereq_('./views/facets/list')
};


},{"./views/facets/boolean":20,"./views/facets/date":21,"./views/facets/list":22,"./views/facets/range":25}],10:[function(_dereq_,module,exports){
var Backbone, Fn, MainModel, MainView, Views, config, dom, facetViewMap, pubsub, tpl, utils,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Backbone = _dereq_('backbone');

utils = _dereq_('hilib/lib/utils');

Fn = utils.general;

dom = utils.dom;

pubsub = _dereq_('hilib/lib/mixins').pubsub;

config = _dereq_('./config');

facetViewMap = _dereq_('./facetviewmap');

MainModel = _dereq_('./models/main');

Views = {
  TextSearch: _dereq_('./views/search'),
  Facets: {
    List: _dereq_('./views/facets/list'),
    Boolean: _dereq_('./views/facets/boolean'),
    Date: _dereq_('./views/facets/date')
  }
};

tpl = _dereq_('../jade/main.jade');

MainView = (function(_super) {
  __extends(MainView, _super);

  function MainView() {
    return MainView.__super__.constructor.apply(this, arguments);
  }

  MainView.prototype.initialize = function(options) {
    var queryOptions;
    this.facetViews = {};
    _.extend(this, pubsub);
    _.extend(facetViewMap, options.facetViewMap);
    delete options.facetViewMap;
    _.extend(config.facetNameMap, options.facetNameMap);
    delete options.facetNameMap;
    _.extend(config, options);
    queryOptions = _.extend(config.queryOptions, config.textSearchOptions);
    this.render();
    this.model = new MainModel(queryOptions);
    this.listenTo(this.model.searchResults, 'change:results', (function(_this) {
      return function(responseModel) {
        _this.renderFacets();
        return _this.trigger('results:change', responseModel);
      };
    })(this));
    this.listenTo(this.model.searchResults, 'change:cursor', (function(_this) {
      return function(responseModel) {
        return _this.trigger('results:change', responseModel);
      };
    })(this));
    this.listenTo(this.model.searchResults, 'change:page', (function(_this) {
      return function(responseModel, database) {
        return _this.trigger('results:change', responseModel, database);
      };
    })(this));
    this.listenTo(this.model.searchResults, 'request', (function(_this) {
      return function() {
        var bb, div, el, loader, top;
        el = _this.el.querySelector('.faceted-search');
        div = _this.el.querySelector('.overlay');
        div.style.width = el.clientWidth + 'px';
        div.style.height = el.clientHeight + 'px';
        div.style.display = 'block';
        loader = _this.el.querySelector('.overlay div');
        bb = dom(el).boundingBox();
        loader.style.left = bb.left + bb.width / 2 + 'px';
        top = bb.height > document.documentElement.clientHeight ? '50vh' : bb.height / 2 + 'px';
        return loader.style.top = top;
      };
    })(this));
    this.listenTo(this.model.searchResults, 'sync', (function(_this) {
      return function() {
        var el;
        el = _this.el.querySelector('.overlay');
        return el.style.display = 'none';
      };
    })(this));
    return this.listenTo(this.model.searchResults, 'unauthorised', (function(_this) {
      return function() {
        return _this.trigger('unauthorised');
      };
    })(this));
  };

  MainView.prototype.render = function() {
    var rtpl;
    rtpl = tpl();
    this.$el.html(rtpl);
    this.$('.loader').fadeIn('slow');
    return this;
  };

  MainView.prototype.renderFacets = function(data) {
    var View, facetData, fragment, index, textSearch, _ref;
    this.$('.loader').hide();
    this.$('.faceted-search > i.fa-compress').css('visibility', 'visible');
    if (this.model.searchResults.length === 1) {
      fragment = document.createDocumentFragment();
      if (config.search) {
        textSearch = new Views.TextSearch();
        this.$('.search-placeholder').html(textSearch.el);
        this.listenTo(textSearch, 'change', (function(_this) {
          return function(queryOptions) {
            return _this.model.set(queryOptions);
          };
        })(this));
        this.facetViews['textSearch'] = textSearch;
      }
      _ref = this.model.searchResults.current.get('facets');
      for (index in _ref) {
        if (!__hasProp.call(_ref, index)) continue;
        facetData = _ref[index];
        if (facetData.type in facetViewMap) {
          View = facetViewMap[facetData.type];
          this.facetViews[facetData.name] = new View({
            attrs: facetData
          });
          this.listenTo(this.facetViews[facetData.name], 'change', (function(_this) {
            return function(queryOptions) {
              return _this.model.set(queryOptions);
            };
          })(this));
          fragment.appendChild(this.facetViews[facetData.name].el);
        } else {
          console.error('Unknown facetView', facetData.type);
        }
      }
      return this.el.querySelector('.facets').appendChild(fragment);
    } else {
      return this.update();
    }
  };

  MainView.prototype.events = function() {
    return {
      'click i.fa-compress': 'toggleFacets',
      'click i.fa-expand': 'toggleFacets'
    };
  };

  MainView.prototype.toggleFacets = function(ev) {
    var $button, facetNames, index, open, slideFacet;
    $button = $(ev.currentTarget);
    open = $button.hasClass('fa-expand');
    $button.toggleClass('fa-compress');
    $button.toggleClass('fa-expand');
    facetNames = _.keys(this.facetViews);
    index = 0;
    slideFacet = (function(_this) {
      return function() {
        var facet, facetName;
        facetName = facetNames[index++];
        facet = _this.facetViews[facetName];
        if (facet != null) {
          if (facetName === 'textSearch') {
            return slideFacet();
          } else {
            if (open) {
              return facet.showBody(function() {
                return slideFacet();
              });
            } else {
              return facet.hideBody(function() {
                return slideFacet();
              });
            }
          }
        }
      };
    })(this);
    return slideFacet();
  };

  MainView.prototype.page = function(pagenumber, database) {
    return this.model.searchResults.current.page(pagenumber, database);
  };

  MainView.prototype.next = function() {
    return this.model.searchResults.moveCursor('_next');
  };

  MainView.prototype.prev = function() {
    return this.model.searchResults.moveCursor('_prev');
  };

  MainView.prototype.hasNext = function() {
    return this.model.searchResults.current.has('_next');
  };

  MainView.prototype.hasPrev = function() {
    return this.model.searchResults.current.has('_prev');
  };

  MainView.prototype.sortResultsBy = function(field) {
    return this.model.set({
      sort: field
    });
  };

  MainView.prototype.update = function() {
    var data, index, _ref, _results;
    if (this.facetViews.hasOwnProperty('textSearch')) {
      this.facetViews.textSearch.update();
    }
    _ref = this.model.searchResults.current.get('facets');
    _results = [];
    for (index in _ref) {
      if (!__hasProp.call(_ref, index)) continue;
      data = _ref[index];
      _results.push(this.facetViews[data.name].update(data.options));
    }
    return _results;
  };

  MainView.prototype.reset = function() {
    var data, index, _ref;
    if (this.facetViews.hasOwnProperty('textSearch')) {
      this.facetViews.textSearch.reset();
    }
    _ref = this.model.searchResults.last().get('facets');
    for (index in _ref) {
      if (!__hasProp.call(_ref, index)) continue;
      data = _ref[index];
      if (this.facetViews[data.name].reset) {
        this.facetViews[data.name].reset();
      }
    }
    return this.model.reset();
  };

  MainView.prototype.refresh = function(newQueryOptions) {
    return this.model.refresh(newQueryOptions);
  };

  return MainView;

})(Backbone.View);

module.exports = MainView;


},{"../jade/main.jade":27,"./config":8,"./facetviewmap":9,"./models/main":16,"./views/facets/boolean":20,"./views/facets/date":21,"./views/facets/list":22,"./views/search":26,"backbone":1,"hilib/lib/mixins":3,"hilib/lib/utils":4}],11:[function(_dereq_,module,exports){
var BooleanFacet, Models,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Models = {
  Facet: _dereq_('./facet')
};

BooleanFacet = (function(_super) {
  __extends(BooleanFacet, _super);

  function BooleanFacet() {
    return BooleanFacet.__super__.constructor.apply(this, arguments);
  }

  BooleanFacet.prototype.set = function(attrs, options) {
    if (attrs === 'options') {
      options = this.parseOptions(options);
    } else if (attrs.options != null) {
      attrs.options = this.parseOptions(attrs.options);
    }
    return BooleanFacet.__super__.set.call(this, attrs, options);
  };

  BooleanFacet.prototype.parseOptions = function(options) {
    var _ref;
    options = (_ref = this.get('options')) != null ? _ref : options;
    if (options.length === 1) {
      options.push({
        name: (!JSON.parse(options[0].name)).toString(),
        count: 0
      });
    }
    return options;
  };

  return BooleanFacet;

})(Models.Facet);

module.exports = BooleanFacet;


},{"./facet":13}],12:[function(_dereq_,module,exports){
var DateFacet, Models,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Models = {
  Facet: _dereq_('../models/facet')
};

DateFacet = (function(_super) {
  __extends(DateFacet, _super);

  function DateFacet() {
    return DateFacet.__super__.constructor.apply(this, arguments);
  }

  DateFacet.prototype.parse = function(attrs) {
    attrs.options = _.map(_.pluck(attrs.options, 'name'), function(option) {
      return option.substr(0, 4);
    });
    attrs.options = _.unique(attrs.options);
    attrs.options.sort();
    return attrs;
  };

  return DateFacet;

})(Models.Facet);

module.exports = DateFacet;


},{"../models/facet":13}],13:[function(_dereq_,module,exports){
var Backbone, Facet, config,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Backbone = _dereq_('backbone');

config = _dereq_('../config');

Facet = (function(_super) {
  __extends(Facet, _super);

  function Facet() {
    return Facet.__super__.constructor.apply(this, arguments);
  }

  Facet.prototype.idAttribute = 'name';

  Facet.prototype.parse = function(attrs) {
    if (config.facetNameMap.hasOwnProperty(attrs.name)) {
      attrs.title = config.facetNameMap[attrs.name];
    } else {
      config.facetNameMap[attrs.name] = attrs.title;
    }
    return attrs;
  };

  return Facet;

})(Backbone.Model);

module.exports = Facet;


},{"../config":8,"backbone":1}],14:[function(_dereq_,module,exports){
var List, Models,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Models = {
  Facet: _dereq_('./facet')
};

List = (function(_super) {
  __extends(List, _super);

  function List() {
    return List.__super__.constructor.apply(this, arguments);
  }

  return List;

})(Models.Facet);

module.exports = List;


},{"./facet":13}],15:[function(_dereq_,module,exports){
var Backbone, ListOption,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Backbone = _dereq_('backbone');

ListOption = (function(_super) {
  __extends(ListOption, _super);

  function ListOption() {
    return ListOption.__super__.constructor.apply(this, arguments);
  }

  ListOption.prototype.idAttribute = 'name';

  ListOption.prototype.defaults = function() {
    return {
      name: '',
      count: 0,
      total: 0,
      checked: false
    };
  };

  ListOption.prototype.parse = function(attrs) {
    attrs.total = attrs.count;
    return attrs;
  };

  return ListOption;

})(Backbone.Model);

module.exports = ListOption;


},{"backbone":1}],16:[function(_dereq_,module,exports){
var Backbone, MainModel, SearchResults,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Backbone = _dereq_('backbone');

SearchResults = _dereq_('../collections/searchresults');

MainModel = (function(_super) {
  __extends(MainModel, _super);

  function MainModel() {
    return MainModel.__super__.constructor.apply(this, arguments);
  }

  MainModel.prototype.defaults = function() {
    return {
      facetValues: [],
      sortParameters: []
    };
  };

  MainModel.prototype.initialize = function(queryOptions, options) {
    this.queryOptions = queryOptions;
    this.searchResults = new SearchResults();
    this.on('change', (function(_this) {
      return function(model, options) {
        return _this.searchResults.runQuery(_.clone(_this.attributes));
      };
    })(this));
    return this.trigger('change');
  };

  MainModel.prototype.set = function(attrs, options) {
    var facetValues;
    if (attrs.facetValue != null) {
      facetValues = _.reject(this.get('facetValues'), function(data) {
        return data.name === attrs.facetValue.name;
      });
      if (attrs.facetValue.values != null) {
        if (attrs.facetValue.values.length > 0) {
          facetValues.push(attrs.facetValue);
        }
      } else {
        facetValues.push(attrs.facetValue);
      }
      attrs.facetValues = facetValues;
      delete attrs.facetValue;
    }
    return MainModel.__super__.set.call(this, attrs, options);
  };

  MainModel.prototype.reset = function() {
    this.clear({
      silent: true
    });
    this.set(this.defaults(), {
      silent: true
    });
    this.set(this.queryOptions, {
      silent: true
    });
    return this.trigger('change');
  };

  MainModel.prototype.refresh = function(newQueryOptions) {
    var key, value;
    if (newQueryOptions == null) {
      newQueryOptions = {};
    }
    for (key in newQueryOptions) {
      if (!__hasProp.call(newQueryOptions, key)) continue;
      value = newQueryOptions[key];
      this.set(key, value);
    }
    return this.searchResults.runQuery(_.clone(this.attributes), false);
  };

  return MainModel;

})(Backbone.Model);

module.exports = MainModel;


},{"../collections/searchresults":7,"backbone":1}],17:[function(_dereq_,module,exports){
var FacetModel, RangeFacet,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

FacetModel = _dereq_('../models/facet');

RangeFacet = (function(_super) {
  __extends(RangeFacet, _super);

  function RangeFacet() {
    return RangeFacet.__super__.constructor.apply(this, arguments);
  }

  RangeFacet.prototype.parse = function(attrs) {
    RangeFacet.__super__.parse.apply(this, arguments);
    attrs.options = {
      lowerLimit: +((attrs.options[0].lowerLimit + '').substr(0, 4)),
      upperLimit: +((attrs.options[0].upperLimit + '').substr(0, 4))
    };
    return attrs;
  };

  return RangeFacet;

})(FacetModel);

module.exports = RangeFacet;


},{"../models/facet":13}],18:[function(_dereq_,module,exports){
var Backbone, Search,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Backbone = _dereq_('backbone');

Search = (function(_super) {
  __extends(Search, _super);

  function Search() {
    return Search.__super__.constructor.apply(this, arguments);
  }

  Search.prototype.defaults = function() {
    return {
      term: '*',
      caseSensitive: false,
      fuzzy: false,
      title: 'Text Search',
      name: 'text_search'
    };
  };

  Search.prototype.queryData = function() {
    var attrs;
    attrs = _.extend({}, this.attributes);
    delete attrs.name;
    delete attrs.title;
    return attrs;
  };

  return Search;

})(Backbone.Model);

module.exports = Search;


},{"backbone":1}],19:[function(_dereq_,module,exports){
var Backbone, SearchResult, ajax, config, managers, token,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Backbone = _dereq_('backbone');

managers = _dereq_('hilib/lib/managers');

ajax = managers.ajax;

token = managers.token;

config = _dereq_('../config');

SearchResult = (function(_super) {
  __extends(SearchResult, _super);

  function SearchResult() {
    return SearchResult.__super__.constructor.apply(this, arguments);
  }

  SearchResult.prototype.defaults = function() {
    return {
      _next: null,
      _prev: null,
      ids: [],
      numFound: null,
      results: [],
      rows: null,
      solrquery: '',
      sortableFields: [],
      start: null,
      term: ''
    };
  };

  SearchResult.prototype.initialize = function(attrs, options) {
    this.options = options;
    SearchResult.__super__.initialize.apply(this, arguments);
    return this.postURL = null;
  };

  SearchResult.prototype.sync = function(method, model, options) {
    var jqXHR;
    if (method === 'read') {
      if (this.options.url != null) {
        return this.getResults(this.options.url, options.success);
      } else {
        jqXHR = ajax.post({
          url: config.baseUrl + config.searchPath,
          data: JSON.stringify(this.options.queryOptions),
          dataType: 'text'
        });
        jqXHR.done((function(_this) {
          return function(data, textStatus, jqXHR) {
            var url;
            if (jqXHR.status === 201) {
              _this.postURL = jqXHR.getResponseHeader('Location');
              url = _this.options.resultRows != null ? _this.postURL + '?rows=' + _this.options.resultRows : _this.postURL;
              return _this.getResults(url, options.success);
            }
          };
        })(this));
        return jqXHR.fail((function(_this) {
          return function(jqXHR, textStatus, errorThrown) {
            if (jqXHR.status === 401) {
              _this.collection.trigger('unauthorized');
            }
            return console.error('Failed getting FacetedSearch results from the server!', arguments);
          };
        })(this));
      }
    }
  };

  SearchResult.prototype.getResults = function(url, done) {
    var jqXHR;
    ajax.token = config.token;
    jqXHR = ajax.get({
      url: url
    });
    jqXHR.done((function(_this) {
      return function(data, textStatus, jqXHR) {
        return done(data);
      };
    })(this));
    return jqXHR.fail((function(_this) {
      return function(jqXHR, textStatus, errorThrown) {
        if (jqXHR.status === 401) {
          _this.collection.trigger('unauthorized');
        }
        return console.error('Failed getting FacetedSearch results from the server!', arguments);
      };
    })(this));
  };

  SearchResult.prototype.page = function(pagenumber, database) {
    var start, url;
    start = this.options.resultRows * (pagenumber - 1);
    url = this.postURL + ("?rows=" + this.options.resultRows + "&start=" + start);
    if (database != null) {
      url += "&database=" + database;
    }
    return this.getResults(url, (function(_this) {
      return function(data) {
        _this.set(data, {
          silent: true
        });
        return _this.collection.trigger('change:page', _this, database);
      };
    })(this));
  };

  return SearchResult;

})(Backbone.Model);

module.exports = SearchResult;


},{"../config":8,"backbone":1,"hilib/lib/managers":2}],20:[function(_dereq_,module,exports){
var BooleanFacet, Models, StringFn, Views, bodyTpl,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

StringFn = _dereq_('hilib/lib/utils').string;

Models = {
  Boolean: _dereq_('../../models/boolean')
};

Views = {
  Facet: _dereq_('./main')
};

bodyTpl = '../../../jade/facets/boolean.body.jade';

BooleanFacet = (function(_super) {
  __extends(BooleanFacet, _super);

  function BooleanFacet() {
    return BooleanFacet.__super__.constructor.apply(this, arguments);
  }

  BooleanFacet.prototype.className = 'facet boolean';

  BooleanFacet.prototype.events = function() {
    return _.extend({}, BooleanFacet.__super__.events.apply(this, arguments), {
      'click i': 'checkChanged',
      'click label': 'checkChanged'
    });
  };

  BooleanFacet.prototype.checkChanged = function(ev) {
    var $target, option, value, _i, _len, _ref;
    $target = ev.currentTarget.tagName === 'LABEL' ? this.$('i[data-value="' + ev.currentTarget.getAttribute('data-value') + '"]') : $(ev.currentTarget);
    $target.toggleClass('fa-square-o');
    $target.toggleClass('fa-check-square-o');
    value = $target.attr('data-value');
    _ref = this.model.get('options');
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      option = _ref[_i];
      if (option.name === value) {
        option.checked = $target.hasClass('fa-check-square-o');
      }
    }
    return this.trigger('change', {
      facetValue: {
        name: this.model.get('name'),
        values: _.map(this.$('i.fa-check-square-o'), function(cb) {
          return cb.getAttribute('data-value');
        })
      }
    });
  };

  BooleanFacet.prototype.initialize = function(options) {
    BooleanFacet.__super__.initialize.apply(this, arguments);
    this.model = new Models.Boolean(options.attrs, {
      parse: true
    });
    this.listenTo(this.model, 'change:options', this.render);
    return this.render();
  };

  BooleanFacet.prototype.render = function() {
    var rtpl;
    BooleanFacet.__super__.render.apply(this, arguments);
    rtpl = bodyTpl(_.extend(this.model.attributes, {
      ucfirst: StringFn.ucfirst
    }));
    this.$('.body').html(rtpl);
    this.$('header i.fa').remove();
    return this;
  };

  BooleanFacet.prototype.update = function(newOptions) {
    return this.model.set('options', newOptions);
  };

  BooleanFacet.prototype.reset = function() {
    return this.render();
  };

  return BooleanFacet;

})(Views.Facet);

module.exports = BooleanFacet;


},{"../../models/boolean":11,"./main":24,"hilib/lib/utils":4}],21:[function(_dereq_,module,exports){
var DateFacet, Models, StringFn, Views, tpl,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

StringFn = _dereq_('hilib/lib/utils').string;

Models = {
  Date: _dereq_('../../models/date')
};

Views = {
  Facet: _dereq_('./main')
};

tpl = '../../../jade/facets/date.jade';

DateFacet = (function(_super) {
  __extends(DateFacet, _super);

  function DateFacet() {
    return DateFacet.__super__.constructor.apply(this, arguments);
  }

  DateFacet.prototype.className = 'facet date';

  DateFacet.prototype.initialize = function(options) {
    DateFacet.__super__.initialize.apply(this, arguments);
    this.model = new Models.Date(options.attrs, {
      parse: true
    });
    this.listenTo(this.model, 'change:options', this.render);
    return this.render();
  };

  DateFacet.prototype.render = function() {
    var rtpl;
    DateFacet.__super__.render.apply(this, arguments);
    rtpl = tpl(_.extend(this.model.attributes, {
      ucfirst: StringFn.ucfirst
    }));
    this.$('.placeholder').html(rtpl);
    return this;
  };

  DateFacet.prototype.update = function(newOptions) {};

  DateFacet.prototype.reset = function() {};

  return DateFacet;

})(Views.Facet);

module.exports = DateFacet;


},{"../../models/date":12,"./main":24,"hilib/lib/utils":4}],22:[function(_dereq_,module,exports){
var Collections, Fn, ListFacet, Models, Views, bodyTpl, menuTpl,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Fn = _dereq_('hilib/lib/utils').general;

Models = {
  List: _dereq_('../../models/list')
};

Collections = {
  Options: _dereq_('../../collections/list.options')
};

Views = {
  Facet: _dereq_('./main'),
  Options: _dereq_('./list.options')
};

menuTpl = '../../../jade/facets/list.menu.jade';

bodyTpl = '../../../jade/facets/list.body.jade';

ListFacet = (function(_super) {
  __extends(ListFacet, _super);

  function ListFacet() {
    return ListFacet.__super__.constructor.apply(this, arguments);
  }

  ListFacet.prototype.className = 'facet list';

  ListFacet.prototype.initialize = function(options) {
    this.options = options;
    ListFacet.__super__.initialize.apply(this, arguments);
    this.model = new Models.List(this.options.attrs, {
      parse: true
    });
    return this.render();
  };

  ListFacet.prototype.render = function() {
    var body, menu;
    ListFacet.__super__.render.apply(this, arguments);
    this.collection = new Collections.Options(this.options.attrs.options, {
      parse: true
    });
    menu = menuTpl({
      model: this.model.attributes,
      selectAll: this.collection.length <= 20
    });
    body = bodyTpl(this.model.attributes);
    this.el.querySelector('header .options').innerHTML = menu;
    this.el.querySelector('.body').innerHTML = body;
    this.optionsView = new Views.Options({
      collection: this.collection,
      facetName: this.model.get('name')
    });
    this.$('.body').html(this.optionsView.el);
    this.listenTo(this.optionsView, 'filter:finished', this.renderFilteredOptionCount);
    this.listenTo(this.optionsView, 'change', (function(_this) {
      return function(data) {
        return _this.trigger('change', data);
      };
    })(this));
    return this;
  };

  ListFacet.prototype.renderFilteredOptionCount = function() {
    var collectionLength, filteredLength;
    filteredLength = this.optionsView.filtered_items.length;
    collectionLength = this.optionsView.collection.length;
    if (filteredLength === 0 || filteredLength === collectionLength) {
      this.$('header .options input[name="filter"]').addClass('nonefound');
      this.$('header small.optioncount').html('');
    } else {
      this.$('header .options input[name="filter"]').removeClass('nonefound');
      this.$('header small.optioncount').html(filteredLength + ' of ' + collectionLength);
    }
    return this;
  };

  ListFacet.prototype.events = function() {
    return _.extend({}, ListFacet.__super__.events.apply(this, arguments), {
      'keyup input[name="filter"]': function(ev) {
        return this.optionsView.filterOptions(ev.currentTarget.value);
      },
      'change header .options input[type="checkbox"][name="all"]': function(ev) {
        return this.optionsView.setCheckboxes(ev);
      },
      'click .orderby i': 'changeOrder'
    });
  };

  ListFacet.prototype.changeOrder = function(ev) {
    var $target, order, type;
    $target = $(ev.currentTarget);
    if ($target.hasClass('active')) {
      if ($target.hasClass('alpha')) {
        $target.toggleClass('fa-sort-alpha-desc');
        $target.toggleClass('fa-sort-alpha-asc');
      } else if ($target.hasClass('amount')) {
        $target.toggleClass('fa-sort-amount-desc');
        $target.toggleClass('fa-sort-amount-asc');
      }
    } else {
      this.$('.active').removeClass('active');
      $target.addClass('active');
    }
    type = $target.hasClass('alpha') ? 'alpha' : 'amount';
    order = $target.hasClass('fa-sort-' + type + '-desc') ? 'desc' : 'asc';
    return this.collection.orderBy(type + '_' + order);
  };

  ListFacet.prototype.update = function(newOptions) {
    return this.optionsView.collection.updateOptions(newOptions);
  };

  ListFacet.prototype.reset = function() {
    return this.optionsView.collection.revert();
  };

  return ListFacet;

})(Views.Facet);

module.exports = ListFacet;


},{"../../collections/list.options":6,"../../models/list":14,"./list.options":23,"./main":24,"hilib/lib/utils":4}],23:[function(_dereq_,module,exports){
var Backbone, Fn, ListFacetOptions, Models, tpl,
  __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Backbone = _dereq_('backbone');

Fn = _dereq_('hilib/lib/utils').general;

Models = {
  List: _dereq_('../../models/list')
};

tpl = '../../../jade/facets/list.option.jade';

ListFacetOptions = (function(_super) {
  __extends(ListFacetOptions, _super);

  function ListFacetOptions() {
    this.triggerChange = __bind(this.triggerChange, this);
    return ListFacetOptions.__super__.constructor.apply(this, arguments);
  }

  ListFacetOptions.prototype.className = 'container';

  ListFacetOptions.prototype.initialize = function() {
    this.showing = null;
    this.showingIncrement = 50;
    this.filtered_items = this.collection.models;
    this.listenTo(this.collection, 'sort', (function(_this) {
      return function() {
        _this.filtered_items = _this.collection.models;
        return _this.render();
      };
    })(this));
    return this.render();
  };

  ListFacetOptions.prototype.render = function() {
    var ul;
    this.showing = 50;
    ul = document.createElement('ul');
    ul.style.height = (this.filtered_items.length * 15) + 'px';
    this.el.innerHTML = '';
    this.el.appendChild(ul);
    this.appendOptions();
    return this;
  };

  ListFacetOptions.prototype.renderAll = function() {
    this.render();
    return this.appendAllOptions();
  };

  ListFacetOptions.prototype.appendOptions = function() {
    var option, _i, _len, _ref;
    tpl = '';
    _ref = this.filtered_items.slice(this.showing - this.showingIncrement, +this.showing + 1 || 9e9);
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      option = _ref[_i];
      tpl += tpl({
        option: option
      });
    }
    return this.$('ul').append(tpl);
  };

  ListFacetOptions.prototype.appendAllOptions = function() {
    var option, _i, _len, _ref;
    tpl = '';
    _ref = this.filtered_items.slice(this.showing);
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      option = _ref[_i];
      tpl += tpl({
        option: option
      });
    }
    return this.$('ul').append(tpl);
  };

  ListFacetOptions.prototype.events = function() {
    return {
      'click i': 'checkChanged',
      'click label': 'checkChanged',
      'scroll': 'onScroll'
    };
  };

  ListFacetOptions.prototype.onScroll = function(ev) {
    var target, topPerc;
    target = ev.currentTarget;
    topPerc = target.scrollTop / target.scrollHeight;
    if (topPerc > (this.showing / 2) / this.collection.length && this.showing < this.collection.length) {
      this.showing += this.showingIncrement;
      if (this.showing > this.collection.length) {
        this.showing = this.collection.length;
      }
      return this.appendOptions();
    }
  };

  ListFacetOptions.prototype.checkChanged = function(ev) {
    var $target, id;
    $target = ev.currentTarget.tagName === 'LABEL' ? this.$('i[data-value="' + ev.currentTarget.getAttribute('data-value') + '"]') : $(ev.currentTarget);
    $target.toggleClass('fa-square-o');
    $target.toggleClass('fa-check-square-o');
    id = $target.attr('data-value');
    this.collection.get(id).set('checked', $target.hasClass('fa-check-square-o'));
    if (this.$('i.fa-check-square-o').length === 0) {
      return this.triggerChange();
    } else {
      return Fn.timeoutWithReset(1000, (function(_this) {
        return function() {
          return _this.triggerChange();
        };
      })(this));
    }
  };

  ListFacetOptions.prototype.triggerChange = function() {
    return this.trigger('change', {
      facetValue: {
        name: this.options.facetName,
        values: _.map(this.$('i.fa-check-square-o'), function(cb) {
          return cb.getAttribute('data-value');
        })
      }
    });
  };


  /*
  	Called by parent (ListFacet) when user types in the search input
   */

  ListFacetOptions.prototype.filterOptions = function(value) {
    var re;
    re = new RegExp(value, 'i');
    this.filtered_items = this.collection.filter(function(item) {
      return re.test(item.id);
    });
    if (this.filtered_items.length === 0) {
      this.filtered_items = this.collection.models;
    }
    this.trigger('filter:finished');
    return this.render();
  };

  ListFacetOptions.prototype.setCheckboxes = function(ev) {
    var model, _i, _len, _ref;
    _ref = this.collection.models;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      model = _ref[_i];
      model.set('checked', ev.currentTarget.checked);
    }
    this.render();
    return this.triggerChange();
  };

  return ListFacetOptions;

})(Backbone.View);

module.exports = ListFacetOptions;


},{"../../models/list":14,"backbone":1,"hilib/lib/utils":4}],24:[function(_dereq_,module,exports){
var Backbone, Facet, tpl,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Backbone = _dereq_('backbone');

tpl = '../../../jade/facets/main.jade';

Facet = (function(_super) {
  __extends(Facet, _super);

  function Facet() {
    return Facet.__super__.constructor.apply(this, arguments);
  }

  Facet.prototype.render = function() {
    var rtpl;
    rtpl = tpl(this.model.attributes);
    this.$el.html(rtpl);
    return this;
  };

  Facet.prototype.events = function() {
    return {
      'click h3': 'toggleBody',
      'click header i.openclose': 'toggleMenu'
    };
  };

  Facet.prototype.toggleMenu = function(ev) {
    var $button;
    $button = $(ev.currentTarget);
    $button.toggleClass('fa-plus-square-o');
    $button.toggleClass('fa-minus-square-o');
    this.$('header .options').slideToggle(150);
    return this.$('header .options input[name="filter"]').focus();
  };

  Facet.prototype.hideMenu = function() {
    var $button;
    $button = $('header i.fa');
    $button.addClass('fa-plus-square-o');
    $button.removeClass('fa-minus-square-o');
    return this.$('header .options').slideUp(150);
  };

  Facet.prototype.toggleBody = function(ev) {
    var func;
    func = this.$('.body').is(':visible') ? this.hideBody : this.showBody;
    if (_.isFunction(ev)) {
      return func.call(this, ev);
    } else {
      return func.call(this);
    }
  };

  Facet.prototype.hideBody = function(done) {
    this.hideMenu();
    return this.$('.body').slideUp(100, (function(_this) {
      return function() {
        if (done != null) {
          done();
        }
        return _this.$('header i.fa').fadeOut(100);
      };
    })(this));
  };

  Facet.prototype.showBody = function(done) {
    return this.$('.body').slideDown(100, (function(_this) {
      return function() {
        if (done != null) {
          done();
        }
        return _this.$('header i.fa').fadeIn(100);
      };
    })(this));
  };

  Facet.prototype.update = function(newOptions) {};

  return Facet;

})(Backbone.View);

module.exports = Facet;


},{"backbone":1}],25:[function(_dereq_,module,exports){
var Models, RangeFacet, Views, bodyTpl, handleSize,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Models = {
  Range: _dereq_('../../models/range')
};

Views = {
  Facet: _dereq_('./main')
};

bodyTpl = '../../../jade/facets/range.body.jade';

handleSize = 12;

RangeFacet = (function(_super) {
  __extends(RangeFacet, _super);

  function RangeFacet() {
    return RangeFacet.__super__.constructor.apply(this, arguments);
  }

  RangeFacet.prototype.className = 'facet range';

  RangeFacet.prototype.initialize = function(options) {
    RangeFacet.__super__.initialize.apply(this, arguments);
    this.draggingMin = false;
    this.dragginMax = false;
    this.model = new Models.Range(options.attrs, {
      parse: true
    });
    this.listenTo(this.model, 'change:options', this.render);
    return this.render();
  };

  RangeFacet.prototype.render = function() {
    var rtpl;
    RangeFacet.__super__.render.apply(this, arguments);
    rtpl = bodyTpl(this.model.attributes);
    this.$('.body').html(rtpl);
    this.$('header i.openclose').hide();
    setTimeout(((function(_this) {
      return function() {
        return _this.postRender();
      };
    })(this)), 0);
    this.$el.mouseleave((function(_this) {
      return function() {
        return _this.stopDragging();
      };
    })(this));
    return this;
  };

  RangeFacet.prototype.postRender = function() {
    var $slider;
    this.$minHandle = this.$('.min-handle');
    this.$maxHandle = this.$('.max-handle');
    this.$minValue = this.$('.min-value');
    this.$maxValue = this.$('.max-value');
    this.$bar = this.$('.bar');
    $slider = this.$('.slider');
    this.sliderWidth = $slider.width();
    this.sliderLeft = $slider.offset().left;
    this.minHandleLeft = handleSize / -2;
    this.maxHandleLeft = this.sliderWidth - (handleSize / 2);
    return this.$maxHandle.css('left', this.maxHandleLeft);
  };

  RangeFacet.prototype.events = function() {
    return {
      'mousedown .max-handle': function() {
        return this.draggingMax = true;
      },
      'mousedown .min-handle': function() {
        return this.draggingMin = true;
      },
      'mouseup': 'stopDragging',
      'mousemove': 'drag',
      'click .slider': 'moveHandle',
      'click button': 'doSearch'
    };
  };

  RangeFacet.prototype.doSearch = function(ev) {
    ev.preventDefault();
    return this.trigger('change', {
      facetValue: {
        name: this.model.get('name'),
        lowerLimit: +(this.$minValue.html() + '0101'),
        upperLimit: +(this.$maxValue.html() + '1231')
      }
    });
  };

  RangeFacet.prototype.moveHandle = function(ev) {
    var left;
    if (!(ev.target === this.el.querySelector('.slider') || ev.target === this.el.querySelector('.bar'))) {
      return;
    }
    left = ev.clientX - this.sliderLeft;
    if (Math.abs(this.$minHandle.position().left - left) < Math.abs(this.$maxHandle.position().left - left)) {
      this.$minHandle.css('left', left - (handleSize / 2));
      this.$bar.css('left', left);
      return this.updateValue(this.$minValue, left);
    } else {
      this.$maxHandle.css('left', left - (handleSize / 2));
      this.$bar.css('right', this.sliderWidth - left);
      return this.updateValue(this.$maxValue, left);
    }
  };

  RangeFacet.prototype.stopDragging = function() {
    this.draggingMin = false;
    return this.draggingMax = false;
  };

  RangeFacet.prototype.drag = function(ev) {
    var left;
    if (this.draggingMin) {
      left = ev.clientX - this.sliderLeft;
      this.minHandleLeft = left - (handleSize / 2);
      if ((-1 < left && left <= this.sliderWidth) && this.maxHandleLeft > this.minHandleLeft) {
        this.$minHandle.css('left', this.minHandleLeft);
        this.$bar.css('left', left);
        this.updateValue(this.$minValue, left);
      }
    }
    if (this.draggingMax) {
      left = ev.clientX - this.sliderLeft;
      this.maxHandleLeft = left - (handleSize / 2);
      if ((-1 < left && left <= this.sliderWidth) && this.maxHandleLeft > this.minHandleLeft) {
        this.$maxHandle.css('left', this.maxHandleLeft);
        this.$bar.css('right', this.sliderWidth - left);
        return this.updateValue(this.$maxValue, left);
      }
    }
  };

  RangeFacet.prototype.updateValue = function($el, left) {
    var ll, ul, value;
    this.$('button').show();
    ll = this.model.get('options').lowerLimit;
    ul = this.model.get('options').upperLimit;
    value = Math.floor((left / this.sliderWidth * (ul - ll)) + ll);
    return $el.html(value);
  };

  RangeFacet.prototype.getLeftPosFromYear = function(year) {
    var left, ll, ul;
    ll = this.model.get('options').lowerLimit;
    ul = this.model.get('options').upperLimit;
    left = ((year - ll) / (ul - ll)) * this.sliderWidth;
    return Math.floor(left);
  };

  RangeFacet.prototype.setMinValue = function(year) {
    var left;
    left = this.getLeftPosFromYear(year);
    this.$minHandle.css('left', left);
    this.$minValue.html(year);
    return this.$bar.css('left', left);
  };

  RangeFacet.prototype.setMaxValue = function(year) {
    var left;
    left = this.getLeftPosFromYear(year);
    this.$maxHandle.css('left', left);
    this.$maxValue.html(year);
    return this.$bar.css('right', this.sliderWidth - left);
  };

  RangeFacet.prototype.update = function(newOptions) {
    if (_.isArray(newOptions)) {
      newOptions = newOptions[0];
    }
    this.setMinValue(+(newOptions.lowerLimit + '').substr(0, 4));
    this.setMaxValue(+(newOptions.upperLimit + '').substr(0, 4));
    return this.$('button').hide();
  };

  RangeFacet.prototype.reset = function() {};

  return RangeFacet;

})(Views.Facet);

module.exports = RangeFacet;


},{"../../models/range":17,"./main":24}],26:[function(_dereq_,module,exports){
var Models, SearchView, Views, bodyTpl, config, menuTpl,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

config = _dereq_('../config');

Models = {
  Search: _dereq_('../models/search')
};

Views = {
  Facet: _dereq_('./facets/main')
};

menuTpl = '../../jade/facets/search.menu.jade';

bodyTpl = '../../jade/facets/search.body.jade';

SearchView = (function(_super) {
  __extends(SearchView, _super);

  function SearchView() {
    return SearchView.__super__.constructor.apply(this, arguments);
  }

  SearchView.prototype.className = 'facet search';

  SearchView.prototype.initialize = function(options) {
    SearchView.__super__.initialize.apply(this, arguments);
    this.model = new Models.Search(config.textSearchOptions);
    this.listenTo(this.model, 'change', (function(_this) {
      return function() {
        return _this.trigger('change', _this.model.queryData());
      };
    })(this));
    return this.render();
  };

  SearchView.prototype.render = function() {
    var body, menu;
    SearchView.__super__.render.apply(this, arguments);
    menu = menuTpl({
      model: this.model
    });
    body = bodyTpl({
      model: this.model
    });
    this.$('.options').html(menu);
    this.$('.body').html(body);
    return this;
  };

  SearchView.prototype.events = function() {
    return _.extend({}, SearchView.__super__.events.apply(this, arguments), {
      'click button': function(ev) {
        return ev.preventDefault();
      },
      'click button.active': 'search',
      'keyup input': 'activateSearchButton',
      'change input[type="checkbox"]': 'checkboxChanged'
    });
  };

  SearchView.prototype.checkboxChanged = function(ev) {
    var attr, cb, checkedArray, _i, _len, _ref;
    if (attr = ev.currentTarget.getAttribute('data-attr')) {
      if (attr === 'searchInTranscriptions') {
        this.$('ul.textlayers').toggle(ev.currentTarget.checked);
      }
      this.model.set(attr, ev.currentTarget.checked);
    } else if (attr = ev.currentTarget.getAttribute('data-attr-array')) {
      checkedArray = [];
      _ref = this.el.querySelectorAll('[data-attr-array="' + attr + '"]');
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        cb = _ref[_i];
        if (cb.checked) {
          checkedArray.push(cb.getAttribute('data-value'));
        }
      }
      this.model.set(attr, checkedArray);
    }
    return this.activateSearchButton(true);
  };

  SearchView.prototype.activateSearchButton = function(checkboxChanged) {
    var inputValue;
    if (checkboxChanged == null) {
      checkboxChanged = false;
    }
    if (checkboxChanged.hasOwnProperty('target')) {
      checkboxChanged = false;
    }
    inputValue = this.el.querySelector('input[name="search"]').value;
    if (inputValue.length > 1 && (this.model.get('term') !== inputValue || checkboxChanged)) {
      return this.$('button').addClass('active');
    } else {
      return this.$('button').removeClass('active');
    }
  };

  SearchView.prototype.search = function(ev) {
    var $search, inputValue;
    ev.preventDefault();
    this.$('button').removeClass('active');
    $search = this.$('input[name="search"]');
    $search.addClass('loading');
    inputValue = this.el.querySelector('input[name="search"]').value;
    return this.model.set('term', inputValue);
  };

  SearchView.prototype.update = function() {
    return this.$('input[name="search"]').removeClass('loading');
  };

  SearchView.prototype.reset = function() {
    return this.render();
  };

  return SearchView;

})(Views.Facet);

module.exports = SearchView;


},{"../config":8,"../models/search":18,"./facets/main":24}],27:[function(_dereq_,module,exports){
var jade = _dereq_("jade/runtime");

module.exports = function template(locals) {
var buf = [];
var jade_mixins = {};

buf.push("<div class=\"overlay\"><div><i class=\"fa fa-spinner fa-spin fa-2x\"></i></div></div><div class=\"faceted-search\"><i class=\"fa fa-compress\"></i><form><div class=\"search-placeholder\"></div><div class=\"facets\"><div class=\"loader\"><h4>Loading facets...</h4><br/><i class=\"fa fa-spinner fa-spin fa-2x\"></i></div></div></form></div>");;return buf.join("");
};
},{"jade/runtime":5}]},{},[10])
(10)
});