const { app, Menu } = require('electron');
const foo = require('electron').remote;

function connect() {
  console.log("test connect");
  oracle();
  oracleQuery("select * from WSL_GENINFO where PROVIDERID='DLH'").then(genInfoData => {
    for (var i = 0; i < genInfoData.length; i++) {
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

      discharge.setDischargeDate(genInfoData[i].DISCHARGEDATE);
      discharge.setActualLengthOfStay(convertToAgePeriod(genInfoData[i].LENGTHOFSTAY, genInfoData[i].UNITOFSTAY));
      console.log(discharge.getDischargeInfo());
      admission.setAdmissionDate(genInfoData[i].ADMISSIONDATE);
      admission.setAdmissionType(null);
      admission.setBedNumber(genInfoData[i].BEDNO);
      admission.setRoomNumber(genInfoData[i].ROOMNO);
      admission.setEstimatedLengthOfStay(null);
      admission.setDischarge(discharge.getDischargeInfo());
      console.log(admission.getAdmissionInfo());

      var diagnosisList = [];
      oracleQuery("select * from WSL_CLAIM_DIAGNOSIS where PROVCLAIMNO='" + genInfoData[i].PROVCLAIMNO + "'").then(diagnosisData => {
        for (var x = 0; x < diagnosisData.length; x++) {
          const diagnosis = require('../models/Diagnosis.js');
          diagnosis.setDiagnosisCode(diagnosisData[x].DIAGNOSISCODE);
          diagnosis.setDiagnosisDescription(diagnosisData[x].DIAGNOSISDESC);
          diagnosis.setDiagnosisNumber(null);
          diagnosis.setDiagnosisType(null);
          diagnosisList.push(diagnosis.getDiagnosisInfo());
        }
      });
      caseDescription.setBloodPressure(genInfoData[i].BLOODPRESSURE);
      caseDescription.setChiefComplaintSymptoms(genInfoData[i].MAINSYMPTOM);
      caseDescription.setDiagnosis(diagnosisList);
      caseDescription.setHeight(null);
      caseDescription.setIllnessCategory(null);
      caseDescription.setIllnessDuration(
        convertToAgePeriod(genInfoData[i].DURATIONOFILLNESS, genInfoData[i].UNITOFDURATION));
      caseDescription.setInvestigation(null);
      caseDescription.setLmp(genInfoData[i].LASTMENSTRUATIONPERIOD);
      caseDescription.setOptics(null);
      caseDescription.setPulse(genInfoData[i].PULSE);
      caseDescription.setRespRate(genInfoData[i].RESPIRATORYRATE);
      caseDescription.setSignicantSigns(genInfoData[i].SIGNIFICANTSIGN);
      caseDescription.setTemperature(genInfoData[i].TEMPERATURE == null ? 0 : genInfoData[i].TEMPERATURE);
      caseDescription.setWeight(genInfoData[i].WEIGH);
      patient.setAge(convertToAgePeriod(genInfoData[i].MEMBERAGE, genInfoData[i].UNITAGE));
      patient.setContactNumber(null);
      patient.setDob(genInfoData[i].MEMBERDOB);
      patient.setFirstName(genInfoData[i].FIRSTNAME);
      patient.setFullName(genInfoData[i].FULLNAME);
      patient.setGender(genInfoData[i].GENDER);
      patient.setLastName(genInfoData[i].LASTNAME);
      patient.setMiddleName(genInfoData[i].MIDDLENAME);
      patient.setNationality(genInfoData[i].NATIONALITY);
      patient.setPatientFileNumber(genInfoData[i].PATFILENO);
      physician.setPhysicianID(genInfoData[i].PHYID);
      physician.setPhysicianName(genInfoData[i].PHYNAME);
      physician.setPhysicianCategory(genInfoData[i].PHYCATEGORY);
      caseInformation.setCaseType(genInfoData[i].CLAIMTYPE);
      caseInformation.setOtherConditions(genInfoData[i].OTHERCOND);
      caseInformation.setRadiologyReport(genInfoData[i].RADIOREPORT);
      caseInformation.setPossibleLineOfTreatment(null);
      caseInformation.setCaseDescription(caseDescription.getCaseDescriptionInfo());
      caseInformation.setPatient(patient.getPatientInfo());
      caseInformation.setPhysician(physician.getPhysicianInfo());

      claimGDPN.setGDPNData(
        amount.getAmountValue(genInfoData[i].TOTCLAIMNETAMT, "SAR"),
        amount.getAmountValue(0.0, "SAR"),
        amount.getAmountValue(genInfoData[i].TOTCLAIMNETVATAMOUNT, "SAR"),
        amount.getAmountValue(genInfoData[i].TOTCLAIMPATSHARE, "SAR"),
        amount.getAmountValue(0.0, "SAR"),
        amount.getAmountValue(genInfoData[i].TOTCLAIMPATSHAREVATAMOUNT, "SAR"),
        amount.getAmountValue(genInfoData[i].TOTCLAIMDISC, "SAR"),
        amount.getAmountValue(genInfoData[i].TOTCLAIMGRSAMT, "SAR"),
        amount.getAmountValue(0.0, "SAR"),
        amount.getAmountValue(0.0, "SAR"));

      claimIdentifier.setApprovalNumber(genInfoData[i].APPREFNO);
      claimIdentifier.setEligibilityNumber(genInfoData[i].ELIGREFNO);
      claimIdentifier.setPayerBatchID(null);
      claimIdentifier.setPayerClaimNumber(null);
      claimIdentifier.setPayerID(genInfoData[i].PAYERID);
      claimIdentifier.setPortalTransactionID(null);
      claimIdentifier.setProviderBatchID(null);
      claimIdentifier.setProviderClaimNumber(genInfoData[i].PROVCLAIMNO);
      claimIdentifier.setProviderParentClaimNumber(null);

      member.setAccCode(genInfoData[i].ACCCODE);
      member.setIdNumber(null);
      member.setMemberID(genInfoData[i].MEMBERID);
      member.setPlanType(genInfoData[i].PLANTYPE);
      member.setPolicyNumber(genInfoData[i].POLICYNO);
      visitInformation.setdepartmentCode(genInfoData[i].DEPTCODE);
      visitInformation.setVisitDate(genInfoData[i].CLAIMDATE);
      visitInformation.setVisitType(genInfoData[i].VISITTYPE);

      var invoiceList = [];
      oracleQuery("select * from WSL_INVOICES where PROVCLAIMNO='" + genInfoData[i].PROVCLAIMNO + "'").then(invoiceData => {
        console.log("======== Invoice Data ========");
        console.log(invoiceData);
        // console.log(genInfoData[i].PROVCLAIMNO);
        for (var j = 0; j < invoiceData.length; j++) {
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
          var serviceList = [];
          oracleQuery("select * from WSL_SERVICE_DETAILS where INVOICENO='" + invoiceData[j].INVOICENO + "'")
            .then(serviceData => {
              console.log("======== Service Data ========");
              console.log(serviceData);
              for (var k = 0; k < serviceData.length; k++) {
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
            });
          invoice.setService(serviceList);
          invoiceList.push(invoice.getInvoiceInfo());
        }
      });
      claim.setAdmission(admission.getAdmissionInfo());
      claim.setAttachment(new Array());
      claim.setCaseInformation(caseInformation.getCaseInformation());
      claim.setClaimGDPN(claimGDPN.getGDPNInfo());
      claim.setClaimIdentities(claimIdentifier.getClaimIdentifierInfo());
      claim.setCommreport(genInfoData[i].COMMREPORT);
      claim.setInvoice(invoiceList);
      claim.setMember(member.getMemberInfo());
      claim.setVisitInformation(visitInformation.getVisitInfo());
      console.log(member.getMemberInfo());
      console.log(claim.getClaimInfo());
      localStorage.setItem('data', claim.getClaimInfo());
    }

  });
}

function logout() {
  localStorage.removeItem('access_token');
  window.location.href = "../login/loginui.html";
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