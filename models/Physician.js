var physicianName, physicianID, physicianCategory;

exports.setPhysicianID = function(data) {
    physicianID = data;
}

exports.setPhysicianName = function(data) {
    physicianName = data;
}

exports.setPhysicianCategory = function(data) {
    if(data!=null && data!=undefined){
    data = data.trim();
    }
    physicianCategory = data;
}

exports.getPhysicianInfo = function () {
    return {
        physicianID: physicianID,
        physicianName: physicianName,
        physicianCategory: physicianCategory
    };
}