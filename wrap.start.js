(function (root, factory) {
    if (typeof define === 'function' && define.amd) {

        // define(factory);
        define(['jquery', 'underscore', 'backbone', 'text'], factory);

    } else {

        root['facetedsearch'] = factory();
    }
// }(this, function () {
}(this, function ($, _, Backbone, text) {
