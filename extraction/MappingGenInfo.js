const shareFunction = require('./SharedFunction.js');
exports.generateGenInfo = async function (genInfoList, callback) {
    let claimMap = new Map();
    for (const genInfoData of genInfoList) {
        const claim = require('../models/Claim.js');

        var discharge, admission, caseDescription, patient, physician, caseInformation,
            claimIdentifier, claimGDPN, member, visitInformation;
        await setDischarge(genInfoData, function (callback) { discharge = callback; });
        await setAdmission(genInfoData, discharge, function (callback) { admission = callback; });
        await setCaseDescription(genInfoData, function (callback) { caseDescription = callback; });
        await setPatient(genInfoData, function (callback) { patient = callback });
        await setPhysician(genInfoData, function (callback) { physician = callback });
        await setCaseInformation(genInfoData, caseDescription, patient, physician,
            function (callback) { caseInformation = callback; });
        await shareFunction.setGDPNData(genInfoData.TOTCLAIMNETAMT, 0.0, genInfoData.TOTCLAIMNETVATAMOUNT,
            genInfoData.TOTCLAIMPATSHARE, 0.0, genInfoData.TOTCLAIMPATSHAREVATAMOUNT, genInfoData.TOTCLAIMDISC,
            genInfoData.TOTCLAIMGRSAMT, 0.0, 0.0, function (callback) { claimGDPN = callback });
        await setClaimIdentities(genInfoData, function (callback) { claimIdentifier = callback });
        await setMember(genInfoData, function (callback) { member = callback });
        await setVisitInformation(genInfoData, function (callback) { visitInformation = callback });

        claim.setCommreport(genInfoData.COMMREPORT);
        claim.setAdmission(admission);
        claim.setAttachment(new Array());
        claim.setCaseInformation(caseInformation);
        claim.setClaimGDPN(claimGDPN);
        claim.setClaimIdentities(claimIdentifier);
        claim.setMember(member);
        claim.setVisitInformation(visitInformation);
        claimMap.set(genInfoData.PROVCLAIMNO, claim.getClaimInfo());
    }
    callback(claimMap);
}
async function setDischarge(genInfoData, callback) {
    const discharge = require('../models/Discharge.js');
    discharge.setDischargeDate(genInfoData.DISCHARGEDATE);
    discharge.setActualLengthOfStay(
        shareFunction.convertToAgePeriod(genInfoData.LENGTHOFSTAY, genInfoData.UNITOFSTAY));
    callback(discharge.getDischargeInfo());
}
async function setAdmission(genInfoData, tempDischarge, callback) {
    const admission = require('../models/Admission.js');
    admission.setAdmissionDate(genInfoData.ADMISSIONDATE);
    admission.setAdmissionType(null);
    admission.setBedNumber(genInfoData.BEDNO);
    admission.setRoomNumber(genInfoData.ROOMNO);
    admission.setEstimatedLengthOfStay(null);
    admission.setDischarge(tempDischarge);
    callback(admission.getAdmissionInfo());
}
async function setCaseDescription(genInfoData, callback) {
    const caseDescription = require('../models/CaseDescription.js');
    caseDescription.setBloodPressure(genInfoData.BLOODPRESSURE);
    caseDescription.setChiefComplaintSymptoms(genInfoData.MAINSYMPTOM);
    // caseDescription.setDiagnosis(diagnosisList);
    caseDescription.setHeight(null);
    caseDescription.setIllnessCategory(null);
    caseDescription.setIllnessDuration(
        shareFunction.convertToAgePeriod(genInfoData.DURATIONOFILLNESS, genInfoData.UNITOFDURATION));
    caseDescription.setInvestigation(null);
    caseDescription.setLmp(genInfoData.LASTMENSTRUATIONPERIOD);
    caseDescription.setOptics(null);
    caseDescription.setPulse(genInfoData.PULSE);
    caseDescription.setRespRate(genInfoData.RESPIRATORYRATE);
    caseDescription.setSignicantSigns(genInfoData.SIGNIFICANTSIGN);
    caseDescription.setTemperature(genInfoData.TEMPERATURE == null ? 0 : genInfoData.TEMPERATURE);
    caseDescription.setWeight(genInfoData.WEIGH);
    callback(caseDescription.getCaseDescriptionInfo());
}
async function setPatient(genInfoData, callback) {
    const patient = require('../models/Patient.js');
    patient.setAge(shareFunction.convertToAgePeriod(genInfoData.MEMBERAGE, genInfoData.UNITAGE));
    patient.setContactNumber(null);
    patient.setDob(genInfoData.MEMBERDOB);
    patient.setFirstName(genInfoData.FIRSTNAME);
    patient.setFullName(genInfoData.FULLNAME);
    patient.setGender(genInfoData.GENDER);
    patient.setLastName(genInfoData.LASTNAME);
    patient.setMiddleName(genInfoData.MIDDLENAME);
    patient.setNationality(genInfoData.NATIONALITY);
    patient.setPatientFileNumber(genInfoData.PATFILENO);
    callback(patient.getPatientInfo());
}
async function setPhysician(genInfoData, callback) {
    const physician = require('../models/Physician.js');
    physician.setPhysicianID(genInfoData.PHYID);
    physician.setPhysicianName(genInfoData.PHYNAME);
    physician.setPhysicianCategory(genInfoData.PHYCATEGORY);
    callback(physician.getPhysicianInfo());
}
async function setCaseInformation(genInfoData, tempCaseDescription, tempPatient, tempPhysician, callback) {
    const caseInformation = require('../models/CaseInformation.js');
    caseInformation.setCaseType(genInfoData.CLAIMTYPE);
    caseInformation.setOtherConditions(genInfoData.OTHERCOND);
    caseInformation.setRadiologyReport(genInfoData.RADIOREPORT);
    caseInformation.setPossibleLineOfTreatment(null);
    caseInformation.setCaseDescription(tempCaseDescription);
    caseInformation.setPatient(tempPatient);
    caseInformation.setPhysician(tempPhysician);
    callback(caseInformation.getCaseInformation());
}
async function setClaimIdentities(genInfoData, callback) {
    const claimIdentifier = require('../models/ClaimIdentifier.js');
    claimIdentifier.setApprovalNumber(genInfoData.APPREFNO);
    claimIdentifier.setEligibilityNumber(genInfoData.ELIGREFNO);
    claimIdentifier.setPayerBatchID(null);
    claimIdentifier.setPayerClaimNumber(null);
    claimIdentifier.setPayerID(sendpayerId);
    claimIdentifier.setPortalTransactionID(null);
    claimIdentifier.setProviderBatchID(null);
    claimIdentifier.setProviderClaimNumber(genInfoData.PROVCLAIMNO);
    claimIdentifier.setProviderParentClaimNumber(null);
    callback(claimIdentifier.getClaimIdentifierInfo());
}
async function setMember(genInfoData, callback) {
    const member = require('../models/Member.js');
    member.setAccCode(genInfoData.ACCCODE);
    member.setIdNumber(genInfoData.NATIONALID == undefined ? null : genInfoData.NATIONALID);
    member.setMemberID(genInfoData.MEMBERID);
    member.setPlanType(genInfoData.PLANTYPE);
    member.setPolicyNumber(genInfoData.POLICYNO);
    callback(member.getMemberInfo());
}
async function setVisitInformation(genInfoData, callback) {
    const visitInformation = require('../models/visitInformation.js');
    visitInformation.setdepartmentCode(genInfoData.DEPTCODE);
    visitInformation.setVisitDate(genInfoData.CLAIMDATE);
    visitInformation.setVisitType(genInfoData.VISITTYPE);
    callback(visitInformation.getVisitInfo);
}