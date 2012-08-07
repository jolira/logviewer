(function (module) {
    "use strict";

    var vows = require('vows'),
        manifest = require('../lib/log-viewer');

    // Create a Test Suite
    vows.describe('debug').addBatch({
        'with output turned on': {
            topic: function () {
                process.env.NODE_DEBUG = "log-viewer";
                debug("test1");
                this.callback();
            },
            'with output turned off': {
                "topic": function () {
                    process.env.NODE_DEBUG = "";
                    debug("test2");
                    this.callback();
                },
                "restore debug settings": function () {
                    if (NODE_DEBUG) {
                        process.env.NODE_DEBUG = NODE_DEBUG;
                    }
                }
            }
        }
    }).export(module);
})(module);
