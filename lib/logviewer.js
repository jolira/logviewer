(function (module) {
    "use strict";

    var awssum = require('awssum'),
        amazon = awssum.load('amazon/amazon'),
        S3 = awssum.load('amazon/s3').S3,
        DELAY = 5, // seconds
        lastSync,
        realTime;

    function getFilePrefix(date) {
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
                    host: matched[1],
                    app: matched[2]
                };

            return realTime.forEach(function(client) {
                client.volatile.emit('log', opts, content);
            });
        });
    }


    function dispatchLog(hidden, now) {
        var date = new Date(now * 1000),
            prefix = getFilePrefix(date);

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

    function dispatchLogs(hidden) {
        var now = Math.floor(Date.now() / 1000) - DELAY;

        if (!lastSync) {
            return dispatchLog(hidden, lastSync = now);
        }

        while (lastSync < now) {
            return dispatchLog(hidden, ++lastSync);
        }
    }

    function startRealTimeLogging(hidden) {
        return setInterval(function() {
            dispatchLogs(hidden);
        }, 1000);

    }

    function unsubscribe(client, idx) {
        if (!realTime || !idx >= realTime.length) {
            return; // not found
        }

        if (realTime[idx] === client) {
            return realTime = realTime.splice(idx, 1);
        }

        return unsubscribe(client, idx + 1);
    }

    function connect(properties) {
        var accessKeyId = properties["aws-access-key-id"],
            secretAccessKey = properties['aws-secret-access-key'],
            awsAccountId = properties['aws-account-id'],
            region = properties['aws-region'] || amazon.US_WEST_1;

        if (!accessKeyId || !secretAccessKey || !awsAccountId) {
            return undefined;
        }

        return new S3({
            accessKeyId:accessKeyId,
            secretAccessKey:secretAccessKey,
            awsAccountId:awsAccountId,
            region:region
        });
    }

    module.exports = function (properties) {
        var hidden = {
                s3:connect(properties),
                bucket:properties['aws-bucket']
            };

        return {
            'subscribe-real-time-logs':function () {
                if (!realTime) {
                    startRealTimeLogging(hidden);
                    realTime = [];
                }
                realTime.push(this);
            },
            'disconnect':function () {
                unsubscribe(this, 0);
            }
        };
    };
})(module);
