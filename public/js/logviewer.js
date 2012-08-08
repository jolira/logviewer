(function (app, Backbone, _) {
    "use strict";

    var MSG_TEMPLATE = app.utils.template("script[id='message']"),
        lastDay;

    function format(ts) {
        var date = new Date(ts),
            month = date.getMonth() + 1,
            day = date.getDate(),
            hour = date.getHours(),
            minutes = date.getMinutes(),
            seconds = date.getSeconds(),
            milis = date.getMilliseconds(),
            result = lastDay === day ? "" : date.getFullYear() + "/" + month + "/" + day + "<br>";

        lastDay = day;

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

        return result + hour + ":" + minutes + ":" + seconds + "." + milis;
    }

    function appendOther(self, opts, level, ts, data) {
        _.each(data, function(value, key) {
            var content = [key, value],
                timestamp = format(ts);

            self.$el.append(MSG_TEMPLATE({
                host:opts.host,
                app:opts.app,
                timestamp:timestamp,
                level:level,
                content:content
            }));
        });

    }

    function log(opts, message) {
        if (message.ms) {
            var self = this;

            _.each(message.ms, function (msg) {
                self.$el.append(MSG_TEMPLATE({
                    host:opts.host,
                    app:opts.app,
                    timestamp:format(msg.ts),
                    level:msg.lv,
                    content:msg.ct
                }));

            });
        }
        if (message.os) {
            appendOther(this, opts, "os", message.ts, message.os);
        }
        if (message.process) {
            appendOther(this, opts, "process", message.ts, message.process);
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