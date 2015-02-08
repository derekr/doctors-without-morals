(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
/* Riot 2.0.7, @license MIT, (c) 2015 Muut Inc. + contributors */

;(function() {

var riot = { version: 'v2.0.7' }

'use strict'

riot.observable = function(el) {

  el = el || {}

  var callbacks = {}

  el.on = function(events, fn) {
    if (typeof fn == 'function') {
      events.replace(/\S+/g, function(name, pos) {
        (callbacks[name] = callbacks[name] || []).push(fn)
        fn.typed = pos > 0
      })
    }
    return el
  }

  el.off = function(events, fn) {
    if (events == '*') callbacks = {}
    else if (fn) {
      var arr = callbacks[events]
      for (var i = 0, cb; (cb = arr && arr[i]); ++i) {
        if (cb == fn) { arr.splice(i, 1); i-- }
      }
    } else {
      events.replace(/\S+/g, function(name) {
        callbacks[name] = []
      })
    }
    return el
  }

  // only single event supported
  el.one = function(name, fn) {
    if (fn) fn.one = 1
    return el.on(name, fn)
  }

  el.trigger = function(name) {
    var args = [].slice.call(arguments, 1),
        fns = callbacks[name] || []

    for (var i = 0, fn; (fn = fns[i]); ++i) {
      if (!fn.busy) {
        fn.busy = 1
        fn.apply(el, fn.typed ? [name].concat(args) : args)
        if (fn.one) { fns.splice(i, 1); i-- }
         else if (fns[i] !== fn) { i-- } // Makes self-removal possible during iteration
        fn.busy = 0
      }
    }

    return el
  }

  return el

}
;(function(riot, evt) {

  // browsers only
  if (!this.top) return

  var loc = location,
      fns = riot.observable(),
      current = hash(),
      win = window

  function hash() {
    return loc.hash.slice(1)
  }

  function parser(path) {
    return path.split('/')
  }

  function emit(path) {
    if (path.type) path = hash()

    if (path != current) {
      fns.trigger.apply(null, ['H'].concat(parser(path)))
      current = path
    }
  }

  var r = riot.route = function(arg) {
    // string
    if (arg[0]) {
      loc.hash = arg
      emit(arg)

    // function
    } else {
      fns.on('H', arg)
    }
  }

  r.exec = function(fn) {
    fn.apply(null, parser(hash()))
  }

  r.parser = function(fn) {
    parser = fn
  }

  win.addEventListener ? win.addEventListener(evt, emit, false) : win.attachEvent('on' + evt, emit)

})(riot, 'hashchange')
/*

//// How it works?


Three ways:

1. Expressions: tmpl('{ value }', data).
   Returns the result of evaluated expression as a raw object.

2. Templates: tmpl('Hi { name } { surname }', data).
   Returns a string with evaluated expressions.

3. Filters: tmpl('{ show: !done, highlight: active }', data).
   Returns a space separated list of trueish keys (mainly
   used for setting html classes), e.g. "show highlight".


// Template examples

tmpl('{ title || "Untitled" }', data)
tmpl('Results are { results ? "ready" : "loading" }', data)
tmpl('Today is { new Date() }', data)
tmpl('{ message.length > 140 && "Message is too long" }', data)
tmpl('This item got { Math.round(rating) } stars', data)
tmpl('<h1>{ title }</h1>{ body }', data)


// Falsy expressions in templates

In templates (as opposed to single expressions) all falsy values
except zero (undefined/null/false) will default to empty string:

tmpl('{ undefined } - { false } - { null } - { 0 }', {})
// will return: " - - - 0"

*/

riot._tmpl = (function() {

  var cache = {},

      // find variable names
      re_vars = /("|').+?[^\\]\1|\.\w*|\w*:|\b(?:this|true|false|null|undefined|new|typeof|Number|String|Object|Array|Math|Date|JSON)\b|([a-z_]\w*)/gi
              // [ 1            ][ 2  ][ 3 ][ 4                                                                                        ][ 5       ]
              // 1. skip quoted strings: "a b", 'a b', 'a \'b\''
              // 2. skip object properties: .name
              // 3. skip object literals: name:
              // 4. skip reserved words
              // 5. match var name

  // build a template (or get it from cache), render with data

  return function(str, data) {
    return str && (cache[str] = cache[str] || tmpl(str))(data)
  }


  // create a template instance

  function tmpl(s, p) {
    p = (s || '{}')

      // temporarily convert \{ and \} to a non-character
      .replace(/\\{/g, '\uFFF0')
      .replace(/\\}/g, '\uFFF1')

      // split string to expression and non-expresion parts
      .split(/({[\s\S]*?})/)

    return new Function('d', 'return ' + (

      // is it a single expression or a template? i.e. {x} or <b>{x}</b>
      !p[0] && !p[2]

        // if expression, evaluate it
        ? expr(p[1])

        // if template, evaluate all expressions in it
        : '[' + p.map(function(s, i) {

            // is it an expression or a string (every second part is an expression)
            return i % 2

              // evaluate the expressions
              ? expr(s, 1)

              // process string parts of the template:
              : '"' + s

                  // preserve new lines
                  .replace(/\n/g, '\\n')

                  // escape quotes
                  .replace(/"/g, '\\"')

                + '"'

          }).join(',') + '].join("")'
      )

      // bring escaped { and } back
      .replace(/\uFFF0/g, '{')
      .replace(/\uFFF1/g, '}')

    )

  }


  // parse { ... } expression

  function expr(s, n) {
    s = s

      // convert new lines to spaces
      .replace(/\n/g, ' ')

      // trim whitespace, curly brackets, strip comments
      .replace(/^[{ ]+|[ }]+$|\/\*.+?\*\//g, '')

    // is it an object literal? i.e. { key : value }
    return /^\s*[\w-"']+ *:/.test(s)

      // if object literal, return trueish keys
      // e.g.: { show: isOpen(), done: item.done } -> "show done"
      ? '[' + s.replace(/\W*([\w-]+)\W*:([^,]+)/g, function(_, k, v) {

          // safely execute vars to prevent undefined value errors
          return v.replace(/\w[^,|& ]*/g, function(v) { return wrap(v, n) }) + '?"' + k + '":"",'

        }) + '].join(" ")'

      // if js expression, evaluate as javascript
      : wrap(s, n)

  }


  // execute js w/o breaking on errors or undefined vars

  function wrap(s, nonull) {
    return '(function(v){try{v='

        // prefix vars (name => data.name)
        + (s.replace(re_vars, function(s, _, v) { return v ? 'd.' + v : s })

          // break the expression if its empty (resulting in undefined value)
          || 'x')

      + '}finally{return '

        // default to empty string for falsy values except zero
        + (nonull ? '!v&&v!==0?"":v' : 'v')

      + '}}).call(d)'
  }

})()
;(function(riot, is_browser) {

  if (!is_browser) return

  var tmpl = riot._tmpl,
      all_tags = [],
      tag_impl = {},
      doc = document

  function each(nodes, fn) {
    for (var i = 0; i < (nodes || []).length; i++) {
      if (fn(nodes[i], i) === false) i--
    }
  }

  function extend(obj, from) {
    from && Object.keys(from).map(function(key) {
      obj[key] = from[key]
    })
    return obj
  }

  function diff(arr1, arr2) {
    return arr1.filter(function(el) {
      return arr2.indexOf(el) < 0
    })
  }

  function walk(dom, fn) {
    dom = fn(dom) === false ? dom.nextSibling : dom.firstChild

    while (dom) {
      walk(dom, fn)
      dom = dom.nextSibling
    }
  }


  function mkdom(tmpl) {
    var tag_name = tmpl.trim().slice(1, 3).toLowerCase(),
        root_tag = /td|th/.test(tag_name) ? 'tr' : tag_name == 'tr' ? 'tbody' : 'div'
        el = doc.createElement(root_tag)

    el.innerHTML = tmpl
    return el
  }


  function update(expressions, instance) {

    // allow recalculation of context data
    instance.trigger('update')

    each(expressions, function(expr) {
      var tag = expr.tag,
          dom = expr.dom

      function remAttr(name) {
        dom.removeAttribute(name)
      }

      // loops first: TODO remove from expressions arr
      if (expr.loop) {
        remAttr('each')
        return loop(expr, instance)
      }

      // custom tag
      if (tag) return tag.update ? tag.update() :
        expr.tag = createTag({ tmpl: tag[0], fn: tag[1], root: dom, parent: instance })


      var attr_name = expr.attr,
          value = tmpl(expr.expr, instance)

      if (value == null) value = ''

      // no change
      if (expr.value === value) return
      expr.value = value


      // text node
      if (!attr_name) return dom.nodeValue = value

      // attribute
      if (!value && expr.bool || /obj|func/.test(typeof value)) remAttr(attr_name)

      // event handler
      if (typeof value == 'function') {
        dom[attr_name] = function(e) {

          // cross browser event fix
          e = e || window.event
          e.which = e.which || e.charCode || e.keyCode
          e.target = e.target || e.srcElement
          e.currentTarget = dom

          // currently looped item
          e.item = instance.__item || instance

          // prevent default behaviour (by default)
          if (value.call(instance, e) !== true) {
            e.preventDefault && e.preventDefault()
            e.returnValue = false
          }

          instance.update()
        }

      // show / hide / if
      } else if (/^(show|hide|if)$/.test(attr_name)) {
        remAttr(attr_name)
        if (attr_name == 'hide') value = !value
        dom.style.display = value ? '' : 'none'

      // normal attribute
      } else {
        if (expr.bool) {
          dom[attr_name] = value
          if (!value) return
          value = attr_name
        }

        dom.setAttribute(attr_name, value)
      }

    })

    instance.trigger('updated')

  }

  function parse(root) {

    var named_elements = {},
        expressions = []

    walk(root, function(dom) {

      var type = dom.nodeType,
          value = dom.nodeValue

      // text node
      if (type == 3 && dom.parentNode.tagName != 'STYLE') {
        addExpr(dom, value)

      // element
      } else if (type == 1) {

        // loop?
        value = dom.getAttribute('each')

        if (value) {
          addExpr(dom, value, { loop: 1 })
          return false
        }

        // custom tag?
        var tag = tag_impl[dom.tagName.toLowerCase()]

        // attributes
        each(dom.attributes, function(attr) {
          var name = attr.name,
              value = attr.value

          // named elements
          if (/^(name|id)$/.test(name)) named_elements[value] = dom

          // expressions
          if (!tag) {
            var bool = name.split('__')[1]
            addExpr(dom, value, { attr: bool || name, bool: bool })
            if (bool) {
              dom.removeAttribute(name)
              return false
            }
          }

        })

        if (tag) addExpr(dom, 0, { tag: tag })

      }

    })

    return { expr: expressions, elem: named_elements }

    function addExpr(dom, value, data) {
      if (value ? value.indexOf('{') >= 0 : data) {
        var expr = { dom: dom, expr: value }
        expressions.push(extend(expr, data || {}))
      }
    }
  }



  // create new custom tag (component)
  function createTag(conf) {

    var opts = conf.opts || {},
        dom = mkdom(conf.tmpl),
        mountNode = conf.root,
        parent = conf.parent,
        ast = parse(dom),
        tag = { root: mountNode, opts: opts, parent: parent, __item: conf.item },
        attributes = {}

    // named elements
    extend(tag, ast.elem)

    // attributes
    each(mountNode.attributes, function(attr) {
      attributes[attr.name] = attr.value
    })

    function updateOpts() {
      Object.keys(attributes).map(function(name) {
        var val = opts[name] = tmpl(attributes[name], parent || tag)
        if (typeof val == 'object') mountNode.removeAttribute(name)
      })
    }

    updateOpts()

    if (!tag.on) {
      riot.observable(tag)
      delete tag.off // off method not needed
    }

    if (conf.fn) conf.fn.call(tag, opts)


    tag.update = function(data, _system) {

      /*
        If loop is defined on the root of the HTML template
        the original parent is a temporary <div/> by mkdom()
      */
      if (parent && dom && !dom.firstChild) {
        mountNode = parent.root
        dom = null
      }

      if (_system || doc.body.contains(mountNode)) {
        extend(tag, data)
        extend(tag, tag.__item)
        updateOpts()
        update(ast.expr, tag)

        // update parent
        !_system && tag.__item && parent.update()
        return true

      } else {
        tag.trigger('unmount')
      }

    }

    tag.update(0, true)

    // append to root
    while (dom.firstChild) {
      if (conf.before) mountNode.insertBefore(dom.firstChild, conf.before)
      else mountNode.appendChild(dom.firstChild)
    }


    tag.trigger('mount')

    all_tags.push(tag)

    return tag
  }


  function loop(expr, instance) {

    // initialize once
    if (expr.done) return
    expr.done = true

    var dom = expr.dom,
        prev = dom.previousSibling,
        root = dom.parentNode,
        template = dom.outerHTML,
        val = expr.expr,
        els = val.split(/\s+in\s+/),
        rendered = [],
        checksum,
        keys


    if (els[1]) {
      val = '{ ' + els[1]
      keys = els[0].slice(1).trim().split(/,\s*/)
    }

    // clean template code
    instance.one('mount', function() {
      var p = dom.parentNode
      if (p) {
        root = p
        root.removeChild(dom)
      }
    })

    function startPos() {
      return Array.prototype.indexOf.call(root.childNodes, prev) + 1
    }

    instance.on('updated', function() {

      var items = tmpl(val, instance)
          is_array = Array.isArray(items)

      if (is_array) items = items.slice(0)

      else {

        if (!items) return // some IE8 issue

        // detect Object changes
        var testsum = JSON.stringify(items)
        if (testsum == checksum) return
        checksum = testsum

        items = Object.keys(items).map(function(key, i) {
          var item = {}
          item[keys[0]] = key
          item[keys[1]] = items[key]
          return item
        })

      }

      // remove redundant
      diff(rendered, items).map(function(item) {
        var pos = rendered.indexOf(item)
        root.removeChild(root.childNodes[startPos() + pos])
        rendered.splice(pos, 1)
      })

      // add new
      diff(items, rendered).map(function(item, i) {
        var pos = items.indexOf(item)

        // string array
        if (keys && !checksum) {
          var obj = {}
          obj[keys[0]] = item
          obj[keys[1]] = pos
          item = obj
        }

        var tag = createTag({
          before: root.childNodes[startPos() + pos],
          parent: instance,
          tmpl: template,
          item: item,
          root: root
        })

        instance.on('update', function() {
          tag.update(0, true)
        })

      })

      // assign rendered
      rendered = items

    })

  }

  riot.tag = function(name, tmpl, fn) {
    fn = fn || noop,
    tag_impl[name] = [tmpl, fn]
  }

  riot.mountTo = function(node, tagName, opts) {
    var tag = tag_impl[tagName]
    return tag && createTag({ tmpl: tag[0], fn: tag[1], root: node, opts: opts })
  }

  riot.mount = function(selector, opts) {
    if (selector == '*') selector = Object.keys(tag_impl).join(', ')

    var instances = []

    each(doc.querySelectorAll(selector), function(node) {
      if (node.riot) return

      var tagName = node.tagName.toLowerCase(),
          instance = riot.mountTo(node, tagName, opts)

      if (instance) {
        instances.push(instance)
        node.riot = 1
      }
    })

    return instances
  }

  // update everything
  riot.update = function() {
    return all_tags = all_tags.filter(function(tag) {
      return !!tag.update()
    })
  }

})(riot, this.top)


// support CommonJS
if (typeof exports === 'object')
  module.exports = riot

// support AMD
else if (typeof define === 'function' && define.amd)
  define(function() { return riot })

// support browser
else
  this.riot = riot

})();
},{}],2:[function(require,module,exports){
module.exports = {
  _stores: [],
  addStore: function(store) {
    this._stores.push(store)
  },
  trigger: function() {
    var args = [].slice.call(arguments)
    this._stores.forEach(function(el){
      el.trigger.apply(null, args)
    })
  },
  on: function(ev, cb) {
    this._stores.forEach(function(el){
      el.on(ev, cb)
    })
  },
  off: function(ev, cb) {
    this._stores.forEach(function(el){
      if (cb)
        el.off(ev, cb)
      else
        el.off(ev)
    })
  },
  one: function(ev, cb) {
    this._stores.forEach(function(el){
      el.one(ev, cb)
    })
  }
}

},{}],3:[function(require,module,exports){
Parse.initialize("u5GYkgHb3xvWHgEclLEq9Vsa4DzbcQyhuHzSy4KT", "cV86IvpB4YVDDl0vZjTwScFoH3bpYKq0B8uXJcat");

var riot = require('riot');
var riotControl = require('./lib/riot-control');

var doctorsList = require('./stores/doctors')();
var doctor = require('./stores/doctor')();
var map = require('./stores/map')();

riotControl.addStore(doctorsList);
riotControl.addStore(doctor);
riotControl.addStore(map); // keeps track of tab bar filter

require('./tags/app.tag');
require('./tags/splash.tag');
require('./tags/map.tag');
require('./tags/tab-bar.tag');
require('./tags/doctor.tag');

riot.mount('dwm-app');



},{"./lib/riot-control":2,"./stores/doctor":4,"./stores/doctors":5,"./stores/map":6,"./tags/app.tag":7,"./tags/doctor.tag":8,"./tags/map.tag":9,"./tags/splash.tag":10,"./tags/tab-bar.tag":11,"riot":1}],4:[function(require,module,exports){
var riot = require('riot');

module.exports = Doctor;

function Doctor () {
    if (!(this instanceof Doctor)) return new Doctor();

    riot.observable(this);

    var self = this;

    self.doctor = null;

    self.on('doctorInit', function (dr) {
        self.doctor = dr;
        self.trigger('doctorChanged', self.doctor);
    });

    self.on('doctorDismiss', function () {
        self.doctor = null;
        self.trigger('doctorChanged', self.doctor);
    });
};

},{"riot":1}],5:[function(require,module,exports){
var riot = require('riot');

module.exports = Doctors;

function Doctors () {
    if (!(this instanceof Doctors)) return new Doctors();

    riot.observable(this);

    var self = this;
    self.doctors = [];

    self.on('doctorsListInit', function() {
        var Doctor = Parse.Object.extend("doctor");
        var dr = new Doctor();
        var query = new Parse.Query(Doctor);
        query.find({
            success: function(results) {
                for (var i = 0; i < results.length; i++) {
                    var dr = results[i];
                    self.doctors.push({
                        objectId: dr.get('objectId'),
                        name: dr.get('name'),
                        rating: dr.get('rating'),
                        drugs: dr.get('drugs'),
                        instructions: dr.get('instructions'),
                        avatar: dr.get('avatar'),
                        cover: dr.get('cover'),
                        comment1: dr.get('Comment_1'),
                        comment2: dr.get('Comment_2'),
                        comment3: dr.get('Comment_3'),
                        profileNumber: dr.get('Profile_Number'),
                        incarcerated: dr.get('Incarcerated')
                    });
                }
                self.trigger('doctorsListChanged', self.doctors);
            },
            error: function(error) {
                alert("Error: " + error.code + " " + error.message);
            }
        });

        self.trigger('doctorsListChanged', self.doctors);

        self.on('desperateDoctor', function () {
            var doctor = self.doctors.filter(function (d) {
                return d.profileNumber === '4';
            })[0];

            if (typeof doctor === 'undefined') return;

            self.trigger('doctorChanged', doctor);
        });
    });
};

},{"riot":1}],6:[function(require,module,exports){
var riot = require('riot');

module.exports = Map;

function Map () {
    if (!(this instanceof Map)) return new Map();

    riot.observable(this);

    var self = this;

    self.filter = null;

    self.on('filterMap', function (filter) {
        self.filter = filter;
        self.trigger('mapFilterChanged', self.filter);
    });
};

},{"riot":1}],7:[function(require,module,exports){
var riot = require('riot');
riot.tag('dwm-app', '<dwm-splash></dwm-splash> <dwm-map></dwm-map> <dwm-tab-bar></dwm-tab-bar> <dwm-doctor></dwm-doctor>', function(opts) {

    var riotControl = require('../lib/riot-control');

    var self = this;

    self.on('mount', function() {
        setTimeout(function () {
            console.log('app loaded');
            riotControl.trigger('appLoaded');
            riotControl.trigger('doctorsListInit');
        }, 2000);
    });

});

},{"../lib/riot-control":2,"riot":1}],8:[function(require,module,exports){
var riot = require('riot');
riot.tag('dwm-doctor', '<div class="doctor-view { \'is-hidden\': isHidden }"> <div class="modal-box { \'is-hidden\': !showModal }"> <div class="modal-header" style="background-image: url({ doctor.cover })"> <div class="modal-avatar" style="background-image: url({ doctor.avatar })"></div> <div class="doctor-info"> <span class="doctor-name">{ doctor.name }</span> </div> </div> <div class="modal-body"> <ul> <li>Drugs: { doctor.drugs }</li> <li>Rating: { doctor.rating }</li> </ul> <div class="modal-highlight"> { doctor.instructions } </div> <div class="doctor-reviews"> <p if="{doctor.comment1}">{ doctor.comment1 }</p> <p if="{doctor.comment2}">{ doctor.comment2 }</p> </div> </div> <button class="booking-btn { \'btn-success\': isBooked }" onclick="{ book }"> <span if="{ !isBooked }"> { typeof doctor.incarcerated !== \'undefined\' ? \'Donate to Legal Fund\' : \'Book Appointment\' } </span> <span if="{ isBooked }"> Chilllll! 👍 </span> </button> </div> <div class="modal-overlay" onclick="{ dismiss }"></div> </div>', function(opts) {

    var riotControl = require('../lib/riot-control');

    var self = this;

    self.isHidden = true;
    self.showModal = false;
    self.isBooked = false;
    self.doctor = {};

    riotControl.on('doctorChanged', function (doctor) {
        console.log('doctor changed');
        if (doctor === null) {
            self.showModal = false;
            self.update();

            setTimeout(function () {
                self.isHidden = true;
                self.doctor = {};
                self.isBooked = false;
                self.update();
            }, 80);

            return;
        }

        self.isHidden = false;
        self.doctor = doctor;
        if (self.doctor.profileNumber === '4') self.isBooked = true;
        self.update();
        setTimeout(function () {
            self.showModal = true;
            self.update();
        }, 20);
    });

    this.dismiss = function(e) {
        riotControl.trigger('doctorDismiss');
    }.bind(this);

    this.book = function(e) {
        self.isBooked = true;
        self.update();
    }.bind(this);

});

},{"../lib/riot-control":2,"riot":1}],9:[function(require,module,exports){
var riot = require('riot');
riot.tag('dwm-map', '<div class="map-view { \'is-hidden\': isHidden }"> <div id="map-container"></div> </div>', function(opts) {

    var MAPBOX_ID = 'drkchd7.l5afb5b5';
    var MAPBOX_ACCESS_TOKEN = 'pk.eyJ1IjoiZHJrY2hkNyIsImEiOiJReEVFQjhZIn0.sEf0nefefS_fxgRl8VfmWw';

    var riotControl = require('../lib/riot-control');

    var self = this;

    self.doctors = [];

    self.isHidden = true;

    riotControl.on('doctorsListChanged', function (doctors) {
        self.isHidden = false;
        self.doctors = doctors;





        self.update();
    });

    riotControl.on('mapFilterChanged', function (filter) {
        console.log(filter);
    });

    self.on('mount', function () {
        self.map = L.mapbox.map(self['map-container'], MAPBOX_ID, {
            accessToken: MAPBOX_ACCESS_TOKEN
        });

        var geocode = L.mapbox.geocoder('mapbox.places', {
            accessToken: MAPBOX_ACCESS_TOKEN
        });

        geocode.query('San Francisco, CA', function (err, result) {
            self.map.setView([result.latlng[0], result.latlng[1]], 12);
        });

        self.map.eachLayer(function (layer) {
            layer.on('click', function (e) {
                e.layer.closePopup();

                var id = e.layer.feature.properties.title;

                var doctor = self.doctors.filter(function (d) {
                    return d.profileNumber === id;
                })[0];

                if (typeof doctor === 'undefined') return;

                riotControl.trigger('doctorInit', doctor);
            });
        })
    });

});

},{"../lib/riot-control":2,"riot":1}],10:[function(require,module,exports){
var riot = require('riot');
riot.tag('dwm-splash', '<div class="splash-view { \'is-hidden\': isHidden }"> <h1>Doctors Without Morals</h1> <p> this will stay up for 2 seconds and then the map view will load. </p> </div>', function(opts) {

    var riotControl = require('../lib/riot-control');

    var self = this;

    self.isHidden = false;

    riotControl.on('doctorsListChanged', function (doctors) {
        console.log('list changed');
        self.isHidden = true;
        self.update();
    });

});

},{"../lib/riot-control":2,"riot":1}],11:[function(require,module,exports){
var riot = require('riot');
riot.tag('dwm-tab-bar', '<div class="tab-bar-view { \'is-hidden\': isHidden }"> <div class="tab-nav"> <div data-filter="herb" onclick="{ tab }"> 🌿 </div> <div data-filter="pills" onclick="{ tab }"> 💊 </div> <div data-filter="yikes" onclick="{ tab }"> 💉 </div> <div data-filter="lucky" onclick="{ tab }"> 🚀 </div> <div data-filter="desperate" onclick="{ tab }"> 🔪 </div> </div> </div>', function(opts) {

    var riotControl = require('../lib/riot-control');

    var self = this;

    self.isHidden = true;

    riotControl.on('doctorsListChanged', function () {
        self.isHidden = false;
        self.update();
    });

    this.tab = function(e) {
        var filter = e.target.dataset.filter;
        riotControl.trigger('filterMap', filter);

        if (filter === 'desperate') riotControl.trigger('desperateDoctor');
    }.bind(this);

});

},{"../lib/riot-control":2,"riot":1}]},{},[3]);
