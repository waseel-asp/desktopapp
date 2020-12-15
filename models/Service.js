var serviceNumber, serviceDate, serviceType, serviceCode, serviceDescription,
    serviceComment, toothNumber, requestedQuantity, unitPrice, serviceGDPN, drugUse;

exports.setServiceNumber = function (data) {
    serviceNumber = data;
}
exports.setServiceDate = function (data) {
    serviceDate = data;
}
exports.setServiceType = function (data) {
    serviceType = data;
}
exports.setServiceCode = function (data) {
    serviceCode = data;
}
exports.setServiceDescription = function (data) {
    serviceDescription = data;
}
exports.setServiceComment = function (data) {
    serviceComment = data;
}
exports.setToothNumber = function (data) {
    toothNumber = data;
}
exports.setRequestedQuantity = function (data) {
    requestedQuantity = data;
}
exports.setUnitPrice = function (data) {
    unitPrice = data;
}
exports.setServiceGDPN = function (data) {
    serviceGDPN = data;
}
exports.setDrugUse = function (data) {
    drugUse = data;
}
exports.getServiceInfo = function () {
    return {
        serviceNumber: serviceNumber, serviceDate: serviceDate,
        serviceType: serviceType, serviceCode: serviceCode,
        serviceDescription: serviceDescription, serviceComment: serviceComment,
        toothNumber: toothNumber, requestedQuantity: requestedQuantity,
        unitPrice: unitPrice, serviceGDPN: serviceGDPN, drugUse: drugUse
    };
}