var net, netVATrate, netVATamount, patientShare, patientShareVATrate, patientShareVATamount;
var discount, gross, priceCorrection, rejection;

exports.setNet = function (data) {
    net = data;
}

exports.setNetVATrate = function (data) {
    netVATrate = data;
}

exports.setNetVATamount = function (data) {
    netVATamount = data;
}

exports.setPatientShare = function (data) {
    patientShare = data;
}

exports.setPatientShareVATrate = function (data) {
    patientShareVATrate = data;
}

exports.setPatientShareVATamount = function (data) {
    patientShareVATamount = data;
}

exports.setDiscount = function (data) {
    discount = data;
}

exports.setGross = function (data) {
    gross = data;
}

exports.setPriceCorrection = function (data) {
    priceCorrection = data;
}

exports.setRejection = function (data) {
    rejection = data;
}

// To set all value at once
exports.setGDPNData = function (netData, netVATrateData, netVATamountData, patientShareData,
                    patientShareVATrateData, patientShareVATamountData, discountData, grossData,
                    priceCorrectionData, rejectionData) {
        net = netData, netVATrate = netVATrateData, netVATamount = netVATamountData,
        patientShare = patientShareData, patientShareVATrate = patientShareVATrateData,
        patientShareVATamount = patientShareVATamountData, discount = discountData,
        gross = grossData, priceCorrection = priceCorrectionData, rejection = rejectionData
};

// You're returning an object with property values set above
exports.getGDPNInfo = function () {
    return {
        net: net, netVATrate: netVATrate, netVATamount: netVATamount,
        patientShare: patientShare, patientShareVATrate: patientShareVATrate,
        patientShareVATamount: patientShareVATamount, discount: discount,
        gross: gross, priceCorrection: priceCorrection, rejection: rejection
    };
};