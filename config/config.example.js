module.exports = {
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
    },
    production: {
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
