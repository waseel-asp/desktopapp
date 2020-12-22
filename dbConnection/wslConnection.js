const sqlLiteConnection = require('./sqlLiteConnection.js')
sqlLiteConnection.initSqllite();

let connection, dbParams;

module.exports = {
    checkConnection: function(params, callback){
        dbParams = params;
        console.log(dbParams);
        if (dbParams) {
            if (dbParams.db_type == "Oracle") {

                oracle().then(data => {
                    console.log("Successfully connected to Oracle!");
                    callback(true);
                }, err => {
                    console.log(err);
                    callback(false);
                });

            } else if (dbParams.db_type == "SqlServer") {

                mssql().then(data => {
                    console.log("Successfully connected to MSSQL!");
                    callback(true);
                }, err => {
                    console.log(err);
                    callback(false);
                });
            } else {
                callback(false);
            }
        } else {
            callback(false);
        }

    },
    connect: function (callback) {

        fetchDbConfig(function (isConnectionAvailable) {

            if (isConnectionAvailable) {
                if (dbParams.db_type == "Oracle") {

                    oracle().then(data => {
                        console.log("Successfully connected to Oracle!");
                        this.connection = data;
                        callback(true);
                    }, err => {
                        console.log(err);
                        callback(false);
                    });

                } else if (dbParams.db_type == "SqlServer") {

                    mssql().then(data => {
                        console.log("Successfully connected to MSSQL!");
                        this.connection = data;
                        callback(true);
                    }, err => {
                        console.log(err);
                        callback(false);
                    });
                } else {
                    callback(false);
                }
            } else {
                callback(false);
            }
        });
    },
    query: async function (queryString) {
        if (dbParams) {
            if (dbParams.db_type == "Oracle") {
                try {
                    return oracleQuery(queryString).then(data => {
                        return data.rows
                    });

                } catch (error) {
                    console.error(error);
                }
            } else if (dbParams.db_type == "SqlServer") {
                return mssqlQuery(queryString).then(data => {
                    return data.recordset
                });
            }
        }
    },
    fetchDatabase : function(callback){
        fetchDatabaseData(function(dbParams){
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
                    callback(true);
                }else if(rows.length == 0){
                    console.log("No Connection...");
                    callback(false);
                } else if (rows.length >1) {
                    console.log("Multiple dataconnections...");
                    callback(false);
                }
            });
        
    } catch (error) {
        console.error(error);
    }
}

function fetchDatabaseData(callback){
    let sql = `SELECT * FROM dbconfig where provider_id = ?`;
    try {
            sqlLiteConnection.getDb().all(sql, [localStorage.getItem("provider_id")], (err, rows) => {
                if (err) {
                    throw err;
                }
                if (rows.length == 1) {
                    dbParams = rows[0];
                    callback(dbParams);
                }else if(rows.length == 0){
                    console.log("No Connection...");
                    callback(null);
                } else if (rows.length >1) {
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
    return await sql.connect(dbConfig);

}

async function oracle() {

    const oracledb = require('oracledb');
    oracledb.outFormat = oracledb.OUT_FORMAT_OBJECT;

    return await oracledb.getConnection({
        user: dbParams.username,
        password: dbParams.password,
        connectString: dbParams.hostname + "/" + dbParams.database_name
    });
}

async function mssqlQuery(queryString) {
    // console.log(this.connection);
    return this.connection.query(queryString);
}

async function oracleQuery(queryString) {
    // console.log(this.connection);
    return await this.connection.execute(queryString);
}


exports.connection = connection;
exports.dbParams = dbParams;