const { electron, BrowserWindow } = require('electron');
const httpRequest = require('https');

function callLogin() {
    var body = JSON.stringify({ username: 'dlhadmin', password: 'dlhclm' });
    var responseData;
    const options = {
        hostname: 'api.qa-eclaims.waseel.com',
        path: '/oauth/authenticate',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        }
    };

    const req = httpRequest.request(options, (res) => {

        res.on('data', (chunk) => {
            responseData = JSON.parse(`${chunk}`);
            console.log(res.statusCode);
            if (res.statusCode == 200) {
                localStorage.setItem('access_token', responseData.access_token);
                window.location.href = "login/page.html"
            } else {
                window.location.href = "autoupdaterui.html"
            }
        });
    });

    req.on('error', (e) => {
        console.error(`problem with request: ${e.message}`);
    });
    req.write(body);
    req.end();
}