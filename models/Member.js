var memberID,idNumber,policyNumber,accCode,planType;

exports.setAccCode = function (data) {
    accCode = data;
};
exports.setPlanType = function (data) {
    if(data!=null && data!= undefined){
        data = data.trim();
    }
    planType = data;
};
exports.setMemberID = function (data) {
    memberID = data;
};
exports.setIdNumber = function (data) {
    idNumber = data;
};
exports.setPolicyNumber = function (data) {
    policyNumber = data;
};
exports.getMemberInfo = function () {
    return {
        accCode: accCode,
        planType: planType,
        memberID: memberID,
        idNumber:idNumber,
        policyNumber:policyNumber
    };
};