$(function () {
    $("#nav-placeholder").load("../home/page.html");
    var jwt_decode = require('jwt-decode')
    var token = localStorage.getItem('access_token');
    var decoded = jwt_decode(token);
    let decodepayers = decoded.payers;
    let payers = [];
    for (let payerid in decodepayers) {
        payers.push({ id: `${payerid}`, name: `${decodepayers[payerid]}` })
    }
    var selectList = document.getElementById('selectedPayer');
    for (var i = 0; i < payers.length; i++) {
        var option = document.createElement("option");
        option.value = payers[i].id;
        option.text = payers[i].name.split(',')[0];
        selectList.appendChild(option);
    }
    openConnection();
});
const wslConnection = require('../dbConnection/wslConnection.js')
const sendClaim = require('./sendClaim.js');
const sqlLiteConnection = require('../dbConnection/sqlLiteConnection.js')
sqlLiteConnection.initSqllite();
let database_type;
function openConnection() {
    //add logic to check the database data exist in database.
    wslConnection.fetchDatabase(function (dbParams) {
        console.log("dddd", dbParams);
        if (dbParams == null) {
            if (window.confirm("You have not added database configuration yet. Do you want to add new one?")) {
                window.location.href = "../dbconfiguration/dbconfigui.html";
            }
        } else {
            database_type = dbParams.db_type;

            wslConnection.checkConnection(dbParams).then(data => {
                console.log("Connection succesful.")

            }, err => {
                console.log(err.message);
            });
        }
    });
}

function connect() {
    console.log("test connect");
    document.getElementById("summary-container").style.display = "none";
    document.getElementById("summary-error").style.display = "none";
    var startDate = document.getElementById('startDate').value;
    var endDate = document.getElementById('endDate').value;
    var selectedPayer = document.getElementById('selectedPayer').value;
    var selectedClaim = document.getElementById('selectedClaim').value;

    if (new Date(startDate) > new Date(endDate)) {
        alert("Please ensure that the End Date is greater than or equal to the Start Date.");
        return false;
    }
    var provider_id = localStorage.getItem('provider_id');
    // var prov_code = decoded.prov_code;
    var payer, claimName;
    let payerSql = `SELECT * FROM payer_mapping WHERE provider_id = ? AND payer_id = ?`;
    sqlLiteConnection.getDb().all(payerSql, [provider_id, selectedPayer], (err, rows) => {
        if (rows.length == 1) {
            payer = rows[0].mapping_value;
        }
    });
    let claimSql = `SELECT * FROM claim_mapping WHERE provider_id = ? AND claim_name = ?`;
    sqlLiteConnection.getDb().all(claimSql, [provider_id, selectedClaim], (err, rows) => {
        if (rows.length == 1) {
            claimName = rows[0].mapping_value;
        }
    });
    wslConnection.connect().then(data => {
        var query = "";
        var database = database_type;
        var provider_code = localStorage.getItem('provider_code');
        if (database.toLowerCase() == "oracle") {
            query = "select * from WSL_GENINFO where PROVIDERID='" + provider_code + "' AND CLAIMTYPE='" + claimName + "' AND PAYERID='" + payer + "' AND CLAIMDATE BETWEEN TO_DATE('" + startDate + "','yyyy-mm-dd') AND TO_DATE('" + endDate + "','yyyy-mm-dd') ";
        } else {
            query = "select * from WSL_GENINFO where PROVIDERID='" + provider_code + "' AND CLAIMTYPE='" + claimName + "' AND PAYERID='" + payer + "' AND CLAIMDATE BETWEEN '" + startDate + "' AND '" + endDate + "' ";
        }
        console.log(query);
        setClaims(query, function (claimList) {
            console.log(claimList);
            console.log('sendClaim(claimList)');
            // sendClaim.sendClaim(claimList);
            if (claimList.length > 0)
                sendClaim.sendClaim(claimList);
            else {
                document.getElementById('summary-error').style.display = 'block';
                document.getElementById('summary-error').innerHTML =
                    "<pre>There is no data in selected criteria.\nPlease select different criteria.</pre>";
            }
        });
    }, err => {
        alert(err.message);
    });
}

