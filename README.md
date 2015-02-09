TTLiveAgentWidget - proxy server
=======

Proxy server for TTLiveAgentWidget. The main purpose of the proxy server is to secure live agent API key by storing it only on the proxy server. So the API key is not sent from client to proxy server. Another purpose of this proxy is to allow to use only some (get knowledgebase articles, create customer and create converastion) live agent APIs. 

Installing
----------

Before you start using this proxy server, you should duplicate `./config/config.example.js` and rename it to `./config/config.js`.

Proxy server uses MySQL database. Before installing you should start your MySQL server and config it in `./config/config.js`. Also run `./sql/db.sql` script to create appropriate database. 

All live agent configurations are placed in `./config/config.js`. For more info see **Configuration**.

Then you can install and run the proxy server:

```
cd path/to/liveagent-proxyserver
npm install
node index.js
```

Configuration
----------

You can config your proxy server in `./config/config.js` file. Configuration is devided to `developement` and `production`. You set your mode by NODE_ENV environment variable. Also proxy server's port is set by PORT environment variable. 

As part of this repository there is also a CONF file `./script/nodejs-liveagentproxy.conf`.

*./config/config.js*

```
{
    developement: {
        db: {
            host: 'localhost',
            database: 'database',
            port: '8889',
            user: 'root',
            password: 'root'
        },
        targetUrl: 'http://myapiurl',
        apiKey: '1234567890abc',
        refreshInterval: 24 * 60 * 60 * 1000
    }
}
```

The options are:

- `db` - mysql server configuration
- `targetUrl` - targeted live agent server
- `apiKey` - live agent api key
- `refreshInterval` - how often will be cached articles refreshed (value in milliseconds)

Features
----------

* Secures live agent API key.
* Allowes to use only `/api/knowledgebase/articles`, `/api/conversations` and `/api/customers` live agent APIs.