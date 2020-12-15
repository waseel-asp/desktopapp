var physicianName, physicianID, physicianCategory;

exports.setPhysicianID = function(data) {
    physicianID = data;
}

exports.setPhysicianName = function(data) {
    physicianName = data;
}

exports.setPhysicianCategory = function(data) {
    physicianCategory = data;
}

exports.getPhysicianInfo = function () {
    return {
        physicianID: physicianID,
        physicianName: physicianName,
        physicianCategory: physicianCategory
    };
}