
(function() {
    var jwt_decode = require('jwt-decode')
    var token = localStorage.getItem('access_token');
   
    var decoded = jwt_decode(token);

// let payerList = decoded.payers;
// var selectList = document.getElementById('payerSelect');
// for (var i = 0; i < payerList.length; i++) {
//     console.log(payerList[i]);
    
//     var option = document.createElement("option");
//     option.value = payerList[i];
//     option.text = payerList[i];
//     selectList.appendChild(option);
// }
 })();

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
    connectDatabase(dbtype);
    //save database in sqlite
    return;
}

function connectDatabase(selectDb){
    console.log("test connect");
    if(selectDb == 'ORACLE'){
        oracle();
    }

  }