var admissionDate, admissionType, estimatedLengthOfStay, roomNumber, bedNumber, discharge;


exports.setAdmissionDate = function (admissionDate) {
    admissionDate = admissionDate;
};

exports.setAdmissionType = function (admissionType) {
    admissionType = admissionType;
};

exports.setEstimatedLengthOfStay = function (estimatedLengthOfStay) {
    estimatedLengthOfStay = estimatedLengthOfStay;
};

// You're returning an object with property values set above
exports.getAdmissionInfo = function () {
    return {
        admissionDate: admissionDate,
        admissionType: admissionType,
        estimatedLengthOfStay: estimatedLengthOfStay
    };
};