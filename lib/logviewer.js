(function (module) {
    "use strict";

    var awssum = require('awssum'),
        amazon = awssum.load('amazon/amazon'),
        S3 = awssum.load('amazon/s3').S3,
        DELAY = 3; // seconds

    function getSecondPrefix(date) {
        var year = date.getUTCFullYear(),
            month = date.getUTCMonth() + 1,
            day = date.getUTCDate(),
            hour = date.getUTCHours(),
            minutes = date.getUTCMinutes(),
            seconds = date.getUTCSeconds();

        return year + "/" + month + "/" + day + "/" + hour + "/" + minutes + "/" + seconds + "/";
    }

    function dispatchLogContent(hidden, key) {
        return hidden.s3.GetObject({
            BucketName:hidden.bucket,
            ObjectName:key
        }, function (err, result) {
            if (err) {
                return cb(err);
            }

            var body = result.Body.toString(),
                content = JSON.parse(body),
                matched = key.match(/[\d]+\/\d+\/\d+\/\d+\/\d+\/\d+\/([^/]+)\/([^-]+)\-\d+\.log/),
                opts = {
                    host:matched[1],
                    app:matched[2]
                };

            return hidden.subscribers.forEach(function (client) {
                client.volatile.emit('log', opts, content);
            });
        });
    }

    function dispatchTimedLogs(hidden, prefix) {
        return hidden.s3.ListObjects({
            BucketName:hidden.bucket,
            MaxKeys:1024 * 1024,
            Prefix:prefix
        }, function (err, result) {
            if (err) {
                return console.error(err);
            }

            var body = result.Body,
                bucketResult = body.ListBucketResult,
                contents = Array.isArray(bucketResult.Contents) ? bucketResult.Contents :
                    [bucketResult.Contents],
                result = [];

            return contents.forEach(function (content) {
                if (content && content.Key) {
                    dispatchLogContent(hidden, content.Key);
                }
            });
        });
    }

    function dispatchSecond(hidden, ts) {
        var date = new Date(ts * 1000),
            prefix = getSecondPrefix(date);

        return dispatchTimedLogs(hidden, prefix);
    }

    function dispatchLogs(hidden, cb) {
        var now = Math.floor(Date.now() / 1000) - DELAY;

        if (hidden.lastSync) {
            while (hidden.lastSync < now) {
                dispatchSecond(hidden, ++hidden.lastSync);
            }
        }
        else {
            dispatchSecond(hidden, hidden.lastSync = now);
        }

        return cb && cb();
    }

    function startRealTimeLogging(hidden) {
        return setInterval(function () {
            dispatchLogs(hidden);
        }, 1000);

    }

    function unsubscribe(hidden, client, idx) {
        if (!hidden.subscribers || !idx >= hidden.subscribers.length) {
            return; // not found
        }

        if (hidden.subscribers[idx] === client) {
            return hidden.subscribers = hidden.subscribers.splice(idx, 1);
        }

        return unsubscribe(hidden, client, idx + 1);
    }

    function subscribe(hidden, elem, idx) {
        if (idx >= hidden.subscribers.length) {
            return hidden.subscribers.push(elem);
        }

        if (hidden.subscribers[idx] === elem) {
            return;
        }

        return subscribe(hidden, elem, idx + 1);
    }

    function connect(properties, cb) {
        var accessKeyId = properties["aws-access-key-id"],
            secretAccessKey = properties['aws-secret-access-key'],
            region = properties['aws-region'] || amazon.US_WEST_1,
            bucket = properties['aws-log-bucket'];

        if (!accessKeyId || !secretAccessKey || !bucket) {
            return cb(new Error("logging credentials missing"));
        }

        return cb(undefined, {
            bucket:bucket,
            s3:new S3({
                accessKeyId:accessKeyId,
                secretAccessKey:secretAccessKey,
                region:region
            })
        });
    }

    module.exports = function (properties, cb) {
        return connect(properties, function (err, hidden) {
            if (err) {
                return cb(err);
            }

            return cb (undefined, {
                'subscribe-real-time-logs':function () {
                    var client = this;

                    if (!hidden.subscribers) {
                        startRealTimeLogging(hidden);
                        hidden.subscribers = [];
                    }

                    subscribe(hidden, client, 0);
                },
                'disconnect':function () {
                    unsubscribe(hidden, this, 0);
                }
            });
        });
    };
})(module);
