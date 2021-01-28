exports.convertToAgePeriod = function (value, unit) {
    if (value == null) {
        value = 0;
        unit = "days";
    }
    var periodUnit = null;
    if (unit != null) {
        if (unit.toLowerCase() === "years" || unit.toLowerCase() === "year") {
            periodUnit = "Y";
        } else if (unit.toLowerCase() === "months" || unit.toLowerCase() === "month") {
            periodUnit = "M";
        } else if (unit.toLowerCase() === "days" || unit.toLowerCase() === "day") {
            periodUnit = "D";
        } else if (unit.toLowerCase() === "weeks" || unit.toLowerCase() === "week") {
            periodUnit = "W";
        }
    }
    if (periodUnit != null) {
        return "P" + value + periodUnit + "";
    } else
        return null;
}

exports.setGDPNData = async function (netData, netVATrateData, netVATamountData, patientShareData,
    patientShareVATrateData, patientShareVATamountData, discountData, grossData,
    priceCorrectionData, rejectionData, callback) {
    const amount = require('../models/Amount.js');
    const commonGDPN = require('../models/GDPN.js');
    commonGDPN.setGDPNData(
        amount.getAmountValue(netData, "SAR"),
        amount.getAmountValue(netVATrateData, "SAR"),
        amount.getAmountValue(netVATamountData, "SAR"),
        amount.getAmountValue(patientShareData, "SAR"),
        amount.getAmountValue(patientShareVATrateData, "SAR"),
        amount.getAmountValue(patientShareVATamountData, "SAR"),
        amount.getAmountValue(discountData, "SAR"),
        amount.getAmountValue(grossData, "SAR"),
        amount.getAmountValue(priceCorrectionData, "SAR"),
        amount.getAmountValue(rejectionData, "SAR"));
    callback(commonGDPN.getGDPNInfo());
}

exports.getPayerMapping = function () {
    const jwt_decode = require('jwt-decode')
    const httpRequest = require('https');
    var url = environment.selectURL(localStorage.getItem('environment'));
    var token = localStorage.getItem('access_token');
    var decoded = jwt_decode(token);
    var selectList = document.getElementById('selectedPayer');
    var authorizationToken = 'Bearer ' + token;
    // EX : https://api.qa-eclaims.waseel.com/settings/providers/601/payer-mapping
    const payerOptions = {
        hostname: url,
        path: '/settings/providers/' + decoded.prov_id + '/payer-mapping',
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': authorizationToken
        }
    };
    const mappingReq = httpRequest.request(payerOptions, (res) => {
        let chunksOfData = [];
        res.on('data', (chunk) => {
            chunksOfData.push(chunk);
        });
        res.on('end', () => {
            let responseBody = Buffer.concat(chunksOfData);
            responseData = JSON.parse(responseBody.toString());
            console.log(responseData);
            if (res.statusCode == 200 || res.statusCode == 201) {
                if (responseData.response) {
                    let arr = responseData.mappingList;
                    arr.forEach(element => {
                        var option = document.createElement("option");
                        option.value = element.payerId;
                        option.text = `${element.payerName} (${element.mappingName})`;
                        selectList.appendChild(option);
                    });
                }
            } else if (res.statusCode == 401) {
                alert("Invalid Token. Please sign in again.")
                window.location.href = "../login/loginui.html";
            }
        });
    });
    mappingReq.end();
}

exports.getClaimMapping = function (callback) {
    const jwt_decode = require('jwt-decode')
    const httpRequest = require('https');
    var url = environment.selectURL(localStorage.getItem('environment'));
    var token = localStorage.getItem('access_token');
    var decoded = jwt_decode(token);
    var selectClaimList = document.getElementById('selectedClaim').childNodes;
    var authorizationToken = 'Bearer ' + token;
    var claimTypeMap = new Map();
    // EX : https://api.qa-eclaims.waseel.com/settings/providers/601/map-values?withCat=true
    const claimOptions = {
        hostname: url,
        path: '/settings/providers/' + decoded.prov_id + '/map-values?withCat=true',
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': authorizationToken
        }
    };
    const claimReq = httpRequest.request(claimOptions, (res) => {
        let chunksOfData = [];
        res.on('data', (chunk) => {
            chunksOfData.push(chunk);
        });
        res.on('end', () => {
            let responseBody = Buffer.concat(chunksOfData);
            responseData = JSON.parse(responseBody.toString());
            if (res.statusCode == 200 || res.statusCode == 201) {
                if (responseData != null) {
                    let arr = responseData.claimType.codes;
                    for (var i = 0; i < Object.keys(arr).length; i++) {
                        claimTypeMap.set(Object.keys(arr)[i], Object.values(arr)[i].values);
                        selectClaimList.forEach(ele => {
                            if (ele.value == Object.keys(arr)[i]) {
                                var len = Object.values(arr)[i].values.length;
                                ele.innerHTML += ' (' + Object.values(arr)[i].values[len - 1] + ')';
                            }
                        });
                    }
                    console.log(claimTypeMap);
                }
            } else if (res.statusCode == 401) {
                alert("Invalid Token. Please sign in again.")
                window.location.href = "../login/loginui.html";
            }
            callback(claimTypeMap);
        });
    });
    claimReq.end();
}

exports.checkExtractionName = async function (name, callback) {
    var providerId = localStorage.getItem('provider_id');
    var url = environment.selectURL(localStorage.getItem('environment'));
    var urlPath = '/upload/providers/' + providerId + '/check/extraction-name';
    var authorizationToken = 'Bearer ' + localStorage.getItem('access_token');

    const urlData = {
        hostname: url,
        path: urlPath,
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': authorizationToken
        }
    };
    var body = {
        extractionName: name
    }
    const req = await httpRequest.request(urlData, (res) => {
        let chunksOfData = [];
        res.on('data', (chunk) => {
            chunksOfData.push(chunk);
        });
        res.on('end', () => {
            let responseBody = Buffer.concat(chunksOfData);
            if (res.statusCode == 200) {
                responseData = JSON.parse(responseBody.toString());
                console.log(responseData);
                callback(responseData.response, res.statusCode);
            } else {
                callback(null, res.statusCode)
            }
        });
    });
    req.write(JSON.stringify(body));
    req.end();
}