    //The modules for your project will be inlined above
    //this snippet. Ask almond to synchronously require the
    //module value for 'main' here and return it as the
    //value to use for the public API for the built file.
    // console.log(require('views/main'))
    define('jquery', function () { return $; });
    
    // define('underscore', function () {
    //     return _;
    // });

    define('text', function () { return text; });

    define('backbone', function () { return Backbone; });

    define('helpers/fns', function () { return Fn; });

    define('managers/ajax', function () { return ajax; });

    // console.log(require('main'))
    // return 'toet';
    return require('main');
}));