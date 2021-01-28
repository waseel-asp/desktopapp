var connection;

module.exports = {
    mysql: async function (dbParams) {
        return new Promise(async function (resolve, reject) {
            const mysql = require('mysql');

            this.connection = await mysql.createConnection({
                host: dbParams.hostname,
                user: dbParams.username,
                password: dbParams.password,
                database: dbParams.database_name
            });
            this.connection.connect(function (err) {
                if (err)
                    reject(err);
                resolve(this.connection);
            });
        });
    },
    mysqlQuery: async function (queryString) {
        return new Promise(function (resolve, reject) {
            this.connection.query(queryString, function (err, rows, fields) {
                // Call reject on error states,
                // call resolve with results
                if (err) {
                    reject(err);
                }
                resolve(rows);
            });
        });
    }

}

exports.connection = connection;