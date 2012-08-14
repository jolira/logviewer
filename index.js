/*jslint node: true, vars: true, indent: 4 */
(function (module) {
    "use strict";

    var path = require("path"),
        baseline = require("site-manager-baseline"),
        logviewer = require("./lib/logviewer"),
        templates = path.join(__dirname, "templates"),
        pubdir = path.join(__dirname, "public");

    module.exports = function (defaults, cb, lopts, gopts, app) {
        baseline(defaults, app, lopts, gopts, function (err, defaults, dispatcher) {
            if (err) {
                return cb(err);
            }
            dispatcher.on(logviewer({
                'aws-access-key-id':lopts['aws-access-key-id'] || gopts['aws-access-key-id'],
                'aws-secret-access-key':lopts['aws-secret-access-key'] || gopts['aws-secret-access-key'],
                'aws-account-id':lopts['aws-account-id'] || gopts['aws-account-id'],
                'aws-region':lopts['aws-region'] || gopts['aws-region'],
                'aws-bucket':lopts['aws-log-bucket'] || gopts['aws-log-bucket']
            }));

            defaults.title = "Log Viewer";
            defaults.hostname = "logviewer.jolira.com";
            defaults.stylesheets = ["less/logviewer.less"];
            [
                "js/logviewer.js"
            ].forEach(function (dir) {
                    defaults.trailingScripts.push(dir);
                });
            [
                path.join(templates, "message.html")
            ].forEach(function (dir) {
                    defaults.templateFiles.push(dir);
                });
            [
                {
                    "name":"description",
                    "content":"Log Viewer"
                }
            ].forEach(function (meta) {
                    defaults.metas.push(meta);
                });
            defaults["public"].unshift(pubdir);
            defaults.googleAnalyticsWebPropertyID = "UA-3602945-1";

            return cb(undefined, defaults);
        });
    };
})(module);