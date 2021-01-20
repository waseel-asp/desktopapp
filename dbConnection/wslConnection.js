const httpRequest = require('https');
var jwt_decode = require('jwt-decode')
const environment = require('../environment.js');

let connection, dbParams = localStorage.getItem("dbParams");
var encrypt = true;

function getProviderId() {
    const token = localStorage.getItem('access_token');
    var decoded = jwt_decode(token);
    return decoded.prov_id;
}

module.exports = {
    checkConnection: function () {

        return new Promise(function (resolve, reject) {

            if (dbParams) {
                if (dbParams.db_type.toUpperCase() == "ORACLE") {

                    oracle().then(data => {
                        console.log("Successfully connected to Oracle!");
                        this.connection = data;
                        resolve(data);
                    }, err => {
                        console.log(err);
                        reject(err);
                    });
                    setTimeout(function () { reject("Connection Timed out!"); }, 60000);

                } else if (dbParams.db_type.toUpperCase() == "SQLSERVER" || dbParams.db_type.toUpperCase() == "SQLSERVERLEGACY") {

                    if (dbParams.db_type.toUpperCase() == "SQLSERVERLEGACY") {
                        this.encrypt = false;
                    }

                    mssql().then(data => {
                        this.connection = data;
                        console.log("Successfully connected to MSSQL!");
                        resolve(data);
                    }, err => {
                        console.log(err);
                        reject(err);
                    });
                    setTimeout(function () { reject("Connection Timed out!"); }, 60000);
                } else if (dbParams.db_type.toUpperCase() == "MYSQL") {
                    mysql().then(data => {
                        console.log("Successfully connected to MYSQL!");
                        resolve(data);
                    }, err => {
                        console.log(err);
                        reject(err);
                    });
                    setTimeout(function () { reject("Connection Timed out!"); }, 60000);
                } else {
                    reject("Invalid DB Configuration")
                }
            } else {
                reject("No DB Configuration");
            }
        });

    },
    connect: function () {

        return new Promise(function (resolve, reject) {
            fetchDbConfig(function (isConnectionAvailable, data, message) {

                if (isConnectionAvailable) {
                    dbParams = data;
                    if (dbParams.db_type.toUpperCase() == "ORACLE") {

                        oracle().then(data => {
                            console.log("Successfully connected to Oracle!");
                            this.connection = data;
                            resolve(data);
                        }, err => {
                            console.log(err);
                            reject(err);
                        });

                    } else if (dbParams.db_type.toUpperCase() == "SQLSERVER" || dbParams.db_type.toUpperCase() == "SQLSERVERLEGACY") {
                        if (dbParams.db_type.toUpperCase() == "SQLSERVERLEGACY") {
                            this.encrypt = false;
                        }
                        mssql().then(data => {
                            console.log("Successfully connected to MSSQL!");
                            this.connection = data;
                            resolve(data);
                        }, err => {
                            console.log(err);
                            reject(err);
                        });
                    } else if (dbParams.db_type.toUpperCase() == "MYSQL") {
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
                    reject(message);
                }
            });
        });
    },
    query: async function (queryString) {
        if (dbParams) {
            if (dbParams.db_type.toUpperCase() == "ORACLE") {
                return new Promise(function (resolve, reject) {
                    oracleQuery(queryString).then(data => {
                        resolve(data.rows);
                    }, error => {
                        reject(error);
                    });
                });

            } else if (dbParams.db_type.toUpperCase() == "SQLSERVER" || dbParams.db_type.toUpperCase() == "SQLSERVERLEGACY") {
                return new Promise(function (resolve, reject) {
                    mssqlQuery(queryString).then(data => {
                        resolve(data.recordset);
                    }, error => {
                        reject(error);
                    });
                });

            } else if (dbParams.db_type.toUpperCase() == "MYSQL") {
                return new Promise(function (resolve, reject) {
                    mysqlQuery(queryString).then(data => {
                        resolve(data);
                    }, error => {
                        reject(error);
                    });
                });
            }
        }
    },
    fetchDatabase: function (callback) {
        fetchDbConfig(function (isConnectionAvailable, params, message) {

            if (isConnectionAvailable) {
                dbParams = params;
                localStorage.getItem("dbParams");
            }
            callback(isConnectionAvailable, dbParams, message);
        });
    },

}

function fetchDbConfig(callback) {
    var url = environment.selectURL(localStorage.getItem('environment'));
    var path = '/settings/providers/' + getProviderId() + '/db-config';

    var authorizationToken = 'Bearer ' + localStorage.getItem('access_token');;

    const reqOptions = {
        hostname: url,
        path: path,
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': authorizationToken
        }
    };

    const dbReq = httpRequest.request(reqOptions, (res) => {

        let chunksOfData = [];

        res.on('data', (chunk) => {
            chunksOfData.push(chunk);
        });

        res.on('end', () => {
            let responseBody = Buffer.concat(chunksOfData);
            responseData = JSON.parse(responseBody.toString());
            console.log(res.statusCode);
            console.log(responseData);
            if (res.statusCode == 200 || res.statusCode == 201) {
                if (responseData.dbObject != null) {
                    let dbParams = {
                        "db_type": responseData.dbObject.dbType,
                        "hostname": responseData.dbObject.hostName,
                        "port": responseData.dbObject.port,
                        "database_name": responseData.dbObject.databaseName,
                        "username": responseData.dbObject.dbUserName,
                        "password": responseData.dbObject.dbPassword
                    };
                    callback(true, dbParams, "Db configurations available");
                } else {
                    callback(false, undefined, "No DB Configuration!");
                }
            } else if (res.statusCode == 401) {
                alert("Invalid Token. Please sign in again.")
                window.location.href = "../login/loginui.html";
            } else {
                if (res.statusCode <= 500 && res.statusCode >= 400) {
                    callback(false, undefined, "Failed to connect to server!");
                }
            }
        });
    });
    dbReq.end();
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
        database: dbParams.database_name,
        encrypt: this.encrypt
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
        try {

            var tempPath = require('electron-root-path').rootPath;
            var oracleClientPath = tempPath + "\\resources\\oracle client 19_9";

            console.log(oracleClientPath);
            oracledb.initOracleClient({ libDir: oracleClientPath });
            oracledb.getConnection({
                user: dbParams.username,
                password: dbParams.password,
                connectString: dbParams.hostname + "/" + dbParams.database_name
            }, function (error, connection) {
                if (error)
                    reject(error)

                resolve(connection);
            });
        } catch (error) {
            reject(error);
        }

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
                reject(err);
            }
            resolve(rows);
        });
    });
}

exports.connection = connection;
exports.dbParams = dbParams;