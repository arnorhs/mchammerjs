#MCHammer - model-controller framework

A very simple framework for developing complex javascript
applications/interactions.

It is based on a publish/subscribe model or an event model, however you
want to look at it.

#What problem does this solve?

In the typical jQuery/ajax based web application you manipulate html elements
from ajax requests or various events. And when you need to save into ajax
requsts or propagate data to many places, you read the data from said elements,
etc.

This can work reasonably well for simple applications with few states, but as
your application grows, these kinds of bindings can get pretty messy and the
code often feels bulky, it gets hard to make changes and you loose overview of
how the application works.

It's probably possible to avoid this anti-pattern with really rigurous rules
and by simply being an awesome super-coder, but unfortunately not everybody
possesses such powers. Yours truly included. Which is why I created this
framework.

#How does MCHammer solve this problem?

Instead of manipulating html data directly through ajax requests and/or passing
data to ajax requests directly from the DOM in your events (with all the nested
callbacks, closures or other anti-patterns, you bind functions to specific
named events when you start your app.

Then you define your JS events in any way you normally would using jQuery or
hand-coding them or however you're used to doing them, but instead of calling
your own functions or doing manipulations/ajax requests on the event, you
trigger your predefined MCHammer events at that point and only pass on an ID of
the data entry that triggered the event.

All your functions are always called within the same scope, and you always have
access to the record you're editing, so passing objects and data around becomes
predictable and you won't have scope-creep.

Additionally the framework provides built-in events that get triggered when a
record gets updated, removed or added, which means it gets easy to update the
visual controls/elements you're using globally if that data is displayed in
multiple places.

#Flexibility

**No need to jam your whole app into the framework**

You don't need to build your app from the ground up using MCHammer. In fact, I
can't see how that would be possible, since it's not suited for that purpose
anyway.

**Well suited for even the smallest features**

You can simply continue to use/write all your existing code and if there is a
particular feature you're working on which you think MCHammer will be well
suited for, you can use it only for that feature if you like. The footprint is
quite small.

The uncompressed code is around 15KB and using the YUI compressor (the version
you'll probably end up using in production) the size goes down to 2.4KB as of
writing.

**Plays very nice with any JS library**

MCHammer doesn't make any changes to any JS prototypes etc and has no external
dependencies (such as jQuery, prototype, underscore.js, templating libraries,
etc).

So you can continue to use whatever you're currently using.

**No routing or "controller"**

The framework is called MC Hammer - as in Model-Controller-Hammer, but there
isn't really any "controller" per se. Instead all functionality is implemented
through special events.

Many of the JS frameworks out there, such as knockout.js, backbone.js, spine.js,
etc. provide some form of routing mechanism and/or controller paradigm to make
the app respond to different #! (hash-bang) URLs. MCHammer doesn't hanve
anything like that, so if you're building an app that requires something like
that, you'll need to find/create something that provides that functionality.

#Example usage

There are a couple of examples of how to build something using MCHammer in the
"examples" folder. Feel free to play with those to get a sense for how apps
can be structured using it.

#Bugs, issues, feature requests

You can submit issues and/or feature requests using the github issue tracker or
simply email me, arnorhs@gmail.com

Go ahead and fork the application as well and do a pull request if you have
something to contribute.


