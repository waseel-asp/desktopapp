var actualLengthOfStay, dischargeDate;

exports.setActualLengthOfStay = function(data) {
    actualLengthOfStay = data;
}

exports.setDischargeDate = function(data) {
    dischargeDate = data;
}

exports.getDischargeInfo = function() {
    return {
        actualLengthOfStay: actualLengthOfStay,
        dischargeDate: dischargeDate
    };
}