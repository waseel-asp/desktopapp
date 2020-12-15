var claimIdentities, member, visitInformation, caseInformation, claimGDPN,
    invoice, commreport, admission,attachment;

exports.setAdmission = function (data) {
    admission = data;
}
exports.setAttachment = function (data) {
    attachment = data;
}
exports.setCaseInformation = function (data) {
    caseInformation = data;
}
exports.setClaimGDPN = function (data) {
    claimGDPN = data;
}
exports.setClaimIdentities = function (data) {
    claimIdentities = data;
}
exports.setCommreport = function (data) {
    commreport = data;
}
exports.setInvoice = function (data) {
    invoice = data;
}
exports.setMember = function (data) {
    member = data;
}
exports.setVisitInformation = function (data) {
    visitInformation = data;
}
exports.getClaimInfo = function () {
    return {
        admission: admission, attachment: attachment,
        caseInformation: caseInformation, claimGDPN: claimGDPN,
        claimIdentities: claimIdentities, commreport: commreport,
        invoice: invoice, member: member, visitInformation: visitInformation
    };
}