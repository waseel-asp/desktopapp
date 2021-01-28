const httpRequest = require('https');
const environment = require('../environment.js');
const shareFunction = require('./SharedFunction.js');
var claimTypeMap = new Map();
var sendpayerId;
$(function() {
    $("#nav-placeholder").load("../home/page.html");
    shareFunction.getPayerMapping();
    shareFunction.getClaimMapping(function(callback) { claimTypeMap = callback });
    openConnection();
});

function refresh() {
    location.reload();
}

const wslConnection = require('../dbConnection/wslConnection.js')
const sendClaim = require('./sendClaim.js');

let database_type;

function openConnection() {
    //add logic to check the database data exist in database.
    wslConnection.fetchDatabase(function(isConnectionAvailable, dbParams, message) {
        console.log("dddd", dbParams);
        if (!isConnectionAvailable) {
            if (window.confirm("You have not added database configuration yet. Do you want to add new one?")) {
                window.location.href = "../dbconfiguration/dbconfigui.html";
            }
        } else {
            database_type = dbParams.db_type;

            wslConnection.checkConnection(dbParams).then(data => {
                console.log("Connection succesful.")
            }, err => {
                console.log(err.message);
                window.location.href = "../dbconfiguration/dbconfigui.html";
            });
        }
    });
}

