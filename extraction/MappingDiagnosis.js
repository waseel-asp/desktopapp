exports.updateDiagnosisData = function (claimMap, diagnosisList, callback) {
    let diagnosisMap = new Map();

    diagnosisList.forEach(diagnosis => {
        var claimKey = diagnosis.PROVCLAIMNO;

        const diagnosisObj = require('../models/Diagnosis.js');
        diagnosisObj.setDiagnosisCode(diagnosis.DIAGNOSISCODE);
        diagnosisObj.setDiagnosisDescription(diagnosis.DIAGNOSISDESC);
        diagnosisObj.setDiagnosisNumber(null);
        diagnosisObj.setDiagnosisType(null);

        if (diagnosisMap.get(claimKey)) {
            var existingList = diagnosisMap.get(claimKey);
            existingList.push(diagnosisObj.getDiagnosisInfo());
        } else {
            var diagnosisList = new Array();
            diagnosisList.push(diagnosisObj.getDiagnosisInfo());
            diagnosisMap.set(claimKey, diagnosisList);
        }
    });

    Array.from(claimMap.keys()).map(key => {
        if (diagnosisMap.get(key)) {
            claimMap.get(key).caseInformation.caseDescription.diagnosis = diagnosisMap.get(key);
        } else {
            claimMap.get(key).caseInformation.caseDescription.diagnosis = new Array();
        }

    });
    callback(claimMap);
}