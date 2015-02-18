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

exports.getArticles = function getArticles(req, res) {

    // Parse URL
    var parsedURL = url.parse(req.url, true);

    var folderId = parsedURL.query['parent_id'];
    var queryHash = parsedURL.query['hash'];
    var limit = parsedURL.query['limit'] || 500;

console.log(limit)

    // If no folderId -> res with 404
    if (!folderId) {
        res.sendStatus(404)
        return
    }

    //
    // If there is 'hash' in request query, then client already has some articles.
    // 
    // 1. Look if folderId in database has the same hase.
    // 2. If hashes are equal, then send 'up-to-date' with true. (Client has current articles -> no need to download new.)
    // 3. If not, then return new articles and new hash. 
    //
    
    if (queryHash) {
        req.getConnection(function(err, connection) {
            if (err) {
                res.sendStatus(500);
            } else {
                articleDao.checkHash(connection, folderId, queryHash, function(err, exists, articles, hash) {
                    if (err) {
                        res.sendStatus(500)
                    } else {
                        if (exists) {
                            res.json({
                                'up-to-date': true,
                                'response': {}
                            })
                        } else {
                            if (articles != null && hash != null) {
                                res.json({
                                    'up-to-date': false,
                                    'response': {
                                        'articles': articles.slice(0, limit),
                                        'hash': hash
                                    }
                                })
                            } else {
                                res.sendStatus(404);
                            }
                        };
                    };
                });
            };
        });
    } else {

        //
        // If there isn't 'hash' in request query, then client has no articles.
        // 
        // 1. Try to get articles for folderId from database.
        // 2. If articles array not empty, then send them (with hash) to client.
        // 3. If there are no articles, then ask live agent for articles, stores them to database and send to client (also with hash).
        //

        req.getConnection(function(err, connection) {
            if (err) {
                res.sendStatus(500);
            } else {
                articleDao.getJson(connection, folderId, function(err, articles, hash) {
                    if (err) {
                        res.sendStatus(500)
                    } else {
                        if (articles.length > 0) {
                            res.json({
                                'up-to-date': false,
                                'response': {
                                    'articles': articles.slice(0, limit),
                                    'hash': hash
                                }
                            })
                        } else {

                            // Add API key
                            parsedURL.query['apikey'] = apiKey;
                            parsedURL.query['limit'] = 500;

                            // Create new url with API key
                            var urlWithApiKey = url.format({
                                pathname: parsedURL.pathname,
                                query: parsedURL.query
                            })

                            rest.get(targetUrl + urlWithApiKey).on('complete', function(response) {
                                try {
                                    var articles = response.response.articles;
                                    var articlesString = JSON.stringify(articles);
                                    var hash = crypto.createHash('md5').update(articlesString).digest('hex');

                                    if (articles.length === 0) {
                                        res.json({
                                            'up-to-date': false,
                                            'response': {
                                                'articles': []
                                            }
                                        })
                                        return
                                    }

                                    articleDao.insertOrUpdateFolder(connection, folderId, hash, articlesString, function(err) {
                                        if (err) {
                                            console.error(err)
                                            res.sendStatus(500)
                                        } else {
                                            res.json({
                                                'up-to-date': false,
                                                'response': {
                                                    'articles': articles.slice(0, limit),
                                                    'hash': hash
                                                }
                                            })
                                        };
                                    })
                                } catch (e) {
                                    console.error(e)
                                    res.sendStatus(500)
                                }
                            })

                        };
                    };
                });
            };
        });
    }
}
