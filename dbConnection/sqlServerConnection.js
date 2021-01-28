var connection;

module.exports = {
    mssql: async function (dbParams) {
        var encrypt = true;
        if (dbParams.db_type.toUpperCase() == "SQLSERVERLEGACY") {
            encrypt = false;
        }
        const sql = require('mssql');
        var dbConfig = {
            server: dbParams.hostname,
            authentication: {
                type: "default",
                options: {
                    userName: dbParams.username,
                    password: dbParams.password
                }
            },
            database: dbParams.database_name,
            encrypt: encrypt
        };
        return new Promise(function (resolve, reject) {
            sql.connect(dbConfig, function (err) {
                if (err)
                    reject(err)
                this.connection = sql;
                resolve(sql);

            });
        });
    },
    mssqlQuery: async function (queryString) {
        return new Promise(function (resolve, reject) {
            this.connection.query(queryString, function (err, result) {
                if (err)
                    reject(err);
                resolve(result);
            });
        });
    }
}