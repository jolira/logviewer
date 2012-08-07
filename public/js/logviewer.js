(function (app, Backbone, _) {
    "use strict";

    function log(message) {
        this.$el.append(JSON.stringify(message));
    }

    var View = Backbone.View.extend({
        initialize:function () {
            app.middle.on("log", log, this);

            app.middle.emit('subscribe-real-time-logs');
        },
        close:function () {
            app.middle.off("log", log, this);
        },
        tagName: "pre",
        render:function () {
            this.$el.html("").addClass("logs");

            return this;
        }
    });

    app.starter.$(function (next) {
        app.container.route("*default", "default", function (route, cb) {
            return cb(undefined, new View({}));
        });

        return next();
    });
})(window["jolira-app"], Backbone, _);