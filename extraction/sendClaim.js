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
    // localStorage.setItem('hello',body);
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
    var progressStatus = document.getElementById("claim-progress-status");
    var progressBar = document.getElementById("progress-bar");
    progressBar.style.width = "75%";
    progressStatus.innerHTML = "Sending Claims ...";
    const req = httpRequest.request(options, (res) => {
        progressBar.style.width = "100%";
        progressStatus.innerHTML = "Sending Claims ...";
        // console.log(res);
        let chunks_of_data = [];
        res.on('data', (chunk) => {
            chunks_of_data.push(chunk);
        });
        res.on('end', () => {
            let response_body = Buffer.concat(chunks_of_data);
            responseData = JSON.parse(response_body.toString());
            console.log(responseData);
            if (res.statusCode == 200 || res.statusCode == 201) {
                document.getElementById("summary-container").style.display = "block";
                document.getElementById("uploadName").innerHTML = responseData['uploadName'];
                document.getElementById("uploadSummaryID").innerHTML = responseData['uploadSummaryID'];
                document.getElementById("noOfUploadedClaims").innerHTML = responseData['noOfUploadedClaims'];
                document.getElementById("netAmountOfUploadedClaims").innerHTML = responseData['netAmountOfUploadedClaims'];
                document.getElementById("netVATAmountOfUploadedClaims").innerHTML = responseData['netVATAmountOfUploadedClaims'];
                document.getElementById("noOfNotUploadedClaims").innerHTML = responseData['noOfNotUploadedClaims'];
            } 
            else {
                if (res.statusCode == 401) {
                    alert("Invalid Token. Please again sign in.")
                    window.location.href = "../login/loginui.html";
                } else if (res.statusCode <= 500 && res.statusCode >= 400) {
                    console.log("In eroror");
                    document.getElementById("summary-error").style.display = "block";
                    document.getElementById("summary-error").innerHTML = 
                    "<p>Error Message : " + responseData.error + "</p>";
                }
            }
            document.getElementById("claim-progress-bar").style.display = "none";
            progressBar.style.width = "0%";
        });
        document.getElementById("extract-button").disabled = false;
    });
    req.write(body);
    req.on('error', (e) => {
        document.getElementById("claim-progress-bar").style.display = "none";
        progressBar.style.width = "0%";
        document.getElementById('summary-error').style.display = 'block';
        document.getElementById('summary-error').innerHTML = `${e.message}`;
        console.error(`problem with request: ${e.message}`);
    });
    req.end();
}