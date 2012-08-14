(function (app, Backbone, _) {
    "use strict";

    app.starter.$(function (next) {
        app.container.route("*default", "logviewer", function (route, cb) {
            return app.logviewer(function(err, view) {
                return cb(err, view);
            });
        });

        return next();
    });
})(window["jolira-app"], Backbone, _);