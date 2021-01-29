exports.updateDiagnosisData = function (claimMap, diagnosisList, callback) {
    let diagnosisMap = new Map();
    Array.from(claimMap.keys()).map(key => {
        var tempData = diagnosisList.filter(diagnosis => diagnosis.PROVCLAIMNO == key);
        diagnosisMap.set(key, tempData);
    });

    Array.from(diagnosisMap.keys()).map(key => {
        var diagnosisData = diagnosisMap.get(key);
        var diagnosisList = [];
        for (var x = 0; x < diagnosisData.length; x++) {
            const diagnosis = require('../models/Diagnosis.js');
            diagnosis.setDiagnosisCode(diagnosisData[x].DIAGNOSISCODE);
            diagnosis.setDiagnosisDescription(diagnosisData[x].DIAGNOSISDESC);
            diagnosis.setDiagnosisNumber(null);
            diagnosis.setDiagnosisType(null);
            diagnosisList.push(diagnosis.getDiagnosisInfo());
        }
        claimMap.get(key).caseInformation.caseDescription.diagnosis = diagnosisList;
    });
    callback(claimMap);
}