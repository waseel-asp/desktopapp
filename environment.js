var stagURL = "";
var prodURL = "";
var qaURL = "api.qa-eclaims.waseel.com";
var serviceURL = "";

function selectURL(urlOption){
    if(urlOption == "STAG"){
        serviceURL = stagURL;
    }else if(urlOption == "PROD"){
        serviceURL = prodURL;
    }else{
        serviceURL = qaURL;
    }
    return serviceURL;
}
