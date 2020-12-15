var admissionDate, admissionType, estimatedLengthOfStay, roomNumber, bedNumber, discharge;


exports.setAdmissionDate = function (data) {
    admissionDate = data;
};

exports.setAdmissionType = function (data) {
    admissionType = data;
};

exports.setEstimatedLengthOfStay = function (data) {
    estimatedLengthOfStay = data;
};

exports.setRoomNumber = function (data) {
    roomNumber = data;
};

exports.setBedNumber = function (data) {
    bedNumber = data;
};

exports.setDischarge = function (data) {
    discharge = data;
};

// You're returning an object with property values set above
exports.getAdmissionInfo = function () {
    return {
        admissionDate: admissionDate,
        admissionType: admissionType,
        estimatedLengthOfStay: estimatedLengthOfStay,
        roomNumber: roomNumber, bedNumber: bedNumber,
        discharge: discharge
    };
};