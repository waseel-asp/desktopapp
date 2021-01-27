const httpRequest = require('https');
const environment = require('../environment.js');
var claimTypeMap = new Map();
var sendpayerId;
$(function() {
    $("#nav-placeholder").load("../home/page.html");
    var jwt_decode = require('jwt-decode')
    var token = localStorage.getItem('access_token');
    var decoded = jwt_decode(token);
    var selectList = document.getElementById('selectedPayer');
    var url = environment.selectURL(localStorage.getItem('environment'));
    var urlPath = '/settings/providers/' + decoded.prov_id + '/payer-mapping';
    var authorizationToken = 'Bearer ' + token;
    // EX : https://api.qa-eclaims.waseel.com/settings/providers/601/payer-mapping
    const payerOptions = {
        hostname: url,
        path: urlPath,
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
    var selectClaimList = document.getElementById('selectedClaim').childNodes;
    var urlPath = '/settings/providers/' + decoded.prov_id + '/map-values?withCat=true';
    // EX : https://api.qa-eclaims.waseel.com/settings/providers/601/map-values?withCat=true
    const claimOptions = {
        hostname: url,
        path: urlPath,
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
        });
    });
    claimReq.end();
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
    checkExtractionName(extractionName, function(response, statusCode) {

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
                            +" from WSL_CLAIM_DIAGNOSIS cd,WSL_GENINFO gen where gen.PROVCLAIMNO=cd.PROVCLAIMNO AND "
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
                                    +" from WSL_CLAIM_ILLNESS cil,WSL_GENINFO gen where gen.PROVCLAIMNO=cil.PROVCLAIMNO AND "
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

function convertToAgePeriod(value, unit) {
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

async function checkExtractionName(name, callback) {
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

async function getDataBaseData(query, callback) {
    await wslConnection.query(query).then(async queryResponse => {
        var test = queryResponse;
        callback(queryResponse);
    })
}
async function MapDataToClaim(genInfoList,callbackGenInfo){
   await generateGenInfo(genInfoList, function(claimMap){
       console.log(claimMap);
       callbackGenInfo(claimMap);
   })
}
function generateGenInfo(genInfoList,callback){
    let claimMap = new Map();
    for (const genInfoData of genInfoList) {
        const discharge = require('../models/Discharge.js');
        const admission = require('../models/Admission.js');
        const caseDescription = require('../models/CaseDescription.js');
        const patient = require('../models/Patient.js');
        const physician = require('../models/Physician.js');
        const caseInformation = require('../models/CaseInformation.js');
        const claimGDPN = require('../models/GDPN.js');
        const claimIdentifier = require('../models/ClaimIdentifier.js');
        const member = require('../models/Member.js');
        const visitInformation = require('../models/visitInformation.js');
        const claim = require('../models/Claim.js');
        const amount = require('../models/Amount.js');

        discharge.setDischargeDate(genInfoData.DISCHARGEDATE);
        discharge.setActualLengthOfStay(convertToAgePeriod(genInfoData.LENGTHOFSTAY, genInfoData.UNITOFSTAY));
        admission.setAdmissionDate(genInfoData.ADMISSIONDATE);
        admission.setAdmissionType(null);
        admission.setBedNumber(genInfoData.BEDNO);
        admission.setRoomNumber(genInfoData.ROOMNO);
        admission.setEstimatedLengthOfStay(null);
        admission.setDischarge(discharge.getDischargeInfo());

        caseDescription.setBloodPressure(genInfoData.BLOODPRESSURE);
        caseDescription.setChiefComplaintSymptoms(genInfoData.MAINSYMPTOM);
        // caseDescription.setDiagnosis(diagnosisList);
        caseDescription.setHeight(null);
        caseDescription.setIllnessCategory(null);
        caseDescription.setIllnessDuration(
            convertToAgePeriod(genInfoData.DURATIONOFILLNESS, genInfoData.UNITOFDURATION));
        caseDescription.setInvestigation(null);
        caseDescription.setLmp(genInfoData.LASTMENSTRUATIONPERIOD);
        caseDescription.setOptics(null);
        caseDescription.setPulse(genInfoData.PULSE);
        caseDescription.setRespRate(genInfoData.RESPIRATORYRATE);
        caseDescription.setSignicantSigns(genInfoData.SIGNIFICANTSIGN);
        caseDescription.setTemperature(genInfoData.TEMPERATURE == null ? 0 : genInfoData.TEMPERATURE);
        caseDescription.setWeight(genInfoData.WEIGH);
        patient.setAge(convertToAgePeriod(genInfoData.MEMBERAGE, genInfoData.UNITAGE));
        patient.setContactNumber(null);
        patient.setDob(genInfoData.MEMBERDOB);
        patient.setFirstName(genInfoData.FIRSTNAME);
        patient.setFullName(genInfoData.FULLNAME);
        patient.setGender(genInfoData.GENDER);
        patient.setLastName(genInfoData.LASTNAME);
        patient.setMiddleName(genInfoData.MIDDLENAME);
        patient.setNationality(genInfoData.NATIONALITY);
        patient.setPatientFileNumber(genInfoData.PATFILENO);
        physician.setPhysicianID(genInfoData.PHYID);
        physician.setPhysicianName(genInfoData.PHYNAME);
        physician.setPhysicianCategory(genInfoData.PHYCATEGORY);
        caseInformation.setCaseType(genInfoData.CLAIMTYPE);
        caseInformation.setOtherConditions(genInfoData.OTHERCOND);
        caseInformation.setRadiologyReport(genInfoData.RADIOREPORT);
        caseInformation.setPossibleLineOfTreatment(null);
        caseInformation.setCaseDescription(caseDescription.getCaseDescriptionInfo());
        caseInformation.setPatient(patient.getPatientInfo());
        caseInformation.setPhysician(physician.getPhysicianInfo());

        claimGDPN.setGDPNData(
            amount.getAmountValue(genInfoData.TOTCLAIMNETAMT, "SAR"),
            amount.getAmountValue(0.0, "SAR"),
            amount.getAmountValue(genInfoData.TOTCLAIMNETVATAMOUNT, "SAR"),
            amount.getAmountValue(genInfoData.TOTCLAIMPATSHARE, "SAR"),
            amount.getAmountValue(0.0, "SAR"),
            amount.getAmountValue(genInfoData.TOTCLAIMPATSHAREVATAMOUNT, "SAR"),
            amount.getAmountValue(genInfoData.TOTCLAIMDISC, "SAR"),
            amount.getAmountValue(genInfoData.TOTCLAIMGRSAMT, "SAR"),
            amount.getAmountValue(0.0, "SAR"),
            amount.getAmountValue(0.0, "SAR"));

        claimIdentifier.setApprovalNumber(genInfoData.APPREFNO);
        claimIdentifier.setEligibilityNumber(genInfoData.ELIGREFNO);
        claimIdentifier.setPayerBatchID(null);
        claimIdentifier.setPayerClaimNumber(null);
        claimIdentifier.setPayerID(sendpayerId);
        claimIdentifier.setPortalTransactionID(null);
        claimIdentifier.setProviderBatchID(null);
        claimIdentifier.setProviderClaimNumber(genInfoData.PROVCLAIMNO);
        claimIdentifier.setProviderParentClaimNumber(null);

        member.setAccCode(genInfoData.ACCCODE);
        member.setIdNumber(genInfoData.NATIONALID);
        member.setMemberID(genInfoData.MEMBERID);
        member.setPlanType(genInfoData.PLANTYPE);
        member.setPolicyNumber(genInfoData.POLICYNO);
        visitInformation.setdepartmentCode(genInfoData.DEPTCODE);
        visitInformation.setVisitDate(genInfoData.CLAIMDATE);
        visitInformation.setVisitType(genInfoData.VISITTYPE);

        claim.setCommreport(genInfoData.COMMREPORT);
        claim.setAdmission(admission.getAdmissionInfo());
        claim.setAttachment(new Array());
        claim.setCaseInformation(caseInformation.getCaseInformation());
        claim.setClaimGDPN(claimGDPN.getGDPNInfo());
        claim.setClaimIdentities(claimIdentifier.getClaimIdentifierInfo());
        // claim.setInvoice(invoiceList);
        claim.setMember(member.getMemberInfo());
        claim.setVisitInformation(visitInformation.getVisitInfo());
        // claimList.push(claim.getClaimInfo());
        claimMap.set(genInfoData.PROVCLAIMNO,claim.getClaimInfo());
    }
    callback(claimMap);
}

async function MapDiagnosisData(claimMap,diagnosisList,callbackDiagnosis){
    await updateDiagnosisData(claimMap,diagnosisList,function(claimMap){
        callbackDiagnosis(claimMap);
    })
}
function updateDiagnosisData(claimMap,diagnosisList,callback){
    let diagnosisMap = new Map();
    Array.from(claimMap.keys()).map(key => {
        var tempData = diagnosisList.filter(diagnosis => diagnosis.PROVCLAIMNO == key);
        diagnosisMap.set(key,tempData);
      });
      
      Array.from(diagnosisMap.keys()).map(key => {
        var diagnosisData = diagnosisMap.get(key);
        var diagnosisList = [];
        for(var x=0;x<diagnosisData.length;x++){
        const diagnosis = require('../models/Diagnosis.js');
        diagnosis.setDiagnosisCode(diagnosisData[x].DIAGNOSISCODE);
        diagnosis.setDiagnosisDescription(diagnosisData[x].DIAGNOSISDESC);
        diagnosis.setDiagnosisNumber(null);
        diagnosis.setDiagnosisType(null);
        diagnosisList.push(diagnosis.getDiagnosisInfo());
        }
        claimMap.get(key).caseInformation.caseDescription.diagnosis=diagnosisList;
      });
      callback(claimMap);
}
async function MapInvoiceData(claimMap,invoiceList,callbackInvoice){
    await updateInvoiceData(claimMap,invoiceList,function(claimMap){
        callbackInvoice(claimMap);
    })
}
function updateInvoiceData(claimMap,invoiceList,callback){
    let invoiceMap = new Map();
    
    Array.from(claimMap.keys()).map(key => {
        var temp = invoiceList.filter(invoice => invoice.PROVCLAIMNO == key);
        invoiceMap.set(key,temp);
      });
      Array.from(invoiceMap.keys()).map(key => {
        var invoiceData = invoiceMap.get(key);
        var invoiceList = [];
        for(var j=0;j<invoiceData.length;j++){
        //invoicelist check current element else fetch
        var tempInvoice = [];
        if (invoiceList.length > 0) {
            tempInvoice = invoiceList.filter(invoice => 
                invoice.invoiceNumber == invoiceData[j].INVOICEID);
        }
        
        const amount = require('../models/Amount.js');
        const invoice = require('../models/Invoice.js');
        const invoiceGDPN = require('../models/GDPN.js');
        const service = require('../models/Service.js');
        const serviceGDPN = require('../models/GDPN.js');
        const serviceamount = require('../models/Amount.js');
        if(tempInvoice.length == 0){
            invoice.setInvoiceNumber(invoiceData[j].INVOICEID);
            invoice.setInvoiceDate(invoiceData[j].INVOICEDATE);
            invoice.setInvoiceDepartment(invoiceData[j].INVOICEDEPT);
            invoiceGDPN.setGDPNData(
                amount.getAmountValue(invoiceData[j].TOTINVNETAMT, "SAR"),
                amount.getAmountValue(0.0, "SAR"),
                amount.getAmountValue(invoiceData[j].TOTINVNETVATAMOUNT, "SAR"),
                amount.getAmountValue(invoiceData[j].TOTINVPATSHARE, "SAR"),
                amount.getAmountValue(0.0, "SAR"),
                amount.getAmountValue(invoiceData[j].TOTINVPATSHAREVATAMOUNT, "SAR"),
                amount.getAmountValue(invoiceData[j].TOTINVDISC, "SAR"),
                amount.getAmountValue(invoiceData[j].TOTINVGRSAMT, "SAR"),
                amount.getAmountValue(0.0, "SAR"),
                amount.getAmountValue(0.0, "SAR"));
            invoice.setInvoiceGDPN(invoiceGDPN.getGDPNInfo());
            var serviceList = [];
            service.setDrugUse(null);
            service.setRequestedQuantity(invoiceData[j].QTY);
            service.setServiceCode(invoiceData[j].SERVICECODE);
            service.setServiceComment(null);
            service.setServiceDate(invoiceData[j].SERVICEDATE);
            service.setServiceDescription(invoiceData[j].SERVICEDESC);
            service.setServiceNumber(null);
            service.setServiceType(invoiceData[j].UNITSERVICETYPE);
            service.setToothNumber(invoiceData[j].TOOTHNO);
            service.setUnitPrice(amount.getAmountValue(invoiceData[j].UNITSERVICEPRICE, "SAR"));
            serviceGDPN.setGDPNData(
                amount.getAmountValue(invoiceData[j].TOTSERVICENETAMT, "SAR"),
                amount.getAmountValue(invoiceData[j].TOTSERVICENETVATRATE, "SAR"),
                amount.getAmountValue(invoiceData[j].TOTSERVICENETVATAMOUNT, "SAR"),
                amount.getAmountValue(invoiceData[j].TOTSERVICEPATSHARE, "SAR"),
                amount.getAmountValue(invoiceData[j].TOTSERVICEPATSHAREVATRATE, "SAR"),
                amount.getAmountValue(invoiceData[j].TOTSERVICEPATSHAREVATAMOUNT, "SAR"),
                amount.getAmountValue(invoiceData[j].TOTSERVICEDISC, "SAR"),
                amount.getAmountValue(invoiceData[j].TOTSERVICEGRSAMT, "SAR"),
                amount.getAmountValue(0.0, "SAR"),
                amount.getAmountValue(0.0, "SAR"));
            service.setServiceGDPN(serviceGDPN.getGDPNInfo());
            serviceList.push(service.getServiceInfo());
            invoice.setService(serviceList);
            invoiceList.push(invoice.getInvoiceInfo());
        }
        else{
            var tempServiceList = tempInvoice[0].service;
            service.setDrugUse(null);
            service.setRequestedQuantity(invoiceData[j].QTY);
            service.setServiceCode(invoiceData[j].SERVICECODE);
            service.setServiceComment(null);
            service.setServiceDate(invoiceData[j].SERVICEDATE);
            service.setServiceDescription(invoiceData[j].SERVICEDESC);
            service.setServiceNumber(null);
            service.setServiceType(invoiceData[j].UNITSERVICETYPE);
            service.setToothNumber(invoiceData[j].TOOTHNO);
            service.setUnitPrice(amount.getAmountValue(invoiceData[j].UNITSERVICEPRICE, "SAR"));
            serviceGDPN.setGDPNData(
                amount.getAmountValue(invoiceData[j].TOTSERVICENETAMT, "SAR"),
                amount.getAmountValue(invoiceData[j].TOTSERVICENETVATRATE, "SAR"),
                amount.getAmountValue(invoiceData[j].TOTSERVICENETVATAMOUNT, "SAR"),
                amount.getAmountValue(invoiceData[j].TOTSERVICEPATSHARE, "SAR"),
                amount.getAmountValue(invoiceData[j].TOTSERVICEPATSHAREVATRATE, "SAR"),
                amount.getAmountValue(invoiceData[j].TOTSERVICEPATSHAREVATAMOUNT, "SAR"),
                amount.getAmountValue(invoiceData[j].TOTSERVICEDISC, "SAR"),
                amount.getAmountValue(invoiceData[j].TOTSERVICEGRSAMT, "SAR"),
                amount.getAmountValue(0.0, "SAR"),
                amount.getAmountValue(0.0, "SAR"));
            service.setServiceGDPN(serviceGDPN.getGDPNInfo());
            tempServiceList.push(service.getServiceInfo());
            tempInvoice[0].service = tempServiceList;
        }

        }
        claimMap.get(key).invoice=invoiceList;
      });
      callback(claimMap);
}

async function MapLabResultData(claimMap,labResultList,callbackLabResult){
    await updateLabResultData(claimMap,labResultList,function(claimMap){
        callbackLabResult(claimMap);
    })
}
function updateLabResultData(claimMap,labResultList,callback){
    let labResultMap = new Map();
    
    Array.from(claimMap.keys()).map(key => {
        var temp = labResultList.filter(labResult => labResult.PROVIDERCLAIMNUMBER == key);
        labResultMap.set(key,temp);
    });
    Array.from(labResultMap.keys()).map(key => {
        var labResultData = labResultMap.get(key);
        var investigationList = [];
        for(var j=0;j<labResultData.length;j++){
            //labResultList check current element else fetch
            var tempInvestigation = [];
            if (investigationList.length > 0) {
                tempInvestigation = investigationList.filter(investigation => 
                    investigation.investigationCode == labResultData[j].LABORATORYTESTCODE &&
                    investigation.investigationType == labResultData[j].SERIALNO
                );
            }
            const investigation = require('../models/Investigation.js');
            const observation = require('../models/Observation.js');

            if(tempInvestigation.length == 0){
                investigation.setInvestigationCode(labResultData[j].LABORATORYTESTCODE);
                investigation.setInvestigationDate(labResultData[j].LABTESTDATE);
                investigation.setInvestigationDescription(labResultData[j].LABDESC);
                investigation.setInvestigationType(labResultData[j].SERIALNO);
                investigation.setInvestigationComments(null);
                var observationList = [];
                observation.setObservationCode(labResultData[j].LABCOMPCODE);
                observation.setObservationDescription(labResultData[j].LABCOMPDESC);
                observation.setObservationValue(labResultData[j].LABRESULT);
                observation.setObservationUnit(labResultData[j].LABRESULTUNIT);
                observation.setObservationComment(labResultData[j].LABRESULTCOMMENT);
                observationList.push(observation.getObservationInfo());
                investigation.setObservation(observationList);
                investigationList.push(investigation.getInvestigationInfo());
            }
            else{
                var tempObservationList = tempInvestigation[0].observation;
                observation.setObservationCode(labResultData[j].LABCOMPCODE);
                observation.setObservationDescription(labResultData[j].LABCOMPDESC);
                observation.setObservationValue(labResultData[j].LABRESULT);
                observation.setObservationUnit(labResultData[j].LABRESULTUNIT);
                observation.setObservationComment(labResultData[j].LABRESULTCOMMENT);
                tempObservationList.push(observation.getObservationInfo());
                tempInvestigation[0].observation = tempObservationList;
            }
        }
        claimMap.get(key).caseInformation.caseDescription.investigation=investigationList;
    });
    callback(claimMap);
}
async function MapIllnessData(claimMap,illnessList,callbackIllnessResult){
    await updateIllnessResultData(claimMap,illnessList,function(claimMap){
        callbackIllnessResult(claimMap);
    })
}
function updateIllnessResultData(claimMap,illnessList,callback){
    let illnessMap = new Map();
    Array.from(claimMap.keys()).map(key => {
        var tempData = illnessList.filter(illness => illness.PROVCLAIMNO == key);
        illnessMap.set(key,tempData);
        });
    Array.from(illnessMap.keys()).map(key => {
        var illnessData = illnessMap.get(key);
        var illnessList = [];
        for(var x=0;x<illnessData.length;x++){
            illnessList.push(illnessData[x].ILLNESSTYPE);
        }
        claimMap.get(key).caseInformation.caseDescription.IllnessCategory=illnessList;
    });
        callback(claimMap);
}
