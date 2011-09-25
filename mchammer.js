/*

    MCHammer

    Super simple model controller framework

    SSMCF ?
    Smackf

    A very simple event-structured framework for developing complex javascript
    applications/interactions.

    It makes for a unified and simple structure when you would otherwise have
    a lot of deeply nested interactions, passing data and objects back and
    forth.

    It makes your code base essentially flat, uses very little memory and
    allows the code to become very understandable.

    todo:
    - test
    - do the .log thing everywhere
    - remove the need for $.isFunction, $.extend
    - write docs

*/

window.MCHammer = (function(){

    /*
        these three are copied from jQuery.. sorry about that. But they are
        not introduced into the global scope, so that shouldn't really
        be a problem (aside from the extra bytes)
    */

    var isFunction = function (obj) {
      return toString.call(obj) === "[object Function]";
    };

    var isArray = function (obj) {
      return toString.call(obj) === "[object Array]";
    };

    // this one can probably be simplified for the narrow use case
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
      if ( typeof target !== "object" && !jQuery.isFunction(target) )
        target = {};

      // extend jQuery itself if only one argument is passed
      if ( length == i ) {
        target = this;
        --i;
      }

      for ( ; i < length; i++ )
        // Only deal with non-null/undefined values
        if ( (options = arguments[ i ]) != null )
          // Extend the base object
          for ( var name in options ) {
            var src = target[ name ], copy = options[ name ];

            // Prevent never-ending loop
            if ( target === copy )
              continue;

            // Recurse if we're merging object values
            if ( deep && copy && typeof copy === "object" && !copy.nodeType )
              target[ name ] = jQuery.extend( deep,
                // Never move original objects, clone them
                src || ( copy.length != null ? [ ] : { } )
              , copy );

            // Don't bring in undefined values
            else if ( copy !== undefined )
              target[ name ] = copy;

          }

      // Return the modified object
      return target;
    };









    /*
        Constructor

        Accepts a JS object with the following optional parameters:

        - debug
          Will log every event and action that happens within the framework
          default value: false

        return a new MCH object
    */
    function MCH (options) {
        this.options = $.extend({},{
            debug: false
        }, options);
        this.items = this.events = {};
    }

    /*
       log ([argument1, [argument2, [...]]])

       Logging/debug/tracing function. Only used internally, but I suppose
       you could use it anywhere for some reason...

       accepts any number of arguments but basically calls console.log()
       if the debug mode is set to true

       doesn't return anything
    */

    MCH.prototype.log = function () {
        if (!this.options.debug) return;
        a = arguments;
        a.unshift("MCH log");
        console.log.apply(console, a);
    };

    /*
        addItem (id, data)

        adds a new item to the list of items.

            id      the id of the element that will be added. MCH provides
                    no method yet of autodefining ids for you, yet.
                    Can be a string or an integer

            data    a JS object of the data to pass in. Can be anything and
                    MCH has no constraints on the types of properties. they
                    can be anything - string, functions, other objects etc.

        returns true if successful, but false if not (eg. if an item with the
        same id has already been added)

        a common usage pattern is to provide all kinds of properties to this
        newly created item. Even references to dom nodes or jQuery objects.
        And another power usage pattern is to provide references/objects from
        items of other MCH objects.

    */
    MCH.prototype.addItem = function (id, data) {

        if (typeof this.items[id] !== "undefined") {
            this.log("addItem: ", id, data, "Warning: item with the same ID already there");
            return false;
        }
        data.id = id;
        this.items[id] = data;
        this.log("addItem: ", id, data);
        return true;
    };

    /*
        getItem (id)

        retrieves an item from the item storage by it's id. Currently you
        can only retrieve a single item.

            id:   The id of the item to retrieve. Can be a string or an
                  integer.

        returns an empty object if the item is not found, or the
        corresponding objects if it's found.
    */
    MCH.prototype.getItem = function (id) {
        if (typeof this.items[id] === "undefined") {
            this.log("getItemItem: ", id, "Warning: Item not found");
            return {};
        }
        this.log("getItemItem: ", id);
        return this.items[id];
    };

    /*
        addEvent (eventName, callback)

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

                          Additionally there is a object called
                          "_" that gets added to the item with
                          meta information from MCH.
                          Currently, the only property of that
                          object is "trigger" that specifies
                          the name of the trigger that triggered
                          the function. Which might be useful
                          when setting the same event handler
                          to many triggers.

            extraParams   if you trigger the function using the
                          extraParams variable, it will be
                          assigned to the second parameter of
                          the function.

            MCH places no constraints on a return value and will
            essentially ignore it.

    */
    MCH.prototype.addEvent = function (eventName, callback) {
        if (typeof this.events[eventName] === "undefined") {
            this.events[eventName] = [];
        }
        if (!isFunction(callback)) {
            this.log("addEvent: "+eventName, callback, "Error: Not a function");
            return false;
        }
        this.events[eventName].add(callback);
        this.log("addEvent: "+eventName, callback);
        return true;
    };

    /*
        trigger (id, eventName[, extraParams])

        Triggers all event handlers for a specified name. It requires
        that you provide an ID of the element that is being affected.

            id                        the id of the item the trigger applies to

            eventName                 name of the event to be triggered

            extraParams (optional)    if there are any extra variables that
                                      you wish to pass on, this is the place
                                      for those. If you need multiple
                                      variables, you can add them as a JS
                                      object.

        returns true if successful, false if there is no event for the
        matching name.

    */
    MCH.prototype.trigger = function (id, eventName, extraParams) {
        if (typeof this.events[eventName] === "undefined") {
            this.log("trigger: ", id, data, "Warning: Event triggered has no event handler");
            return false;
        }

        var item = this.getItem(id);
        // pass on the name of the trigger - useful if using the same
        // event handler for multiple triggers
        item._.trigger = eventName;

        var params = [item];
        if (typeof extraParams !== "undefined") {
            params.add(extraParams);
        }

        for (var i = 0, l = this.events[eventName].length; i < l; i++) {
            this.events[eventName][i].apply(this, params);
        }

        return true;
    };





})();
