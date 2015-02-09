exports.checkHash = function checkHash(connection, folderId, hash, cb) {

    var query = "SELECT * FROM articles WHERE folderId = ?";

    connection.query(query, [folderId, hash], function(err, rows) {
        if (err) {
            cb(err)
        } else {
            if (rows.length > 0) {
                var dbHash = rows[0].hash;
                if (dbHash === hash) {
                    cb(null, true)
                } else {
                    cb(null, false, JSON.parse(rows[0].json), rows[0].hash)
                };
            } else {
                cb(null, false)
            };
        };
    });
}

exports.getFolders = function getFolders(connection, cb) {

    var query = "SELECT folderId FROM articles";

    connection.query(query, function(err, rows) {
        if (err) {
            cb(err)
        } else {
            if (rows.length > 0) {
                cb(null, rows)
            } else {
                cb(null, [])
            };
        };
    });

}

var insertFolder = exports.insertFolder = function insertFolder(connection, folderId, hash, json, cb) {

    var query = "INSERT INTO articles SET ?"

    var folder = {
        folderId: folderId,
        hash: hash,
        json: json
    }

    connection.query(query, folder, function(err) {
        if (err) {
            cb(err)
        } else {
            cb(null)
        };
    })

}

var updateFolder = exports.updateFolder = function updateFolder(connection, folderId, hash, json, cb) {

    var query = "UPDATE articles SET hash = ?, json = ? WHERE folderId = ?"

    connection.query(query, [hash, json, folderId], function(err) {
        if (err) {
            cb(err)
        } else {
            cb(null)
        };
    })

}

exports.insertOrUpdateFolder = function updateFolder(connection, folderId, hash, json, cb) {

    var getQuery = "SELECT * FROM articles WHERE folderId = ?"
    var query = "UPDATE articles SET hash = ?, json = ? WHERE folderId = ?"

    connection.query(getQuery, [folderId], function(err, rows) {
        if (err) {
            cb(err)
        } else {
            if (rows.length > 0) {
                updateFolder(connection, folderId, hash, json, function(err) {
                    if (err) {
                        cb(err)
                    } else {
                        cb(null)
                    };
                })
            } else {
                insertFolder(connection, folderId, hash, json, function(err) {
                    if (err) {
                        cb(err)
                    } else {
                        cb(null)
                    };
                })
            };
        };
    })

}

exports.getJson = function getJson(connection, folderId, cb) {

    var query = "SELECT json, hash FROM articles WHERE folderId = ?"

    connection.query(query, [folderId], function(err, rows) {
        if (err) {
            cb(err)
        } else {
            if (rows.length === 0) {
                cb(null, [])
            } else {
                cb(null, JSON.parse(rows[0].json), rows[0].hash)
            };
        };
    });

}
