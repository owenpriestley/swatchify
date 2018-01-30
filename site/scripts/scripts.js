(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){

/**
 * Expose `Emitter`.
 */

if (typeof module !== 'undefined') {
  module.exports = Emitter;
}

/**
 * Initialize a new `Emitter`.
 *
 * @api public
 */

function Emitter(obj) {
  if (obj) return mixin(obj);
};

/**
 * Mixin the emitter properties.
 *
 * @param {Object} obj
 * @return {Object}
 * @api private
 */

function mixin(obj) {
  for (var key in Emitter.prototype) {
    obj[key] = Emitter.prototype[key];
  }
  return obj;
}

/**
 * Listen on the given `event` with `fn`.
 *
 * @param {String} event
 * @param {Function} fn
 * @return {Emitter}
 * @api public
 */

Emitter.prototype.on =
Emitter.prototype.addEventListener = function(event, fn){
  this._callbacks = this._callbacks || {};
  (this._callbacks['$' + event] = this._callbacks['$' + event] || [])
    .push(fn);
  return this;
};

/**
 * Adds an `event` listener that will be invoked a single
 * time then automatically removed.
 *
 * @param {String} event
 * @param {Function} fn
 * @return {Emitter}
 * @api public
 */

Emitter.prototype.once = function(event, fn){
  function on() {
    this.off(event, on);
    fn.apply(this, arguments);
  }

  on.fn = fn;
  this.on(event, on);
  return this;
};

/**
 * Remove the given callback for `event` or all
 * registered callbacks.
 *
 * @param {String} event
 * @param {Function} fn
 * @return {Emitter}
 * @api public
 */

Emitter.prototype.off =
Emitter.prototype.removeListener =
Emitter.prototype.removeAllListeners =
Emitter.prototype.removeEventListener = function(event, fn){
  this._callbacks = this._callbacks || {};

  // all
  if (0 == arguments.length) {
    this._callbacks = {};
    return this;
  }

  // specific event
  var callbacks = this._callbacks['$' + event];
  if (!callbacks) return this;

  // remove all handlers
  if (1 == arguments.length) {
    delete this._callbacks['$' + event];
    return this;
  }

  // remove specific handler
  var cb;
  for (var i = 0; i < callbacks.length; i++) {
    cb = callbacks[i];
    if (cb === fn || cb.fn === fn) {
      callbacks.splice(i, 1);
      break;
    }
  }
  return this;
};

/**
 * Emit `event` with the given args.
 *
 * @param {String} event
 * @param {Mixed} ...
 * @return {Emitter}
 */

Emitter.prototype.emit = function(event){
  this._callbacks = this._callbacks || {};
  var args = [].slice.call(arguments, 1)
    , callbacks = this._callbacks['$' + event];

  if (callbacks) {
    callbacks = callbacks.slice(0);
    for (var i = 0, len = callbacks.length; i < len; ++i) {
      callbacks[i].apply(this, args);
    }
  }

  return this;
};

/**
 * Return array of callbacks for `event`.
 *
 * @param {String} event
 * @return {Array}
 * @api public
 */

Emitter.prototype.listeners = function(event){
  this._callbacks = this._callbacks || {};
  return this._callbacks['$' + event] || [];
};

/**
 * Check if this emitter has `event` handlers.
 *
 * @param {String} event
 * @return {Boolean}
 * @api public
 */

Emitter.prototype.hasListeners = function(event){
  return !! this.listeners(event).length;
};

},{}],2:[function(require,module,exports){
/*
 *jsonQ.js v 1.1.0
 *Author: Sudhanshu Yadav
 *s-yadav.github.com
 *Copyright (c) 2013 - 2016 Sudhanshu Yadav.
 *MIT licenses
 */
//initialize jsonQ
;(function(factory) {
    /** support UMD ***/
    var global = Function('return this')() || (42, eval)('this');
    if (typeof define === "function" && define.amd) {
        define(["jsonq"], function($) {
            return (global.jsonQ = factory());
        });
    } else if (typeof module === "object" && module.exports) {
        module.exports = factory();

    } else {
        global.jsonQ = factory();
    }
}(function(undefined) {

    var jsonQ = function(json) {
        //return a jsonQ object
        return new jsonQ.fn.init(json);
    },
        //plugin variable and methods
        error = function(msg) {
            throw msg;
        },
        stringify = JSON.stringify,
        parse = JSON.parse;

    //global settings
    jsonQ.settings = {
        sort: {
            "order": "ASC",
            "logic": function(val) {
                return val;
            },
            "caseIgnore": true,
            "allLevel": true //to sort all level if true and if false only lowest level
        }
    };

    /*****private functions for internal use only*******/

    //to check weather path b is subset of path a
    function matchPath(a, b) {
        var regex = new RegExp('^' + a.join('~~'), 'i');
        return regex.test(b.join('~~'));
    }

    //function to create new format
    function newFormat(option) {
        //parameter change
        var keyAdded = option.keyAdded || [],
            json = option.json,
            path = option.path,
            newJson = option.newJson;
        //add to new json

        jsonQ.each(json, function(k, val) {
            var lvlpath = path ? JSON.parse(JSON.stringify(path)) : [];
            lvlpath.push(k);

            //to add a new direct access for each key in json so we get the path of that key easily
            if (objType(json) == 'object') {
                if (keyAdded.indexOf(k) == -1) {
                    keyAdded.push(k);
                    newJson.jsonQ_path[k] = [];
                }

                newJson.jsonQ_path[k].push({
                    path: lvlpath
                });
            }
            //if value is json or array go to further level
            var type = objType(val);
            if (type == 'object' || type == 'array') {
                newFormat({
                    'json': val,
                    'newJson': newJson,
                    'path': lvlpath,
                    'keyAdded': keyAdded
                });
            }


        });

        return newJson;
    }

    //traverse functions
    var tFunc = {
        //search on top level
        topLevel: function(option) {
            var current = this.jsonQ_current,
                newObj = this.cloneObj(jsonQ()),
                newCurrent = newObj.jsonQ_current = [],
                prevPathStr = '',
                key = option.key,
                method = option.method;

            for (var i = 0, ln = current.length; i < ln; i++) {
                var pathC = current[i].path,
                    pathStr,
                    outofBound = false,
                    parPath = pathC.concat([]);

                //to run callback to apply top traverse logic
                if (method == 'parent') {
                    if (parPath.length === 0) {
                        outofBound = true;
                    } else {
                        parPath.pop();
                    }
                } else {
                    var keyIndex = parPath.lastIndexOf(key);
                    if (keyIndex == -1) {
                        outofBound = true;
                    } else {
                        parPath = parPath.slice(0, keyIndex + 1);
                    }
                }

                pathStr = JSON.stringify(parPath);

                if (prevPathStr != pathStr && !outofBound) {
                    newCurrent.push({
                        path: parPath
                    });
                }

                prevPathStr = pathStr;
            }

            //set other defination variables
            newObj.length = newCurrent.length;
            //to add selector
            newObj.selector.push({
                method: method,
                key: key
            });

            return newObj;
        },
        //travese which have qualifiers mainly on bottom and sibling method
        qualTrv: function(option) {
            var current = this.jsonQ_current,
                newObj = this.cloneObj(jsonQ()),
                newCurrent = newObj.jsonQ_current = [],
                pathObj = this.jsonQ_path,

                //key element (an array of paths with following key)
                key = option.key,
                //dont work with original object clone it and if undefined than make as empty array
                elm = jsonQ.clone(pathObj[key]) || [],
                //qualifier
                qualifier = option.qualifier,
                qType = objType(qualifier),
                //travese method
                method = option.method,
                find = method == "find" ? true : false;

            for (var i = 0, ln = current.length; i < ln; i++) {
                var pathC = current[i].path,
                    pathCTemp = [],
                    found = false;


                if (!find) {
                    //if it is top level continue the loop. This case comes when we do sibling method called on initial object
                    if (pathC.length === 0) {
                        continue;
                    }

                    pathCTemp = pathC.concat([]);
                    pathCTemp.pop();
                }

                //make a loop on element to match the current path and element path
                for (var j = 0; j < elm.length; j++) {
                    var pathE = elm[j].path,
                        condition;
                    if (find) {
                        condition = matchPath(pathC, pathE);
                    } else {
                        var pathETemp = pathE.concat([]);
                        //to pop last element
                        pathETemp.pop();
                        condition = pathCTemp.join() == pathETemp.join();
                    }

                    if (condition) {
                        //code to check qualifier need to be written this on is only when quantifier when it is function in other case it will be applied on last

                        var qTest = tFunc.qTest.call(this, qType, qualifier, pathE, newCurrent);

                        if (qTest) {
                            //to remove element which is already added
                            elm.splice(j, 1);
                            j--;
                        }

                        //make found flag true
                        found = true;
                    }
                    //break if path doesent match in next sequence and for one element is already there.
                    else if (found) {
                        break;
                    }
                }
            }

            //to apply qualifier if it is string . its mainly for array kind of qualifier
            if (qType == "string") {
                newObj = this.filter.call(newObj, qualifier);
            }

            //set other defination variables
            newObj.length = newObj.jsonQ_current.length;

            //to add selector
            newObj.selector.push({
                method: method,
                key: key,
                qualifier: qualifier
            });


            return newObj;
        },
        qTest: function(qType, qualifier, path, array) {
            var qTest = qType == 'function' ? qualifier.call(this.pathValue(path)) : qType == 'object' ? jsonQ.checkKeyValue(this.pathValue(path), qualifier) : true;

            //if it is key value pair than also we can check here.
            if (qTest) {
                array.push({
                    path: path
                });
            }
            return qTest;
        }

    };

    //functions involved on sorting
    var sortFunc = {
        baseConv: function(type, val, settings) {
            if (type == 'string') {
                if (settings.caseIgnore) {
                    return val.toLowerCase();
                }
            } else if (type == 'array') {
                return val.join();
            } else if (type == 'object') {
                return stringify(jsonQ.order(val));
            }

            return val;
        },
        sortAry: function(array, logic, settings) {
            array.sort(function(a, b) {
                var compA = logic(a);
                var compB = logic(b);
                return (compA < compB) ? -1 : (compA > compB) ? 1 : 0;
            });

            //to display on decending order
            if (settings.order.toLowerCase() == "desc") {
                array.reverse();
            }
            return array;
        }
    };

    jsonQ.fn = jsonQ.prototype = {
        init: function(json) {
            var type;

            //to return if no parameter is passed

            if (!json) return this;

            type = objType(json);
            if (type == 'string') {
                try {
                    json = JSON.parse(json);
                } catch (e) {
                    error('Not a valid json string.');
                }
            } else if (type != 'object' && type != 'array') {
                error('Not a valid json object.');
                return json;
            }

            //to set initial values
            this.jsonQ_root = json;
            this.jsonQ_path = {};
            this.jsonQ_current = [{
                path: []
            }];

            //to get other keys
            newFormat({
                json: json,
                newJson: this,
                refresh: true
            });

            //set jsonQ defination variables
            this.length = this.jsonQ_current.length;
            this.selector = [];

            return this;

        },

        //to get value at specific path from root
        pathValue: function(path) {
            return jsonQ.pathValue(this.jsonQ_root, path);
        },
        setPathValue: function(path, value) {
            jsonQ.setPathValue(this.jsonQ_root, path, value);
            return this;
        },
        clone: function() {
            return parse(stringify(this.jsonQ_current));
        },
        cloneObj: function(newObj) {
            var obj = this;

            newObj = newObj || {};

            jsonQ.each(obj, function(k, v) {
                newObj[k] = v;
            });

            //to make a different copy of selector otherwise selector will be same on all object.
            newObj.selector = jsonQ.merge([], newObj.selector);

            return newObj;
        },
        value: function(value, clone) {
            var json = this.jsonQ_current;


            clone = clone === false ? false : true;

            //to return value if called as getter (ie value is undefined)
            if (!value) {
                var newArray = [];
                //create a new set of values
                this.each(function(idx, path, val) {
                    newArray.push(val);
                });

                return newArray;
            }
            //value as setter. value can be the exact value which you want to set or can be a callback. In callback pathvalue will be first argument.
            else {
                var type = objType(value);
                for (var i = 0, ln = json.length; i < ln; i++) {
                    var path = json[i].path,
                        val;
                    if (type == 'function') {
                        var prevVal = this.pathValue(path);
                        val = clone ? jsonQ.clone(value(prevVal)) : value(prevVal);
                    } else {
                        val = clone ? jsonQ.clone(value) : value;
                    }
                    //to set value on json
                    this.setPathValue(path, val);
                }

                return this;
            }

        },
        //clone parameter is for if you want to append any object so append exact object or create clone of object and append
        //to append in last of values of current
        append: function(valObj, clone) {
            return this.appendAt("last", valObj, clone);
        },
        //to append in first of values of current
        prepend: function(valObj, clone) {
            return this.appendAt("first", valObj, clone);
        },
        //to append at specific index of values of current
        appendAt: function(index, valObj, clone) {
            var current = this.jsonQ_current;
            //return if incorrect index is given
            if (isNaN(index) && index != "first" && index != "last") {
                error(index + 'is not a valid index.');
                return this;
            }

            for (var i = 0, ln = current.length; i < ln; i++) {
                var pathC = current[i].path.concat([]),
                    lastKey = pathC.pop(),
                    parRef = this.pathValue(pathC),
                    type = objType(parRef[lastKey]),
                    objLn = parRef[lastKey].length;


                //to limit index
                var idx = index < 0 || index == "first" ? 0 : index > objLn || index == "last" ? objLn : index;


                //if array push
                if (type == 'array') {
                    valObj = clone ? jsonQ.clone(valObj) : valObj;

                    parRef[lastKey].splice(idx, 0, valObj);
                }

                //if string concatinate , if number add
                else if (type == 'string') {
                    var str = parRef[lastKey];
                    parRef[lastKey] = str.substring(0, idx) + valObj + str.substring(idx, objLn);
                }


            }
            return this;

        },
        filter: function(qualifier) {
            var current = this.jsonQ_current,
                newObj = this.cloneObj(jsonQ()),
                newCurrent = newObj.jsonQ_current = [],
                qType = objType(qualifier);

            if (!qualifier) return this;

            for (var i = 0, ln = current.length; i < ln; i++) {
                var pathC = current[i].path;

                //code to check qualifier need to be written this on is only when quantifier when it is function or json in other case it will be applied on last
                tFunc.qTest.call(this, qType, qualifier, pathC, newCurrent);
            }

            //to apply qualifier if it is string . its mainly for array kind of qualifier
            if (qType == 'string') {
                //to check string for nth and eq
                var regex = /(nth|eq)\((.+)\)/,
                    matched = regex.exec(qualifier);
                if (matched) {
                    newCurrent = jsonQ.nthElm(current, matched[2], true);
                } else {
                    newCurrent = jsonQ.nthElm(current, qualifier, true);
                }
                //to store it back on newObj
                newObj.jsonQ_current = newCurrent;
            }

            //set other defination variables
            newObj.length = newCurrent.length;

            //to add selector
            newObj.selector.push({
                method: 'filter',
                qualifier: qualifier
            });

            return newObj;

        },
        //first argument is key in which you want to search, second key is qualifier of it.
        find: function(key, qualifier) {
            return tFunc.qualTrv.call(this, {
                method: "find",
                key: key,
                qualifier: qualifier
            });
        },
        sibling: function(key, qualifier) {
            return tFunc.qualTrv.call(this, {
                method: "sibling",
                key: key,
                qualifier: qualifier
            });
        },
        parent: function() {
            return tFunc.topLevel.call(this, {
                method: "parent"
            });
        },
        closest: function(key) {
            return tFunc.topLevel.call(this, {
                method: "closest",
                key: key
            });
        },
        //return path of first element found through selector
        path: function() {
            return this.jsonQ_current[0].path;
        },
        //some time we can only return the value of the first element in current
        firstElm: function() {
            return this.pathValue(this.jsonQ_current[0].path);
        },
        lastElm: function() {
            return this.pathValue(this.jsonQ_current[this.length - 1].path);
        },
        nthElm: function(pattern, arrayReturn) {
            return jsonQ.nthElm(this.value(), pattern, arrayReturn);
        },
        index: function(elm, isQualifier) {
            return jsonQ.index(this.value(), elm, isQualifier);
        },
        createXML: function() {
            return jsonQ.createXML(this.value());
        },


        //function to sort array objects
        sort: function(key, settings) {
            //merge global setting with local setting
            settings = jsonQ.merge({}, jsonQ.settings.sort, settings);
            var jobj = this.find(key),
                current = jobj.clone(),
                sortStack = [],
                i, ln,
                sortedPath = [],
                type = objType(jobj.pathValue(current[0].path)),
                //function to get value which is an array from pathKey traversing from right.
                getClosestArray = function(key) {
                    while (key.length !== 0) {
                        var lastKey = key.pop();
                        if (!isNaN(lastKey)) {
                            var val = jobj.pathValue(key);
                            if (objType(val) == 'array') {
                                return val;
                            }
                        }
                    }
                    return null;
                };

            //initialize sort stack
            for (i = 0, ln = current.length; i < ln; i++) {
                sortStack.push({
                    pathHolder: current[i].path.concat([]),
                    current: current[i].path.concat([])
                });
            }

            //to run the loop untill all ar sorted
            var alpha = 0,

                // function to remove element if sorting is done for that path
                spliceElm = function(i) {
                    sortStack.splice(i, 1);
                    return --i;
                };
            while (sortStack.length !== 0) {
                alpha++;
                for (i = 0; i < sortStack.length; i++) {
                    var cur = sortStack[i].current,
                        pH = sortStack[i].pathHolder,
                        //to get the closest array in the current path. This will also change value of current path variable.
                        ary = getClosestArray(cur),
                        pathStr = cur.join();



                    //to remove from sort stack if no array is left on key or if that is already sorted
                    if (cur.length === 0 || sortedPath.indexOf(pathStr) != -1) {
                        i = spliceElm(i);
                    }

                    //to sort if array found
                    else {
                        //logic path is path which we add in on condition to find the element value according to which we are sorting
                        var logicPath = pH.slice(cur.length + 1, pH.length),

                            logic = function(a) {
                                var val = jsonQ.pathValue(a, logicPath);

                                //to convert val to be compared
                                val = sortFunc.baseConv(type, val, settings);
                                return settings.logic(val);
                            };

                        //to sort the root json
                        sortFunc.sortAry(ary, logic, settings);

                        //if multilevel sort is true
                        if (settings.allLevel) {
                            //to maintain the path which is already sorted and change pathHolder to point first element of sorted array
                            pH[cur.length] = 0;
                            sortedPath.push(pathStr);
                        } else {
                            //remove sorted path
                            i = spliceElm(i);
                        }
                    }



                }
            }


            return jsonQ(jobj.jsonQ_root).find(key);
        },
        //to make loop on current
        each: function(callback) {
            var current = this.jsonQ_current;
            for (var i = 0, ln = current.length; i < ln; i++) {
                callback(i, current[i].path, this.pathValue(current[i].path));
            }
            return this;
        },
        //to return unique value of current
        unique: function() {
            return jsonQ.unique(this.value());
        },
        refresh: function() {
            var selector = this.selector;

            var jObj = jsonQ(this.jsonQ_root);
            for (var i = 0, ln = selector.length; i < ln; i++) {
                var curSel = selector[i],
                    args = [];

                if (curSel.key) args.push(curSel.key);
                if (curSel.qualifier) args.push(curSel.qualifier);

                jObj = jObj[curSel.method].apply(jObj, args);
            }

            //to store value back on this
            this.cloneObj.call(jObj, this);

            return this;
        },
        prettify: function(htmlReturn) {
            return jsonQ.prettify(this.value(), htmlReturn);
        }
    };

    //super exposed functions
    //jsonQ each
    jsonQ.each = function(json, callback) {
        for (var key in json) {
            if (json.hasOwnProperty(key)) {
                callback(key, json[key]);
            }
        }
    };

    //to find object type of any object
    var objType = jsonQ.objType = (function() {
        var map = {
            '[object Array]': 'array',
            '[object Object]': 'object',
            '[object String]': 'string',
            '[object Number]': 'number',
            '[object Boolean]': 'boolean',
            '[object Null]': 'null',
            '[object Function]': 'function'
        };

        return function(obj) {
            var type = Object.prototype.toString.call(obj);
            return map[type];
        };
    }());

    //to merge all the objects in argument to the first argument.
    //idea taken by jquery extend.

    //deep parameter is required if a person want to merge a json in all level recursively
    jsonQ.merge = function() {
        var arg = arguments,
            deepType = objType(arg[0]),
            i = 1,
            ln = arg.length,
            deep = false,
            target = arg[0];
        if (ln === 0 || (deepType == "boolean" && ln == 1)) {
            return;
        }
        //to get the target object where all merge will be done
        if (deepType == "boolean") {
            target = arg[1];
            i = 2;
            deep = arg[0];
        }

        //callback function to recursiveliy merge
        var eachCallback = function(k, v) {
            var type = objType(v),
                tarType = objType(target[k]);

            if (deep && (type == "array" || type == "object")) {
                target[k] = type == tarType && (tarType == "array" || tarType == "object") ? target[k] : type == "array" ? [] : {};

                //to merge recursively
                jsonQ.merge(deep, target[k], v);
            } else {
                target[k] = v;
            }
        };

        for (; i < ln; i++) {

            jsonQ.each(arg[i], eachCallback);
        }
        return target;
    };

    jsonQ.merge(jsonQ, {
        sort: function(ary, settings) {
            settings = jsonQ.merge({}, jsonQ.settings.sort, settings);

            if (objType(ary) != 'array') {
                error('Only array is allowed to sort');
                return;
            }

            var convLogic = function(val) {

                var type = objType(val);
                val = sortFunc.baseConv(type, val, settings);

                return settings.logic(val);
            };

            //to return sorted array
            return sortFunc.sortAry(ary, convLogic, settings);
        },
        order: function(json) {

            //to return if json type is not an object type
            if (typeof json != 'object') {
                return json;
            }

            var logic = function(val) {
                //if a json is an array alike and keys are numbers as string type ("1","2" instad of 1,2) convert them to integer.
                if (!isNaN(val)) val = parseInt(val);
                return val;
            },

                func = function(jsonVal) {
                    var jsonType = objType(jsonVal),
                        keys = Object.keys(jsonVal);

                    if (jsonType == 'object') {
                        keys.sort(function(a, b) {
                            var compA = logic(a);
                            var compB = logic(b);
                            return (compA < compB) ? -1 : (compA > compB) ? 1 : 0;
                        });
                    }
                    //to order
                    for (var i = 0, ln = keys.length; i < ln; i++) {
                        var key = keys[i],
                            val = jsonVal[key],
                            type = objType(val);

                        //to go to next level if value is json type
                        if (type == 'object' || type == "array") {
                            func(val);
                        }

                        //to order
                        if (jsonType == 'object') {
                            delete jsonVal[key];
                            jsonVal[key] = val;
                        }
                    }
                };

            //initialize
            func(json);

            return json;
        },
        clone: function(json) {
            var type = objType(json);
            return type == 'object' || type == 'array' ? parse(stringify(json)) : json;
        },
        //to find index of an element in set of element
        index: function(list, elm, isQualifier) {
            var type = objType(elm),
                ln = list.length,
                //check that elm is a object or not that is taken by refrence
                refObj = type == "object" || type == "array" || type == "function" ? true : false;


            //if elm is a function consider it as a qualifier
            if (type == "function") {
                isQualifier = true;
            }

            if (refObj && !isQualifier) {
                //convert object to string so that they can be compared.
                var jsonStr = stringify(jsonQ.order(elm));
            }

            for (var i = 0; i < ln; i++) {
                var cur = list[i];
                if (refObj) {
                    var lType = objType(cur);
                    if (lType != type && !isQualifier) continue;

                    //to compare
                    if (!isQualifier) {
                        if (stringify(jsonQ.order(cur)) == jsonStr) {
                            return i;
                        }

                        //if element is a qualifier
                    } else {
                        var test;
                        if (type == 'function') {
                            test = elm.call(cur);
                        } else if (type == "object" && lType == "object") {
                            test = jsonQ.checkKeyValue(cur, elm);
                        } else if (lType == "array") {
                            if (type == "array") {
                                for (var j = 0, elmLn = elm.length; j < elmLn; j++) {
                                    test = jsonQ.index(cur, elm[j]) != -1;
                                    if (!test) break;
                                }
                            } else {
                                test = jsonQ.index(cur, elm) != -1;
                            }
                        }

                        //return index if it passes the test
                        if (test) return i;

                    }

                } else if (elm == cur) {
                    return i;
                }
            }
            return -1;
        },
        //to check an array contains a specfic element or not . an element can be aaray or json.
        contains: function(array, elm, isQualifier) {
            return jsonQ.index(array, elm, isQualifier) != -1;
        },
        //function to check an json object contains a set of key value pair or not
        checkKeyValue: function(json, keyVal) {
            for (var k in keyVal) {
                if (keyVal.hasOwnProperty(k))
                    if (!jsonQ.identical(keyVal[k], json[k])) return false;
            }
            return true;
        },

        nthElm: function(array, arg, aryRetrn) {
            var result;
            if (array[arg]) {
                result = array[arg];
            } else if (arg == 'last') {
                result = array[array.length - 1];
            } else if (arg == 'first') {
                result = array[0];
            } else if (arg == 'random') {
                var rand = Math.floor(Math.random() * array.length);
                result = array[rand];
            } else if (arg == 'even') {
                result = jsonQ.nthElm(array, '2n');
            } else if (arg == 'odd') {
                result = jsonQ.nthElm(array, '2n+1');
            }
            //to return sequence
            else {
                try {
                    var newArray = [],
                        ln = array.length;

                    if (!arg.match(/^[0-9n*+-\/]+$/)) throw ('');

                    arg = arg.replace(/([0-9])n/g, function($0, $1) {
                        return $1 ? $1 + '*n' : $0;
                    });



                    for (var n = 0; n < ln; n++) {
                        var index = eval(arg);
                        if (index > ln - 1) {
                            break;
                        }
                        newArray.push(array[index]);
                    }
                    result = newArray;
                } catch (error) {
                    //if no correct option return whole array
                    result = array;
                }
            }
            result = result || array;
            return objType(result) != 'array' && aryRetrn ? [result] : result;
        },
        prettify: function(obj, htmlReturn) {

            if (typeof obj != 'object') {
                throw ('Only valid json object is allowed.');
            }

            //to return prtified. If htmlReturn false add 3 spaces else add &nbsp;
            if (htmlReturn) {
                return JSON.stringify(obj, null, '\t').replace(/\n/g, '</br>').replace(/\t/g, '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;');
            }
            return JSON.stringify(obj, null, 3);

        },

        //need to modify it little bit
        //By Chris O'Brien, prettycode.org
        identical: function(a, b) {

            function sort(object) {
                if (typeof object !== "object" || object === null) {
                    return object;
                }

                return Object.keys(object).sort().map(function(key) {
                    return {
                        key: key,
                        value: sort(object[key])
                    };
                });
            }

            return JSON.stringify(sort(a)) === JSON.stringify(sort(b));
        },
        //Return the union of arrays in new array
        union: function() {
            var arg = arguments,
                target = [],
                ln = arg.length;

            for (var i = 0; i < ln; i++) {
                var aryLn = arg[i].length;
                for (var j = 0; j < aryLn; j++) {
                    var itm = arg[i][j];
                    if (jsonQ.index(target, itm) == -1) {
                        target.push(itm);
                    }
                }

            }
            return target;
        },
        //return intersection of array in new array
        intersection: function() {
            var arg = arguments,
                target = [],
                flag,
                ln = arg.length;

            if (ln == 1) {
                target = arg[0];
            } else {
                for (var j = 0, aryLn = arg[0].length; j < aryLn; j++) {
                    var elm = arg[0][j];
                    flag = 1;
                    for (var i = 1; i < ln; i++) {
                        if (jsonQ.index(arg[i], elm) == -1) {
                            flag = 0;
                            break;
                        }
                    }
                    if (flag == 1) {
                        target.push(elm);
                    }

                }
            }
            return target;
        },
        //suffle the order of elements in a array. returns the same array.
        suffle: function(array) {
            for (var i = 1, ln = array.length; i < ln; i++) {
                var j = Math.floor(Math.random() * (i + 1)),
                    tmp = array[i];
                array[i] = array[j];
                array[j] = tmp;
            }

            return array;

        },
        //return a new array list of unuiqe(distinct) elements of an array
        unique: function(array) {
            var ln = array.length,
                newAry = [];
            for (var i = 0; i < ln; i++) {
                if (jsonQ.index(newAry, array[i]) == -1) {
                    newAry.push(array[i]);
                }
            }
            return newAry;
        },
        //to get value at specific path in a json
        pathValue: function(json, path) {
            var i = 0,

                ln = path.length;

            if (json === null) {
                return null;
            }
            while (i < ln) {
                if (json[path[i]] === null) {
                    json = null;
                    return;
                } else {
                    json = json[path[i]];
                }
                i = i + 1;
            }
            return json;
        },
        setPathValue: function(json, path, value) {
            var i = 0,
                tempJson = json,
                ln = path.length;
            if (json === null) {
                return null;
            }
            while (i < ln) {
                if (typeof tempJson[path[i]] != 'object') {
                    tempJson[path[i]] = objType(path[i + 1]) == 'number' ? [] : {};
                }
                if (i == path.length - 1) {
                    tempJson[path[i]] = value;
                }
                tempJson = tempJson[path[i]];
                i = i + 1;
            }
            return json;
        },
        createXML: function(json) {
            var jsonToXML = function(json, xmlAry) {
                xmlAry = xmlAry || [];
                var start = xmlAry.length === 0 ? true : false,
                    type = objType(json);
                if (start) {
                    xmlAry.push('<?xml version="1.0" encoding="ISO-8859-1"?><jsonXML>');
                }

                //to make loop on array or object;
                jsonQ.each(json, function(k, val) {
                    var tag = type == 'array' ? 'arrayItem' : k,
                        elmType = objType(val);
                    xmlAry.push('<' + tag + ' type="' + elmType + '">');
                    if (elmType == 'object' || elmType == 'array') {
                        jsonToXML(val, xmlAry);
                    } else {
                        xmlAry.push('<![CDATA[' + val + ']]>');

                    }
                    xmlAry.push('</' + tag + '>');
                });


                if (start) {
                    xmlAry.push('</jsonXML>');
                    return xmlAry.join('');
                } else {
                    return xmlAry;
                }

            };
            return jsonToXML(json);
        },
        //append functions

        //to append in last of values of array or string
        append: function(target, val, clone) {
            return jsonQ.appendAt(target, "last", val, clone);
        },
        //to append in first of values of array or string
        prepend: function(target, val, clone) {
            return jsonQ.appendAt(target, "first", val, clone);
        },
        //to append at specific index of values of array or string
        appendAt: function(target, index, val, clone) {

            if (isNaN(index) && index != "first" && index != "last") {
                error(index + 'is not a valid index.');
                return;
            }

            var type = objType(target),
                length = target.length;

            //to limit index
            var idx = index < 0 || index == "first" ? 0 : index > length || index == "last" ? length : index;


            //if array push
            if (type == 'array') {
                val = clone ? jsonQ.clone(val) : val;
                target.splice(idx, 0, val);
            }

            //if string concatinate , if number add
            else if (type == 'string') {
                target = target.substring(0, idx) + val + target.substring(idx, length);
            }


            return target;

        }

    });

    //to assign jsonQ prototypes to init function
    jsonQ.fn.init.prototype = jsonQ.fn;

    return jsonQ;
}));

},{}],3:[function(require,module,exports){
'use strict';

var Request = require('./base-request');

var DEFAULT_HOST = 'accounts.spotify.com',
    DEFAULT_PORT = 443,
    DEFAULT_SCHEME = 'https';

module.exports.builder = function() {
  return Request.builder()
      .withHost(DEFAULT_HOST)
      .withPort(DEFAULT_PORT)
      .withScheme(DEFAULT_SCHEME);
};
},{"./base-request":4}],4:[function(require,module,exports){
'use strict';

var Request = function(builder) {
  if (!builder) {
    throw new Error('No builder supplied to constructor');
  }

  this.host = builder.host;
  this.port = builder.port;
  this.scheme = builder.scheme;
  this.queryParameters = builder.queryParameters;
  this.bodyParameters = builder.bodyParameters;
  this.headers = builder.headers;
  this.path = builder.path;
};

Request.prototype.getHost = function() {
  return this.host;
};

Request.prototype.getPort = function() {
  return this.port;
};

Request.prototype.getScheme = function() {
  return this.scheme;
};

Request.prototype.getPath = function() {
  return this.path;
};

Request.prototype.getQueryParameters = function() {
  return this.queryParameters;
};

Request.prototype.getBodyParameters = function() {
  return this.bodyParameters;
};

Request.prototype.getHeaders = function() {
  return this.headers;
};

Request.prototype.getURI = function() {
  if (!this.scheme || !this.host || !this.port) {
    throw new Error('Missing components necessary to construct URI');
  }
  var uri = this.scheme + '://' + this.host;
  if (this.scheme === 'http' && this.port !== 80 ||
    this.scheme === 'https' && this.port !== 443) {
    uri += ':' + this.port;
  }
  if (this.path) {
    uri += this.path;
  }
  return uri;
};

Request.prototype.getURL = function() {
  var uri = this.getURI();
  if (this.getQueryParameters()) {
    return uri + this.getQueryParameterString(this.getQueryParameters());
  } else {
    return uri;
  }
};

Request.prototype.addQueryParameters = function(queryParameters) {
  for (var key in queryParameters) {
    this.addQueryParameter(key, queryParameters[key]);
  }
};

Request.prototype.addQueryParameter = function(key, value) {
  if (!this.queryParameters) {
    this.queryParameters = {};
  }
  this.queryParameters[key] = value;
};

Request.prototype.addBodyParameters = function(bodyParameters) {
  for (var key in bodyParameters) {
    this.addBodyParameter(key, bodyParameters[key]);
  }
};

Request.prototype.addBodyParameter = function(key, value) {
  if (!this.bodyParameters) {
    this.bodyParameters = {};
  }
  this.bodyParameters[key] = value;
};

Request.prototype.addHeaders = function(headers) {
  if (!this.headers) {
    this.headers = headers;
  } else {
    for (var key in headers) {
      this.headers[key] = headers[key];
    }
  }
};

Request.prototype.getQueryParameterString = function() {
  var queryParameters = this.getQueryParameters();
  if (!queryParameters) {
    return;
  }
  var queryParameterString = '?';
  var first = true;
  for (var key in queryParameters) {
    if (queryParameters.hasOwnProperty(key)) {
      if (!first) {
        queryParameterString += '&';
      } else {
        first = false;
      }
      queryParameterString += key + '=' + queryParameters[key];
    }
  }
  return queryParameterString;
};

var Builder = function() {
  var host, port, scheme, queryParameters, bodyParameters, headers, jsonBody;
};

Builder.prototype.withHost = function(host) {
  this.host = host;
  return this;
};

Builder.prototype.withPort = function(port) {
  this.port = port;
  return this;
};

Builder.prototype.withScheme = function(scheme) {
  this.scheme = scheme;
  return this;
};

Builder.prototype.withQueryParameters = function(queryParameters) {
  this.queryParameters = queryParameters;
  return this;
};

Builder.prototype.withPath = function(path) {
  this.path = path;
  return this;
};

Builder.prototype.withBodyParameters = function(bodyParameters) {
  this.bodyParameters = bodyParameters;
  return this;
};

Builder.prototype.withHeaders = function(headers) {
  this.headers = headers;
  return this;
};

Builder.prototype.build = function() {
  return new Request(this);
};

module.exports.builder = function() {
  return new Builder();
};

},{}],5:[function(require,module,exports){
module.exports = require('./spotify-web-api');

},{"./spotify-web-api":7}],6:[function(require,module,exports){
'use strict';

var superagent = require('superagent'),
    WebApiError = require('./webapi-error');

var HttpManager = {};

/* Create superagent options from the base request */
var _getParametersFromRequest = function(request) {

  var options = {};

  if (request.getQueryParameters()) {
    options.query = request.getQueryParameters();
  }

  if (request.getHeaders() &&
      request.getHeaders()['Content-Type'] === 'application/json') {
    options.data = JSON.stringify(request.getBodyParameters());
  } else if (request.getBodyParameters()) {
    options.data = request.getBodyParameters();
  }

  if (request.getHeaders()) {
    options.headers = request.getHeaders();
  }
  return options;
};

/* Create an error object from an error returned from the Web API */
var _getErrorObject = function(defaultMessage, err) {
  var errorObject;
  if (typeof err.error === 'object' && typeof err.error.message === 'string') {
    // Web API Error format
    errorObject = new WebApiError(err.error.message, err.error.status);
  } else if (typeof err.error === 'string') {
    // Authorization Error format
    /* jshint ignore:start */
    errorObject = new WebApiError(err.error + ': ' + err['error_description']);
    /* jshint ignore:end */
  } else if (typeof err === 'string') {
    // Serialized JSON error
    try {
      var parsedError = JSON.parse(err);
      errorObject = new WebApiError(parsedError.error.message, parsedError.error.status);
    } catch (err) {
      // Error not JSON formatted
    }
  }

  if(!errorObject) {
    // Unexpected format
    errorObject = new WebApiError(defaultMessage + ': ' + JSON.stringify(err));
  }

  return errorObject;
};

/* Make the request to the Web API */
HttpManager._makeRequest = function(method, options, uri, callback) {
  var req = method(uri);

  if (options.query) {
    req.query(options.query);
  }

  if (options.data && (!options.headers || options.headers['Content-Type'] !== 'application/json')) {
    req.type('form');
    req.send(options.data);
  } else if (options.data) {
    req.send(options.data);
  }

  if (options.headers) {
    req.set(options.headers);
  }

  req.end(function (err, response) {
    if (err) {
      var errorObject = _getErrorObject('Request error', {
        error: err
      });
      return callback(errorObject);
    }

    return callback(null, {
      body: response.body,
      headers: response.headers,
      statusCode: response.statusCode
    });
  });
};

/**
 * Make a HTTP GET request.
 * @param {BaseRequest} The request.
 * @param {Function} The callback function.
 */
HttpManager.get = function(request, callback) {
  var options = _getParametersFromRequest(request);
  var method = superagent.get;

  HttpManager._makeRequest(method, options, request.getURI(), callback);
};

/**
 * Make a HTTP POST request.
 * @param {BaseRequest} The request.
 * @param {Function} The callback function.
 */
HttpManager.post = function(request, callback) {

  var options = _getParametersFromRequest(request);
  var method = superagent.post;

  HttpManager._makeRequest(method, options, request.getURI(), callback);
};

/**
 * Make a HTTP DELETE request.
 * @param {BaseRequest} The request.
 * @param {Function} The callback function.
 */
HttpManager.del = function(request, callback) {

  var options = _getParametersFromRequest(request);
  var method = superagent.del;

  HttpManager._makeRequest(method, options, request.getURI(), callback);
};

/**
 * Make a HTTP PUT request.
 * @param {BaseRequest} The request.
 * @param {Function} The callback function.
 */
HttpManager.put = function(request, callback) {

  var options = _getParametersFromRequest(request);
  var method = superagent.put;

  HttpManager._makeRequest(method, options, request.getURI(), callback);
};

module.exports = HttpManager;

},{"./webapi-error":8,"superagent":10}],7:[function(require,module,exports){
'use strict';

var AuthenticationRequest = require('./authentication-request'),
    WebApiRequest = require('./webapi-request'),
    HttpManager = require('./http-manager');

function SpotifyWebApi(credentials) {
  this._credentials = credentials || {};
}

SpotifyWebApi.prototype = {
  _addBodyParameters: function(request, options) {
    if (options) {
      for (var key in options) {
        if (key !== 'credentials') {
          request.addBodyParameter(key, options[key]);
        }
      }
    }
  },

  _addQueryParameters: function(request, options) {
    if (!options) {
      return;
    }
    for (var key in options) {
      if (key !== 'credentials') {
        request.addQueryParameter(key, options[key]);
      }
    }
  },

  _performRequest: function(method, request) {
    var promiseFunction = function(resolve, reject) {
      method(request, function(error, result) {
        if (error) {
          reject(error);
        } else {
          resolve(result);
        }
      });
    };
    return new Promise(promiseFunction);
  },

  _addAccessToken: function(request, accessToken) {
    if (accessToken) {
      request.addHeaders({
        'Authorization' : 'Bearer ' + accessToken
      });
    }
  },

  setCredentials: function(credentials) {
    for (var key in credentials) {
      if (credentials.hasOwnProperty(key)) {
        this._credentials[key] = credentials[key];
      }
    }
  },

  getCredentials: function() {
    return this._credentials;
  },

  resetCredentials: function() {
    this._credentials = null;
  },

  setClientId: function(clientId) {
    this._setCredential('clientId', clientId);
  },

  setClientSecret: function(clientSecret) {
    this._setCredential('clientSecret', clientSecret);
  },

  setAccessToken: function(accessToken) {
    this._setCredential('accessToken', accessToken);
  },

  setRefreshToken: function(refreshToken) {
    this._setCredential('refreshToken', refreshToken);
  },

  setRedirectURI: function(redirectUri) {
    this._setCredential('redirectUri', redirectUri);
  },

  getRedirectURI: function() {
    return this._getCredential('redirectUri');
  },

  getClientId: function() {
    return this._getCredential('clientId');
  },

  getClientSecret: function() {
    return this._getCredential('clientSecret');
  },

  getAccessToken: function() {
    return this._getCredential('accessToken');
  },

  getRefreshToken: function() {
    return this._getCredential('refreshToken');
  },

  resetClientId: function() {
    this._resetCredential('clientId');
  },

  resetClientSecret: function() {
    this._resetCredential('clientSecret');
  },

  resetAccessToken: function() {
    this._resetCredential('accessToken');
  },

  resetRefreshToken: function() {
    this._resetCredential('refreshToken');
  },

  resetRedirectURI: function() {
    this._resetCredential('redirectUri');
  },

  _setCredential: function(credentialKey, value) {
    this._credentials = this._credentials || {};
    this._credentials[credentialKey] = value;
  },

  _getCredential: function(credentialKey) {
    if (!this._credentials) {
      return;
    } else {
      return this._credentials[credentialKey];
    }
  },

  _resetCredential: function(credentialKey) {
    if (!this._credentials) {
      return;
    } else {
      this._credentials[credentialKey] = null;
    }
  },

  /**
   * Look up a track.
   * @param {string} trackId The track's ID.
   * @param {Object} [options] The possible options, currently only market.
   * @param {requestCallback} [callback] Optional callback method to be called instead of the promise.
   * @example getTrack('3Qm86XLflmIXVm1wcwkgDK').then(...)
   * @returns {Promise|undefined} A promise that if successful, returns an object containing information
   *          about the track. Not returned if a callback is given.
   */
  getTrack: function(trackId, options, callback) {
     // In case someone is using a version where options parameter did not exist.
    var actualCallback;
    if (typeof options === 'function') {
      actualCallback = options;
    } else {
      actualCallback = callback;
    }

    var actualOptions = {};
    if (typeof options === 'object') {
      Object.keys(options).forEach(function(key) {
        actualOptions[key] = options[key];
      });
    }

    var request = WebApiRequest.builder()
      .withPath('/v1/tracks/' + trackId)
      .withQueryParameters(actualOptions)
      .build();

    this._addAccessToken(request, this.getAccessToken());

    var promise = this._performRequest(HttpManager.get, request);

    if (actualCallback) {
      promise.then(function(data) {
        actualCallback(null, data);
      }, function(err) {
        actualCallback(err);
      });
    } else {
      return promise;
    }
  },

  /**
   * Look up several tracks.
   * @param {string[]} trackIds The IDs of the artists.
   * @param {Object} [options] The possible options, currently only market.
   * @param {requestCallback} [callback] Optional callback method to be called instead of the promise.
   * @example getArtists(['0oSGxfWSnnOXhD2fKuz2Gy', '3dBVyJ7JuOMt4GE9607Qin']).then(...)
   * @returns {Promise|undefined} A promise that if successful, returns an object containing information
   *          about the artists. Not returned if a callback is given.
   */
  getTracks: function(trackIds, options, callback) {
    // In case someone is using a version where options parameter did not exist.
    var actualCallback;
    if (typeof options === 'function') {
      actualCallback = options;
    } else {
      actualCallback = callback;
    }

    var actualOptions = {};
    if (typeof options === 'object') {
      Object.keys(options).forEach(function(key) {
        actualOptions[key] = options[key];
      });
    }

    var request = WebApiRequest.builder()
      .withPath('/v1/tracks')
      .withQueryParameters({
        'ids' : trackIds.join(',')
      })
      .build();

    this._addAccessToken(request, this.getAccessToken());
    this._addQueryParameters(request, actualOptions);

    var promise = this._performRequest(HttpManager.get, request);

    if (actualCallback) {
      promise.then(function(data) {
        actualCallback(null, data);
      }, function(err) {
        actualCallback(err);
      });
    } else {
      return promise;
    }
  },

  /**
   * Look up an album.
   * @param {string} albumId The album's ID.
   * @param {Object} [options] The possible options, currently only market.
   * @param {requestCallback} [callback] Optional callback method to be called instead of the promise.
   * @example getAlbum('0sNOF9WDwhWunNAHPD3Baj').then(...)
   * @returns {Promise|undefined} A promise that if successful, returns an object containing information
   *          about the album. Not returned if a callback is given.
   */
  getAlbum: function(albumId, options, callback) {
    // In case someone is using a version where options parameter did not exist.
    var actualCallback;
    if (typeof options === 'function') {
      actualCallback = options;
    } else {
      actualCallback = callback;
    }

    var actualOptions = {};
    if (typeof options === 'object') {
      Object.keys(options).forEach(function(key) {
        actualOptions[key] = options[key];
      });
    }

    var request = WebApiRequest.builder()
      .withPath('/v1/albums/' + albumId)
      .withQueryParameters(actualOptions)
      .build();

    this._addAccessToken(request, this.getAccessToken());

    var promise = this._performRequest(HttpManager.get, request);

    if (actualCallback) {
      promise.then(function(data) {
        actualCallback(null, data);
      }, function(err) {
        actualCallback(err);
      });
    } else {
      return promise;
    }
  },

  /**
   * Look up several albums.
   * @param {string[]} albumIds The IDs of the albums.
   * @param {Object} [options] The possible options, currently only market.
   * @param {requestCallback} [callback] Optional callback method to be called instead of the promise.
   * @example getAlbums(['0oSGxfWSnnOXhD2fKuz2Gy', '3dBVyJ7JuOMt4GE9607Qin']).then(...)
   * @returns {Promise|undefined} A promise that if successful, returns an object containing information
   *          about the albums. Not returned if a callback is given.
   */
  getAlbums: function(albumIds, options, callback) {
    // In case someone is using a version where options parameter did not exist.
    var actualCallback;
    if (typeof options === 'function') {
      actualCallback = options;
    } else {
      actualCallback = callback;
    }

    var actualOptions = {};
    if (typeof options === 'object') {
      Object.keys(options).forEach(function(key) {
        actualOptions[key] = options[key];
      });
    }

    var request = WebApiRequest.builder()
      .withPath('/v1/albums')
      .withQueryParameters({
        'ids' : albumIds.join(',')
      })
      .build();

    this._addAccessToken(request, this.getAccessToken());
    this._addQueryParameters(request, actualOptions);

    var promise = this._performRequest(HttpManager.get, request);

    if (actualCallback) {
      promise.then(function(data) {
        actualCallback(null, data);
      }, function(err) {
        actualCallback(err);
      });
    } else {
      return promise;
    }
  },

  /**
   * Look up an artist.
   * @param {string} artistId The artist's ID.
   * @param {requestCallback} [callback] Optional callback method to be called instead of the promise.
   * @example api.getArtist('1u7kkVrr14iBvrpYnZILJR').then(...)
   * @returns {Promise|undefined} A promise that if successful, returns an object containing information
   *          about the artist. Not returned if a callback is given.
   */
  getArtist: function(artistId, callback) {
    var request = WebApiRequest.builder()
      .withPath('/v1/artists/' + artistId)
      .build();

    this._addAccessToken(request, this.getAccessToken());

    var promise = this._performRequest(HttpManager.get, request);

    if (callback) {
      promise.then(function(data) {
        callback(null, data);
      }, function(err) {
        callback(err);
      });
    } else {
      return promise;
    }
  },

  /**
   * Look up several artists.
   * @param {string[]} artistIds The IDs of the artists.
   * @param {requestCallback} [callback] Optional callback method to be called instead of the promise.
   * @example getArtists(['0oSGxfWSnnOXhD2fKuz2Gy', '3dBVyJ7JuOMt4GE9607Qin']).then(...)
   * @returns {Promise|undefined} A promise that if successful, returns an object containing information
   *          about the artists. Not returned if a callback is given.
   */
  getArtists: function(artistIds, callback) {
    var request = WebApiRequest.builder()
      .withPath('/v1/artists')
      .withQueryParameters({
        'ids' : artistIds.join(',')
      })
      .build();

    this._addAccessToken(request, this.getAccessToken());

    var promise = this._performRequest(HttpManager.get, request);

    if (callback) {
      promise.then(function(data) {
        callback(null, data);
      }, function(err) {
        callback(err);
      });
    } else {
      return promise;
    }
  },

  /**
   * Search for music entities of certain types.
   * @param {string} query The search query.
   * @param {string[]} types An array of item types to search across.
   * Valid types are: 'album', 'artist', 'playlist', and 'track'.
   * @param {Object} [options] The possible options, e.g. limit, offset.
   * @param {requestCallback} [callback] Optional callback method to be called instead of the promise.
   * @example search('Abba', ['track', 'playlist'], { limit : 5, offset : 1 }).then(...)
   * @returns {Promise|undefined} A promise that if successful, returns an object containing the
   *          search results. The result is paginated. If the promise is rejected,
   *          it contains an error object. Not returned if a callback is given.
   */
  search: function(query, types, options, callback) {
    var request = WebApiRequest.builder()
      .withPath('/v1/search/')
      .withQueryParameters({
        type : types.join(','),
        q : query
      })
      .build();

    this._addAccessToken(request, this.getAccessToken());
    this._addQueryParameters(request, options);

    var promise = this._performRequest(HttpManager.get, request);

    if (callback) {
      promise.then(function(data) {
        callback(null, data);
      }, function(err) {
        callback(err);
      });
    } else {
      return promise;
    }
  },

  /**
   * Search for an album.
   * @param {string} query The search query.
   * @param {Object} [options] The possible options, e.g. limit, offset.
   * @param {requestCallback} [callback] Optional callback method to be called instead of the promise.
   * @example searchAlbums('Space Oddity', { limit : 5, offset : 1 }).then(...)
   * @returns {Promise|undefined} A promise that if successful, returns an object containing the
   *          search results. The result is paginated. If the promise is rejected,
   *          it contains an error object. Not returned if a callback is given.
   */
  searchAlbums: function(query, options, callback) {
    return this.search(query, ['album'], options, callback);
  },

  /**
   * Search for an artist.
   * @param {string} query The search query.
   * @param {Object} [options] The possible options, e.g. limit, offset.
   * @param {requestCallback} [callback] Optional callback method to be called instead of the promise.
   * @example searchArtists('David Bowie', { limit : 5, offset : 1 }).then(...)
   * @returns {Promise|undefined} A promise that if successful, returns an object containing the
   *          search results. The result is paginated. If the promise is rejected,
   *          it contains an error object. Not returned if a callback is given.
   */
  searchArtists: function(query, options, callback) {
    return this.search(query, ['artist'], options, callback);
  },

  /**
   * Search for a track.
   * @param {string} query The search query.
   * @param {Object} [options] The possible options, e.g. limit, offset.
   * @param {requestCallback} [callback] Optional callback method to be called instead of the promise.
   * @example searchTracks('Mr. Brightside', { limit : 3, offset : 2 }).then(...)
   * @returns {Promise|undefined} A promise that if successful, returns an object containing the
   *          search results. The result is paginated. If the promise is rejected,
   *          it contains an error object. Not returned if a callback is given.
   */
  searchTracks: function(query, options, callback) {
    return this.search(query, ['track'], options, callback);
  },

  /**
   * Search for playlists.
   * @param {string} query The search query.
   * @param {Object} options The possible options.
   * @param {requestCallback} [callback] Optional callback method to be called instead of the promise.
   * @example searchPlaylists('workout', { limit : 1, offset : 0 }).then(...)
   * @returns {Promise|undefined} A promise that if successful, returns an object containing the
   *          search results. The result is paginated. If the promise is rejected,
   *          it contains an error object. Not returned if a callback is given.
   */
  searchPlaylists: function(query, options, callback) {
    return this.search(query, ['playlist'], options, callback);
  },

  /**
   * Get an artist's albums.
   * @param {string} artistId The artist's ID.
   * @options {Object} [options] The possible options, e.g. limit, offset.
   * @param {requestCallback} [callback] Optional callback method to be called instead of the promise.
   * @example getArtistAlbums('0oSGxfWSnnOXhD2fKuz2Gy', { album_type : 'album', country : 'GB', limit : 2, offset : 5 }).then(...)
   * @returns {Promise|undefined} A promise that if successful, returns an object containing the albums
   *          for the given artist. The result is paginated. If the promise is rejected,
   *          it contains an error object. Not returned if a callback is given.
   */
  getArtistAlbums: function(artistId, options, callback) {
    var request = WebApiRequest.builder()
      .withPath('/v1/artists/' + artistId + '/albums')
      .build();

    this._addAccessToken(request, this.getAccessToken());
    this._addQueryParameters(request, options);

    var promise = this._performRequest(HttpManager.get, request);

    if (callback) {
      promise.then(function(data) {
        callback(null, data);
      }, function(err) {
        callback(err);
      });
    } else {
      return promise;
    }
  },

  /**
   * Get the tracks of an album.
   * @param albumId the album's ID.
   * @options {Object} [options] The possible options, e.g. limit.
   * @param {requestCallback} [callback] Optional callback method to be called instead of the promise.
   * @example getAlbumTracks('41MnTivkwTO3UUJ8DrqEJJ', { limit : 5, offset : 1 }).then(...)
   * @returns {Promise|undefined} A promise that if successful, returns an object containing the
   *                    tracks in the album. The result is paginated. If the promise is rejected.
   *                    it contains an error object. Not returned if a callback is given.
   */
  getAlbumTracks: function(albumId, options, callback) {
    var request = WebApiRequest.builder()
      .withPath('/v1/albums/' + albumId + '/tracks')
      .build();

    this._addAccessToken(request, this.getAccessToken());
    this._addQueryParameters(request, options);

    var promise = this._performRequest(HttpManager.get, request);

    if (callback) {
      promise.then(function(data) {
        callback(null, data);
      }, function(err) {
        callback(err);
      });
    } else {
      return promise;
    }
  },

  /**
   * Get an artist's top tracks.
   * @param {string} artistId The artist's ID.
   * @param {string} country The country/territory where the tracks are most popular. (format: ISO 3166-1 alpha-2)
   * @param {requestCallback} [callback] Optional callback method to be called instead of the promise.
   * @example getArtistTopTracks('0oSGxfWSnnOXhD2fKuz2Gy', 'GB').then(...)
   * @returns {Promise|undefined} A promise that if successful, returns an object containing the
   *          artist's top tracks in the given country. If the promise is rejected,
   *          it contains an error object. Not returned if a callback is given.
   */
  getArtistTopTracks: function(artistId, country, callback) {
    var request = WebApiRequest.builder()
      .withPath('/v1/artists/' + artistId + '/top-tracks')
      .withQueryParameters({
        'country' : country
      })
      .build();

    this._addAccessToken(request, this.getAccessToken());

    var promise = this._performRequest(HttpManager.get, request);

    if (callback) {
      promise.then(function(data) {
        callback(null, data);
      }, function(err) {
        callback(err);
      });
    } else {
      return promise;
    }
  },

  /**
   * Get related artists.
   * @param {string} artistId The artist's ID.
   * @param {requestCallback} [callback] Optional callback method to be called instead of the promise.
   * @example getArtistRelatedArtists('0oSGxfWSnnOXhD2fKuz2Gy').then(...)
   * @returns {Promise|undefined} A promise that if successful, returns an object containing the
   *          related artists. If the promise is rejected, it contains an error object. Not returned if a callback is given.
   */
  getArtistRelatedArtists: function(artistId, callback) {
    var request = WebApiRequest.builder()
      .withPath('/v1/artists/' + artistId + '/related-artists')
      .build();

    this._addAccessToken(request, this.getAccessToken());

    var promise = this._performRequest(HttpManager.get, request);

    if (callback) {
      promise.then(function(data) {
        callback(null, data);
      }, function(err) {
        callback(err);
      });
    } else {
      return promise;
    }
  },

  /**
   * Get information about a user.
   * @param userId The user ID.
   * @param {requestCallback} [callback] Optional callback method to be called instead of the promise.
   * @example getUser('thelinmichael').then(...)
   * @returns {Promise|undefined} A promise that if successful, resolves to an object
   *          containing information about the user. If the promise is
   *          rejected, it contains an error object. Not returned if a callback is given.
   */
  getUser: function(userId, callback) {
    var request = WebApiRequest.builder()
      .withPath('/v1/users/' + encodeURIComponent(userId))
      .build();

    this._addAccessToken(request, this.getAccessToken());

    var promise = this._performRequest(HttpManager.get, request);

    if (callback) {
      promise.then(function(data) {
        callback(null, data);
      }, function(err) {
        callback(err);
      });
    } else {
      return promise;
    }
  },

  /**
   * Get information about the user that has signed in (the current user).
   * @param {requestCallback} [callback] Optional callback method to be called instead of the promise.
   * @example getMe().then(...)
   * @returns {Promise|undefined} A promise that if successful, resolves to an object
   *          containing information about the user. The amount of information
   *          depends on the permissions given by the user. If the promise is
   *          rejected, it contains an error object. Not returned if a callback is given.
   */
  getMe: function(callback) {
    var request = WebApiRequest.builder()
      .withPath('/v1/me')
      .build();

    this._addAccessToken(request, this.getAccessToken());

    var promise = this._performRequest(HttpManager.get, request);

    if (callback) {
      promise.then(function(data) {
        callback(null, data);
      }, function(err) {
        callback(err);
      });
    } else {
      return promise;
    }
  },

  /**
   * Get a user's playlists.
   * @param {string} userId An optional id of the user. If you know the Spotify URI it is easy
   * to find the id (e.g. spotify:user:<here_is_the_id>). If not provided, the id of the user that granted
   * the permissions will be used.
   * @param {Object} [options] The options supplied to this request.
   * @param {requestCallback} [callback] Optional callback method to be called instead of the promise.
   * @example getUserPlaylists('thelinmichael').then(...)
   * @returns {Promise|undefined} A promise that if successful, resolves to an object containing
   *          a list of playlists. If rejected, it contains an error object. Not returned if a callback is given.
   */
  getUserPlaylists: function(userId, options, callback) {
    var path;
    if (typeof userId === 'string') {
      path = '/v1/users/' + encodeURIComponent(userId) + '/playlists';
    } else {
      path = '/v1/me/playlists';
    }

    var request = WebApiRequest.builder()
      .withPath(path)
      .build();

    this._addAccessToken(request, this.getAccessToken());
    this._addQueryParameters(request, options);

    var promise = this._performRequest(HttpManager.get, request);

    if (callback) {
      promise.then(function(data) {
        callback(null, data);
      }, function(err) {
        callback(err);
      });
    } else {
      return promise;
    }
  },

  /**
   * Get a playlist.
   * @param {string} userId The playlist's owner's user ID.
   * @param {string} playlistId The playlist's ID.
   * @param {Object} [options] The options supplied to this request.
   * @param {requestCallback} [callback] Optional callback method to be called instead of the promise.
   * @example getPlaylist('thelinmichael', '3EsfV6XzCHU8SPNdbnFogK').then(...)
   * @returns {Promise|undefined} A promise that if successful, resolves to an object containing
   *          the playlist. If rejected, it contains an error object. Not returned if a callback is given.
   */
  getPlaylist: function(userId, playlistId, options, callback) {
    var request = WebApiRequest.builder()
      .withPath('/v1/users/' + encodeURIComponent(userId) + '/playlists/' + playlistId)
      .build();

    this._addAccessToken(request, this.getAccessToken());
    this._addQueryParameters(request, options);

    var promise = this._performRequest(HttpManager.get, request);

    if (callback) {
      promise.then(function(data) {
        callback(null, data);
      }, function(err) {
        callback(err);
      });
    } else {
      return promise;
    }
  },

  /**
   * Get tracks in a playlist.
   * @param {string} userId THe playlist's owner's user ID.
   * @param {string} playlistId The playlist's ID.
   * @param {Object} [options] Optional options, such as fields.
   * @param {requestCallback} [callback] Optional callback method to be called instead of the promise.
   * @example getPlaylistTracks('thelinmichael', '3ktAYNcRHpazJ9qecm3ptn').then(...)
   * @returns {Promise|undefined} A promise that if successful, resolves to an object that containing
   * the tracks in the playlist. If rejected, it contains an error object. Not returned if a callback is given.
   */
  getPlaylistTracks: function(userId, playlistId, options, callback) {
    var request = WebApiRequest.builder().
      withPath('/v1/users/' + encodeURIComponent(userId) + '/playlists/' + playlistId + '/tracks').
      withQueryParameters(options).
      build();

    this._addAccessToken(request, this.getAccessToken());

    var promise = this._performRequest(HttpManager.get, request);

    if (callback) {
      promise.then(function(data) {
        callback(null, data);
      }, function(err) {
        callback(err);
      });
    } else {
      return promise;
    }
  },

  /**
   * Create a playlist.
   * @param {string} userId The playlist's owner's user ID.
   * @param {string} playlistName The name of the playlist.
   * @param {Object} [options] The possible options, currently only public.
   * @param {requestCallback} [callback] Optional callback method to be called instead of the promise.
   * @example createPlaylist('thelinmichael', 'My cool playlist!', { public : false }).then(...)
   * @returns {Promise|undefined} A promise that if successful, resolves to an object containing information about the
   *          created playlist. If rejected, it contains an error object. Not returned if a callback is given.
   */
  createPlaylist: function(userId, playlistName, options, callback) {
    // In case someone is using a version where options parameter did not exist.
    var actualCallback;
    if (typeof options === 'function') {
      actualCallback = options;
    } else {
      actualCallback = callback;
    }

    var actualOptions = { 'name' : playlistName };
    if (typeof options === 'object') {
      Object.keys(options).forEach(function(key) {
        actualOptions[key] = options[key];
      });
    }

    var request = WebApiRequest.builder()
      .withPath('/v1/users/' + encodeURIComponent(userId) + '/playlists')
      .withHeaders({ 'Content-Type' : 'application/json' })
      .withBodyParameters(actualOptions)
      .build();

    this._addAccessToken(request, this.getAccessToken());

    var promise = this._performRequest(HttpManager.post, request);

    if (actualCallback) {
      promise.then(function(data) {
        actualCallback(null, data);
      }, function(err) {
        actualCallback(err);
      });
    } else {
      return promise;
    }
  },

  /**
   * Follow a playlist.
   * @param {string} userId The playlist's owner's user ID
   * @param {string} playlistId The playlist's ID
   * @param {Object} [options] The possible options, currently only public.
   * @param {requestCallback} [callback] Optional callback method to be called instead of the promise.
   * @returns {Promise|undefined} A promise that if successful, simply resolves to an empty object. If rejected,
   * it contains an error object. Not returned if a callback is given.
   */
  followPlaylist: function(userId, playlistId, options, callback) {
    var request = WebApiRequest.builder()
      .withPath('/v1/users/' + encodeURIComponent(userId) + '/playlists/' + playlistId + '/followers')
      .withBodyParameters(options)
      .withHeaders({ 'Content-Type' : 'application/json' })
      .build();

    this._addAccessToken(request, this.getAccessToken());

    var promise = this._performRequest(HttpManager.put, request);

    if (callback) {
      promise.then(function(data) {
        callback(null, data);
      }, function(err) {
        callback(err);
      });
    } else {
      return promise;
    }
  },

  /**
   * Unfollow a playlist.
   * @param {string} userId The playlist's owner's user ID
   * @param {string} playlistId The playlist's ID
   * @param {Object} [options] The possible options, currently only public.
   * @param {requestCallback} [callback] Optional callback method to be called instead of the promise.
   * @returns {Promise|undefined} A promise that if successful, simply resolves to an empty object. If rejected,
   * it contains an error object. Not returned if a callback is given.
   */
  unfollowPlaylist: function(userId, playlistId, callback) {
    var request = WebApiRequest.builder()
      .withPath('/v1/users/' + encodeURIComponent(userId) + '/playlists/' + playlistId + '/followers')
      .withHeaders({ 'Content-Type' : 'application/json' })
      .build();

    this._addAccessToken(request, this.getAccessToken());

    var promise = this._performRequest(HttpManager.del, request);

    if (callback) {
      promise.then(function(data) {
        callback(null, data);
      }, function(err) {
        callback(err);
      });
    } else {
      return promise;
    }
  },

  /**
   * Change playlist details.
   * @param {string} userId The playlist's owner's user ID
   * @param {string} playlistId The playlist's ID
   * @param {Object} [options] The possible options, e.g. name, public.
   * @param {requestCallback} [callback] Optional callback method to be called instead of the promise.
   * @example changePlaylistDetails('thelinmichael', '3EsfV6XzCHU8SPNdbnFogK', {name: 'New name', public: true}).then(...)
   * @returns {Promise|undefined} A promise that if successful, simply resolves to an empty object. If rejected,
   * it contains an error object. Not returned if a callback is given.
   */
  changePlaylistDetails: function(userId, playlistId, options, callback) {
    var request = WebApiRequest.builder()
      .withPath('/v1/users/' + encodeURIComponent(userId) + '/playlists/' + playlistId)
      .withHeaders({ 'Content-Type' : 'application/json' })
      .withBodyParameters(options)
      .build();

    this._addAccessToken(request, this.getAccessToken());

    var promise = this._performRequest(HttpManager.put, request);

    if (callback) {
      promise.then(function(data) {
        callback(null, data);
      }, function(err) {
        callback(err);
      });
    } else {
      return promise;
    }
  },

  /**
   * Add tracks to a playlist.
   * @param {string} userId The playlist's owner's user ID
   * @param {string} playlistId The playlist's ID
   * @param {string[]} tracks URIs of the tracks to add to the playlist.
   * @param {Object} [options] Options, position being the only one.
   * @param {requestCallback} [callback] Optional callback method to be called instead of the promise.
   * @example addTracksToPlaylist('thelinmichael', '3EsfV6XzCHU8SPNdbnFogK',
              '["spotify:track:4iV5W9uYEdYUVa79Axb7Rh", "spotify:track:1301WleyT98MSxVHPZCA6M"]').then(...)
   * @returns {Promise|undefined} A promise that if successful returns an object containing a snapshot_id. If rejected,
   * it contains an error object. Not returned if a callback is given.
   */
  addTracksToPlaylist: function(userId, playlistId, tracks, options, callback) {
    var request = WebApiRequest.builder()
      .withPath('/v1/users/' + encodeURIComponent(userId) + '/playlists/' + playlistId + '/tracks')
      .withHeaders({ 'Content-Type' : 'application/json' })
      .withBodyParameters({
        uris: tracks
      })
      .build();

    this._addQueryParameters(request, options);
    this._addAccessToken(request, this.getAccessToken());

    var promise = this._performRequest(HttpManager.post, request);

    if (callback) {
      promise.then(function(data) {
        callback(null, data);
      }, function(err) {
        callback(err);
      });
    } else {
      return promise;
    }
  },

  /**
   * Remove tracks from a playlist.
   * @param {string} userId The playlist's owner's user ID
   * @param {string} playlistId The playlist's ID
   * @param {Object[]} tracks An array of objects containing a property called uri with the track URI (String), and
   * a an optional property called positions (int[]), e.g. { uri : "spotify:track:491rM2JN8KvmV6p0oDDuJT", positions : [0, 15] }
   * @param {Object} options Options, snapshot_id being the only one.
   * @param {requestCallback} [callback] Optional callback method to be called instead of the promise.
   * @returns {Promise|undefined} A promise that if successful returns an object containing a snapshot_id. If rejected,
   * it contains an error object. Not returned if a callback is given.
   */
  removeTracksFromPlaylist: function(userId, playlistId, tracks, options, callback) {
    var request = WebApiRequest.builder().
      withPath('/v1/users/' + encodeURIComponent(userId) + '/playlists/' + playlistId + '/tracks').
      withHeaders({ 'Content-Type' : 'application/json' }).
      withBodyParameters({
        'tracks': tracks
      }).
      build();

    this._addBodyParameters(request, options);
    this._addAccessToken(request, this.getAccessToken());

    var promise = this._performRequest(HttpManager.del, request);

    if (callback) {
      promise.then(function(data) {
        callback(null, data);
      }, function(err) {
        callback(err);
      });
    } else {
      return promise;
    }
  },

  /**
   * Remove tracks from a playlist by position instead of specifying the tracks' URIs.
   * @param {string} userId The playlist's owner's user ID
   * @param {string} playlistId The playlist's ID
   * @param {int[]} positions The positions of the tracks in the playlist that should be removed
   * @param {string} snapshot_id The snapshot ID, or version, of the playlist. Required
   * @param {requestCallback} [callback] Optional callback method to be called instead of the promise.
   * @returns {Promise|undefined} A promise that if successful returns an object containing a snapshot_id. If rejected,
   * it contains an error object. Not returned if a callback is given.
   */
  removeTracksFromPlaylistByPosition: function(userId, playlistId, positions, snapshotId, callback) {
    var request = WebApiRequest.builder().
      withPath('/v1/users/' + encodeURIComponent(userId) + '/playlists/' + playlistId + '/tracks').
      withHeaders({ 'Content-Type' : 'application/json' }).
      withBodyParameters({
        'positions': positions,
        'snapshot_id' : snapshotId
      }).
      build();

    this._addAccessToken(request, this.getAccessToken());

    var promise = this._performRequest(HttpManager.del, request);

    if (callback) {
      promise.then(function(data) {
        callback(null, data);
      }, function(err) {
        callback(err);
      });
    } else {
      return promise;
    }
  },

  /**
   * Replace tracks in a playlist.
   * @param {string} userId The playlist's owner's user ID
   * @param {string} playlistId The playlist's ID
   * @param {Object[]} uris An array of track URIs (strings)
   * @param {requestCallback} [callback] Optional callback method to be called instead of the promise.
   * @returns {Promise|undefined} A promise that if successful returns an empty object. If rejected,
   * it contains an error object. Not returned if a callback is given.
   */
  replaceTracksInPlaylist: function(userId, playlistId, uris, callback) {
    var request = WebApiRequest.builder().
      withPath('/v1/users/' + encodeURIComponent(userId) + '/playlists/' + playlistId + '/tracks').
      withHeaders({ 'Content-Type' : 'application/json' }).
      withBodyParameters({
        'uris': uris
      }).
      build();

    this._addAccessToken(request, this.getAccessToken());

    var promise = this._performRequest(HttpManager.put, request);

    if (callback) {
      promise.then(function(data) {
        callback(null, data);
      }, function(err) {
        callback(err);
      });
    } else {
      return promise;
    }
  },

  /**
   * Reorder tracks in a playlist.
   * @param {string} userId The playlist's owner's user ID
   * @param {string} playlistId The playlist's ID
   * @param {int} rangeStart The position of the first track to be reordered.
   * @param {int} insertBefore The position where the tracks should be inserted.
   * @param {Object} options Optional parameters, i.e. range_length and snapshot_id.
   * @param {requestCallback} [callback] Optional callback method to be called instead of the promise.
   * @returns {Promise|undefined} A promise that if successful returns an object containing a snapshot_id. If rejected,
   * it contains an error object. Not returned if a callback is given.
   */
  reorderTracksInPlaylist: function(userId, playlistId, rangeStart, insertBefore, options, callback) {
    var request = WebApiRequest.builder().
      withPath('/v1/users/' + encodeURIComponent(userId) + '/playlists/' + playlistId + '/tracks').
      withHeaders({ 'Content-Type' : 'application/json' }).
      withBodyParameters({
        'range_start': rangeStart,
        'insert_before' : insertBefore
      }).
      build();

    this._addAccessToken(request, this.getAccessToken());
    this._addBodyParameters(request, options);

    var promise =  this._performRequest(HttpManager.put, request);

    if (callback) {
      promise.then(function(data) {
        callback(null, data);
      }, function(err) {
        callback(err);
      });
    } else {
      return promise;
    }
  },

  /**
   * Get audio features for a single track identified by its unique Spotify ID.
   * @param {string} trackId The track ID
   * @param {requestCallback} [callback] Optional callback method to be called instead of the promise.
   * @example getAudioFeaturesForTrack('38P3Q4QcdjQALGF2Z92BmR').then(...)
   * @returns {Promise|undefined} A promise that if successful, resolves to an object
   *          containing information about the audio features. If the promise is
   *          rejected, it contains an error object. Not returned if a callback is given.
   */
  getAudioFeaturesForTrack: function(trackId, callback) {
    var request = WebApiRequest.builder()
      .withPath('/v1/audio-features/' + trackId)
      .build();

    this._addAccessToken(request, this.getAccessToken());

    var promise = this._performRequest(HttpManager.get, request);

    if (callback) {
      promise.then(function(data) {
        callback(null, data);
      }, function(err) {
        callback(err);
      });
    } else {
      return promise;
    }
  },

  /**
   * Get audio analysis for a single track identified by its unique Spotify ID.
   * @param {string} trackId The track ID
   * @param {requestCallback} [callback] Optional callback method to be called instead of the promise.
   * @example getAudioAnalysisForTrack('38P3Q4QcdjQALGF2Z92BmR').then(...)
   * @returns {Promise|undefined} A promise that if successful, resolves to an object
   *          containing information about the audio analysis. If the promise is
   *          rejected, it contains an error object. Not returned if a callback is given.
   */
  getAudioAnalysisForTrack: function(trackId, callback) {
    var request = WebApiRequest.builder()
      .withPath('/v1/audio-analysis/' + trackId)
      .build();

    this._addAccessToken(request, this.getAccessToken());

    var promise = this._performRequest(HttpManager.get, request);

    if (callback) {
      promise.then(function(data) {
        callback(null, data);
      }, function(err) {
        callback(err);
      });
    } else {
      return promise;
    }
  },

  /**
   * Get audio features for multiple tracks identified by their unique Spotify ID.
   * @param {string[]} trackIds The track IDs
   * @param {requestCallback} [callback] Optional callback method to be called instead of the promise.
   * @example getAudioFeaturesForTracks(['38P3Q4QcdjQALGF2Z92BmR', '2HO2bnoMrpnZUbUqiilLHi']).then(...)
   * @returns {Promise|undefined} A promise that if successful, resolves to an object
   *          containing information about the audio features for the tracks. If the promise is
   *          rejected, it contains an error object. Not returned if a callback is given.
   */
  getAudioFeaturesForTracks: function(trackIds, callback) {
    var request = WebApiRequest.builder()
      .withPath('/v1/audio-features')
      .withQueryParameters({
        'ids' : trackIds.join(',')
      })
      .build();

    this._addAccessToken(request, this.getAccessToken());

    var promise = this._performRequest(HttpManager.get, request);

    if (callback) {
      promise.then(function(data) {
        callback(null, data);
      }, function(err) {
        callback(err);
      });
    } else {
      return promise;
    }
  },

  /**
   * Create a playlist-style listening experience based on seed artists, tracks and genres.
   * @param {Object} [options] The options supplied to this request.
   * @param {requestCallback} [callback] Optional callback method to be called instead of the promise.
   * @example getRecommendations({ min_energy: 0.4, seed_artists: ['6mfK6Q2tzLMEchAr0e9Uzu', '4DYFVNKZ1uixa6SQTvzQwJ'], min_popularity: 50 }).then(...)
   * @returns {Promise|undefined} A promise that if successful, resolves to an object containing
   *          a list of tracks and a list of seeds. If rejected, it contains an error object. Not returned if a callback is given.
   */
  getRecommendations: function(options, callback) {
    var request = WebApiRequest.builder()
      .withPath('/v1/recommendations')
      .build();

    var _opts = {};
    var optionsOfTypeArray = ['seed_artists', 'seed_genres', 'seed_tracks'];
    for (var option in options) {
      if (options.hasOwnProperty(option)) {
        if (optionsOfTypeArray.indexOf(option) !== -1 &&
          Object.prototype.toString.call(options[option]) === '[object Array]') {
          _opts[option] = options[option].join(',');
        } else {
          _opts[option] = options[option];
        }
      }
    }

    this._addAccessToken(request, this.getAccessToken());
    this._addQueryParameters(request, _opts);

    var promise = this._performRequest(HttpManager.get, request);

    if (callback) {
      promise.then(function(data) {
        callback(null, data);
      }, function(err) {
        callback(err);
      });
    } else {
      return promise;
    }
  },

  /**
   * Retrieve a list of available genres seed parameter values for recommendations.
   * @param {requestCallback} [callback] Optional callback method to be called instead of the promise.
   * @example getAvailableGenreSeeds().then(...)
   * @returns {Promise|undefined} A promise that if successful, resolves to an object containing
   *          a list of available genres to be used as seeds for recommendations.
   *          If rejected, it contains an error object. Not returned if a callback is given.
   */
  getAvailableGenreSeeds: function(callback) {
    var request = WebApiRequest.builder()
      .withPath('/v1/recommendations/available-genre-seeds')
      .build();

    this._addAccessToken(request, this.getAccessToken());

    var promise = this._performRequest(HttpManager.get, request);

    if (callback) {
      promise.then(function(data) {
        callback(null, data);
      }, function(err) {
        callback(err);
      });
    } else {
      return promise;
    }
  },

  /**
   * Retrieve a URL where the user can give the application permissions.
   * @param {string[]} scopes The scopes corresponding to the permissions the application needs.
   * @param {string} state A parameter that you can use to maintain a value between the request and the callback to redirect_uri.It is useful to prevent CSRF exploits.
   * @param {boolean} showDialog A parameter that you can use to force the user to approve the app on each login rather than being automatically redirected.
   * @returns {string} The URL where the user can give application permissions.
   */
  createAuthorizeURL: function(scopes, state, showDialog) {
    var showDialogParam = showDialog ? { 'show_dialog' : showDialog } : null;
    var options = {
      'client_id' : this.getClientId(),
      'response_type' : 'code',
      'redirect_uri' : this.getRedirectURI(),
      'scope' : scopes.join('%20'),
      'state' : state
    };
    var actualOptions = Object.assign(options, showDialogParam);
    var request = AuthenticationRequest.builder()
      .withPath('/authorize')
      .withQueryParameters(actualOptions)
      .build();

    return request.getURL();
  },

  /**
   * Retrieve the tracks that are saved to the authenticated users Your Music library.
   * @param {Object} [options] Options, being market, limit, and/or offset.
   * @param {requestCallback} [callback] Optional callback method to be called instead of the promise.
   * @returns {Promise|undefined} A promise that if successful, resolves to an object containing a paging object which in turn contains
   *          playlist track objects. Not returned if a callback is given.
   */
  getMySavedTracks: function(options, callback) {
    var request = WebApiRequest.builder()
      .withPath('/v1/me/tracks')
      .withQueryParameters(options)
      .build();

    this._addAccessToken(request, this.getAccessToken());

    var promise = this._performRequest(HttpManager.get, request);

    if (callback) {
      promise.then(function(data) {
        callback(null, data);
      }, function(err) {
        callback(err);
      });
    } else {
      return promise;
    }
  },

  /**
   * Check if one or more tracks is already saved in the current Spotify user’s “Your Music” library.
   * @param {string[]} trackIds The track IDs
   * @param {requestCallback} [callback] Optional callback method to be called instead of the promise.
   * @returns {Promise|undefined} A promise that if successful, resolves into an array of booleans. The order
   * of the returned array's elements correspond to the track ID in the request.
   * The boolean value of true indicates that the track is part of the user's library, otherwise false.
   * Not returned if a callback is given.
   */
  containsMySavedTracks: function(trackIds, callback) {
    var request = WebApiRequest.builder()
      .withPath('/v1/me/tracks/contains')
      .withQueryParameters({
        'ids' : trackIds.join(',')
      })
      .build();

    this._addAccessToken(request, this.getAccessToken());

    var promise = this._performRequest(HttpManager.get, request);

    if (callback) {
      promise.then(function(data) {
        callback(null, data);
      }, function(err) {
        callback(err);
      });
    } else {
      return promise;
    }
  },

  /**
   * Remove a track from the authenticated user's Your Music library.
   * @param {string[]} trackIds The track IDs
   * @param {requestCallback} [callback] Optional callback method to be called instead of the promise.
   * @returns {Promise|undefined} A promise that if successful returns null, otherwise an error.
   * Not returned if a callback is given.
   */
  removeFromMySavedTracks: function(trackIds, callback) {
    var request = WebApiRequest.builder()
      .withPath('/v1/me/tracks')
      .withHeaders({ 'Content-Type' : 'application/json' })
      .withBodyParameters(trackIds)
      .build();

    this._addAccessToken(request, this.getAccessToken());

    var promise = this._performRequest(HttpManager.del, request);

    if (callback) {
      promise.then(function(data) {
        callback(null, data);
      }, function(err) {
        callback(err);
      });
    } else {
      return promise;
    }
  },

   /**
   * Add a track from the authenticated user's Your Music library.
   * @param {string[]} trackIds The track IDs
   * @param {requestCallback} [callback] Optional callback method to be called instead of the promise.
   * @returns {Promise|undefined} A promise that if successful returns null, otherwise an error. Not returned if a callback is given.
   */
  addToMySavedTracks: function(trackIds, callback) {
    var request = WebApiRequest.builder()
      .withPath('/v1/me/tracks')
      .withHeaders({ 'Content-Type' : 'application/json' })
      .withBodyParameters(trackIds)
      .build();

    this._addAccessToken(request, this.getAccessToken());

    var promise = this._performRequest(HttpManager.put, request);

    if (callback) {
      promise.then(function(data) {
        callback(null, data);
      }, function(err) {
        callback(err);
      });
    } else {
      return promise;
    }
  },

  /**
   * Remove an album from the authenticated user's Your Music library.
   * @param {string[]} albumIds The album IDs
   * @param {requestCallback} [callback] Optional callback method to be called instead of the promise.
   * @returns {Promise|undefined} A promise that if successful returns null, otherwise an error.
   * Not returned if a callback is given.
   */
  removeFromMySavedAlbums: function(albumIds, callback) {
    var request = WebApiRequest.builder()
      .withPath('/v1/me/albums')
      .withHeaders({ 'Content-Type' : 'application/json' })
      .withBodyParameters(albumIds)
      .build();

    this._addAccessToken(request, this.getAccessToken());

    var promise = this._performRequest(HttpManager.del, request);

    if (callback) {
      promise.then(function(data) {
        callback(null, data);
      }, function(err) {
        callback(err);
      });
    } else {
      return promise;
    }
  },

  /**
   * Add an album from the authenticated user's Your Music library.
   * @param {string[]} albumIds The track IDs
   * @param {requestCallback} [callback] Optional callback method to be called instead of the promise.
   * @returns {Promise|undefined} A promise that if successful returns null, otherwise an error. Not returned if a callback is given.
   */
  addToMySavedAlbums: function(albumIds, callback) {
    var request = WebApiRequest.builder()
      .withPath('/v1/me/albums')
      .withHeaders({ 'Content-Type' : 'application/json' })
      .withBodyParameters(albumIds)
      .build();

    this._addAccessToken(request, this.getAccessToken());

    var promise = this._performRequest(HttpManager.put, request);

    if (callback) {
      promise.then(function(data) {
        callback(null, data);
      }, function(err) {
        callback(err);
      });
    } else {
      return promise;
    }
  },

  /**
   * Retrieve the albums that are saved to the authenticated users Your Music library.
   * @param {Object} [options] Options, being market, limit, and/or offset.
   * @param {requestCallback} [callback] Optional callback method to be called instead of the promise.
   * @returns {Promise|undefined} A promise that if successful, resolves to an object containing a paging object which in turn contains
   *          playlist album objects. Not returned if a callback is given.
   */
  getMySavedAlbums: function(options, callback) {
    var request = WebApiRequest.builder()
      .withPath('/v1/me/albums')
      .withQueryParameters(options)
      .build();

    this._addAccessToken(request, this.getAccessToken());

    var promise = this._performRequest(HttpManager.get, request);

    if (callback) {
      promise.then(function(data) {
        callback(null, data);
      }, function(err) {
        callback(err);
      });
    } else {
      return promise;
    }
  },

  /**
   * Check if one or more albums is already saved in the current Spotify user’s “Your Music” library.
   * @param {string[]} albumIds The album IDs
   * @param {requestCallback} [callback] Optional callback method to be called instead of the promise.
   * @returns {Promise|undefined} A promise that if successful, resolves into an array of booleans. The order
   * of the returned array's elements correspond to the album ID in the request.
   * The boolean value of true indicates that the album is part of the user's library, otherwise false.
   * Not returned if a callback is given.
   */
  containsMySavedAlbums: function(albumIds, callback) {
    var request = WebApiRequest.builder()
      .withPath('/v1/me/albums/contains')
      .withQueryParameters({
        'ids' : albumIds.join(',')
      })
      .build();

    this._addAccessToken(request, this.getAccessToken());

    var promise = this._performRequest(HttpManager.get, request);

    if (callback) {
      promise.then(function(data) {
        callback(null, data);
      }, function(err) {
        callback(err);
      });
    } else {
      return promise;
    }
  },

  /**
   * Get the current user's top artists based on calculated affinity.
   * @param {Object} [options] Options, being time_range, limit, offset.
   * @param {requestCallback} [callback] Optional callback method to be called instead of the promise.
   * @returns {Promise|undefined} A promise that if successful, resolves into a paging object of artists,
   *          otherwise an error. Not returned if a callback is given.
   */
  getMyTopArtists: function(options, callback) {
    var request = WebApiRequest.builder()
      .withPath('/v1/me/top/artists')
      .build();

    this._addAccessToken(request, this.getAccessToken());
    this._addQueryParameters(request, options);

    var promise = this._performRequest(HttpManager.get, request);

    if (callback) {
      promise.then(function(data) {
        callback(null, data);
      }, function(err) {
        callback(err);
      });
    } else {
      return promise;
    }
  },

  /**
   * Get the current user's top tracks based on calculated affinity.
   * @param {Object} [options] Options, being time_range, limit, offset.
   * @param {requestCallback} [callback] Optional callback method to be called instead of the promise.
   * @returns {Promise|undefined} A promise that if successful, resolves into a paging object of tracks,
   *          otherwise an error. Not returned if a callback is given.
   */
  getMyTopTracks: function(options, callback) {
    var request = WebApiRequest.builder()
      .withPath('/v1/me/top/tracks')
      .build();

    this._addAccessToken(request, this.getAccessToken());
    this._addQueryParameters(request, options);

    var promise = this._performRequest(HttpManager.get, request);

    if (callback) {
      promise.then(function(data) {
        callback(null, data);
      }, function(err) {
        callback(err);
      });
    } else {
      return promise;
    }
  },

  /**
   * Get the Current User's Recently Played Tracks
   * @param {Object} [options] Options, being type, after, limit, before.
   * @param {requestCallback} [callback] Optional callback method to be called instead of the promise.
   * @returns {Promise|undefined} A promise that if successful, resolves into a paging object of tracks,
   *          otherwise an error. Not returned if a callback is given.
   */
  getMyRecentlyPlayedTracks: function(options, callback) {
    var request = WebApiRequest.builder()
      .withPath('/v1/me/player/recently-played')
      .build();

    this._addAccessToken(request, this.getAccessToken());
    this._addQueryParameters(request, options);

    var promise = this._performRequest(HttpManager.get, request);

    if (callback) {
      promise.then(function(data) {
        callback(null, data);
      }, function(err) {
        callback(err);
      });
    } else {
      return promise;
    }
  },

  /**
   * Get the Current User's Connect Devices
   * @param {requestCallback} [callback] Optional callback method to be called instead of the promise.
   * @returns {Promise|undefined} A promise that if successful, resolves into a paging object of tracks,
   *          otherwise an error. Not returned if a callback is given.
   */
  getMyDevices: function(callback) {
    var request = WebApiRequest.builder()
      .withPath('/v1/me/player/devices')
      .build();

    this._addAccessToken(request, this.getAccessToken());

    var promise = this._performRequest(HttpManager.get, request);

    if (callback) {
      promise.then(function(data) {
        callback(null, data);
      }, function(err) {
        callback(err);
      });
    } else {
      return promise;
    }
  },


  /**
   * Get the Current User's Currently Playing Track.
   * @param {Object} [options] Options, being market.
   * @param {requestCallback} [callback] Optional callback method to be called instead of the promise.
   * @returns {Promise|undefined} A promise that if successful, resolves into a paging object of tracks,
   *          otherwise an error. Not returned if a callback is given.
   */
  getMyCurrentPlayingTrack: function(options, callback) {
    var request = WebApiRequest.builder()
      .withPath('/v1/me/player/currently-playing')
      .build();

    this._addAccessToken(request, this.getAccessToken());
    this._addQueryParameters(request, options);

    var promise = this._performRequest(HttpManager.get, request);

    if (callback) {
      promise.then(function(data) {
        callback(null, data);
      }, function(err) {
        callback(err);
      });
    } else {
      return promise;
    }
  },

  /**
   * Get the Current User's Current Playback State
   * @param {Object} [options] Options, being market.
   * @param {requestCallback} [callback] Optional callback method to be called instead of the promise.
   * @returns {Promise|undefined} A promise that if successful, resolves into a paging object of tracks,
   *          otherwise an error. Not returned if a callback is given.
   */
  getMyCurrentPlaybackState: function(options, callback) {
    var request = WebApiRequest.builder()
      .withPath('/v1/me/player')
      .build();

    this._addAccessToken(request, this.getAccessToken());
    this._addQueryParameters(request, options);

    var promise = this._performRequest(HttpManager.get, request);

    if (callback) {
      promise.then(function(data) {
        callback(null, data);
      }, function(err) {
        callback(err);
      });
    } else {
      return promise;
    }
  },

  /**
   * Transfer a User's Playback
   * @param {Object} [options] Options, being market.
   * @param {requestCallback} [callback] Optional callback method to be called instead of the promise.
   * @returns {Promise|undefined} A promise that if successful, resolves into a paging object of tracks,
   *          otherwise an error. Not returned if a callback is given.
   */
  transferMyPlayback: function(options, callback) {
    var request = WebApiRequest.builder()
      .withPath('/v1/me/player')
      .withHeaders({ 'Content-Type' : 'application/json' })
      .withBodyParameters({
        'device_ids': options.deviceIds,
        'play': options.play || false
      })
      .build();

    delete options.deviceIds;
    this._addAccessToken(request, this.getAccessToken());
    this._addBodyParameters(request, options);

    var promise = this._performRequest(HttpManager.put, request);

    if (callback) {
      promise.then(function(data) {
        callback(null, data);
      }, function(err) {
        callback(err);
      });
    } else {
      return promise;
    }
  },

  /**
   * Starts o Resumes the Current User's Playback
   * @param {Object} [options] Options, being context_uri, offset, uris.
   * @param {requestCallback} [callback] Optional callback method to be called instead of the promise.
   * @example playbackResume({context_uri: 'spotify:album:5ht7ItJgpBH7W6vJ5BqpPr'}).then(...)
   * @returns {Promise|undefined} A promise that if successful, resolves into a paging object of tracks,
   *          otherwise an error. Not returned if a callback is given.
   */
  play: function(options, callback) {

    var actualOptions = {};
    if (typeof options === 'object') {
      Object.keys(options).forEach(function(key) {
        actualOptions[key] = options[key];
      });
    }

    var request = WebApiRequest.builder()
      .withPath('/v1/me/player/play')
      .withHeaders({ 'Content-Type' : 'application/json' })
      .withBodyParameters(actualOptions)
      .build();

    this._addAccessToken(request, this.getAccessToken());

    var promise = this._performRequest(HttpManager.put, request);

    if (callback) {
      promise.then(function(data) {
        callback(null, data);
      }, function(err) {
        callback(err);
      });
    } else {
      return promise;
    }
  },

  /**
   * Pauses the Current User's Playback
   * @param {requestCallback} [callback] Optional callback method to be called instead of the promise.
   * @example playbackPause().then(...)
   * @returns {Promise|undefined} A promise that if successful, resolves into a paging object of tracks,
   *          otherwise an error. Not returned if a callback is given.
   */
  pause: function(callback) {
    var request = WebApiRequest.builder()
      .withPath('/v1/me/player/pause')
      .build();

    this._addAccessToken(request, this.getAccessToken());

    var promise = this._performRequest(HttpManager.put, request);

    if (callback) {
      promise.then(function(data) {
        callback(null, data);
      }, function(err) {
        callback(err);
      });
    } else {
      return promise;
    }
  },

  /**
   * Skip the Current User's Playback To Previous Track
   * @param {requestCallback} [callback] Optional callback method to be called instead of the promise.
   * @example playbackPrevious().then(...)
   * @returns {Promise|undefined} A promise that if successful, resolves into a paging object of tracks,
   *          otherwise an error. Not returned if a callback is given.
   */
  skipToPrevious: function(callback) {
    var request = WebApiRequest.builder()
      .withPath('/v1/me/player/previous')
      .build();

    this._addAccessToken(request, this.getAccessToken());

    var promise = this._performRequest(HttpManager.post, request);

    if (callback) {
      promise.then(function(data) {
        callback(null, data);
      }, function(err) {
        callback(err);
      });
    } else {
      return promise;
    }
  },

  /**
   * Skip the Current User's Playback To Next Track
   * @param {requestCallback} [callback] Optional callback method to be called instead of the promise.
   * @example playbackNext().then(...)
   * @returns {Promise|undefined} A promise that if successful, resolves into a paging object of tracks,
   *          otherwise an error. Not returned if a callback is given.
   */
  skipToNext: function(callback) {
    var request = WebApiRequest.builder()
      .withPath('/v1/me/player/next')
      .build();

    this._addAccessToken(request, this.getAccessToken());

    var promise = this._performRequest(HttpManager.post, request);

    if (callback) {
      promise.then(function(data) {
        callback(null, data);
      }, function(err) {
        callback(err);
      });
    } else {
      return promise;
    }
  },

  /**
   * Set Repeat Mode On The Current User's Playback
   * @param {Object} [options] Options, being state (track, context, off).
   * @param {requestCallback} [callback] Optional callback method to be called instead of the promise.
   * @example playbackRepeat({state: 'context'}).then(...)
   * @returns {Promise|undefined} A promise that if successful, resolves into a paging object of tracks,
   *          otherwise an error. Not returned if a callback is given.
   */
  setRepeat: function(options, callback) {
    var request = WebApiRequest.builder()
      .withPath('/v1/me/player/repeat')
      .withQueryParameters({
        'state': options.state || 'off'
      })
      .build();

    this._addAccessToken(request, this.getAccessToken());

    var promise = this._performRequest(HttpManager.put, request);

    if (callback) {
      promise.then(function(data) {
        callback(null, data);
      }, function(err) {
        callback(err);
      });
    } else {
      return promise;
    }
  },

  /**
   * Set Shuffle Mode On The Current User's Playback
   * @param {Object} [options] Options, being state (true, false).
   * @param {requestCallback} [callback] Optional callback method to be called instead of the promise.
   * @example playbackShuffle({state: 'false'}).then(...)
   * @returns {Promise|undefined} A promise that if successful, resolves into a paging object of tracks,
   *          otherwise an error. Not returned if a callback is given.
   */
  setShuffle: function(options, callback) {
    var request = WebApiRequest.builder()
      .withPath('/v1/me/player/shuffle')
      .withQueryParameters({
        'state': options.state || 'false'
      })
      .build();

    this._addAccessToken(request, this.getAccessToken());

    var promise = this._performRequest(HttpManager.put, request);

    if (callback) {
      promise.then(function(data) {
        callback(null, data);
      }, function(err) {
        callback(err);
      });
    } else {
      return promise;
    }
  },

  /**
   * Add the current user as a follower of one or more other Spotify users.
   * @param {string[]} userIds The IDs of the users to be followed.
   * @param {requestCallback} [callback] Optional callback method to be called instead of the promise.
   * @example followUsers(['thelinmichael', 'wizzler']).then(...)
   * @returns {Promise|undefined} A promise that if successful, simply resolves to an empty object. If rejected,
   *          it contains an error object. Not returned if a callback is given.
   */
  followUsers: function(userIds, callback) {
    var request = WebApiRequest.builder()
      .withPath('/v1/me/following')
      .withQueryParameters({
        ids: userIds.join(','),
        type: 'user'
      })
      .build();

    this._addAccessToken(request, this.getAccessToken());

    var promise = this._performRequest(HttpManager.put, request);

    if (callback) {
      promise.then(function(data) {
        callback(null, data);
      }, function(err) {
        callback(err);
      });
    } else {
      return promise;
    }
  },

  /**
   * Add the current user as a follower of one or more artists.
   * @param {string[]} artistIds The IDs of the artists to be followed.
   * @param {requestCallback} [callback] Optional callback method to be called instead of the promise.
   * @example followArtists(['0LcJLqbBmaGUft1e9Mm8HV', '3gqv1kgivAc92KnUm4elKv']).then(...)
   * @returns {Promise|undefined} A promise that if successful, simply resolves to an empty object. If rejected,
   *          it contains an error object. Not returned if a callback is given.
   */
  followArtists: function(artistIds, callback) {
    var request = WebApiRequest.builder()
      .withPath('/v1/me/following')
      .withQueryParameters({
        ids: artistIds.join(','),
        type: 'artist'
      })
      .build();

    this._addAccessToken(request, this.getAccessToken());

    var promise = this._performRequest(HttpManager.put, request);

    if (callback) {
      promise.then(function(data) {
        callback(null, data);
      }, function(err) {
        callback(err);
      });
    } else {
      return promise;
    }
  },

  /**
   * Remove the current user as a follower of one or more other Spotify users.
   * @param {string[]} userIds The IDs of the users to be unfollowed.
   * @param {requestCallback} [callback] Optional callback method to be called instead of the promise.
   * @example unfollowUsers(['thelinmichael', 'wizzler']).then(...)
   * @returns {Promise|undefined} A promise that if successful, simply resolves to an empty object. If rejected,
   *          it contains an error object. Not returned if a callback is given.
   */
  unfollowUsers: function(userIds, callback) {
    var request = WebApiRequest.builder()
      .withPath('/v1/me/following')
      .withQueryParameters({
        ids: userIds.join(','),
        type: 'user'
      })
      .build();

    this._addAccessToken(request, this.getAccessToken());

    var promise = this._performRequest(HttpManager.del, request);

    if (callback) {
      promise.then(function(data) {
        callback(null, data);
      }, function(err) {
        callback(err);
      });
    } else {
      return promise;
    }
  },

  /**
   * Remove the current user as a follower of one or more artists.
   * @param {string[]} artistIds The IDs of the artists to be unfollowed.
   * @param {requestCallback} [callback] Optional callback method to be called instead of the promise.
   * @example unfollowArtists(['0LcJLqbBmaGUft1e9Mm8HV', '3gqv1kgivAc92KnUm4elKv']).then(...)
   * @returns {Promise|undefined} A promise that if successful, simply resolves to an empty object. If rejected,
   *          it contains an error object. Not returned if a callback is given.
   */
  unfollowArtists: function(artistIds, callback) {
    var request = WebApiRequest.builder()
      .withPath('/v1/me/following')
      .withQueryParameters({
        ids: artistIds.join(','),
        type: 'artist'
      })
      .build();

    this._addAccessToken(request, this.getAccessToken());

    var promise = this._performRequest(HttpManager.del, request);

    if (callback) {
      promise.then(function(data) {
        callback(null, data);
      }, function(err) {
        callback(err);
      });
    } else {
      return promise;
    }
  },

  /**
   * Check to see if the current user is following one or more other Spotify users.
   * @param {string[]} userIds The IDs of the users to check if are followed by the current user.
   * @param {requestCallback} [callback] Optional callback method to be called instead of the promise.
   * @example isFollowingUsers(['thelinmichael', 'wizzler']).then(...)
   * @returns {Promise|undefined} A promise that if successful, resolves into an array of booleans. The order
   *          of the returned array's elements correspond to the users IDs in the request.
   *          The boolean value of true indicates that the user is following that user, otherwise is not.
   *          Not returned if a callback is given.
   */
  isFollowingUsers: function(userIds, callback) {
    var request = WebApiRequest.builder()
      .withPath('/v1/me/following/contains')
      .withQueryParameters({
        ids: userIds.join(','),
        type: 'user'
      })
      .build();

    this._addAccessToken(request, this.getAccessToken());

    var promise = this._performRequest(HttpManager.get, request);

    if (callback) {
      promise.then(function(data) {
        callback(null, data);
      }, function(err) {
        callback(err);
      });
    } else {
      return promise;
    }
  },

  /**
   * Get the current user's followed artists.
   * @param {Object} [options] Options, being after and limit.
   * @param {requestCallback} [callback] Optional callback method to be called instead of the promise.
   * @returns {Promise|undefined} A promise that if successful, resolves to an object containing a paging object which contains
   * album objects. Not returned if a callback is given.
   */
  getFollowedArtists: function(options, callback) {
    var request = WebApiRequest.builder()
      .withPath('/v1/me/following')
      .withHeaders({ 'Content-Type' : 'application/json' })
      .withQueryParameters({
        type : 'artist'
      })
      .build();

    this._addAccessToken(request, this.getAccessToken());
    this._addQueryParameters(request, options);

    var promise = this._performRequest(HttpManager.get, request);

    if (callback) {
      promise.then(function(data) {
        callback(null, data);
      }, function(err) {
        callback(err);
      });
    } else {
      return promise;
    }
  },

  /**
   * Check if users are following a playlist.
   * @param {string} userId The playlist's owner's user ID
   * @param {string} playlistId The playlist's ID
   * @param {String[]} User IDs of the following users
   * @param {requestCallback} [callback] Optional callback method to be called instead of the promise.
   * @returns {Promise|undefined} A promise that if successful returns an array of booleans. If rejected,
   * it contains an error object. Not returned if a callback is given.
   */
  areFollowingPlaylist: function(userId, playlistId, followerIds, callback) {
    var request = WebApiRequest.builder()
      .withPath('/v1/users/' + encodeURIComponent(userId) + '/playlists/' + playlistId + '/followers/contains')
      .withQueryParameters({
        ids : followerIds.join(',')
      })
      .build();

    this._addAccessToken(request, this.getAccessToken());

    var promise = this._performRequest(HttpManager.get, request);

    if (callback) {
      promise.then(function(data) {
        callback(null, data);
      }, function(err) {
        callback(err);
      });
    } else {
      return promise;
    }
  },

  /**
   * Check to see if the current user is following one or more artists.
   * @param {string[]} artistIds The IDs of the artists to check if are followed by the current user.
   * @param {requestCallback} [callback] Optional callback method to be called instead of the promise.
   * @example isFollowingArtists(['0LcJLqbBmaGUft1e9Mm8HV', '3gqv1kgivAc92KnUm4elKv']).then(...)
   * @returns {Promise|undefined} A promise that if successful, resolves into an array of booleans. The order
   *          of the returned array's elements correspond to the artists IDs in the request.
   *          The boolean value of true indicates that the user is following that artist, otherwise is not.
   *          Not returned if a callback is given.
   */
  isFollowingArtists: function(artistIds, callback) {
    var request = WebApiRequest.builder()
      .withPath('/v1/me/following/contains')
      .withQueryParameters({
        ids: artistIds.join(','),
        type: 'artist'
      })
      .build();

    this._addAccessToken(request, this.getAccessToken());

    var promise = this._performRequest(HttpManager.get, request);

    if (callback) {
      promise.then(function(data) {
        callback(null, data);
      }, function(err) {
        callback(err);
      });
    } else {
      return promise;
    }
  },

  /**
   * Retrieve new releases
   * @param {Object} [options] Options, being country, limit and/or offset.
   * @param {requestCallback} [callback] Optional callback method to be called instead of the promise.
   * @returns {Promise|undefined} A promise that if successful, resolves to an object containing a paging object which contains
   * album objects. Not returned if a callback is given.
   */
  getNewReleases: function(options, callback) {
    var request = WebApiRequest.builder()
      .withPath('/v1/browse/new-releases')
      .withHeaders({ 'Content-Type' : 'application/json' })
      .withQueryParameters(options)
      .build();

    this._addAccessToken(request, this.getAccessToken());

    var promise = this._performRequest(HttpManager.get, request);

    if (callback) {
      promise.then(function(data) {
        callback(null, data);
      }, function(err) {
        callback(err);
      });
    } else {
      return promise;
    }
  },

  /**
   * Retrieve featured playlists
   * @param {Object} [options] Options, being country, locale, timestamp, limit, offset.
   * @param {requestCallback} [callback] Optional callback method to be called instead of the promise.
   * @returns {Promise|undefined} A promise that if successful, resolves to an object containing a paging object which contains
   * featured playlists. Not returned if a callback is given.
   */
  getFeaturedPlaylists: function(options, callback) {
    var request = WebApiRequest.builder()
      .withPath('/v1/browse/featured-playlists')
      .withHeaders({ 'Content-Type' : 'application/json' })
      .withQueryParameters(options)
      .build();

    this._addAccessToken(request, this.getAccessToken());

    var promise = this._performRequest(HttpManager.get, request);

    if (callback) {
      promise.then(function(data) {
        callback(null, data);
      }, function(err) {
        callback(err);
      });
    } else {
      return promise;
    }
  },

  /**
   * Retrieve a list of categories used to tag items in Spotify (e.g. in the 'Browse' tab)
   * @param {Object} [options] Options, being country, locale, limit, offset.
   * @param {requestCallback} [callback] Optional callback method to be called instead of the promise.
   * @returns {Promise|undefined} A promise that if successful, resolves to an object containing a paging object of categories.
   * Not returned if a callback is given.
   */
  getCategories: function(options, callback) {
    var request = WebApiRequest.builder()
      .withPath('/v1/browse/categories')
      .withQueryParameters(options)
      .build();

    this._addAccessToken(request, this.getAccessToken());

    var promise = this._performRequest(HttpManager.get, request);

    if (callback) {
      promise.then(function(data) {
        callback(null, data);
      }, function(err) {
        callback(err);
      });
    } else {
      return promise;
    }
  },

  /**
   * Retrieve a category.
   * @param {string} categoryId The id of the category to retrieve.
   * @param {Object} [options] Options, being country, locale.
   * @param {requestCallback} [callback] Optional callback method to be called instead of the promise.
   * @returns {Promise|undefined} A promise that if successful, resolves to an object containing a category object.
   * Not returned if a callback is given.
   */
  getCategory: function(categoryId, options, callback) {
    var request = WebApiRequest.builder()
      .withPath('/v1/browse/categories/' + categoryId)
      .withQueryParameters(options)
      .build();

    this._addAccessToken(request, this.getAccessToken());

    var promise = this._performRequest(HttpManager.get, request);

    if (callback) {
      promise.then(function(data) {
        callback(null, data);
      }, function(err) {
        callback(err);
      });
    } else {
      return promise;
    }
  },

  /**
   * Retrieve playlists for a category.
   * @param {string} categoryId The id of the category to retrieve playlists for.
   * @param {Object} [options] Options, being country, limit, offset.
   * @param {requestCallback} [callback] Optional callback method to be called instead of the promise.
   * @returns {Promise|undefined} A promise that if successful, resolves to a paging object containing simple playlists.
   * Not returned if a callback is given.
   */
  getPlaylistsForCategory: function(categoryId, options, callback) {
    var request = WebApiRequest.builder()
      .withPath('/v1/browse/categories/' + categoryId + '/playlists')
      .withQueryParameters(options)
      .build();

    this._addAccessToken(request, this.getAccessToken());

    var promise = this._performRequest(HttpManager.get, request);

    if (callback) {
      promise.then(function(data) {
        callback(null, data);
      }, function(err) {
        callback(err);
      });
    } else {
      return promise;
    }
  }
};

SpotifyWebApi._addMethods = function(methods) {
  for (var i in methods) {
    if (methods.hasOwnProperty(i)) {
      this.prototype[i] = methods[i];
    }
  }
};

module.exports = SpotifyWebApi;

},{"./authentication-request":3,"./http-manager":6,"./webapi-request":9}],8:[function(require,module,exports){
'use strict';

function WebapiError(message, statusCode) {
  this.name = 'WebapiError';
  this.message = (message || '');
  this.statusCode = statusCode;
}

WebapiError.prototype = Error.prototype;

module.exports = WebapiError;
},{}],9:[function(require,module,exports){
'use strict';

var Request = require('./base-request');

var DEFAULT_HOST = 'api.spotify.com',
    DEFAULT_PORT = 443,
    DEFAULT_SCHEME = 'https';

module.exports.builder = function() {
  return Request.builder()
      .withHost(DEFAULT_HOST)
      .withPort(DEFAULT_PORT)
      .withScheme(DEFAULT_SCHEME);
};
},{"./base-request":4}],10:[function(require,module,exports){
/**
 * Root reference for iframes.
 */

var root;
if (typeof window !== 'undefined') { // Browser window
  root = window;
} else if (typeof self !== 'undefined') { // Web Worker
  root = self;
} else { // Other environments
  console.warn("Using browser-only version of superagent in non-browser environment");
  root = this;
}

var Emitter = require('emitter');
var requestBase = require('./request-base');
var isObject = require('./is-object');

/**
 * Noop.
 */

function noop(){};

/**
 * Expose `request`.
 */

var request = module.exports = require('./request').bind(null, Request);

/**
 * Determine XHR.
 */

request.getXHR = function () {
  if (root.XMLHttpRequest
      && (!root.location || 'file:' != root.location.protocol
          || !root.ActiveXObject)) {
    return new XMLHttpRequest;
  } else {
    try { return new ActiveXObject('Microsoft.XMLHTTP'); } catch(e) {}
    try { return new ActiveXObject('Msxml2.XMLHTTP.6.0'); } catch(e) {}
    try { return new ActiveXObject('Msxml2.XMLHTTP.3.0'); } catch(e) {}
    try { return new ActiveXObject('Msxml2.XMLHTTP'); } catch(e) {}
  }
  throw Error("Browser-only verison of superagent could not find XHR");
};

/**
 * Removes leading and trailing whitespace, added to support IE.
 *
 * @param {String} s
 * @return {String}
 * @api private
 */

var trim = ''.trim
  ? function(s) { return s.trim(); }
  : function(s) { return s.replace(/(^\s*|\s*$)/g, ''); };

/**
 * Serialize the given `obj`.
 *
 * @param {Object} obj
 * @return {String}
 * @api private
 */

function serialize(obj) {
  if (!isObject(obj)) return obj;
  var pairs = [];
  for (var key in obj) {
    pushEncodedKeyValuePair(pairs, key, obj[key]);
  }
  return pairs.join('&');
}

/**
 * Helps 'serialize' with serializing arrays.
 * Mutates the pairs array.
 *
 * @param {Array} pairs
 * @param {String} key
 * @param {Mixed} val
 */

function pushEncodedKeyValuePair(pairs, key, val) {
  if (val != null) {
    if (Array.isArray(val)) {
      val.forEach(function(v) {
        pushEncodedKeyValuePair(pairs, key, v);
      });
    } else if (isObject(val)) {
      for(var subkey in val) {
        pushEncodedKeyValuePair(pairs, key + '[' + subkey + ']', val[subkey]);
      }
    } else {
      pairs.push(encodeURIComponent(key)
        + '=' + encodeURIComponent(val));
    }
  } else if (val === null) {
    pairs.push(encodeURIComponent(key));
  }
}

/**
 * Expose serialization method.
 */

 request.serializeObject = serialize;

 /**
  * Parse the given x-www-form-urlencoded `str`.
  *
  * @param {String} str
  * @return {Object}
  * @api private
  */

function parseString(str) {
  var obj = {};
  var pairs = str.split('&');
  var pair;
  var pos;

  for (var i = 0, len = pairs.length; i < len; ++i) {
    pair = pairs[i];
    pos = pair.indexOf('=');
    if (pos == -1) {
      obj[decodeURIComponent(pair)] = '';
    } else {
      obj[decodeURIComponent(pair.slice(0, pos))] =
        decodeURIComponent(pair.slice(pos + 1));
    }
  }

  return obj;
}

/**
 * Expose parser.
 */

request.parseString = parseString;

/**
 * Default MIME type map.
 *
 *     superagent.types.xml = 'application/xml';
 *
 */

request.types = {
  html: 'text/html',
  json: 'application/json',
  xml: 'application/xml',
  urlencoded: 'application/x-www-form-urlencoded',
  'form': 'application/x-www-form-urlencoded',
  'form-data': 'application/x-www-form-urlencoded'
};

/**
 * Default serialization map.
 *
 *     superagent.serialize['application/xml'] = function(obj){
 *       return 'generated xml here';
 *     };
 *
 */

 request.serialize = {
   'application/x-www-form-urlencoded': serialize,
   'application/json': JSON.stringify
 };

 /**
  * Default parsers.
  *
  *     superagent.parse['application/xml'] = function(str){
  *       return { object parsed from str };
  *     };
  *
  */

request.parse = {
  'application/x-www-form-urlencoded': parseString,
  'application/json': JSON.parse
};

/**
 * Parse the given header `str` into
 * an object containing the mapped fields.
 *
 * @param {String} str
 * @return {Object}
 * @api private
 */

function parseHeader(str) {
  var lines = str.split(/\r?\n/);
  var fields = {};
  var index;
  var line;
  var field;
  var val;

  lines.pop(); // trailing CRLF

  for (var i = 0, len = lines.length; i < len; ++i) {
    line = lines[i];
    index = line.indexOf(':');
    field = line.slice(0, index).toLowerCase();
    val = trim(line.slice(index + 1));
    fields[field] = val;
  }

  return fields;
}

/**
 * Check if `mime` is json or has +json structured syntax suffix.
 *
 * @param {String} mime
 * @return {Boolean}
 * @api private
 */

function isJSON(mime) {
  return /[\/+]json\b/.test(mime);
}

/**
 * Return the mime type for the given `str`.
 *
 * @param {String} str
 * @return {String}
 * @api private
 */

function type(str){
  return str.split(/ *; */).shift();
};

/**
 * Return header field parameters.
 *
 * @param {String} str
 * @return {Object}
 * @api private
 */

function params(str){
  return str.split(/ *; */).reduce(function(obj, str){
    var parts = str.split(/ *= */),
        key = parts.shift(),
        val = parts.shift();

    if (key && val) obj[key] = val;
    return obj;
  }, {});
};

/**
 * Initialize a new `Response` with the given `xhr`.
 *
 *  - set flags (.ok, .error, etc)
 *  - parse header
 *
 * Examples:
 *
 *  Aliasing `superagent` as `request` is nice:
 *
 *      request = superagent;
 *
 *  We can use the promise-like API, or pass callbacks:
 *
 *      request.get('/').end(function(res){});
 *      request.get('/', function(res){});
 *
 *  Sending data can be chained:
 *
 *      request
 *        .post('/user')
 *        .send({ name: 'tj' })
 *        .end(function(res){});
 *
 *  Or passed to `.send()`:
 *
 *      request
 *        .post('/user')
 *        .send({ name: 'tj' }, function(res){});
 *
 *  Or passed to `.post()`:
 *
 *      request
 *        .post('/user', { name: 'tj' })
 *        .end(function(res){});
 *
 * Or further reduced to a single call for simple cases:
 *
 *      request
 *        .post('/user', { name: 'tj' }, function(res){});
 *
 * @param {XMLHTTPRequest} xhr
 * @param {Object} options
 * @api private
 */

function Response(req, options) {
  options = options || {};
  this.req = req;
  this.xhr = this.req.xhr;
  // responseText is accessible only if responseType is '' or 'text' and on older browsers
  this.text = ((this.req.method !='HEAD' && (this.xhr.responseType === '' || this.xhr.responseType === 'text')) || typeof this.xhr.responseType === 'undefined')
     ? this.xhr.responseText
     : null;
  this.statusText = this.req.xhr.statusText;
  this._setStatusProperties(this.xhr.status);
  this.header = this.headers = parseHeader(this.xhr.getAllResponseHeaders());
  // getAllResponseHeaders sometimes falsely returns "" for CORS requests, but
  // getResponseHeader still works. so we get content-type even if getting
  // other headers fails.
  this.header['content-type'] = this.xhr.getResponseHeader('content-type');
  this._setHeaderProperties(this.header);
  this.body = this.req.method != 'HEAD'
    ? this._parseBody(this.text ? this.text : this.xhr.response)
    : null;
}

/**
 * Get case-insensitive `field` value.
 *
 * @param {String} field
 * @return {String}
 * @api public
 */

Response.prototype.get = function(field){
  return this.header[field.toLowerCase()];
};

/**
 * Set header related properties:
 *
 *   - `.type` the content type without params
 *
 * A response of "Content-Type: text/plain; charset=utf-8"
 * will provide you with a `.type` of "text/plain".
 *
 * @param {Object} header
 * @api private
 */

Response.prototype._setHeaderProperties = function(header){
  // content-type
  var ct = this.header['content-type'] || '';
  this.type = type(ct);

  // params
  var obj = params(ct);
  for (var key in obj) this[key] = obj[key];
};

/**
 * Parse the given body `str`.
 *
 * Used for auto-parsing of bodies. Parsers
 * are defined on the `superagent.parse` object.
 *
 * @param {String} str
 * @return {Mixed}
 * @api private
 */

Response.prototype._parseBody = function(str){
  var parse = request.parse[this.type];
  if (!parse && isJSON(this.type)) {
    parse = request.parse['application/json'];
  }
  return parse && str && (str.length || str instanceof Object)
    ? parse(str)
    : null;
};

/**
 * Set flags such as `.ok` based on `status`.
 *
 * For example a 2xx response will give you a `.ok` of __true__
 * whereas 5xx will be __false__ and `.error` will be __true__. The
 * `.clientError` and `.serverError` are also available to be more
 * specific, and `.statusType` is the class of error ranging from 1..5
 * sometimes useful for mapping respond colors etc.
 *
 * "sugar" properties are also defined for common cases. Currently providing:
 *
 *   - .noContent
 *   - .badRequest
 *   - .unauthorized
 *   - .notAcceptable
 *   - .notFound
 *
 * @param {Number} status
 * @api private
 */

Response.prototype._setStatusProperties = function(status){
  // handle IE9 bug: http://stackoverflow.com/questions/10046972/msie-returns-status-code-of-1223-for-ajax-request
  if (status === 1223) {
    status = 204;
  }

  var type = status / 100 | 0;

  // status / class
  this.status = this.statusCode = status;
  this.statusType = type;

  // basics
  this.info = 1 == type;
  this.ok = 2 == type;
  this.clientError = 4 == type;
  this.serverError = 5 == type;
  this.error = (4 == type || 5 == type)
    ? this.toError()
    : false;

  // sugar
  this.accepted = 202 == status;
  this.noContent = 204 == status;
  this.badRequest = 400 == status;
  this.unauthorized = 401 == status;
  this.notAcceptable = 406 == status;
  this.notFound = 404 == status;
  this.forbidden = 403 == status;
};

/**
 * Return an `Error` representative of this response.
 *
 * @return {Error}
 * @api public
 */

Response.prototype.toError = function(){
  var req = this.req;
  var method = req.method;
  var url = req.url;

  var msg = 'cannot ' + method + ' ' + url + ' (' + this.status + ')';
  var err = new Error(msg);
  err.status = this.status;
  err.method = method;
  err.url = url;

  return err;
};

/**
 * Expose `Response`.
 */

request.Response = Response;

/**
 * Initialize a new `Request` with the given `method` and `url`.
 *
 * @param {String} method
 * @param {String} url
 * @api public
 */

function Request(method, url) {
  var self = this;
  this._query = this._query || [];
  this.method = method;
  this.url = url;
  this.header = {}; // preserves header name case
  this._header = {}; // coerces header names to lowercase
  this.on('end', function(){
    var err = null;
    var res = null;

    try {
      res = new Response(self);
    } catch(e) {
      err = new Error('Parser is unable to parse the response');
      err.parse = true;
      err.original = e;
      // issue #675: return the raw response if the response parsing fails
      err.rawResponse = self.xhr && self.xhr.responseText ? self.xhr.responseText : null;
      // issue #876: return the http status code if the response parsing fails
      err.statusCode = self.xhr && self.xhr.status ? self.xhr.status : null;
      return self.callback(err);
    }

    self.emit('response', res);

    var new_err;
    try {
      if (res.status < 200 || res.status >= 300) {
        new_err = new Error(res.statusText || 'Unsuccessful HTTP response');
        new_err.original = err;
        new_err.response = res;
        new_err.status = res.status;
      }
    } catch(e) {
      new_err = e; // #985 touching res may cause INVALID_STATE_ERR on old Android
    }

    // #1000 don't catch errors from the callback to avoid double calling it
    if (new_err) {
      self.callback(new_err, res);
    } else {
      self.callback(null, res);
    }
  });
}

/**
 * Mixin `Emitter` and `requestBase`.
 */

Emitter(Request.prototype);
for (var key in requestBase) {
  Request.prototype[key] = requestBase[key];
}

/**
 * Set Content-Type to `type`, mapping values from `request.types`.
 *
 * Examples:
 *
 *      superagent.types.xml = 'application/xml';
 *
 *      request.post('/')
 *        .type('xml')
 *        .send(xmlstring)
 *        .end(callback);
 *
 *      request.post('/')
 *        .type('application/xml')
 *        .send(xmlstring)
 *        .end(callback);
 *
 * @param {String} type
 * @return {Request} for chaining
 * @api public
 */

Request.prototype.type = function(type){
  this.set('Content-Type', request.types[type] || type);
  return this;
};

/**
 * Set responseType to `val`. Presently valid responseTypes are 'blob' and
 * 'arraybuffer'.
 *
 * Examples:
 *
 *      req.get('/')
 *        .responseType('blob')
 *        .end(callback);
 *
 * @param {String} val
 * @return {Request} for chaining
 * @api public
 */

Request.prototype.responseType = function(val){
  this._responseType = val;
  return this;
};

/**
 * Set Accept to `type`, mapping values from `request.types`.
 *
 * Examples:
 *
 *      superagent.types.json = 'application/json';
 *
 *      request.get('/agent')
 *        .accept('json')
 *        .end(callback);
 *
 *      request.get('/agent')
 *        .accept('application/json')
 *        .end(callback);
 *
 * @param {String} accept
 * @return {Request} for chaining
 * @api public
 */

Request.prototype.accept = function(type){
  this.set('Accept', request.types[type] || type);
  return this;
};

/**
 * Set Authorization field value with `user` and `pass`.
 *
 * @param {String} user
 * @param {String} pass
 * @param {Object} options with 'type' property 'auto' or 'basic' (default 'basic')
 * @return {Request} for chaining
 * @api public
 */

Request.prototype.auth = function(user, pass, options){
  if (!options) {
    options = {
      type: 'basic'
    }
  }

  switch (options.type) {
    case 'basic':
      var str = btoa(user + ':' + pass);
      this.set('Authorization', 'Basic ' + str);
    break;

    case 'auto':
      this.username = user;
      this.password = pass;
    break;
  }
  return this;
};

/**
* Add query-string `val`.
*
* Examples:
*
*   request.get('/shoes')
*     .query('size=10')
*     .query({ color: 'blue' })
*
* @param {Object|String} val
* @return {Request} for chaining
* @api public
*/

Request.prototype.query = function(val){
  if ('string' != typeof val) val = serialize(val);
  if (val) this._query.push(val);
  return this;
};

/**
 * Queue the given `file` as an attachment to the specified `field`,
 * with optional `filename`.
 *
 * ``` js
 * request.post('/upload')
 *   .attach('content', new Blob(['<a id="a"><b id="b">hey!</b></a>'], { type: "text/html"}))
 *   .end(callback);
 * ```
 *
 * @param {String} field
 * @param {Blob|File} file
 * @param {String} filename
 * @return {Request} for chaining
 * @api public
 */

Request.prototype.attach = function(field, file, filename){
  this._getFormData().append(field, file, filename || file.name);
  return this;
};

Request.prototype._getFormData = function(){
  if (!this._formData) {
    this._formData = new root.FormData();
  }
  return this._formData;
};

/**
 * Invoke the callback with `err` and `res`
 * and handle arity check.
 *
 * @param {Error} err
 * @param {Response} res
 * @api private
 */

Request.prototype.callback = function(err, res){
  var fn = this._callback;
  this.clearTimeout();
  fn(err, res);
};

/**
 * Invoke callback with x-domain error.
 *
 * @api private
 */

Request.prototype.crossDomainError = function(){
  var err = new Error('Request has been terminated\nPossible causes: the network is offline, Origin is not allowed by Access-Control-Allow-Origin, the page is being unloaded, etc.');
  err.crossDomain = true;

  err.status = this.status;
  err.method = this.method;
  err.url = this.url;

  this.callback(err);
};

/**
 * Invoke callback with timeout error.
 *
 * @api private
 */

Request.prototype._timeoutError = function(){
  var timeout = this._timeout;
  var err = new Error('timeout of ' + timeout + 'ms exceeded');
  err.timeout = timeout;
  this.callback(err);
};

/**
 * Compose querystring to append to req.url
 *
 * @api private
 */

Request.prototype._appendQueryString = function(){
  var query = this._query.join('&');
  if (query) {
    this.url += ~this.url.indexOf('?')
      ? '&' + query
      : '?' + query;
  }
};

/**
 * Initiate request, invoking callback `fn(res)`
 * with an instanceof `Response`.
 *
 * @param {Function} fn
 * @return {Request} for chaining
 * @api public
 */

Request.prototype.end = function(fn){
  var self = this;
  var xhr = this.xhr = request.getXHR();
  var timeout = this._timeout;
  var data = this._formData || this._data;

  // store callback
  this._callback = fn || noop;

  // state change
  xhr.onreadystatechange = function(){
    if (4 != xhr.readyState) return;

    // In IE9, reads to any property (e.g. status) off of an aborted XHR will
    // result in the error "Could not complete the operation due to error c00c023f"
    var status;
    try { status = xhr.status } catch(e) { status = 0; }

    if (0 == status) {
      if (self.timedout) return self._timeoutError();
      if (self._aborted) return;
      return self.crossDomainError();
    }
    self.emit('end');
  };

  // progress
  var handleProgress = function(direction, e) {
    if (e.total > 0) {
      e.percent = e.loaded / e.total * 100;
    }
    e.direction = direction;
    self.emit('progress', e);
  }
  if (this.hasListeners('progress')) {
    try {
      xhr.onprogress = handleProgress.bind(null, 'download');
      if (xhr.upload) {
        xhr.upload.onprogress = handleProgress.bind(null, 'upload');
      }
    } catch(e) {
      // Accessing xhr.upload fails in IE from a web worker, so just pretend it doesn't exist.
      // Reported here:
      // https://connect.microsoft.com/IE/feedback/details/837245/xmlhttprequest-upload-throws-invalid-argument-when-used-from-web-worker-context
    }
  }

  // timeout
  if (timeout && !this._timer) {
    this._timer = setTimeout(function(){
      self.timedout = true;
      self.abort();
    }, timeout);
  }

  // querystring
  this._appendQueryString();

  // initiate request
  if (this.username && this.password) {
    xhr.open(this.method, this.url, true, this.username, this.password);
  } else {
    xhr.open(this.method, this.url, true);
  }

  // CORS
  if (this._withCredentials) xhr.withCredentials = true;

  // body
  if ('GET' != this.method && 'HEAD' != this.method && 'string' != typeof data && !this._isHost(data)) {
    // serialize stuff
    var contentType = this._header['content-type'];
    var serialize = this._serializer || request.serialize[contentType ? contentType.split(';')[0] : ''];
    if (!serialize && isJSON(contentType)) serialize = request.serialize['application/json'];
    if (serialize) data = serialize(data);
  }

  // set header fields
  for (var field in this.header) {
    if (null == this.header[field]) continue;
    xhr.setRequestHeader(field, this.header[field]);
  }

  if (this._responseType) {
    xhr.responseType = this._responseType;
  }

  // send stuff
  this.emit('request', this);

  // IE11 xhr.send(undefined) sends 'undefined' string as POST payload (instead of nothing)
  // We need null here if data is undefined
  xhr.send(typeof data !== 'undefined' ? data : null);
  return this;
};


/**
 * Expose `Request`.
 */

request.Request = Request;

/**
 * GET `url` with optional callback `fn(res)`.
 *
 * @param {String} url
 * @param {Mixed|Function} [data] or fn
 * @param {Function} [fn]
 * @return {Request}
 * @api public
 */

request.get = function(url, data, fn){
  var req = request('GET', url);
  if ('function' == typeof data) fn = data, data = null;
  if (data) req.query(data);
  if (fn) req.end(fn);
  return req;
};

/**
 * HEAD `url` with optional callback `fn(res)`.
 *
 * @param {String} url
 * @param {Mixed|Function} [data] or fn
 * @param {Function} [fn]
 * @return {Request}
 * @api public
 */

request.head = function(url, data, fn){
  var req = request('HEAD', url);
  if ('function' == typeof data) fn = data, data = null;
  if (data) req.send(data);
  if (fn) req.end(fn);
  return req;
};

/**
 * OPTIONS query to `url` with optional callback `fn(res)`.
 *
 * @param {String} url
 * @param {Mixed|Function} [data] or fn
 * @param {Function} [fn]
 * @return {Request}
 * @api public
 */

request.options = function(url, data, fn){
  var req = request('OPTIONS', url);
  if ('function' == typeof data) fn = data, data = null;
  if (data) req.send(data);
  if (fn) req.end(fn);
  return req;
};

/**
 * DELETE `url` with optional callback `fn(res)`.
 *
 * @param {String} url
 * @param {Function} [fn]
 * @return {Request}
 * @api public
 */

function del(url, fn){
  var req = request('DELETE', url);
  if (fn) req.end(fn);
  return req;
};

request['del'] = del;
request['delete'] = del;

/**
 * PATCH `url` with optional `data` and callback `fn(res)`.
 *
 * @param {String} url
 * @param {Mixed} [data]
 * @param {Function} [fn]
 * @return {Request}
 * @api public
 */

request.patch = function(url, data, fn){
  var req = request('PATCH', url);
  if ('function' == typeof data) fn = data, data = null;
  if (data) req.send(data);
  if (fn) req.end(fn);
  return req;
};

/**
 * POST `url` with optional `data` and callback `fn(res)`.
 *
 * @param {String} url
 * @param {Mixed} [data]
 * @param {Function} [fn]
 * @return {Request}
 * @api public
 */

request.post = function(url, data, fn){
  var req = request('POST', url);
  if ('function' == typeof data) fn = data, data = null;
  if (data) req.send(data);
  if (fn) req.end(fn);
  return req;
};

/**
 * PUT `url` with optional `data` and callback `fn(res)`.
 *
 * @param {String} url
 * @param {Mixed|Function} [data] or fn
 * @param {Function} [fn]
 * @return {Request}
 * @api public
 */

request.put = function(url, data, fn){
  var req = request('PUT', url);
  if ('function' == typeof data) fn = data, data = null;
  if (data) req.send(data);
  if (fn) req.end(fn);
  return req;
};

},{"./is-object":11,"./request":13,"./request-base":12,"emitter":1}],11:[function(require,module,exports){
/**
 * Check if `obj` is an object.
 *
 * @param {Object} obj
 * @return {Boolean}
 * @api private
 */

function isObject(obj) {
  return null !== obj && 'object' === typeof obj;
}

module.exports = isObject;

},{}],12:[function(require,module,exports){
/**
 * Module of mixed-in functions shared between node and client code
 */
var isObject = require('./is-object');

/**
 * Clear previous timeout.
 *
 * @return {Request} for chaining
 * @api public
 */

exports.clearTimeout = function _clearTimeout(){
  this._timeout = 0;
  clearTimeout(this._timer);
  return this;
};

/**
 * Override default response body parser
 *
 * This function will be called to convert incoming data into request.body
 *
 * @param {Function}
 * @api public
 */

exports.parse = function parse(fn){
  this._parser = fn;
  return this;
};

/**
 * Override default request body serializer
 *
 * This function will be called to convert data set via .send or .attach into payload to send
 *
 * @param {Function}
 * @api public
 */

exports.serialize = function serialize(fn){
  this._serializer = fn;
  return this;
};

/**
 * Set timeout to `ms`.
 *
 * @param {Number} ms
 * @return {Request} for chaining
 * @api public
 */

exports.timeout = function timeout(ms){
  this._timeout = ms;
  return this;
};

/**
 * Promise support
 *
 * @param {Function} resolve
 * @param {Function} reject
 * @return {Request}
 */

exports.then = function then(resolve, reject) {
  if (!this._fullfilledPromise) {
    var self = this;
    this._fullfilledPromise = new Promise(function(innerResolve, innerReject){
      self.end(function(err, res){
        if (err) innerReject(err); else innerResolve(res);
      });
    });
  }
  return this._fullfilledPromise.then(resolve, reject);
}

exports.catch = function(cb) {
  return this.then(undefined, cb);
};

/**
 * Allow for extension
 */

exports.use = function use(fn) {
  fn(this);
  return this;
}


/**
 * Get request header `field`.
 * Case-insensitive.
 *
 * @param {String} field
 * @return {String}
 * @api public
 */

exports.get = function(field){
  return this._header[field.toLowerCase()];
};

/**
 * Get case-insensitive header `field` value.
 * This is a deprecated internal API. Use `.get(field)` instead.
 *
 * (getHeader is no longer used internally by the superagent code base)
 *
 * @param {String} field
 * @return {String}
 * @api private
 * @deprecated
 */

exports.getHeader = exports.get;

/**
 * Set header `field` to `val`, or multiple fields with one object.
 * Case-insensitive.
 *
 * Examples:
 *
 *      req.get('/')
 *        .set('Accept', 'application/json')
 *        .set('X-API-Key', 'foobar')
 *        .end(callback);
 *
 *      req.get('/')
 *        .set({ Accept: 'application/json', 'X-API-Key': 'foobar' })
 *        .end(callback);
 *
 * @param {String|Object} field
 * @param {String} val
 * @return {Request} for chaining
 * @api public
 */

exports.set = function(field, val){
  if (isObject(field)) {
    for (var key in field) {
      this.set(key, field[key]);
    }
    return this;
  }
  this._header[field.toLowerCase()] = val;
  this.header[field] = val;
  return this;
};

/**
 * Remove header `field`.
 * Case-insensitive.
 *
 * Example:
 *
 *      req.get('/')
 *        .unset('User-Agent')
 *        .end(callback);
 *
 * @param {String} field
 */
exports.unset = function(field){
  delete this._header[field.toLowerCase()];
  delete this.header[field];
  return this;
};

/**
 * Write the field `name` and `val`, or multiple fields with one object
 * for "multipart/form-data" request bodies.
 *
 * ``` js
 * request.post('/upload')
 *   .field('foo', 'bar')
 *   .end(callback);
 *
 * request.post('/upload')
 *   .field({ foo: 'bar', baz: 'qux' })
 *   .end(callback);
 * ```
 *
 * @param {String|Object} name
 * @param {String|Blob|File|Buffer|fs.ReadStream} val
 * @return {Request} for chaining
 * @api public
 */
exports.field = function(name, val) {

  // name should be either a string or an object.
  if (null === name ||  undefined === name) {
    throw new Error('.field(name, val) name can not be empty');
  }

  if (isObject(name)) {
    for (var key in name) {
      this.field(key, name[key]);
    }
    return this;
  }

  // val should be defined now
  if (null === val || undefined === val) {
    throw new Error('.field(name, val) val can not be empty');
  }
  this._getFormData().append(name, val);
  return this;
};

/**
 * Abort the request, and clear potential timeout.
 *
 * @return {Request}
 * @api public
 */
exports.abort = function(){
  if (this._aborted) {
    return this;
  }
  this._aborted = true;
  this.xhr && this.xhr.abort(); // browser
  this.req && this.req.abort(); // node
  this.clearTimeout();
  this.emit('abort');
  return this;
};

/**
 * Enable transmission of cookies with x-domain requests.
 *
 * Note that for this to work the origin must not be
 * using "Access-Control-Allow-Origin" with a wildcard,
 * and also must set "Access-Control-Allow-Credentials"
 * to "true".
 *
 * @api public
 */

exports.withCredentials = function(){
  // This is browser-only functionality. Node side is no-op.
  this._withCredentials = true;
  return this;
};

/**
 * Set the max redirects to `n`. Does noting in browser XHR implementation.
 *
 * @param {Number} n
 * @return {Request} for chaining
 * @api public
 */

exports.redirects = function(n){
  this._maxRedirects = n;
  return this;
};

/**
 * Convert to a plain javascript object (not JSON string) of scalar properties.
 * Note as this method is designed to return a useful non-this value,
 * it cannot be chained.
 *
 * @return {Object} describing method, url, and data of this request
 * @api public
 */

exports.toJSON = function(){
  return {
    method: this.method,
    url: this.url,
    data: this._data,
    headers: this._header
  };
};

/**
 * Check if `obj` is a host object,
 * we don't want to serialize these :)
 *
 * TODO: future proof, move to compoent land
 *
 * @param {Object} obj
 * @return {Boolean}
 * @api private
 */

exports._isHost = function _isHost(obj) {
  var str = {}.toString.call(obj);

  switch (str) {
    case '[object File]':
    case '[object Blob]':
    case '[object FormData]':
      return true;
    default:
      return false;
  }
}

/**
 * Send `data` as the request body, defaulting the `.type()` to "json" when
 * an object is given.
 *
 * Examples:
 *
 *       // manual json
 *       request.post('/user')
 *         .type('json')
 *         .send('{"name":"tj"}')
 *         .end(callback)
 *
 *       // auto json
 *       request.post('/user')
 *         .send({ name: 'tj' })
 *         .end(callback)
 *
 *       // manual x-www-form-urlencoded
 *       request.post('/user')
 *         .type('form')
 *         .send('name=tj')
 *         .end(callback)
 *
 *       // auto x-www-form-urlencoded
 *       request.post('/user')
 *         .type('form')
 *         .send({ name: 'tj' })
 *         .end(callback)
 *
 *       // defaults to x-www-form-urlencoded
 *      request.post('/user')
 *        .send('name=tobi')
 *        .send('species=ferret')
 *        .end(callback)
 *
 * @param {String|Object} data
 * @return {Request} for chaining
 * @api public
 */

exports.send = function(data){
  var obj = isObject(data);
  var type = this._header['content-type'];

  // merge
  if (obj && isObject(this._data)) {
    for (var key in data) {
      this._data[key] = data[key];
    }
  } else if ('string' == typeof data) {
    // default to x-www-form-urlencoded
    if (!type) this.type('form');
    type = this._header['content-type'];
    if ('application/x-www-form-urlencoded' == type) {
      this._data = this._data
        ? this._data + '&' + data
        : data;
    } else {
      this._data = (this._data || '') + data;
    }
  } else {
    this._data = data;
  }

  if (!obj || this._isHost(data)) return this;

  // default to json
  if (!type) this.type('json');
  return this;
};

},{"./is-object":11}],13:[function(require,module,exports){
// The node and browser modules expose versions of this with the
// appropriate constructor function bound as first argument
/**
 * Issue a request:
 *
 * Examples:
 *
 *    request('GET', '/users').end(callback)
 *    request('/users').end(callback)
 *    request('/users', callback)
 *
 * @param {String} method
 * @param {String|Function} url or callback
 * @return {Request}
 * @api public
 */

function request(RequestConstructor, method, url) {
  // callback
  if ('function' == typeof url) {
    return new RequestConstructor('GET', method).end(url);
  }

  // url first
  if (2 == arguments.length) {
    return new RequestConstructor('GET', method);
  }

  return new RequestConstructor(method, url);
}

module.exports = request;

},{}],14:[function(require,module,exports){
var jsonQ = require("jsonq");
var SpotifyWebApi = require("spotify-web-api-node");
var spotifyApi = new SpotifyWebApi();
var rgbToHex = function(rgb) {
  var hex = Number(rgb).toString(16);
  if (hex.length < 2) {
    hex = "0" + hex;
  }
  return hex;
};

$(document).ready(function() {
  $("#getArtwork").on("click", function() {
    $(".finals").hide();
    ////////////////--: GET TOKEN :--///////
    var xhttp = new XMLHttpRequest();
    xhttp.open("GET", "/token/", false);
    xhttp.setRequestHeader("Content-type", "x-www-form-urlencoded");
    xhttp.send();
    var response = xhttp.responseText;
    var token = jsonQ(response)
      .find("token")
      .value();
    spotifyApi.setAccessToken(token);
    ////////////////--: GET ARTWORK :--///////
    var searchQuery = $("#album").val();
    $(".finals").fadeTo(700, 1);
    spotifyApi.searchAlbums(searchQuery).then(
      function(data) {
        var albums = data.body.albums.items;
        var currentAlbum = albums[0].images;
        var currentArtwork = currentAlbum[0].url;
        var img = document.getElementById("#albumView");
        img.crossOrigin = "Anonymous";
        img.setAttribute("src", currentArtwork);
        Vibrant.from(img)
          .getPalette()
          .then(function(palette) {
            var jsonObj = jsonQ(palette);
            colors = jsonObj.find("_rgb").value();
            $("#1").css("background-color", "rgb(" + colors[0] + ")");
            $("#2").css("background-color", "rgb(" + colors[1] + ")");
            $("#3").css("background-color", "rgb(" + colors[2] + ")");
            $("#4").css("background-color", "rgb(" + colors[3] + ")");
            $("#5").css("background-color", "rgb(" + colors[4] + ")");
            $("#6").css("background-color", "rgb(" + colors[5] + ")");
            $(".get").css("color", "rgb(" + colors[3] + ")");
            $(".underline").css("border-color", "rgb(" + colors[3] + ")");
          });
      },
      function(err) {
        console.error(err);
      }
    );
    $(".get").text("Swatches");
    $("h1").addClass("underline");
  });
});

/* MODAL HELP, IF YA WANNIT

    // Get the modal
window.onload = function () {
    var modal = document.getElementById("helpBox");

    // Get the button that opens the modal
    var btn = document.getElementById("helpButt");

    // Get the <span> element that closes the modal
    var span = document.getElementsByClassName("close")[0];

    // When the user clicks on the button, open the modal 
    btn.onclick = function () {
        modal.style.display = "block";
    }

    // When the user clicks on <span> (x), close the modal
    span.onclick = function () {
        modal.style.display = "none";
    }

    // When the user clicks anywhere outside of the modal, close it
    window.onclick = function (event) {
        if (event.target == modal) {
            modal.style.display = "none";
        }
    } 
}*/

},{"jsonq":2,"spotify-web-api-node":5}]},{},[14]);
