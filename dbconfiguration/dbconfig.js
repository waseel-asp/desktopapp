const wslConnection = require('../dbConnection/wslConnection.js');

function refresh() {
    document.forms["dbConfig"].reset();
    document.getElementById("success-block").style.display = "none";
    document.getElementById("error-block").style.display = "none";
    document.getElementById("warning-block").style.display = "none";
    document.getElementById("db-errors").innerHTML = "";
    document.getElementById("db-warnings").innerHTML = "";
    getExistingDatabaseValue();
}


function getExistingDatabaseValue() {

    document.getElementById('test').disabled = true;

    wslConnection.fetchDatabase(function (isConnectionAvailable, dbParams, message) {
        if (isConnectionAvailable) {
            document.getElementById('dbtype').innerHTML = dbParams.db_type;
            document.getElementById('ip').value = dbParams.hostname;
            document.getElementById('port').value = dbParams.port;
            document.getElementById('database').value = dbParams.database_name;
            document.getElementById('username').value = dbParams.username;
            document.getElementById('password').value = dbParams.password;
            
            validateDatabase(wslConnection, dbParams);
        } else {
            document.getElementById("error-block").style.display = "block";
            document.getElementById("db-errors").innerHTML += "<li>" + message + "</li>"
            document.getElementById('test').disabled = false;
        }
    });
}