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
    - simplify .extend for our very narrow use case
    - set up docs from the source comments
    - the impementing code looks kind of ugly from an aesthetic point of
      view. It would be nice if we could make it more pretty.

*/

window.MCHammer = (function(){

    /*
        some of these are copied from jQuery.. sorry about that. But they
        are not introduced into the global scope, so that shouldn't really
        be a problem (aside from the extra bytes)
    */

    var isFunction = function (obj) {
      return typeof obj === "function";
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
      if ( typeof target !== "object" && !isFunction(target) ) target = {};

      for ( ; i < length; i++ ) {
        // Only deal with non-null/undefined values
        if ( (options = arguments[ i ]) != null ) {
          // Extend the base object
          for ( var name in options ) {
            var src = target[ name ], copy = options[ name ];

            // Prevent never-ending loop
            if ( target === copy ) continue;

            // Recurse if we're merging object values
            if ( deep && copy && typeof copy === "object" && !copy.nodeType ) {
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
        var a = arguments;
        // now this is a hack if I've ever seen one
        if (this.options.debugOnlyTriggers && a[0].indexOf("trigger:") != 0) return;
        Array.prototype.unshift.call(a, "{MCH.log} ");
        console.log.apply(console, a);
    };

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
    MCH.prototype.addItem = function (id, data) {

        if (typeof this.items[id] !== "undefined") {
            this.log("addItem: ", id, data, "Warning: item with the same ID already there");
            return false;
        }
        data.id = id;
        data._ = {};
        // used internally for some stuff
        this.items[id] = data;
        this.log("addItem: ", id, data);
        this.trigger(data, "MCH:addItem");
        return true;
    };

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
    MCH.prototype.updateItem = function (id, newData) {
        if (typeof this.items[id] === "undefined") {
            this.log("updateItem: ", id, "Warning: No item found with that ID");
            return false;
        }
        this.items[id] = extend(this.items[id], newData);
        this.trigger(id, "MCH:updateItem", newData);
        this.log("updateItem: ", id, newData);
        return true;
    }
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
    MCH.prototype.removeItem = function (id) {

        if (typeof this.items[id] === "undefined") {
            this.log("removeItem: ", id, "Warning: No item found with that ID");
            return false;
        }
        this.trigger(id, "MCH:removeItem");
        delete this.items[id];
        this.log("removeItem: ", id);
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
            this.log("getItem: ", id, "Warning: Item not found");
            return {};
        }
        this.log("getItem: ", id);
        return this.items[id];
    };

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
    MCH.prototype.bind = function (eventName, callback) {
        if (typeof this.events[eventName] === "undefined") {
            this.events[eventName] = [];
        }
        if (!isFunction(callback)) {
            this.log("bind: "+eventName, callback, "Error: Not a function, is a: "+typeof callback);
            return false;
        }
        this.events[eventName].push(callback);
        this.log("bind: "+eventName, callback);
        return true;
    };

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
    MCH.prototype.trigger = function (id, eventName, extraParams) {
        if (typeof this.events[eventName] === "undefined") {
            this.log("trigger: ", id, eventName, "Warning: Event triggered has no event handler");
            return false;
        }

        var item;
        // optionally you can pass on an object to the trigger - that will
        // make the trigger not retrieve the item but use that object.
        // theoretically you could then pass on something that's not at all
        // a member of the item list, i'd say that's crazy, but I guess it's
        // up to the developer... (used mostly internally to trigger an
        // event on an object that's already been created and is in memory)
        if (typeof id === "object" && id.hasOwnProperty("_")) {
            item = id;
            id = item.id;
        } else {
            item = this.getItem(id);
        }

        // pass on meta information, currently only the name of the trigger
        // - useful if using the same event handler for multiple triggers
        item._.trigger = eventName;

        // set up params for calling the corresponding event.
        // the params are the item being called on and any extra params
        // passed on when triggering the event
        var params = [item];
        if (typeof extraParams !== "undefined") {
            params.push(extraParams);
        }

        // call all defined events for this item's ID
        for (var i = 0, l = this.events[eventName].length; i < l; i++) {
            this.events[eventName][i].apply(this, params);
        }

        this.log("trigger: ", id, eventName);

        return true;
    };



    return MCH;

})();
