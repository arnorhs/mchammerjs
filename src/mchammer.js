/*

    MCHammer - model-controller framework

    A very simple event-structured framework for developing complex javascript
    applications/interactions.

    It makes for a unified and simple structure when you would otherwise have
    a lot of deeply nested interactions, passing data and objects back and
    forth.

    It makes your code base essentially flat, uses very little memory and
    allows the code to become very understandable.

    It makes speghetti code less unpredictable since all functions are always
    called within the same scope, so passing objects and data around becomes
    predictable and you won't have scope-creep.

    todo:
    - simplify .extend for our very narrow use case... maybe...?
    - set up docs from the source comments
    - make it consistent that getItem and findByProperty return both arrays
      or both return objects with the id is the reference of each element.

*/

window.MCHammer = (function(window, undefined){

    // These are only defined so the minified version becomes smaller. Every byte counts :)
    var OBJECT = "object";

    /*
        some of these are copied from jQuery.. sorry about that. But they
        are not introduced into the global scope, so that shouldn't really
        be a problem (aside from the extra bytes)
    */

    var isFunction = function (obj) {
      // jquery doesn't do this, maybe it won't work in all browsers
      return typeof obj === "function";
    };

    var isArray = function (obj) {
      // if an object defines a length attribute, this will actually
      // return true as well. Might want to use whatever jquery uses instead...
      return typeof obj === OBJECT && typeof obj["length"] === "number";
    };

    // this one can probably be simplified for the narrow use case
    // currently it's just a copy of the jquery one except I removed the "extend jquery" bit
    var extend = function() {
      // copy reference to target object
      var target = arguments[0] || {}, i = 1, length = arguments.length, deep = false, options;

      // Handle a deep copy situation
      if ( typeof target === "boolean" ) {
        deep = target;
        target = arguments[1] || {};
        // skip the boolean and the target
        i = 2;
      }

      // Handle case when target is a string or something (possible in deep copy)
      if ( typeof target !== OBJECT && !isFunction(target) ) target = {};

      for ( ; i < length; i++ ) {
        // Only deal with non-null/undefined values
        if ( (options = arguments[ i ]) != null ) {
          // Extend the base object
          for ( var name in options ) {
            var src = target[ name ], copy = options[ name ];

            // Prevent never-ending loop
            if ( target === copy ) continue;

            // Recurse if we're merging object values
            if ( deep && copy && typeof copy === OBJECT && !copy.nodeType ) {
              target[ name ] = extend( deep,
                // Never move original objects, clone them
                src || ( copy.length != null ? [ ] : { } )
              , copy );
            // Don't bring in undefined values
            } else if ( copy !== undefined ) {
              target[ name ] = copy;
            }

          }
        }
      }

      // Return the modified object
      return target;
    };





    /*
        this is the class for a data object that gets created. It's mostly used
        because we'll want to do a check for the datatype later on - to make sure
        everything's fine.

        it's *possible* that in the future we might add some functions to it's
        prototype, but for now this should do...
    */
    function MCHData (obj) {
        if (obj === undefined) {
            obj = {};
        }
        for (var i in obj) {
            this[i] = obj[i];
        }
    }



    /*
        Constructor

        Accepts a JS object with the following optional parameters:

        - debug
          Will log every event and action that happens within the framework
          default value: false
        
        - debugOnlyTriggers
          Will only print debug on triggering events

        return a new MCH object
    */
    function MCH (options) {
        /*
            Public variables:
              - options
              - items
              - events
        */
        this.options = extend({},{
            debug: false,
            debugOnlyTriggers: false
        }, options);
        this.items = {};
        this.events = {};
    }

    MCH.prototype = {

        /* helper function to create a new MCHData object -- probably won't be
           used externally */
        newData: function (obj) {
            return new MCHData(obj);
        },

        /*
            log ([argument1, [argument2, [...]]])

            Logging/debug/tracing function. Only used internally, but I suppose
            you could use it anywhere for some reason...

            accepts any number of arguments but basically calls console.log()
            if the debug mode is set to true

            doesn't return anything
        */

        log: function () {
            if (!this.options.debug) return;
            var a = arguments;
            // now this is a hack if I've ever seen one
            if (this.options.debugOnlyTriggers && a[0].indexOf("trigger:") != 0) return;
            Array.prototype.unshift.call(a, "{MCH.log} ");
            console.log.apply(console, a);
        },

        /*
            addItem (id, data)

            adds a new item to the list of items.

                id      the id of the element that will be added. MCH provides
                        no method of autodefining ids for you, yet.
                        Can be a string or an integer

                data    a JS object of the data to pass in. Can be anything and
                        MCH has no constraints on the types of properties. they
                        can be anything - string, functions, other objects etc.

            returns true if successful, but false if not (eg. if an item with the
            same id has already been added)

            additionally the id will also be added to the object itself, so if
            you pass on an id property in the data object, that will be
            overridden by the id you pass in. you could either think that you
            don't have to set it, or just allow it to be overridden...

            a common usage pattern is to provide all kinds of properties to this
            newly created item. Even references to dom nodes or jQuery objects.
            And another power usage pattern is to provide references/objects from
            items of other MCH objects.

            if successful, an internal event "MCH:addItem" will also be
            triggered.
        */

        addItem: function (id, data) {

            if (this.items[id] !== undefined) {
                this.log("addItem: ", id, data, "Warning: item with the same ID already there");
                return false;
            }
            data.id = id;
            // used internally for some stuff
            this.items[id] = new MCHData(data);
            this.log("addItem: ", id, data);
            this.trigger(data, "MCH:addItem");
            return true;
        },

        /*
            updateItem (id)

            updates an item in the list

                id            the id of the element that will be added.
                              Can be a string or an integer

                properties    properties to be edited. can just as well
                              be a completely new object, the same
                              object or whatever

            returns true if successful, but false if not (eg. if an item
            with a corresponding id cannot be found.

            there is an internal event triggered, "MCH:updateItem"
            note that it will be called after the item is updated, with
            the corresponding data object, as well as the new data (in
            extraParams) - so you can use it to take action on that item
            based on the change.

            It might be more useful to get the old object, the new object,
            and the change, but that would require a deep copy and maybe
            it's simply something nobody cares about. So for now we'll
            make do with just receiving the changed thing and then
            the updated properties.

            it's possible that in the future specifying a false/true return
            value on that event handler will determine if the item will
            eventually be changed or not...
        */

        updateItem: function (id, newData) {
            if (this.items[id] === undefined) {
                this.log("updateItem: ", id, "Warning: No item found with that ID");
                return false;
            }
            this.items[id] = extend(this.items[id], newData);
            this.trigger(id, "MCH:updateItem", newData);
            this.log("updateItem: ", id, newData);
            return true;
        },

        /*
            removeItem (id)

            removes an item from the list

                id      the id of the element that will be added.
                        Can be a string or an integer

            returns true if successful, but false if not (eg. if an item with a
            corresponding id cannot be found.

            there is an internal event triggered, "MCH:removeItem"
            note that it will be called before the item is removed, with the
            corresponding data object - so you can use it to take action
            on that item - just know that it will be deleted right
            afterwards.

            it's possible that in the future specifying a false/true return
            value on that event handler will determine if the item will
            eventually be removed or not...
        */

        removeItem: function (id) {

            if (this.items[id] === undefined) {
                this.log("removeItem: ", id, "Warning: No item found with that ID");
                return false;
            }
            this.trigger(id, "MCH:removeItem");
            delete this.items[id];
            this.log("removeItem: ", id);
            return true;
        },

        /**********************************************************************
         *
         *  New methods which I'm not sure about
         *
         *********************************************************************/
          
        /*
            findByProperty (properties)

            retrieves all the items that have a certain property

                properties    A JS object with the properties and the values
                              you are searching for. There is no deep searching
                              taking place. So if an object equals to === it
                              is retrieved.

                              Can be many properties

            returns an empty object if no items are found, or the
            corresponding objects if they're found referenced by the
            same id as the original objects
        */
        findByProperty: function (properties) {
            if (typeof properties !== OBJECT) {
                this.log("findByProperty: ", id, "Warning: No properties specified");
                return {};
            }

            // we'll collect the list of found properties here
            var foundItems = {}, ok, i, j;
            // I don't have a clue how to otherwise get the first item...
            for (i in this.items) {
                // default to true.. through the iteration if any of the
                // values are false, we'll set it to false and break so
                // the item is only accepted if this variable is still ok
                ok = true;
                for (j in properties) {
                    // this function becomes around 40% faster if we skip
                    // this test, but it seems cleaner with it... what to
                    // do? what to do?
                    // using an undefined check results in around 30% speed
                    // improvement over "hasOwnProperty", so thi is hereby
                    // chosen as the default
                    if (this.items[i][j] === undefined || properties[j] !== this.items[i][j]) {
                        ok = false;
                        break;
                    }
                }
                // add the item to foundItems with the same key
                if (ok) {
                  foundItems[this.items[i].id] = this.items[i];
                }
            }

            return foundItems;
        },
        findByProperty2: function (properties) {
            if (typeof properties !== OBJECT) {
                this.log("findByProperty: ", id, "Warning: No properties specified");
                return {};
            }

            return this.findByFunction(function(dataObj) {
                // default to true.. through the iteration if any of the
                // values are false, we'll set it to false and break so
                // the item is only accepted if this variable is still ok
                var ok = true;
                for (var j in properties) {
                    // this function becomes around 40% faster if we skip this test, but it
                    // seems cleaner with it... what to do? what to do?
                    if (dataObj[j] === undefined || dataObj[j] !== properties[j]) {
                        ok = false;
                        break;
                    }
                }
                // add the item to foundItems with the same key
                return ok;
            });
        },

        /*
            findByFunction (properties)

            retrieves all the items that evaluate true through a callback function.

                callback  A function that you define that accepts a single
                          parameters, which is the item currently being searched
                          on.

            returns an empty object if no items are found, or the
            corresponding objects if their values result in a truthy return value
            from that function -- note: truthy. So if it evaluates to 1 or {} it
            will still be returned (that might change in the future to a specific === true)
        */
        findByFunction: function (callback) {
            if (!isFunction(callback)) {
                this.log("findByFunction: ", callback, "Warning: callback is not a function");
                return {};
            }
            // we'll collect the list of found properties here
            var foundItems = {};
            for (var i in this.items) {
                // if the function specified returns true, add it to the list
                // we're calling the function as if it's a function within mchammer with
                // the current mchammer object as the "this" property of the function
                // this used to be called using .call on the function so the "this" context
                // would be maintained as the MCHammer thing - but that added around 20-30%
                // more time on to it...
                // doing it with a pure loop does actually make it so that this will get
                // 20% faster - but i don't know if that's worth the extra lines of code
                // required..
                if (callback(this.items[i])) {
                    foundItems[this.items[i].id] = this.items[i];
                }
            }
            return foundItems;
        },

        /*
            getFirstItem ()

            retrieves the first item from the item storage.

            returns an empty object if the item is not found, or the
            corresponding object if it's found.

            I don't know why you'd need this function, except for
            testing purposes
        */
        getFirstItem: function () {
            this.log("getFirstItem: ");
            // I don't have a clue how to otherwise get the first item...
            for (var i in this.items) {
              if (!this.items.hasOwnProperty(i)) continue;
              return this.items[i];
            }
        },

        /**********************************************************************
         *
         *  End of new methods which I'm not sure about
         *
         *********************************************************************/
          
        /*
            getItem (id or array if ids)

            retrieves an item from the item storage by it's id. Currently you
            can only retrieve a single item.

                id:   The id of the item to retrieve. Can be a string or an
                      integer or an array of those

            returns an empty object if the item is not found, or the
            corresponding objects if it's found.

            if you provide an array if ids as the parameter, it returns an
            array of objects

            note: the function is recursive, so theoretically you could provide a 
            multi-dimensional array of ids, though I'm not sure why you'd
            want to do that.
        */

        getItem: function (id) {
            if (id === undefined) {
                this.log("getItem: ", id, "Warning: id provided is undefined");
                return new MCHData();
            }
            if (isArray(id)) {
                var ret = [], i = 0, l = id.length;
                for ( ; i < l; i++) {
                    ret.push(this.getItem(id[i]));
                }
                return ret;
            }
            if (this.items[id] === undefined) {
                this.log("getItem: ", id, "id provided not found");
                return new MCHData();
            }
            this.log("getItem: ", id);
            return this.items[id];
        },

        /*
            bind (eventName, callback)

            adds a new event handler to the events list.

                eventName     string identifier for the specified event.

                callback      function to be called when the event gets
                              triggered.

            You can have many event handlers assigned to the same event.
            I'm not sure if you'll ever be able to remove them, though.

            The function that gets called has the following properties:

                function (item, extra):

                item          the javascript object originally added
                              using the addItem function.

                extraParams   if you trigger the function using the
                              extraParams variable, it will be
                              assigned to the second parameter of
                              the function.

                you should realize that the item passed on into the
                function is not a deep copy, but the actual variable
                in memory - any changes you make to it will persist
                without those changes triggering any events. This
                can be very useful eg. for adding jquery references
                to the object etc.

                the "this" value of the function will be a reference
                to the MCH object. So essentially you're calling
                it from within itself. This might change in the
                future (as well as practically everything else)

                MCH places no constraints on a return value and will
                essentially ignore it.

                there are also built in events that you can hook on
                to, that are triggered by MCHammer internally,
                nameley:

                MCH:addItem - gets triggered when you add a new
                              item to the object using addItem
        */

        bind: function (eventName, callback) {
            if (!isFunction(callback)) {
                this.log("bind: "+eventName, callback, "Error: Not a function, is a: "+typeof callback);
                return false;
            }
            if (this.events[eventName] === undefined) {
                this.events[eventName] = [];
            }
            this.events[eventName].push(callback);
            this.log("bind: "+eventName, callback);
            return true;
        },

        /*
            trigger (id, eventName[, extraParams])

            Triggers all event handlers for a specified name. It requires
            that you provide an ID of the element that is being affected.

                id                        the id of the item the trigger applies to

                                          can, technically, also be an object, and
                                          theoretically you might want to ever
                                          pass an object to it, even completley
                                          unrelated, but personally I think that's
                                          nuts.. (used internally to trigger events
                                          on objects that have already been retrieved)

                eventName                 name of the event to be triggered

                extraParams (optional)    if there are any extra variables that
                                          you wish to pass on, this is the place
                                          for those. If you need multiple
                                          variables, you can add them as a JS
                                          object.

            returns true if successful, false if there is no event for the
            matching name.
        */

        trigger: function (id, eventName, extraParams) {
            if (this.events[eventName] === undefined) {
                this.log("trigger: ", id, eventName, "Warning: Event triggered has no event handler");
                return false;
            }

            var item;
            // optionally you can pass on an MCHData object to the trigger - that will
            // make the trigger not retrieve the item but use that object instead.
            // theoretically you could then pass on something that's not at all
            // a member of the item list, i'd say that's crazy, but I guess it's
            // up to the developer... (used mostly internally to trigger an
            // event on an object that's already been created and is in memory)
            if (typeof id === OBJECT && id.constructor === MCHData) {
                item = id;
                id = item.id;
            } else {
                // assuming it's an ID at this point
                item = this.getItem(id);
            }

            // set up params for calling the corresponding event.
            // the params are the item being called on and any extra params
            // passed on when triggering the event
            var params = [item];
            if (extraParams !== undefined) {
                params.push(extraParams);
            }

            // call all defined events for this item's ID
            for (var i = 0, l = this.events[eventName].length; i < l; i++) {
                this.events[eventName][i].apply({eventName:eventName, MCHInstance: this}, params);
            }

            this.log("trigger: ", id, eventName);

            return true;
        }
    };



    return MCH;

})();