function connect() {
    environment.refreshCurrentToken();
    var startDate = document.getElementById('startDate').value;
    var endDate = document.getElementById('endDate').value;
    if (startDate == "Start Date") {
        var startDateInput = document.getElementById('startDate');
        startDateInput.focus();
        startDateInput.setCustomValidity('Please provide a start date');
        startDateInput.reportValidity();
        return false;
    }
    if (endDate == "End Date") {
        var endDateInput = document.getElementById('endDate');
        endDateInput.focus();
        endDateInput.setCustomValidity('Please provide an end date');
        endDateInput.reportValidity();
        return false;
    }
    console.log("test connect");
    var selectedPayer = document.getElementById('selectedPayer').value;
    var selectedClaim = document.getElementById('selectedClaim').value;
    startDate = startDate + ' 00:00';
    endDate = endDate + ' 23:59';
    var payerEle = document.getElementById("selectedPayer");
    var selectedText = payerEle.options[payerEle.selectedIndex].text;
    selectedPayer = selectedText.match(/\(([^)]+)\)/)[1];
    sendpayerId = document.getElementById('selectedPayer').value;
    document.getElementById("extract-button").disabled = true;
    document.getElementById("extraction-refresh-button").disabled = true;
    document.getElementById("summary-container").style.display = "none";
    document.getElementById("summary-error").style.display = "none";
    document.getElementById("name-errors").innerHTML = "";
    var progressStatus = document.getElementById("claim-progress-status");
    var progressBar = document.getElementById("progress-bar");
    document.getElementById("claim-progress-bar").style.display = "block";
    progressBar.style.width = "25%";
    progressStatus.innerHTML = "Extracting ...";

    if (new Date(startDate) > new Date(endDate)) {
        alert("Please ensure that the End Date is greater than or equal to the Start Date.");
        document.getElementById("claim-progress-bar").style.display = "none";
        progressBar.style.width = "0%";
        document.getElementById("extract-button").disabled = false;
        document.getElementById("extraction-refresh-button").disabled = false;
        return false;
    }
    //check extraction name already present or not
    var extractionName = document.getElementById('extractionName').value;
    shareFunction.checkExtractionName(extractionName, function(response, statusCode) {

        if (response && statusCode == 200) {
            document.getElementById("error-extraction-block").style.display = "flex";
            document.getElementById("name-errors").innerHTML += "<p>" + "Extraction name already exists. Please enter a different extraction name." + "</p>"
            $("#error-extraction-block").fadeOut(10000);
            document.getElementById("claim-progress-bar").style.display = "none";
            progressBar.style.width = "0%";
            document.getElementById("extract-button").disabled = false;
            document.getElementById("extraction-refresh-button").disabled = false;
            return false;
        } else if (statusCode == 401) {
            alert("Invalid Token. Please sign in again.")
            window.location.href = "../login/loginui.html";
        } else if (statusCode <= 500 && statusCode >= 400) {
            document.getElementById("error-extraction-block").style.display = "flex";
            document.getElementById("name-errors").innerHTML += "<p>" + "There is internal server technical issue." + "</p>"
            $("#error-extraction-block").fadeOut(10000);
            document.getElementById("claim-progress-bar").style.display = "none";
            progressBar.style.width = "0%";
            document.getElementById("extract-button").disabled = false;
            document.getElementById("extraction-refresh-button").disabled = false;
            return false;
        } else {
            wslConnection.connect().then(data => {
                var query = "";
                var database = database_type;
                var claimType = "' '";
                if (selectedClaim.toLowerCase() != 'all') {
                    claimTypeMap.get(selectedClaim).forEach(element => {
                        if (element == claimTypeMap.get(selectedClaim)[0])
                            claimType = "'" + element + "'";
                        else
                            claimType += ", '" + element + "'";
                    });
                } else {
                    var temp = document.getElementById('selectedClaim').childNodes;
                    var zero = 0;
                    temp.forEach(element => {
                        if (element.value != undefined && element.value != '') {
                            if (claimTypeMap.get(element.value) != undefined) {
                                claimTypeMap.get(element.value).forEach(ele => {
                                    if (zero == 0 && ele == claimTypeMap.get(element.value)[0]) {
                                        zero = 1;
                                        claimType = "'" + ele + "'";
                                    } else
                                        claimType += ", '" + ele + "'";
                                });
                            }
                        }
                    });
                }
                var providerMappingCode = localStorage.getItem('provider_mapping_code');
                if (database.toLowerCase() == "oracle") {
                    query = "select * from WSL_GENINFO where PROVIDERID='" + providerMappingCode + "' AND CLAIMTYPE IN(" + claimType + ") AND PAYERID='" + selectedPayer + "' AND CLAIMDATE BETWEEN TO_DATE('" + startDate + "','yyyy-mm-dd HH24:MI') AND TO_DATE('" + endDate + "','yyyy-mm-dd HH24:MI') ";
                } else {
                    query = "select * from WSL_GENINFO where PROVIDERID='" + providerMappingCode + "' AND CLAIMTYPE IN(" + claimType + ") AND PAYERID='" + selectedPayer + "' AND CLAIMDATE BETWEEN '" + startDate + "' AND '" + endDate + "' ";
                }
                console.log(query);
                getDataBaseData(query, function(data){
                    var genInfoList = data;
                    var invoiceQuery = "select inv.*,sd.*,inv.INVOICENO AS INVOICEID from WSL_INVOICES inv, WSL_SERVICE_DETAILS sd ,WSL_GENINFO gen where "
                    + "inv.INVOICENO=sd.INVOICENO and inv.PROVCLAIMNO=gen.PROVCLAIMNO and"
                    + " gen.PROVIDERID='" + providerMappingCode + "' AND gen.CLAIMTYPE IN(" + claimType + ") AND gen.PAYERID='" + selectedPayer + "'";
                    if (database.toLowerCase() == "oracle") {
                        invoiceQuery = invoiceQuery + "AND gen.CLAIMDATE BETWEEN TO_DATE('" + startDate + "','yyyy-mm-dd HH24:MI') AND TO_DATE('" + endDate + "','yyyy-mm-dd HH24:MI')";
                    }else{
                        invoiceQuery = invoiceQuery + "AND gen.CLAIMDATE BETWEEN '" + startDate + "' AND '" + endDate + "'";
                    }
                    
                    getDataBaseData(invoiceQuery, function(data){
                        var invoiceList = data;
                        var diagnosisQuery = "";
                        if(database.toLowerCase() == "mysql"){
                            diagnosisQuery = "select cd.provclaimno AS PROVCLAIMNO,cd.diagnosiscode AS DIAGNOSISCODE,cd.diagnosisdesc AS DIAGNOSISDESC"
                            +" from WSL_CLAIM_DIAGNOSIS cd,WSL_GENINFO gen where gen.PROVCLAIMNO=cd.provclaimno AND "
                            +"gen.PROVIDERID='" + providerMappingCode + "' AND gen.CLAIMTYPE IN(" + claimType + ") AND gen.PAYERID='" + selectedPayer + "'";
                        }else{
                            diagnosisQuery = "select cd.* from WSL_CLAIM_DIAGNOSIS cd,WSL_GENINFO gen where gen.PROVCLAIMNO=cd.PROVCLAIMNO AND "
                            +"gen.PROVIDERID='" + providerMappingCode + "' AND gen.CLAIMTYPE IN(" + claimType + ") AND gen.PAYERID='" + selectedPayer + "'";
                        }
                        if(database.toLowerCase() == "oracle"){
                            diagnosisQuery = diagnosisQuery + "AND gen.CLAIMDATE BETWEEN TO_DATE('" + startDate + "','yyyy-mm-dd HH24:MI') AND TO_DATE('" + endDate + "','yyyy-mm-dd HH24:MI')";
                        }else{
                            diagnosisQuery = diagnosisQuery + "AND gen.CLAIMDATE BETWEEN '" + startDate + "' AND '" + endDate + "'";
                        }
                        getDataBaseData(diagnosisQuery, function(diagnosisRes){
                            var diagnosisList = diagnosisRes;
                            var labResultQuery = "SELECT lr.*, lc.*, lr.PROVCLAIMNO as PROVIDERCLAIMNUMBER, lr.SERIAL as SERIALNO, lr.LABTESTCODE as LABORATORYTESTCODE FROM WSL_LAB_RESULT lr, WSL_LAB_COMPONENT lc, WSL_GENINFO gen WHERE "
                            +"gen.PROVCLAIMNO=lr.PROVCLAIMNO AND lr.PROVCLAIMNO=lc.PROVCLAIMNO AND lr.SERIAL = lc.SERIAL AND lr.LABTESTCODE = lc.LABTESTCODE AND "
                            +"gen.PROVIDERID='" + providerMappingCode + "' AND gen.CLAIMTYPE IN(" + claimType + ") AND gen.PAYERID='" + selectedPayer + "'";
                            if(database.toLowerCase() == "oracle"){
                                labResultQuery = labResultQuery + "AND gen.CLAIMDATE BETWEEN TO_DATE('" + startDate + "','yyyy-mm-dd HH24:MI') AND TO_DATE('" + endDate + "','yyyy-mm-dd HH24:MI')";
                            }else{
                                labResultQuery = labResultQuery + "AND gen.CLAIMDATE BETWEEN '" + startDate + "' AND '" + endDate + "'";
                            }
                            getDataBaseData(labResultQuery, function(labResultRes){
                                var labResultList = labResultRes;
                                var illnessQuery = "";
                                if(database.toLowerCase() == "mysql"){
                                    illnessQuery = "select cil.provclaimno AS PROVCLAIMNO, cil.illnesstype AS ILLNESSTYPE"
                                    +" from WSL_CLAIM_ILLNESS cil,WSL_GENINFO gen where gen.PROVCLAIMNO=cil.provclaimno AND "
                                    +"gen.PROVIDERID='" + providerMappingCode + "' AND gen.CLAIMTYPE IN(" + claimType + ") AND gen.PAYERID='" + selectedPayer + "'";
                                }else{
                                    illnessQuery = "select cil.* from WSL_CLAIM_ILLNESS cil,WSL_GENINFO gen where gen.PROVCLAIMNO=cil.PROVCLAIMNO AND "
                                    +"gen.PROVIDERID='" + providerMappingCode + "' AND gen.CLAIMTYPE IN(" + claimType + ") AND gen.PAYERID='" + selectedPayer + "'";
                                }
                                if(database.toLowerCase() == "oracle"){
                                    illnessQuery = illnessQuery + "AND gen.CLAIMDATE BETWEEN TO_DATE('" + startDate + "','yyyy-mm-dd HH24:MI') AND TO_DATE('" + endDate + "','yyyy-mm-dd HH24:MI')";
                                }else{
                                    illnessQuery = illnessQuery + "AND gen.CLAIMDATE BETWEEN '" + startDate + "' AND '" + endDate + "'";
                                }
                                getDataBaseData(illnessQuery, function(illnessRes){
                                    var illnessList = illnessRes;
                                    progressBar.style.width = "50%";
                                    progressStatus.innerHTML = "Mapping ..."
                                    MapDataToClaim(genInfoList,function(claimMap){
                                        MapDiagnosisData(claimMap,diagnosisList,function(responseClaimMap){
                                            console.log("after diagnosis map");
                                            MapLabResultData(responseClaimMap,labResultList, function(responseClaimMap){
                                                console.log("after investigation map");
                                                MapIllnessData(responseClaimMap,illnessList, function(responseClaimMap){
                                                    console.log("after illness data map");
                                                    MapInvoiceData(responseClaimMap,invoiceList,function(updatedClaimMap){
                                                        console.log("after invoice map");
                                                        //latest list call 
                                                        var claimList = [];
                                                        Array.from(updatedClaimMap.keys()).map(key => {
                                                            claimList.push(updatedClaimMap.get(key));
                                                        });
                                                        console.log("after convert",claimList);
                                                        
                                                        if (claimList.length > 0) {
                                                            var claimBody = {
                                                                extractionName: extractionName,
                                                                claimList: claimList
                                                            };
                                                            sendClaim.sendClaim(claimBody);
                                                        } else {
                                                            document.getElementById("claim-progress-bar").style.display = "none";
                                                            progressBar.style.width = "0%";
                                                            document.getElementById('summary-error').style.display = 'block';
                                                            document.getElementById('summary-error').innerHTML =
                                                                "<pre>There is no data in selected criteria.\nPlease select different criteria.</pre>";
                                                            document.getElementById("extract-button").disabled = false;
                                                            document.getElementById("extraction-refresh-button").disabled = false;
                                                        }
                                                    })
                                                })
                                            });
                                        })
                                    })
                                })
                            });
                        });
                    })
                })
            }, err => {
                alert(err.message);
                document.getElementById("claim-progress-bar").style.display = "none";
                progressBar.style.width = "0%";
                document.getElementById("extract-button").disabled = false;
                document.getElementById("extraction-refresh-button").disabled = false;
            });
        }
    })
}

