var observationCode, observationDescription, observationValue, observationUnit, observationComment;

exports.setObservationCode = function(data) {
    observationCode = data;
}
exports.setObservationDescription = function(data) {
    observationDescription = data;
}
exports.setObservationValue = function(data) {
    observationValue = data;
}
exports.setObservationUnit = function(data) {
    observationUnit = data;
}
exports.setObservationComment = function(data) {
    observationComment = data;
}

exports.getObservationInfo = function () {
    return {
        observationCode: observationCode, observationDescription: observationDescription,
        observationValue: observationValue, observationUnit: observationUnit,
        observationComment: observationComment
    };
}