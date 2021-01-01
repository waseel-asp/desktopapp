var stagURL = "api.qa-eclaims.waseel.com";
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
