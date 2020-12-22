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
    // EX : https://api.qa-eclaims.waseel.com/upload/providers/601/json
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
                while (table.firstChild) {
                    table.removeChild(table.lastChild);
                }
                var lengthOfResponse = Object.keys(responseData).length;
                var j = 0;
                var len = Math.floor(lengthOfResponse/3);
                console.log(len + " : " + lengthOfResponse/3)
                for (var i = 0; i<len; i++) {
                    var row = document.createElement("div");
                    row.setAttribute('class','row');
                    var div1 = document.createElement("div");
                    var div2 = document.createElement("div");
                    var div3 = document.createElement("div");
                    div1.setAttribute('class','col-sm-4');
                    div1.style.margin = '0.5% -2% 0.5% 2%';
                    div2.setAttribute('class','col-sm-4');
                    div2.style.margin = '0.5% 0 0.5% 0';
                    div3.setAttribute('class','col-sm-4');
                    div3.style.margin = '0.5% 0 0.5% 0';
                    div1.innerHTML = Object.keys(responseData)[j] + "  :  " + Object.values(responseData)[j]+"";
                    j++;
                    div2.innerHTML = Object.keys(responseData)[j] + "  :  " + Object.values(responseData)[j]+"";
                    j++;
                    div3.innerHTML = Object.keys(responseData)[j] + "  :  " + Object.values(responseData)[j]+"";
                    j++;
                    row.appendChild(div1);
                    row.appendChild(div2);
                    row.appendChild(div3);
                    table.appendChild(row);
                }
            } 
            else {
                if (res.statusCode <= 500 && res.statusCode >= 400) {
                    console.log("In eroror");
                    document.getElementById("summary-error").style.display = "block";
                    document.getElementById("summary-error").innerHTML = 
                        "<p>Error Message : " + responseData.error + "</p>";
                }
            }
        });
    });
    req.write(body);
    req.end();
}