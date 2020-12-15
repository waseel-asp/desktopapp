var visitDate, departmentCode, visitType;

exports.setVisitDate = function (data) {
    visitDate = data;
}

exports.setdepartmentCode = function (data) {
    departmentCode = data;
}

exports.setVisitType = function (data) {
    visitType = data;
}

exports.getVisitInfo = function () {
    return {
        visitDate: visitDate,
        departmentCode: departmentCode,
        visitType: visitType
    };
};