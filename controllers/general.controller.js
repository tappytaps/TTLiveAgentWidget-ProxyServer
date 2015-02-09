var url = require('url');

var crypto = require('crypto');
var rest = require('restler');

var articleDao = require('../dao/articleDao');
var config = require('../config/config');

//////////////////////////////////////////////////////////////

// get environment
var env = process.env.NODE_ENV || 'developement';

var targetUrl = config[env].targetUrl;
var apiKey = config[env].apiKey;

//////////////////////////////////////////////////////////////
///
exports.postWithApiKey = function postWithApiKey(req, res) {
    var body = req.body;
    var path = req.path;
    body['apikey'] = apiKey;
    rest.post(targetUrl + path, {
        data: body
    }).on('complete', function(data, targetRes) {
        try {
            var response = data.response;
            res.status(targetRes.statusCode).json(response);
        } catch (err) {
            res.sendStatus(500);
        }
    })
}
