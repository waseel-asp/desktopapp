function databaseConfiguration() {
    var ele = document.getElementsByName('dbtype');
    var dbtype;
    for (i = 0; i < ele.length; i++) {
        if (ele[i].checked)
            dbtype = ele[i].value;
    }
    var body = JSON.stringify({
        ip: document.getElementById('ip').value,
        port: document.getElementById('port').value,
        database: document.getElementById('database').value,
        dbtype: dbtype,
        username: document.getElementById('username').value,
        password: document.getElementById('password').value
    });
    console.log(body);
    return;
}