(function (root, factory) {
    if (typeof define === 'function' && define.amd) {

        define(factory);
        // define(['jquery', 'backbone', 'text', 'helpers/fns', 'managers/ajax'], factory);

    } else {

        root['faceted-search'] = factory();
    }
}(this, function () {
// }(this, function ($, Backbone, text, Fn, ajax) {
