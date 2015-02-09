var crypto = require('crypto');

var rest = require('restler');
var mysql = require('mysql');
var async = require('async');

var articleDao = require('../dao/articleDao');
var config = require('../config/config');

// get environment
var env = process.env.NODE_ENV || 'developement';

// Database connection
var dbConfig = config[env].db;
var apiKey = config[env].apiKey;
var targetUrl = config[env].targetUrl;

exports.start = function start(cb) {

    var connection = mysql.createConnection({
        host: dbConfig.host,
        database: dbConfig.database,
        port: dbConfig.port,
        user: dbConfig.user,
        password: dbConfig.password
    });

    connection.connect();

    articleDao.getFolders(connection, function(err, folders) {
        if (err) {
            cb(err)
        } else {
            async.eachSeries(folders, function(folder, callback) {
                rest.get(targetUrl + '/api/knowledgebase/articles?parent_id=' + folder.folderId + '&apikey=' + apiKey).on('complete', function(res) {

                    var articles = res.response.articles;
                    var articlesString = JSON.stringify(articles);

                    var hash = crypto.createHash('md5').update(articlesString).digest('hex');

                    articleDao.updateFolder(connection, folder.folderId, hash, articlesString, function(err) {
                        if (err) {
                            callback(err)
                        } else {
                            callback(null)
                        };
                    })
                })
            }, function(err) {
                if (err) {
                    console.log(err);
                    connection.end();
                    cb(err);
                } else {
                    connection.end();
                    cb(null)
                }
            })
        };

    })

}
