var payerID, portalTransactionID, providerClaimNumber, providerParentClaimNumber,
    providerBatchID, payerBatchID, payerClaimNumber, approvalNumber, eligibilityNumber;

exports.setPayerID = function(data) {
    payerID = data;
}
exports.setPortalTransactionID = function(data) {
    portalTransactionID = data;
}
exports.setProviderClaimNumber = function(data) {
    providerClaimNumber = data;
}
exports.setProviderParentClaimNumber = function(data) {
    providerParentClaimNumber = data;
}
exports.setProviderBatchID = function(data) {
    providerBatchID = data;
}
exports.setPayerBatchID = function(data) {
    payerBatchID = data;
}
exports.setPayerClaimNumber = function(data) {
    payerClaimNumber = data;
}
exports.setApprovalNumber = function(data) {
    approvalNumber = data;
}
exports.setEligibilityNumber = function(data) {
    eligibilityNumber = data;
}
exports.getClaimIdentifierInfo = function () {
    return {
        payerID: payerID, portalTransactionID: portalTransactionID,
        providerClaimNumber: providerClaimNumber,
        providerParentClaimNumber: providerParentClaimNumber,
        providerBatchID: providerBatchID, payerBatchID: payerBatchID,
        payerClaimNumber: payerClaimNumber, approvalNumber: approvalNumber,
        eligibilityNumber:eligibilityNumber
    };
}