const wslConnection = require('../dbConnection/wslConnection.js');

function refresh(){
    location.reload();
}


function getExistingDatabaseValue() {
    
    wslConnection.fetchDatabase(function (isConnectionAvailable, dbParams, message) {
        if (isConnectionAvailable) {
            document.getElementById('dbtype').innerHTML = dbParams.db_type;
            document.getElementById('ip').value = dbParams.hostname;
            document.getElementById('port').value = dbParams.port;
            document.getElementById('database').value = dbParams.database_name;
            document.getElementById('username').value = dbParams.username;
            document.getElementById('password').value = dbParams.password;

            validateDatabase(wslConnection, dbParams);
        }else{
            document.getElementById("error-block").style.display = "block";
            document.getElementById("db-errors").innerHTML += "<li>"+message+"</li>"
        }
    });
}