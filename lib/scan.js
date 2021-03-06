var config = require('./config')();
var types = require('./types');
var dynamoRequest = require('./dynamoRequest');
var _ = require('underscore');

module.exports.scan = function(opts, cb) {
    if(!cb && _.isFunction(opts)) { cb = opts; opts = {}; }
    if(!opts) opts = {};

    var params = {
        TableName: opts.table || config.table
    };

    if(opts.attributes) {
        params.AttributesToGet = opts.attributes;
        params.Select = 'SPECIFIC_ATTRIBUTES';
    } else  {
        params.Select = opts.select || 'ALL_ATTRIBUTES';
    }
    if(opts.limit) {
        params.Limit = opts.limit;
    }

    return dynamoRequest({query:params, pages: opts.pages, func: function(query, callback) {
        config.dynamo.scan(query, function(err, resp){
            if (err) return callback(err);
            if(resp.Items) {
                resp.Items = types.typesFromDynamo(resp.Items);
            }
            var result = { count:resp.Count, items: resp.Items };
            if(resp.LastEvaluatedKey) {
                result.last = resp.LastEvaluatedKey;
            }
            callback(null, result);
        });
    }}, cb);
};
