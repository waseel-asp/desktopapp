
function refresh() {
    document.forms["dbConfig"].reset();
    document.getElementById("success-block").style.display = "none";
    document.getElementById("error-block").style.display = "none";
    document.getElementById("warning-block").style.display = "none";
    document.getElementById("db-errors").innerHTML = "";
    document.getElementById("db-warnings").innerHTML = "";
    getExistingDatabaseValue();
}


async function getExistingDatabaseValue() {
    const wslConnection = require('../dbConnection/wslConnection.js');
    var refreshTest = document.getElementById('test');
    refreshTest.disabled = true;
    var spinnerSpan = document.createElement("span");
    spinnerSpan.classList.add('spinner-border');
    spinnerSpan.classList.add('spinner-border-sm');
    refreshTest.innerHTML = ' Loading....';
    refreshTest.firstChild.before(spinnerSpan);
    
    await wslConnection.fetchDatabase(async function (isConnectionAvailable, dbParams, message) {
        if (isConnectionAvailable) {

            document.getElementById('dbtype').innerHTML = dbParams.db_type;
            document.getElementById('ip').value = dbParams.hostname;
            document.getElementById('port').value = dbParams.port;
            document.getElementById('database').value = dbParams.database_name;
            document.getElementById('username').value = dbParams.username;
            document.getElementById('password').value = dbParams.password;

            validateDatabase(wslConnection, dbParams, function (connected) {
                if (connected)
                    document.getElementById("success-block").style.display = "flex";
                refreshTest.disabled = false;
                refreshTest.removeChild(spinnerSpan);
                refreshTest.innerHTML = 'Refresh & Test';

            });
        } else {
            document.getElementById("error-block").style.display = "block";
            document.getElementById("db-errors").innerHTML += "<p>" + message + "</p>"
            document.getElementById('test').disabled = false;
            refreshTest.disabled = false;
            refreshTest.removeChild(spinnerSpan);
            refreshTest.innerHTML = 'Refresh & Test';
        }
    });


}