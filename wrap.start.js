(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        //Allow using this built library as an AMD module
        //in another project. That other project will only
        //see this AMD call, not the internal modules in
        //the closure below.
        define(['jquery', 'backbone', 'text', 'helpers/fns', 'managers/ajax'], factory);
        // define(factory);
    } else {
        //Browser globals case. Just assign the
        //result to a property on the global.
        root.libGlobalName = factory();
    }
}(this, function ($, Backbone, text, Fn, ajax) {
    //almond, and your modules will be inlined here