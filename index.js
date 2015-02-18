var url = require('url');

var crypto = require('crypto');
var express = require('express');
var myConnection = require('express-myconnection');
var mysql = require('mysql');
var rest = require('restler');
var bodyParser = require('body-parser');

var articleDao = require('./dao/articleDao');
var config = require('./config/config');

var articlesCtrl = require('./controllers/articles.controller');
var generalCtrl = require('./controllers/general.controller');

var updateScript = require('./script/index');

//////////////////////////////////////////////////////////////

var app = express();

// get environment
var env = process.env.NODE_ENV || 'developement';
var port = process.env.PORT || 9000;

var targetUrl = config[env].targetUrl;
var apiKey = config[env].apiKey;
var refreshInterval = config[env].refreshInterval;

// Database connection
var dbConfig = config[env].db;

// Cors
app.use(function(req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    if (req.method === 'OPTIONS') {
        res.header('Access-Control-Allow-Methods', 'OPTIONS,GET,PUT,POST,PATCH,DELETE');
        res.header('Access-Control-Allow-Headers', "Content-Type,X-Requested-With,Authorization,Origin,Accept,Image");

        return res.send(200);
    }
    next();
});

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({
    extended: false
}))

// DB connection

app.use(myConnection(mysql, dbConfig, 'pool'));

app.get('/api/knowledgebase/articles', articlesCtrl.getArticles);
app.post('/api/conversations', generalCtrl.postWithApiKey);
app.post('/api/customers', generalCtrl.postWithApiKey);

updateScript.start(function(err) {
    if (err) {
        console.log(err);
    } else {
        console.log('Update script done.')
        app.listen(port);
        console.log('Server running at port %s in %s mode.', port, env);
        startUpdating()
    };
})

//////////////////////////////////////////////////////////////

/**
 * Sets interval for updating database articles
 */
function startUpdating() {
    setInterval(function() {
        console.log('Updating articles data.')
        updateScript.start(function(err) {
            if (err) {
                console.log(err)
                console.log('Articles update failed.')
            } else {
                console.log('Articles update done.')
            };
        })
    }, refreshInterval);
}
