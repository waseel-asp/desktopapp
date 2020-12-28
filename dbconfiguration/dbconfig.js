const sqlLiteConnection = require('../dbConnection/sqlLiteConnection.js');
const wslConnection = require('../dbConnection/wslConnection.js');
sqlLiteConnection.initSqllite();

function getExistingDatabaseValue() {
    wslConnection.fetchDatabase(function (dbParams) {
        if (dbParams != null) {
            var ele = document.getElementsByName('dbtype');
            for (i = 0; i < ele.length; i++) {
                if (ele[i].value == dbParams.db_type)
                    ele[i].checked = "true";
            }
            document.getElementById('ip').value = dbParams.hostname;
            document.getElementById('port').value = dbParams.port;
            document.getElementById('database').value = dbParams.database_name;
            document.getElementById('username').value = dbParams.username;
            document.getElementById('password').value = dbParams.password;
        }
    });
}

function changePayerMappingValue() {
    var provider_id = localStorage.getItem('provider_id');
    var payer = document.getElementById('payerSelect').value;
    let payerSql = `SELECT * FROM payer_mapping WHERE provider_id = ? AND payer_id = ?`;
    sqlLiteConnection.getDb().all(payerSql, [provider_id, payer], (err, rows) => {
        if (rows.length == 1) {
            document.getElementById('payer').click();
            document.getElementById('payer').value = rows[0].mapping_value;
        }
        else {
            document.getElementById('payer').value = '';
        }
    });
}

function changeClaimMappingValue() {
    var provider_id = localStorage.getItem('provider_id');
    var claim = document.getElementById('claim_name').value;
    let claimSql = `SELECT * FROM claim_mapping WHERE provider_id = ? AND claim_name = ?`;
    sqlLiteConnection.getDb().all(claimSql, [provider_id, claim], (err, rows) => {
        if (rows.length == 1) {
            document.getElementById('claimtype').click();
            document.getElementById('claimtype').value = rows[0].mapping_value;
        }
        else {
            document.getElementById('claimtype').value = '';
        }
    });
}

function databaseConfiguration() {
    var saveButton = document.getElementById('save-config-button');
    saveButton.disabled = true;
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

    var payer = document.getElementById('payerSelect');
    // var payer_name = document.getElementById('payerSelect').text;

    var payer_name = payer.options[payer.selectedIndex].text;
    var payer_value = document.getElementById('payer').value;
    var claim = document.getElementById('claim_name').value;
    var claim_value = document.getElementById('claimtype').value;

    let dbParams = {
        "db_type": dbType,
        "hostname": hostname,
        "port": port,
        "database_name": databaseName,
        "username": username,
        "password": password
    };

    wslConnection.checkConnection(dbParams).then(data => {
        saveDbConfig(dbType, hostname, port, databaseName, username, password);
        var provider_id = localStorage.getItem("provider_id");
        savePayerMapping(provider_id, payer.value, payer_name, payer_value);
        saveClaimMapping(provider_id, claim, claim_value);
        window.location.href = "../extraction/extractionui.html";

    }, err => {
        saveButton.disabled = false;
        alert(err.message);
    });
}

function saveDbConfig(dbType, hostname, port, databaseName, username, password) {
    var provider_id = localStorage.getItem("provider_id");
    let sql = `SELECT * FROM dbconfig where provider_id=?`;
    try {
        sqlLiteConnection.getDb().all(sql, [provider_id], (err, rows) => {
            if (err) {
                throw err;
            }
            if (rows.length > 1) {
                console.log("Multiple connections");
                return;
            }
            else if (rows.length == 0) {
                sqlLiteConnection.getDb().run(`INSERT INTO dbconfig(provider_id, db_type, hostname, port, database_name, username, password) VALUES(?,?,?,?,?,?,?)`,
                    [provider_id, dbType, hostname, port, databaseName, username, password], function (err) {
                        if (err) {
                            return console.log(err.message);
                        }
                        // get the last insert id
                        console.log(`A row has been inserted with row id ${this.lastID}`);
                    });
            } else if (rows.length == 1) {
                sqlLiteConnection.getDb().run(`UPDATE dbconfig set provider_id = ?, db_type = ?, hostname = ?, port = ?, database_name = ?, username = ?, password = ? where provider_id=?`,
                    [provider_id, dbType, hostname, port, databaseName, username, password, provider_id], function (err) {
                        if (err) {
                            return console.log(err.message);
                        }
                        // get the last insert id
                        console.log(`A row has been update with row id ${this.lastID}`);
                    });

            }


            // window.location.href = "../extraction/extractionui.html";

        });

    } catch (error) {
        console.log(error);
    }

}

function savePayerMapping(provider_id, payer_id, payer_name, payer_value) {

    let sql = `SELECT * FROM payer_mapping where provider_id=? and payer_id=?`;
    try {
        sqlLiteConnection.getDb().all(sql, [provider_id, payer_id], (err, rows) => {
            if (err) {
                throw err;
            }
            if (rows.length > 1) {
                console.log("Multiple payer config");
                return;
            }
            else if (rows.length == 0) {
                sqlLiteConnection.getDb().run(`INSERT INTO payer_mapping(provider_id, payer_id, payer_name, mapping_value) VALUES(?,?,?,?)`,
                    [provider_id, payer_id, payer_name, payer_value], function (err) {
                        if (err) {
                            return console.log(err.message);
                        }
                        // get the last insert id
                        console.log(`A row has been inserted with row id ${this.lastID}`);
                    });
            } else if (rows.length == 1) {
                sqlLiteConnection.getDb().run(`UPDATE payer_mapping set payer_name = ?, mapping_value = ? where provider_id=? and payer_id=?`,
                    [payer_name, payer_value, provider_id, payer_id], function (err) {
                        if (err) {
                            return console.log(err.message);
                        }
                        // get the last insert id
                        console.log(`A row has been update with row id ${this.lastID}`);
                    });

            }
        });

    } catch (error) {
        console.log(error);
    }
}

function saveClaimMapping(provider_id, claim_name, claim_value) {

    let sql = `SELECT * FROM claim_mapping where provider_id=? and claim_name=?`;
    try {
        sqlLiteConnection.getDb().all(sql, [provider_id, claim_name], (err, rows) => {
            if (err) {
                throw err;
            }
            if (rows.length > 1) {
                console.log("Multiple claim_mapping config");
                return;
            }
            else if (rows.length == 0) {
                sqlLiteConnection.getDb().run(`INSERT INTO claim_mapping(provider_id, claim_name, mapping_value) VALUES(?,?,?)`,
                    [provider_id, claim_name, claim_value], function (err) {
                        if (err) {
                            return console.log(err.message);
                        }
                        // get the last insert id
                        console.log(`A row has been inserted with row id ${this.lastID}`);
                    });
            } else if (rows.length == 1) {
                sqlLiteConnection.getDb().run(`UPDATE claim_mapping set mapping_value = ? where provider_id=? and claim_name=?`,
                    [claim_value, provider_id, claim_name], function (err) {
                        if (err) {
                            return console.log(err.message);
                        }
                        // get the last insert id
                        console.log(`A row has been update with row id ${this.lastID}`);
                    });

            }
        });

    } catch (error) {
        console.log(error);
    }
}