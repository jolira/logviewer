(function (app, Backbone, _) {
    "use strict";

    var MSG_TEMPLATE = app.utils.template("script[id='message']");

    function format(ts) {
        var date = new Date(ts),
            year = date.getFullYear(),
            month = date.getMonth() + 1,
            day = date.getDate(),
            hour = date.getHours(),
            minutes = date.getMinutes(),
            seconds = date.getSeconds(),
            milis = date.getMilliseconds();

        if (minutes < 10) {
            minutes = "0" + minutes;
        }
        if (seconds < 10) {
            seconds = "0" + seconds;
        }
        if (milis < 10) {
            milis = "00" + milis;
        }
        else if (milis < 100) {
            milis = "0" + milis;
        }

        return year + "/" + month + "/" + day + "&nbsp;" + hour + ":" + minutes + ":" + seconds + "." + milis;
    }

    function log(message) {
        if (message.ms) {
            var self = this;

            _.each(message.ms, function (msg) {
                self.$el.append(MSG_TEMPLATE({
                    timestamp:format(msg.ts),
                    level:msg.lv,
                    content:msg.ct
                }));

            });
        }
    }

    var View = Backbone.View.extend({
        initialize:function () {
            app.middle.on("log", log, this);

            app.middle.emit('subscribe-real-time-logs');
        },
        close:function () {
            app.middle.off("log", log, this);
        },
        render:function () {
            this.$el.html("").addClass("well logs");

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