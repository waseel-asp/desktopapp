var stagURL = "api.stg-eclaims.waseel.com";
var prodURL = "api.eclaims.waseel.com";
var qaURL = "api.qa-eclaims.waseel.com";
var serviceURL = "";

exports.selectURL = function(urlOption){
    if(urlOption == "STAG"){
        serviceURL = stagURL;
    }else if(urlOption == "PROD"){
        serviceURL = prodURL;
    }else{
        serviceURL = qaURL;
    }
    return serviceURL;
}

exports.refreshCurrentToken = function() {
    const expireTime = new Date(localStorage.getItem('expire_time'));
    const diff = (expireTime.getTime() - new Date().getTime()) / (1000*60);
    if(diff <= 30 && diff > 0) {
        var httpRequest = require('https');
        const body = JSON.stringify({
            access_token: localStorage.getItem('access_token'),
            refresh_token: localStorage.getItem('refresh_token')
        });
        var url = exports.selectURL(localStorage.getItem('environment'));
        var urlPath = '/oauth/refresh';
        const option = {
            hostname: url,
            path: urlPath,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            }
        };
        const request = httpRequest.request(option, (res) => {
            let chunksOfData = [];
            res.on('data', (chunk) => {
                chunksOfData.push(chunk);
            });
            res.on('end', () => {
                let responseBody = Buffer.concat(chunksOfData);
                if (res.statusCode == 200 || res.statusCode == 201) {
                    responseData = JSON.parse(responseBody.toString());
                    if (responseData != null) {
                        console.log('In Environment : Refresh Token');
                        localStorage.setItem('access_token', responseData.access_token);
                        localStorage.setItem('expire_time', responseData.expires_in);
                        localStorage.setItem('refresh_token', responseData.refresh_token);
                    }
                }
            });
        });
        request.write(body);
        request.end();
    }
}