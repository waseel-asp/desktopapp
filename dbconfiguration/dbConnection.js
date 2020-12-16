const sqlite3 = require('sqlite3').verbose();

let connection, dbParams;

function databaseConfiguration() {

    var ele = document.getElementsByName('dbtype');
    var dbType;
    for (i = 0; i < ele.length; i++) {
        if (ele[i].checked)
            dbType = ele[i].value;
    }
    var hostname = document.getElementById('ip').value;
    var port = document.getElementById('port').value;
    var databaseName = document.getElementById('database').value;
    var username = document.getElementById('username').value;
    var password = document.getElementById('password').value;

    saveDbConfig(dbType, hostname, port, databaseName, username, password)
}

function saveDbConfig(dbType, hostname, port, databaseName, username, password) {

    let sql = `SELECT * FROM dbconfig where id=1`;

    db.all(sql, [], (err, rows) => {
        if (err) {
            throw err;
        }
        if (rows.length > 1) {
            console.log("Multiple connections");
            return;
        }
        else if (rows.length == 0) {
            db.run(`INSERT INTO dbconfig(db_type, hostname, port, database_name, username, password) VALUES(?,?,?,?,?,?)`,
                [dbType, hostname, port, databaseName, username, password], function (err) {
                    if (err) {
                        return console.log(err.message);
                    }
                    // get the last insert id
                    console.log(`A row has been inserted with row id ${this.lastID}`);
                });
        } else if (rows.length == 1) {
            db.run(`UPDATE dbconfig set db_type = ?, hostname = ?, port = ?, database_name = ?, username = ?, password = ?`,
                [dbType, hostname, port, databaseName, username, password], function (err) {
                    if (err) {
                        return console.log(err.message);
                    }
                    // get the last insert id
                    console.log(`A row has been update with row id ${this.lastID}`);
                });

        }
        connect();

    });
}

function connect(callback) {

    fetchDbConfig(function (isConnectionAvailable) {

        if (isConnectionAvailable) {
            if (this.dbParams.db_type == "Oracle") {

                oracle().then(data => {
                    console.log("Successfully connected to Oracle!");
                    this.connection = data;
                    callback(true);
                }, err => {
                    console.log(err);
                    callback(false);
                });

            } else if (this.dbParams.db_type == "SqlServer") {

                mssql().then(data => {
                    console.log("Successfully connected to MSSQL!");
                    this.connection = data;
                    callback(true);
                }, err => {
                    console.log(err);
                    callback(false);
                });
            }else{
                callback(false);
            }
        }else{
            callback(false);
        }
    });
}

function fetchDbConfig(callback) {
    let sql = `SELECT * FROM dbconfig where id=1`;

    db.all(sql, [], (err, rows) => {
        if (err) {
            throw err;
        }
        if (rows.length == 1) {
            this.dbParams = rows[0];
            callback(true);
        } else {
            console.log("Multiple dataconnections...");
            callback(false);
        }
    });
}

async function query(queryString) {
    if (this.dbParams) {
        if (this.dbParams.db_type == "Oracle") {
            return oracleQuery(queryString).then(data => {
                return data.rows
            });
        } else if (this.dbParams.db_type == "SqlServer") {
            return mssqlQuery(queryString).then(data => {
                return data.recordset
            });
        }
    }
}


let db = new sqlite3.Database('./db/midtables_config.db', (err) => {
    if (err) {
        console.error(err.message);
    }
    console.log('Connected to the dbconfig database.');

    dbSchema = `CREATE TABLE IF NOT EXISTS dbconfig (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        db_type text NOT NULL,
        hostname text NOT NULL,
        port integer NOT NULL,
        database_name text NOT NULL,
        username text NOT NULL,
        password text NOT NULL
    );`

    db.exec(dbSchema, function (err) {
        if (err) {
            console.log(err);
        }
    });

});

async function mssql() {

    const sql = require('mssql');
    var dbConfig = {
        server: this.dbParams.hostname,
        authentication: {
            type: "default",
            options: {
                userName: this.dbParams.username,
                password: this.dbParams.password
            }
        },
        database: this.dbParams.database_name
    };
    return await sql.connect(dbConfig);
}

async function oracle() {

    const oracledb = require('oracledb');
    oracledb.outFormat = oracledb.OUT_FORMAT_OBJECT;

    return await oracledb.getConnection({
        user: this.dbParams.username,
        password: this.dbParams.password,
        connectString: this.dbParams.hostname + "/" + this.dbParams.database_name
    });
}

async function mssqlQuery(queryString) {
    console.log(this.connection);
    return await this.connection.Request().query(queryString);
}

async function oracleQuery(queryString) {
    console.log(this.connection);
    return await this.connection.execute(queryString);
}