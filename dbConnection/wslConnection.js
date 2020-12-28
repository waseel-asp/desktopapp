const sqlLiteConnection = require('./sqlLiteConnection.js')
sqlLiteConnection.initSqllite();

let connection, dbParams;

module.exports = {
    checkConnection: function (params) {

        return new Promise(function (resolve, reject) {

            dbParams = params;
            console.log(dbParams);
            if (dbParams) {
                if (dbParams.db_type == "Oracle") {

                    oracle().then(data => {
                        console.log("Successfully connected to Oracle!");
                        this.connection = data;
                        resolve(data);
                    }, err => {
                        console.log(err);
                        reject(err);
                    });

                } else if (dbParams.db_type == "SqlServer") {

                    mssql().then(data => {
                        this.connection = data;
                        console.log("Successfully connected to MSSQL!");
                        resolve(data);
                    }, err => {
                        console.log(err);
                        reject(err);
                    });
                } else if (dbParams.db_type == "MySql") {
                    mysql().then(data => {
                        console.log("Successfully connected to MYSQL!");
                        resolve(data);
                    }, err => {
                        console.log(err);
                        reject(err);
                    });
                } else {
                    reject("Invalid DB Configuration")
                }
            } else {
                callback("No DB Configuration");
            }
        });

    },
    connect: function () {

        return new Promise(function (resolve, reject) {
            fetchDbConfig(function (isConnectionAvailable, error) {

                if (isConnectionAvailable) {
                    if (dbParams.db_type == "Oracle") {

                        oracle().then(data => {
                            console.log("Successfully connected to Oracle!");
                            this.connection = data;
                            resolve(data);
                        }, err => {
                            console.log(err);
                            reject(err);
                        });

                    } else if (dbParams.db_type == "SqlServer") {

                        mssql().then(data => {
                            console.log("Successfully connected to MSSQL!");
                            this.connection = data;
                            resolve(data);
                        }, err => {
                            console.log(err);
                            reject(err);
                        });
                    } else if (dbParams.db_type == "MySql") {
                        mysql().then(data => {
                            console.log("Successfully connected to MYSQL!");
                            resolve(data);
                        }, err => {
                            console.log(err);
                            reject(err);
                        });
                    } else {
                        reject("Invalid DB Configuration")
                    }
                } else {
                    reject("No DB Configuration")
                }
            });
        });
    },
    query: async function (queryString) {
        if (dbParams) {
            if (dbParams.db_type == "Oracle") {
                try {
                    return oracleQuery(queryString).then(data => {
                        return data.rows
                    }, error => {
                        console.log(error);
                    });

                } catch (error) {
                    console.error(error);
                }
            } else if (dbParams.db_type == "SqlServer") {
                return mssqlQuery(queryString).then(data => {
                    return data.recordset
                }, error => {
                    console.log(error);
                });
            } else if (dbParams.db_type == "MySql") {
                return mysqlQuery(queryString).then(data => {
                    return data;
                }, error => {
                    console.log(error);
                })
            }
        }
    },
    fetchDatabase: function (callback) {
        fetchDatabaseData(function (dbParams) {
            callback(dbParams);
        });
    },

}

function fetchDbConfig(callback) {
    let sql = `SELECT * FROM dbconfig where provider_id = ?`;
    try {
        sqlLiteConnection.getDb().all(sql, [localStorage.getItem("provider_id")], (err, rows) => {
            if (err) {
                throw err;
            }
            if (rows.length == 1) {
                dbParams = rows[0];
                callback(true, "");
            } else if (rows.length == 0) {
                console.log("No Connection...");
                callback(false, "No DB connection");
            } else if (rows.length > 1) {
                console.log("Multiple dataconnections...");
                callback("false", "Multiple DB connnections");
            }
        });

    } catch (error) {
        console.error(error);
    }
}

function fetchDatabaseData(callback) {
    let sql = `SELECT * FROM dbconfig where provider_id = ?`;
    try {
        sqlLiteConnection.getDb().all(sql, [localStorage.getItem("provider_id")], (err, rows) => {
            if (err) {
                throw err;
            }
            if (rows.length == 1) {
                dbParams = rows[0];
                callback(dbParams);
            } else if (rows.length == 0) {
                console.log("No Connection...");
                callback(null);
            } else if (rows.length > 1) {
                console.log("Multiple dataconnections...");
            }
        });

    } catch (error) {
        console.error(error);
    }
}
async function mssql() {

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
        database: dbParams.database_name
    };
    return new Promise(function (resolve, reject) {
        sql.connect(dbConfig, function (err) {
            if (err)
                reject(err)

            resolve(sql);

        });
    });
}

async function oracle() {

    const oracledb = require('oracledb');
    oracledb.outFormat = oracledb.OUT_FORMAT_OBJECT;

    return new Promise(function (resolve, reject) {
        oracledb.getConnection({
            user: dbParams.username,
            password: dbParams.password,
            connectString: dbParams.hostname + "/" + dbParams.database_name
        }, function (error, connection) {
            if (error)
                reject(error)

            resolve(connection);
        });
    });
}

async function mysql() {
    const mysql = require('mysql');
    this.connection = await mysql.createConnection({
        host: dbParams.hostname,
        user: dbParams.username,
        password: dbParams.password,
        database: dbParams.database_name
    });
    return new Promise(function (resolve, reject) {
        this.connection.connect(function (err) {
            if (err)
                reject(err);
            resolve(this.connection);
        });

    });
}

async function mssqlQuery(queryString) {
    return new Promise(function (resolve, reject) {
        this.connection.query(queryString, function (err, result) {
            if (err)
                reject(err);
            resolve(result);
        });
    });
}

async function oracleQuery(queryString) {
    return new Promise(function (resolve, reject) {
        this.connection.execute(queryString, function (err, result) {
            if (err)
                reject(err);
            resolve(result);
        });

    });
}

async function mysqlQuery(queryString) {
    return new Promise(function (resolve, reject) {
        this.connection.query(queryString, function (err, rows, fields) {
            // Call reject on error states,
            // call resolve with results
            if (err) {
                return reject(err);
            }
            resolve(rows);
        });
    });
}

exports.connection = connection;
exports.dbParams = dbParams;