async function setClaims(query, callback) {
    await wslConnection.query(query).then(async genInfoDatas => {
        var claimList = [];
        for (const genInfoData of genInfoDatas) {
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
            const diagnosis = require('../models/Diagnosis.js');

            discharge.setDischargeDate(genInfoData.DISCHARGEDATE);
            discharge.setActualLengthOfStay(convertToAgePeriod(genInfoData.LENGTHOFSTAY, genInfoData.UNITOFSTAY));
            admission.setAdmissionDate(genInfoData.ADMISSIONDATE);
            admission.setAdmissionType(null);
            admission.setBedNumber(genInfoData.BEDNO);
            admission.setRoomNumber(genInfoData.ROOMNO);
            admission.setEstimatedLengthOfStay(null);
            admission.setDischarge(discharge.getDischargeInfo());

            var diagnosisList = [];
            await wslConnection.query("select * from WSL_CLAIM_DIAGNOSIS where PROVCLAIMNO='" + genInfoData.PROVCLAIMNO + "'").then(diagnosisData => {
                for (var x = 0; x < diagnosisData.length; x++) {
                    diagnosis.setDiagnosisCode(diagnosisData[x].DIAGNOSISCODE);
                    diagnosis.setDiagnosisDescription(diagnosisData[x].DIAGNOSISDESC);
                    diagnosis.setDiagnosisNumber(null);
                    diagnosis.setDiagnosisType(null);
                    diagnosisList.push(diagnosis.getDiagnosisInfo());
                }
            });
            caseDescription.setBloodPressure(genInfoData.BLOODPRESSURE);
            caseDescription.setChiefComplaintSymptoms(genInfoData.MAINSYMPTOM);
            caseDescription.setDiagnosis(diagnosisList);
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
            claimIdentifier.setPayerID(genInfoData.PAYERID);
            claimIdentifier.setPortalTransactionID(null);
            claimIdentifier.setProviderBatchID(null);
            claimIdentifier.setProviderClaimNumber(genInfoData.PROVCLAIMNO);
            claimIdentifier.setProviderParentClaimNumber(null);

            member.setAccCode(genInfoData.ACCCODE);
            member.setIdNumber(null);
            member.setMemberID(genInfoData.MEMBERID);
            member.setPlanType(genInfoData.PLANTYPE);
            member.setPolicyNumber(genInfoData.POLICYNO);
            visitInformation.setdepartmentCode(genInfoData.DEPTCODE);
            visitInformation.setVisitDate(genInfoData.CLAIMDATE);
            visitInformation.setVisitType(genInfoData.VISITTYPE);

            claim.setCommreport(genInfoData.COMMREPORT);
            await setInvoiceData(genInfoData.PROVCLAIMNO, function (invoiceList) {
                claim.setAdmission(admission.getAdmissionInfo());
                claim.setAttachment(new Array());
                claim.setCaseInformation(caseInformation.getCaseInformation());
                claim.setClaimGDPN(claimGDPN.getGDPNInfo());
                claim.setClaimIdentities(claimIdentifier.getClaimIdentifierInfo());
                claim.setInvoice(invoiceList);
                claim.setMember(member.getMemberInfo());
                claim.setVisitInformation(visitInformation.getVisitInfo());
                claimList.push(claim.getClaimInfo());
            });
        }
        callback(claimList);
    }, err => {
        document.getElementById('summary-error').style.display = 'block';
        document.getElementById('summary-error').innerHTML = err;
        console.log(err);
    });
}

async function setInvoiceData(data, callback) { // genInfoData[i].PROVCLAIMNO
    try {
        await wslConnection.query("select * from WSL_INVOICES where PROVCLAIMNO='" + data + "'").then(async invoiceData => {
            var invoiceList = [];
            for (var j = 0; j < invoiceData.length; j++) {
                const amount = require('../models/Amount.js');
                const invoice = require('../models/Invoice.js');
                const invoiceGDPN = require('../models/GDPN.js');
                invoice.setInvoiceNumber(invoiceData[j].INVOICENO);
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

                await setServiceData(invoiceData[j].INVOICENO, function (serviceList) {
                    invoice.setService(serviceList);
                    invoiceList.push(invoice.getInvoiceInfo());
                });
            }
            callback(invoiceList);
        });
    } catch (error) {
        console.error(error);
    }
}

async function setServiceData(data, callback) { // invoiceData[j].INVOICENO
    try {
        await wslConnection.query("select * from WSL_SERVICE_DETAILS where INVOICENO='" + data + "'")
            .then(async serviceData => {
                var serviceList = [];
                for (var k = 0; k < serviceData.length; k++) {
                    const amount = require('../models/Amount.js');
                    const service = require('../models/Service.js');
                    const serviceGDPN = require('../models/GDPN.js');
                    service.setDrugUse(null);
                    service.setRequestedQuantity(serviceData[k].QTY);
                    service.setServiceCode(serviceData[k].SERVICECODE);
                    service.setServiceComment(null);
                    service.setServiceDate(serviceData[k].SERVICEDATE);
                    service.setServiceDescription(serviceData[k].SERVICEDESC);
                    service.setServiceNumber(null);
                    service.setServiceType(serviceData[k].UNITSERVICETYPE);
                    service.setToothNumber(serviceData[k].TOOTHNO);
                    service.setUnitPrice(amount.getAmountValue(serviceData[k].UNITSERVICEPRICE, "SAR"));
                    serviceGDPN.setGDPNData(
                        amount.getAmountValue(serviceData[k].TOTSERVICENETAMT, "SAR"),
                        amount.getAmountValue(serviceData[k].TOTSERVICENETVATRATE, "SAR"),
                        amount.getAmountValue(serviceData[k].TOTSERVICENETVATAMOUNT, "SAR"),
                        amount.getAmountValue(serviceData[k].TOTSERVICEPATSHARE, "SAR"),
                        amount.getAmountValue(serviceData[k].TOTSERVICEPATSHAREVATRATE, "SAR"),
                        amount.getAmountValue(serviceData[k].TOTSERVICEPATSHAREVATAMOUNT, "SAR"),
                        amount.getAmountValue(serviceData[k].TOTSERVICEDISC, "SAR"),
                        amount.getAmountValue(serviceData[k].TOTSERVICEGRSAMT, "SAR"),
                        amount.getAmountValue(0.0, "SAR"),
                        amount.getAmountValue(0.0, "SAR"));
                    service.setServiceGDPN(serviceGDPN.getGDPNInfo());
                    serviceList.push(service.getServiceInfo());
                }
                callback(serviceList);
            });
    } catch (error) {
        console.error(error);
    }
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