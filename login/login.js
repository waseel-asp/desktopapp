const { electron, BrowserWindow } = require('electron');
const httpRequest = require('https');
const environment = require('../environment.js');
const jwt_decode = require('jwt-decode');
$(function () {
    localStorage.clear();
});
function callLogin() {
    var body = JSON.stringify({
        username: document.getElementById('username').value,
        password: document.getElementById('password').value
    });
    var ele = document.getElementsByName('urlOption');
    var urlOption;
    for (i = 0; i < ele.length; i++) {
        if (ele[i].checked)
            urlOption = ele[i].value;
    }
    console.log(body + "fff" + urlOption);
    localStorage.setItem('environment', urlOption);
    var url = environment.selectURL(urlOption)
    console.log(url);

    var responseData;
    const options = {
        hostname: url,
        path: '/oauth/authenticate',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        }
    };

    const req = httpRequest.request(options, (res) => {
        document.getElementById("errorArea").style.display = "none";
        let chunks_of_data = [];
        res.on('data', (chunk) => {
            chunks_of_data.push(chunk);
        });
        res.on('end', () => {
            let response_body = Buffer.concat(chunks_of_data);
            responseData = JSON.parse(response_body.toString());

            if (res.statusCode == 200) {
                localStorage.setItem('access_token', responseData.access_token);
                localStorage.setItem('expire_time', responseData.expires_in);
                // window.location.href = "../home/page.html"
                var jwt_decode = require('jwt-decode')
                var token = localStorage.getItem('access_token');
                var decoded = jwt_decode(token);
                
                localStorage.setItem("provider_id", decoded.prov_id)
                localStorage.setItem("provider_code", decoded.prov_code);
                window.location.href = "../dbconfiguration/dbconfigui.html";

            } else {
                if (res.statusCode <= 500 && res.statusCode >= 400) {
                    console.log("In eroror");
                    document.getElementById("errorArea").style.display = "block";
                    document.getElementById("errorMessage").innerHTML = "username/password is invaild!";
                }

            }

        });
    });

    req.on('error', (e) => {
        console.error(`problem with request: ${e.message}`);
    });
    req.write(body);
    req.end();
    return;
}