async function getDataBaseData(query, callback) {
    await wslConnection.query(query).then(async queryResponse => {
        callback(queryResponse);
    })
}
async function MapDataToClaim(genInfoList,callbackGenInfo){
    const mapGenInfo = require('./MappingGenInfo.js');
    await mapGenInfo.generateGenInfo(genInfoList, function(claimMap){
        console.log(claimMap);
        callbackGenInfo(claimMap);
    })
}

async function MapDiagnosisData(claimMap,diagnosisList,callbackDiagnosis){
    const mapDiagnosis = require('./MappingDiagnosis.js');
    await mapDiagnosis.updateDiagnosisData(claimMap,diagnosisList,function(claimMap){
        callbackDiagnosis(claimMap);
    })
}

async function MapInvoiceData(claimMap,invoiceList,callbackInvoice){
    const mapInvoice = require('./MappingInvoice.js');
    await mapInvoice.updateInvoiceData(claimMap,invoiceList,function(claimMap){
        callbackInvoice(claimMap);
    })
}

async function MapLabResultData(claimMap,labResultList,callbackLabResult){
    const mapLabResult = require('./MappingInvestigation.js');
    await mapLabResult.updateLabResultData(claimMap,labResultList,function(claimMap){
        callbackLabResult(claimMap);
    })
}

async function MapIllnessData(claimMap,illnessList,callbackIllnessResult){
    const mapIllness = require('./MappingIllness.js');
    await mapIllness.updateIllnessResultData(claimMap,illnessList,function(claimMap){
        callbackIllnessResult(claimMap);
    })
}