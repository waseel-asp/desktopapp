const sqlLiteConnection = require('../sqlLiteConnection')
sqlLiteConnection.initSqllite();
console.log(sqlLiteConnection.getDb());
// const wslConnection = require('../wslConnection')

// wslConnection.connect(function (isConnectionAvailable) {
//     console.log(isConnectionAvailable);
//     if (!isConnectionAvailable) {
//         console.log("Not available");
//     } else {
//         //if database connection already present forward to extraction page
//         // window.location.href = "../autoupdaterui.html";

//         wslConnection.query("SELECT * from wsl_geninfo").then(data => {
//             console.log(data)
//         }, err => {
//             console.log(err)
//         });

//     }
// });