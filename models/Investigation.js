var investigationType, investigationCode, investigationDescription, investigationDate,
    observation, investigationComments;

exports.setInvestigationType = function(data) {
    investigationType = data;
}
exports.setInvestigationCode = function(data) {
    investigationCode = data;
}
exports.setInvestigationDescription = function(data) {
    investigationDescription = data;
}
exports.setInvestigationDate = function(data) {
    investigationDate = data;
}
exports.setObservation = function(data) {
    observation = data;
}
exports.setInvestigationComments = function(data) {
    investigationComments = data;
}

exports.getInvestigationInfo = function () {
    return {
        investigationType: investigationType, investigationCode: investigationCode,
        investigationDescription: investigationDescription, investigationDate: investigationDate,
        observation: observation, investigationComments: investigationComments
    };
}