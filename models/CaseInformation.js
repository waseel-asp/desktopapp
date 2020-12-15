var caseType, physician, patient, caseDescription, possibleLineOfTreatment, otherConditions, radiologyReport;

exports.setCaseType = function(data) {
    caseType = data;
}

exports.setPhysician = function(data) {
    physician = data;
}

exports.setPatient = function(data) {
    patient = data;
}

exports.setCaseDescription = function(data) {
    caseDescription = data;
}

exports.setPossibleLineOfTreatment = function(data) {
    possibleLineOfTreatment = data;
}

exports.setOtherConditions = function(data) {
    otherConditions = data;
}

exports.setRadiologyReport = function(data) {
    radiologyReport = data;
}

exports.getCaseInformation = function () {
    return {
        caseType: caseType,
        physician: physician,
        patient: patient,
        caseDescription: caseDescription,
        possibleLineOfTreatment: possibleLineOfTreatment,
        otherConditions: otherConditions,
        radiologyReport: radiologyReport
    };
}