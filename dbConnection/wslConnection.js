const httpRequest = require('https');
var jwt_decode = require('jwt-decode')
const environment = require('../environment.js');
const oracleConnection = require("./oracleConnection.js");
const mysqlConnection = require("./mysqlConnection.js");
const sqlServerConnection = require("./sqlServerConnection.js");

let dbParams = localStorage.getItem("dbParams");


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

                    oracleConnection.oracle(dbParams).then(data => {
                        console.log("Successfully connected to Oracle!");
                        resolve(data);
                    }, err => {
                        console.log(err);
                        reject(err);
                    });
                    setTimeout(function () { reject("Connection Timed out!"); }, 60000);

                } else if (dbParams.db_type.toUpperCase() == "SQLSERVER" || dbParams.db_type.toUpperCase() == "SQLSERVERLEGACY") {

                    sqlServerConnection.mssql(dbParams).then(data => {
                        console.log("Successfully connected to MSSQL!");
                        resolve(data);
                    }, err => {
                        console.log(err);
                        reject(err);
                    });
                    setTimeout(function () { reject("Connection Timed out!"); }, 60000);

                } else if (dbParams.db_type.toUpperCase() == "MYSQL") {

                    mysqlConnection.mysql(dbParams).then(data => {
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

                        oracleConnection.oracle(dbParams).then(data => {
                            console.log("Successfully connected to Oracle!");
                            resolve(data);
                        }, err => {
                            console.log(err);
                            reject(err);
                        });
                        setTimeout(function () { reject("Connection Timed out!"); }, 60000);

                    } else if (dbParams.db_type.toUpperCase() == "SQLSERVER" || dbParams.db_type.toUpperCase() == "SQLSERVERLEGACY") {

                        sqlServerConnection.mssql(dbParams).then(data => {
                            console.log("Successfully connected to MSSQL!");
                            resolve(data);
                        }, err => {
                            console.log(err);
                            reject(err);
                        });
                        setTimeout(function () { reject("Connection Timed out!"); }, 60000);

                    } else if (dbParams.db_type.toUpperCase() == "MYSQL") {

                        mysqlConnection.mysql(dbParams).then(data => {
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
                    reject(message);
                }
            });
        });
    },
    query: async function (queryString) {
        if (dbParams) {
            if (dbParams.db_type.toUpperCase() == "ORACLE") {
                return new Promise(function (resolve, reject) {
                    oracleConnection.oracleQuery(queryString).then(data => {
                        resolve(data.rows);
                    }, error => {
                        reject(error);
                    });
                });

            } else if (dbParams.db_type.toUpperCase() == "SQLSERVER" || dbParams.db_type.toUpperCase() == "SQLSERVERLEGACY") {
                return new Promise(function (resolve, reject) {
                    sqlServerConnection.mssqlQuery(queryString).then(data => {
                        resolve(data.recordset);
                    }, error => {
                        reject(error);
                    });
                });

            } else if (dbParams.db_type.toUpperCase() == "MYSQL") {
                return new Promise(function (resolve, reject) {
                    mysqlConnection.mysqlQuery(queryString).then(data => {
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
                localStorage.setItem("dbParams", dbParams);
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

exports.dbParams = dbParams;