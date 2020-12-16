const sqlLiteConnection = require('../sqlLiteConnection')
sqlLiteConnection.initSqllite();
// (function() {
//     var jwt_decode = require('jwt-decode')
//     var token = localStorage.getItem('access_token');
   
//     var decoded = jwt_decode(token);

// let payerList = decoded.payers;
// var selectList = document.getElementById('payerSelect');
// for (var i = 0; i < payerList.length; i++) {
//     console.log(payerList[i]);
    
//     var option = document.createElement("option");
//     option.value = payerList[i];
//     option.text = payerList[i];
//     selectList.appendChild(option);
// }
//  })();
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

    saveDbConfig(dbType, hostname, port, databaseName, username, password);
}

function saveDbConfig(dbType, hostname, port, databaseName, username, password) {

    let sql = `SELECT * FROM dbconfig where id=1`;
    try{
        sqlLiteConnection.getDb().all(sql, [], (err, rows) => {
            if (err) {
                throw err;
            }
            if (rows.length > 1) {
                console.log("Multiple connections");
                return;
            }
            else if (rows.length == 0) {
                sqlLiteConnection.getDb().run(`INSERT INTO dbconfig(db_type, hostname, port, database_name, username, password) VALUES(?,?,?,?,?,?)`,
                    [dbType, hostname, port, databaseName, username, password], function (err) {
                        if (err) {
                            return console.log(err.message);
                        }
                        // get the last insert id
                        console.log(`A row has been inserted with row id ${this.lastID}`);
                    });
            } else if (rows.length == 1) {
                sqlLiteConnection.getDb().run(`UPDATE dbconfig set db_type = ?, hostname = ?, port = ?, database_name = ?, username = ?, password = ?`,
                    [dbType, hostname, port, databaseName, username, password], function (err) {
                        if (err) {
                            return console.log(err.message);
                        }
                        // get the last insert id
                        console.log(`A row has been update with row id ${this.lastID}`);
                    });
    
            }
            sqlLiteConnection.close();
            //temporary
            // wslConnection.connect(function (isConnectionAvailable) {
            //     if (!isConnectionAvailable) {
            //         alert("Unable to connect to database");
            //     }else{
            //         // window.location.href = "./temp.html"
            //         wslConnection.query("SELECT * from wsl_geninfo").then(data => {
            //             console.log(data)
            //         }, err => {
            //             console.log(err)
            //         });
            //     }
            // });
            window.location.href = "./temp.html";
    
        });

    }catch(error){
        console.log(error);
    }
    
}