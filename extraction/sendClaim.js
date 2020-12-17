const httpRequest = require('https');
var jwt_decode = require('jwt-decode')
const environment = require('../environment.js');

function getProviderId() {
    const token = localStorage.getItem('access_token');
    var decoded = jwt_decode(token);
    return decoded.prov_id;
}

exports.sendClaim = function (claims) {
    var responseData;
    var body = JSON.stringify(claims);
    localStorage.setItem('hello',body);
    var url = environment.selectURL(localStorage.getItem('environment'));
    var urlPath = '/upload/providers/'+ getProviderId() +'/json';
    var authorizationToken = 'Bearer '+ localStorage.getItem('access_token');
    // https://api.qa-eclaims.waseel.com/upload/providers/601/json
    const options = {
        hostname: url,
        path: urlPath,
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': authorizationToken
        }
    };

    const req = httpRequest.request(options, (res) => {
        console.log(res);
        res.on('data', (chunk) => {
            responseData = JSON.parse(`${chunk}`);
            console.log(responseData);
            if (res.statusCode == 200 || res.statusCode == 201) {
                console.log('status ok');
                document.getElementById("summary-container").style.display = "block";
                var table = document.getElementById('summary-table');
                for(x in responseData) {
                    var row = table.insertRow(0);
                    var cell1 = row.insertCell(0);
                    var cell2 = row.insertCell(1);
                    cell1.innerHTML = x;
                    cell2.innerHTML = responseData[x];
                }
            } 
            // else {
            //     if (res.statusCode < 500 && res.statusCode >= 400) {
            //         console.log("In eroror");
            //         // document.getElementById("errorArea").style.display = "block";
            //         // document.getElementById("errorMessage").innerHTML = "username/password is invaild!";
            //     }
            //     // window.location.href = "../autoupdaterui.html"
            // }
        });
    });
    req.write(body);
    req.end();
}