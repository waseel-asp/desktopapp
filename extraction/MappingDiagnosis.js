exports.updateDiagnosisData = async function (claimMap, diagnosisList, callback) {
    let diagnosisMap = new Map();
    Array.from(claimMap.keys()).map(key => {
        var tempData = diagnosisList.filter(diagnosis => diagnosis.PROVCLAIMNO == key);
        diagnosisMap.set(key, tempData);
    });
    Array.from(diagnosisMap.keys()).map(async key => {
        var diagnosisData = diagnosisMap.get(key);
        var diagnosisList = [];
        for (var x = 0; x < diagnosisData.length; x++) {
            var diagnosis;
            await setDiagnosis(diagnosisData[x], function (callback) { diagnosis = callback });
            diagnosisList.push(diagnosis);
        }
        claimMap.get(key).caseInformation.caseDescription.diagnosis = diagnosisList;
    });
    callback(claimMap);
}
async function setDiagnosis(diagnosisData, callback) {
    const diagnosis = require('../models/Diagnosis.js');
    diagnosis.setDiagnosisCode(diagnosisData.DIAGNOSISCODE);
    diagnosis.setDiagnosisDescription(diagnosisData.DIAGNOSISDESC);
    diagnosis.setDiagnosisNumber(null);
    diagnosis.setDiagnosisType(null);
    callback(diagnosis.getDiagnosisInfo());
}