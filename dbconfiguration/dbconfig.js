const sqlLiteConnection = require('../sqlLiteConnection')
sqlLiteConnection.initSqllite();


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

    var payer = document.getElementById('payerSelect').value;
    var payer_value = document.getElementById('payer').value;
    var claim = document.getElementById('claim_name').value;
    var claim_value = document.getElementById('claimtype').value;

    saveDbConfig(dbType, hostname, port, databaseName, username, password);
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
            window.location.href = "../extraction/extractionui.html";

        });

    } catch (error) {
        console.log(error);
    }

}

function saveMapping(payer, payer_value, claim, claim_value){

    try{

        // sqlLiteConnection.getDb().run(`INSERT INTO dbconfig(provider_id, db_type, hostname, port, database_name, username, password) VALUES(?,?,?,?,?,?,?)`,
        //             [provider_id, dbType, hostname, port, databaseName, username, password], function (err) {
        //                 if (err) {
        //                     return console.log(err.message);
        //                 }
        //                 // get the last insert id
        //                 console.log(`A row has been inserted with row id ${this.lastID}`);
        //             });
    }catch(error){
        console.error(error);
    }

}