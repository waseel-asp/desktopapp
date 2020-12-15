var diagnosisNumber, diagnosisCode, diagnosisType, diagnosisDescription;

exports.setDiagnosisNumber = function (data) {
    diagnosisNumber = data;
}
exports.setDiagnosisCode = function (data) {
    diagnosisCode = data;
}
exports.setDiagnosisType = function (data) {
    diagnosisType = data;
}
exports.setDiagnosisDescription = function (data) {
    diagnosisDescription = data;
}
exports.getDiagnosisInfo = function () {
    return {
        diagnosisNumber: diagnosisNumber,
        diagnosisCode: diagnosisCode,
        diagnosisType: diagnosisType,
        diagnosisDescription: diagnosisDescription
    };
}