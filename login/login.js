const { electron, BrowserWindow } = require('electron');
const httpRequest = require('https');
const jwt_decode = require('jwt-decode');

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
    var url = selectURL(urlOption)
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
        res.on('data', (chunk) => {
            responseData = JSON.parse(`${chunk}`);
            if (res.statusCode == 200) {
                localStorage.setItem('access_token', responseData.access_token);
                var token = responseData.access_token;
                var decoded = jwt_decode(token);
 
                console.log(decoded);
                // window.location.href = "../home/page.html"
                window.location.href = "../dbconfiguration/dbconfigui.html";
            } else {
                if (res.statusCode < 500 && res.statusCode >= 400) {
                    console.log("In eroror");
                    document.getElementById("errorArea").style.display = "block";
                    document.getElementById("errorMessage").innerHTML = "username/password is invaild!";
                }

                // window.location.href = "../autoupdaterui.html"
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