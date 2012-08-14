(function (app, Backbone, _) {
    "use strict";

    var MSG_TEMPLATE = app.utils.template("script[id='logmessage']"),
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
        self.$el.append(MSG_TEMPLATE({
            host:opts.host,
            app:opts.app,
            timestamp:format(ts),
            level:level,
            content:data
        }));
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

    function connect() {
        app.middle.emit('subscribe-real-time-logs');
    }

    var View = Backbone.View.extend({
        initialize:function () {
            app.middle.on("log", log, this);
            app.middle.on("connect", connect, this);

            if (app.middle.connected) {
                connect();
            }
        },
        close:function () {
            app.middle.off("log", log, this);
            app.middle.off("connect", connect, this);
        },
        render:function () {
            this.$el.html("").addClass("well logs");

            return this;
        }
    });

    app.logviewer = app.logviewer || function(cb) {
        return cb(undefined, new View({}));
    };
})(window["jolira-app"], Backbone, _);